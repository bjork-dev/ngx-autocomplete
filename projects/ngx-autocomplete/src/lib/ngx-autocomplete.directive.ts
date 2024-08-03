import {
  AfterViewInit,
  ComponentRef, computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  input,
  output,
  Renderer2,
  signal,
  ViewContainerRef
} from '@angular/core';
import {Searcher} from "./searcher";
import {SearchResultComponent} from "./search-result/search-result.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {filter, fromEvent, tap} from "rxjs";
import {NgxAutoCompleteWindowEvent} from "./events/ngx-auto-complete-window.event";
import {NgxAutoCompleteDataItem} from "./ngx-auto-complete-data.item";

@Directive({
  standalone: true,
  selector: '[ngxAutoComplete]',
})
export class NxgAutoCompleteDirective implements AfterViewInit {
  ngxAutoComplete = input<string[]>([]);
  ngxAutoCompleteMaxResults = input<number>(0);
  multiple = input<boolean>(false);
  showWindowOnFocus = input<boolean>(false);
  style = input<'light' | 'dark'>('light');
  checkboxColor = input<string>('#a8a8a8');
  maxHeight = input<string>('400px');

  ngxAutoCompleteItemSelected = output<string>();
  ngxAutoCompleteItemRemoved = output<string>();
  ngxAutCompleteWindowChanged = output<NgxAutoCompleteWindowEvent>();

  selectionIndex = signal(-1);

  dataItems = computed(() => {
    return this.ngxAutoComplete().map((item, index) => {
      return {value: item, id: crypto.randomUUID()} as NgxAutoCompleteDataItem;
    });
  });

  private searchResultComponent: ComponentRef<SearchResultComponent>;

  constructor(private elementRef: ElementRef, private renderer: Renderer2, viewContainerRef: ViewContainerRef,
              private destroyRef: DestroyRef) {

    effect(() => {
      this.configureInputs();
    }, {allowSignalWrites: true});

    this.searchResultComponent = viewContainerRef.createComponent(SearchResultComponent);

    this.searchResultComponent.instance.itemSelected.pipe(
      takeUntilDestroyed(),
      tap((item) => {
        if (this.multiple()) {
          const items = this.searchResultComponent.instance._selectedItems().map(i => i.value);
          this.renderer.setProperty(this.elementRef.nativeElement, 'value', items.join(', ') + ', ');
        } else {
          this.renderer.setProperty(this.elementRef.nativeElement, 'value', item.value);
          this.closeWindow();
        }
        const index = this.searchResultComponent.instance.items().indexOf(item);
        this.selectionIndex.set(index);
        this.ngxAutoCompleteItemSelected.emit(item.value);
      }))
      .subscribe();

    this.searchResultComponent.instance.itemRemoved.pipe(
      takeUntilDestroyed(),
      tap(((item) => {
        if (this.multiple()) {
          this.renderer.setProperty(this.elementRef.nativeElement, 'value', this.elementRef.nativeElement.value.replace(item.value + ', ', ''));
        } else {
          this.clearInput();
        }
        this.ngxAutoCompleteItemRemoved.emit(item.value);
      })))
      .subscribe();

  }

  ngAfterViewInit(): void {
    const searcher = new Searcher(this.dataItems());

    fromEvent(this.elementRef.nativeElement, 'input').pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(((event: any) => {
        let query = event.target.value.split(',').pop().trim();

        if (query === '') {
          return;
        }

        this.searchResultComponent.instance.items.set(searcher.search(query, this.ngxAutoCompleteMaxResults()));
        this.selectionIndex.set(-1);

        const selectedItems = this.searchResultComponent.instance.elementRef.nativeElement.querySelectorAll('.highlight');
        for (let i = 0; i < selectedItems.length; i++) {
          this.renderer.removeClass(selectedItems[i], 'highlight');
        }

        this.searchResultComponent.instance.hidden.set(this.elementRef.nativeElement.value === '');
      }))).subscribe();

    fromEvent(this.elementRef.nativeElement, 'focus').pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((() => {
        this.positionSearchResultComponent();
        if (this.showWindowOnFocus()) {
          this.openWindow();
        }
      }))).subscribe();

    fromEvent(document, 'click').pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((ev: Event) => !this.searchResultComponent.instance.hidden()
        && ev.target !== this.elementRef.nativeElement && this.searchResultComponent.instance.elementRef.nativeElement.contains(ev.target) === false),
      tap((event: any) => {
        if (!this.multiple()) {
          this.clearInput();
        }
        this.closeWindow()
      })
    ).subscribe();

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((ev: any) => !this.searchResultComponent.instance.hidden() && ev.key === 'Enter'),
      tap((event: any) => {
        event.preventDefault();
        const selectedItem = this.searchResultComponent.instance.items()[this.selectionIndex()];
        if (selectedItem) {
          this.searchResultComponent.instance.selectOrRemoveItem((selectedItem));
          if (!this.multiple()) {
            this.closeWindow();
          }
        }
      })).subscribe();

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((ev: any) => !this.searchResultComponent.instance.hidden() && ev.key === 'Backspace'),
      tap((event: Event) => {
        event.preventDefault();
        const items = this.searchResultComponent.instance._selectedItems();
        if (items.length === 0) {
          // if no items are selected just clear the current input character
          this.renderer.setProperty(this.elementRef.nativeElement, 'value', this.elementRef.nativeElement.value.slice(0, -1));
          return;
        }

        // if the user has entered a partial query, remove it instead of the last item
        const query = this.elementRef.nativeElement.value.split(',').pop().trim();
        if (query !== '') {
          this.renderer.setProperty(this.elementRef.nativeElement, 'value', this.elementRef.nativeElement.value.slice(0, -1));
          return;
        }

        const lastItem = items[items.length - 1];
        this.searchResultComponent.instance.selectOrRemoveItem((lastItem));
      })).subscribe();

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((ev: any) => !this.searchResultComponent.instance.hidden() && ev.key === 'Escape'),
      tap(() => {
        if (!this.multiple()) {
          this.clearInput();
        }
        this.closeWindow()
      })
    ).subscribe();

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((ev: any) => !this.searchResultComponent.instance.hidden() && ev.key === 'ArrowDown'),
      tap(((event: Event) => {
        event.preventDefault();

        this.selectionIndex.set(this.selectionIndex() + 1);

        if (this.selectionIndex() >= this.searchResultComponent.instance.items().length) {
          this.selectionIndex.set(0);
        }
        if (!this.multiple()) {
          this.renderer.setProperty(this.elementRef.nativeElement, 'value', this.searchResultComponent.instance.items()[this.selectionIndex()].value);
        }

        const childItems = this.searchResultComponent.instance.elementRef.nativeElement.children[0].children;

        this.renderer.addClass(childItems[this.selectionIndex()], 'highlight');
        if (this.selectionIndex() > 0) {
          this.renderer.removeClass(childItems[this.selectionIndex() - 1], 'highlight');
        } else {
          this.renderer.removeClass(childItems[childItems.length - 1], 'highlight');
        }
      }))).subscribe();

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((ev: any) => !this.searchResultComponent.instance.hidden() && ev.key === 'ArrowUp'),
      tap((event: Event) => {
        event.preventDefault();

        this.selectionIndex.set(this.selectionIndex() - 1);

        if (this.selectionIndex() < 0) {
          this.selectionIndex.set(this.searchResultComponent.instance.items().length - 1);
        }

        if (!this.multiple()) {
          this.renderer.setProperty(this.elementRef.nativeElement, 'value', this.searchResultComponent.instance.items()[this.selectionIndex()].value);
        }

        const childItems = this.searchResultComponent.instance.elementRef.nativeElement.children[0].children;

        this.renderer.addClass(childItems[this.selectionIndex()], 'highlight');
        if (this.selectionIndex() < childItems.length - 1) {
          this.renderer.removeClass(childItems[this.selectionIndex() + 1], 'highlight');
        } else {
          this.renderer.removeClass(childItems[0], 'highlight');
        }
      })).subscribe();
  }

  configureInputs() {
    this.selectionIndex.set(-1);
    this.searchResultComponent.instance._selectedItems.set([]);
    this.searchResultComponent.instance.multiple.set(this.multiple());
    this.searchResultComponent.instance.style.set(this.style());
    this.searchResultComponent.instance.checkboxColor.set(this.checkboxColor());
    this.searchResultComponent.instance.maxHeight.set(this.maxHeight());

    if (this.ngxAutoCompleteMaxResults() > 0) {
      this.searchResultComponent.instance.items.set(this.dataItems().slice(0, this.ngxAutoCompleteMaxResults()));
    } else {
      this.searchResultComponent.instance.items.set(this.dataItems());
    }
  }

  positionSearchResultComponent() {
    const inputRect = this.elementRef.nativeElement.getBoundingClientRect();
    const searchResultEl = this.searchResultComponent.instance.elementRef.nativeElement;

    this.renderer.setStyle(searchResultEl, 'width', inputRect.width + 'px');
    this.renderer.setStyle(searchResultEl, 'position', 'absolute');
    this.renderer.setStyle(searchResultEl, 'top', (inputRect.bottom + window.scrollY) + 'px');
    this.renderer.setStyle(searchResultEl, 'left', (inputRect.left + window.scrollX) + 'px');
  }

  clearInput() {
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', '');
  }

  closeWindow() {
    this.searchResultComponent.instance.hidden.set(true);
    this.renderer.selectRootElement(this.elementRef.nativeElement).blur();
    this.ngxAutCompleteWindowChanged.emit({opened: false});
  }

  openWindow() {
    this.searchResultComponent.instance.hidden.set(false);
    this.ngxAutCompleteWindowChanged.emit({opened: true});
  }

}

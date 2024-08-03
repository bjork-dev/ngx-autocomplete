import {
  AfterViewInit,
  ComponentRef,
  DestroyRef,
  Directive,
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

  private searchResultComponent: ComponentRef<SearchResultComponent>;

  constructor(private elementRef: ElementRef, private renderer: Renderer2, viewContainerRef: ViewContainerRef,
              private destroyRef: DestroyRef) {

    this.searchResultComponent = viewContainerRef.createComponent(SearchResultComponent);
    this.searchResultComponent.instance.renderer.setStyle(this.searchResultComponent.instance.elementRef.nativeElement, 'position', 'absolute');

    this.searchResultComponent.instance.itemSelected.pipe(
      takeUntilDestroyed(),
      tap((item: string) => {
        if (this.multiple()) {
          const items = this.searchResultComponent.instance._selectedItems();
          this.renderer.setProperty(this.elementRef.nativeElement, 'value', items.join(', ') + ', ');
        } else {
          this.renderer.setProperty(this.elementRef.nativeElement, 'value', item);
          this.closeWindow();
        }
        const index = this.searchResultComponent.instance.items().indexOf(item);
        this.selectionIndex.set(index);
        this.ngxAutoCompleteItemSelected.emit(item);
      }))
      .subscribe();

    this.searchResultComponent.instance.itemRemoved.pipe(
      takeUntilDestroyed(),
      tap(((item: string) => {
        this.renderer.setProperty(this.elementRef.nativeElement, 'value', this.elementRef.nativeElement.value.replace(item + ', ', ''));
        this.ngxAutoCompleteItemRemoved.emit(item);
      })))
      .subscribe();

  }

  ngAfterViewInit(): void {
    this.searchResultComponent.instance.multiple.set(this.multiple());
    this.searchResultComponent.instance.style.set(this.style());
    this.searchResultComponent.instance.checkboxColor.set(this.checkboxColor());
    this.searchResultComponent.instance.maxHeight.set(this.maxHeight());

    if (this.ngxAutoCompleteMaxResults() > 0) {
      this.searchResultComponent.instance.items.set(this.ngxAutoComplete().slice(0, this.ngxAutoCompleteMaxResults()));
    } else {
      this.searchResultComponent.instance.items.set(this.ngxAutoComplete());
    }

    const searcher = new Searcher(this.ngxAutoComplete());

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
        this.renderer.setStyle(this.searchResultComponent.instance.elementRef.nativeElement, 'width', this.elementRef.nativeElement.offsetWidth + 'px');
        if (this.showWindowOnFocus()) {
          this.openWindow();
        }
      }))).subscribe();

    fromEvent(document, 'click').pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(() => !this.searchResultComponent.instance.hidden()),
      tap((event: any) => {
        if (event.target !== this.elementRef.nativeElement
          && this.searchResultComponent.instance.elementRef.nativeElement.contains(event.target) === false) {
          this.closeWindow();
        }
      })).subscribe();

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(() => !this.searchResultComponent.instance.hidden()),
      tap((event: any) => {
        if (event.key === 'Enter') {
          const selectedItem = this.searchResultComponent.instance.items()[this.selectionIndex()];
          if (selectedItem) {
            if (this.multiple()) {
              this.searchResultComponent.instance.selectOrRemoveItem((selectedItem));
            } else {
              this.renderer.setProperty(this.elementRef.nativeElement, 'value', selectedItem);
              this.ngxAutoCompleteItemSelected.emit(selectedItem);
              this.closeWindow();
            }
          }
        }
      })).subscribe();

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(() => !this.searchResultComponent.instance.hidden()),
      tap((event: any) => {
        if (event.key === 'Backspace') {
          event.preventDefault();
          const items = this.searchResultComponent.instance._selectedItems();

          if (items.length === 0) {
            return;
          }

          const lastItem = items[items.length - 1];
          this.searchResultComponent.instance.selectOrRemoveItem((lastItem));
        }
      })).subscribe();

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(() => !this.searchResultComponent.instance.hidden()),
      tap((event: any) => {
        if (event.key === 'Escape') {
          this.closeWindow()
        }
      })).subscribe();

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(() => !this.searchResultComponent.instance.hidden()),
      tap(((event: any) => {
        if (event.key === 'ArrowDown') {
          this.selectionIndex.set(this.selectionIndex() + 1);

          if (this.selectionIndex() >= this.searchResultComponent.instance.items().length) {
            this.selectionIndex.set(0);
          }
          if (!this.multiple()) {
            this.renderer.setProperty(this.elementRef.nativeElement, 'value', this.searchResultComponent.instance.items()[this.selectionIndex()]);
          }

          const childItems = this.searchResultComponent.instance.elementRef.nativeElement.children[0].children;

          this.renderer.addClass(childItems[this.selectionIndex()], 'highlight');
          if (this.selectionIndex() > 0) {
            this.renderer.removeClass(childItems[this.selectionIndex() - 1], 'highlight');
          } else {
            this.renderer.removeClass(childItems[childItems.length - 1], 'highlight');
          }
        }

      }))).subscribe();

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef),
      filter(() => !this.searchResultComponent.instance.hidden()),
      tap((event: any) => {
        if (event.key === 'ArrowUp') {
          this.selectionIndex.set(this.selectionIndex() - 1);

          if (this.selectionIndex() < 0) {
            this.selectionIndex.set(this.searchResultComponent.instance.items().length - 1);
          }

          if (!this.multiple()) {
            this.renderer.setProperty(this.elementRef.nativeElement, 'value', this.searchResultComponent.instance.items()[this.selectionIndex()]);
          }

          const childItems = this.searchResultComponent.instance.elementRef.nativeElement.children[0].children;

          this.renderer.addClass(childItems[this.selectionIndex()], 'highlight');
          if (this.selectionIndex() < childItems.length - 1) {
            this.renderer.removeClass(childItems[this.selectionIndex() + 1], 'highlight');
          } else {
            this.renderer.removeClass(childItems[0], 'highlight');
          }

        }
      })).subscribe();
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

import {
  AfterViewInit,
  ComponentRef, DestroyRef,
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
import {fromEvent, tap} from "rxjs";

@Directive({
  standalone: true,
  selector: '[ngxAutoComplete]',
})
export class NxgAutoCompleteDirective implements AfterViewInit {
  ngxAutoComplete = input<string[]>([]);
  ngxAutoCompleteMaxResults = input<number>(0);
  multiple = input<boolean>(false);

  ngxAutoCompleteItemSelected = output<string>();
  ngxAutoCompleteItemRemoved = output<string>();

  selectionIndex = signal(-1);

  private searchResultComponent: ComponentRef<SearchResultComponent>;

  constructor(private elementRef: ElementRef, private renderer: Renderer2, viewContainerRef: ViewContainerRef,
              private destroyRef: DestroyRef) {


    this.searchResultComponent = viewContainerRef.createComponent(SearchResultComponent);

    this.searchResultComponent.instance.hidden = true;
    this.searchResultComponent.instance.elementRef.nativeElement.style.position = 'absolute';

    this.searchResultComponent.instance.itemSelected.pipe(
      takeUntilDestroyed(),
      tap((item: string) => {
        if (this.multiple()) {

          const items = this.searchResultComponent.instance._selectedItems;

          this.elementRef.nativeElement.value = items.join(', ') + ', ';
        } else {
          this.elementRef.nativeElement.value = item;
          this.searchResultComponent.instance.hidden = true
        }

        const index = this.ngxAutoComplete().indexOf(item);
        this.selectionIndex.set(index);

        this.ngxAutoCompleteItemSelected.emit(item);
      }))
      .subscribe();

    this.searchResultComponent.instance.itemRemoved.pipe(
      takeUntilDestroyed(),
      tap(((item: string) => {
        this.elementRef.nativeElement.value = this.elementRef.nativeElement.value.replace(item + ', ', '');
        this.ngxAutoCompleteItemRemoved.emit(item);
      })))
      .subscribe();

  }

  ngAfterViewInit(): void {
    this.searchResultComponent.instance.multiple = this.multiple();
    this.searchResultComponent.instance.items = this.ngxAutoComplete();
    const searcher = new Searcher(this.ngxAutoComplete());

    fromEvent(this.elementRef.nativeElement, 'input').pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(((event: any) => {
        const query = event.target.value;

        if (query === '') {
          this.searchResultComponent.instance._selectedItems = [];
          this.ngxAutoCompleteItemRemoved.emit('');
        }

        this.searchResultComponent.instance.items = searcher.search(query, this.ngxAutoCompleteMaxResults());
        this.searchResultComponent.instance.hidden = this.elementRef.nativeElement.value === '';
      }))).subscribe();

    fromEvent(this.elementRef.nativeElement, 'focus').pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((() => {
        this.searchResultComponent.instance.elementRef.nativeElement.style.top = this.elementRef.nativeElement.offsetHeight + 12 + 'px';
        this.searchResultComponent.instance.elementRef.nativeElement.style.width = this.elementRef.nativeElement.offsetWidth + 'px';
        this.searchResultComponent.instance.hidden = false;
      }))).subscribe();

    fromEvent(document, 'click').pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((event: any) => {
        if (event.target !== this.elementRef.nativeElement
          && this.searchResultComponent.instance.elementRef.nativeElement.contains(event.target) === false) {
          this.searchResultComponent.instance.hidden = true;
        }
      })).subscribe();

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((event: any) => {
        if (event.key === 'Enter') {
          const selectedItem = this.searchResultComponent.instance.items[this.selectionIndex()];
          if (selectedItem) {
            if (this.multiple()) {
              this.searchResultComponent.instance.selectItem((selectedItem));
            } else {
              this.elementRef.nativeElement.value = selectedItem;
              this.ngxAutoCompleteItemSelected.emit(selectedItem);
              this.elementRef.nativeElement.blur();
              this.searchResultComponent.instance.hidden = true;
            }
          }
        }
      })).subscribe();

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((event: any) => {
        if (event.key === 'Escape') {
          this.searchResultComponent.instance.hidden = true;
          this.elementRef.nativeElement.blur();
        }
      })).subscribe();

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(((event: any) => {
        if (event.key === 'ArrowDown') {
          this.selectionIndex.set(this.selectionIndex() + 1);

          if (this.selectionIndex() >= this.searchResultComponent.instance.items.length) {
            this.selectionIndex.set(0);
          }
          if (!this.multiple()) {
            this.elementRef.nativeElement.value = this.searchResultComponent.instance.items[this.selectionIndex()];
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
      takeUntilDestroyed(this.destroyRef), tap((event: any) => {
        if (event.key === 'ArrowUp') {
          this.selectionIndex.set(this.selectionIndex() - 1);

          if (this.selectionIndex() < 0) {
            this.selectionIndex.set(this.searchResultComponent.instance.items.length - 1);
          }

          if (!this.multiple()) {
            this.elementRef.nativeElement.value = this.searchResultComponent.instance.items[this.selectionIndex()];
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

}

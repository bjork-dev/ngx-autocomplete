import {
  AfterViewInit,
  ComponentRef, DestroyRef,
  Directive,
  ElementRef, EventEmitter,
  input,
  OnDestroy, Output,
  Renderer2,
  signal,
  ViewContainerRef
} from '@angular/core';
import {Searcher} from "./searcher";
import {SearchResultComponent} from "./search-result/search-result.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {fromEvent} from "rxjs";

@Directive({
  standalone: true,
  selector: '[ngxAutoComplete]',
})
export class NxgAutoCompleteDirective implements OnDestroy, AfterViewInit {
  ngxAutoComplete = input<string[]>([]);
  ngxAutoCompleteMaxResults = input<number>(0);

  selectionIndex = signal(-1);

  private searchResultComponent: ComponentRef<SearchResultComponent>;
  @Output() ngxAutoCompleteItemSelected = new EventEmitter<string>();

  constructor(private elementRef: ElementRef, private renderer: Renderer2, viewContainerRef: ViewContainerRef,
              private destroyRef: DestroyRef) {



    this.searchResultComponent = viewContainerRef.createComponent(SearchResultComponent);

    // set the components elemenref parent to the input element
    this.searchResultComponent.instance.elementRef.nativeElement.style.position = 'absolute';
    this.searchResultComponent.instance.elementRef.nativeElement.style.top = elementRef.nativeElement.offsetHeight + 20 + 'px';
    this.searchResultComponent.instance.elementRef.nativeElement.style.width = elementRef.nativeElement.offsetWidth - 10 + 'px';
    // this.searchResultComponent.instance.elementRef.nativeElement.style.zIndex = '9999';
    // this.searchResultComponent.instance.elementRef.nativeElement.style.backgroundColor = 'white';


    // this.searchResultComponent.instance.width = elementRef.nativeElement.offsetWidth - 2;
    this.searchResultComponent.instance.itemSelected.pipe(
      takeUntilDestroyed()
    )
      .subscribe((item: string) => {
        this.elementRef.nativeElement.value = item;
        this.searchResultComponent.instance.hidden = true

        const index = this.ngxAutoComplete().indexOf(item);
        this.selectionIndex.set(index);

        this.ngxAutoCompleteItemSelected.emit(item);
      });

  }

  ngAfterViewInit(): void {
    this.searchResultComponent.instance.items = this.ngxAutoComplete();
    const searcher = new Searcher(this.ngxAutoComplete());

    fromEvent(this.elementRef.nativeElement, 'input').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: any) => {
      const query = event.target.value;
      this.searchResultComponent.instance.items = searcher.search(query, this.ngxAutoCompleteMaxResults());
      this.searchResultComponent.instance.hidden = this.elementRef.nativeElement.value === '';
    });

    fromEvent(this.elementRef.nativeElement, 'focus').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.searchResultComponent.instance.hidden = false;
    });

    fromEvent(document, 'click').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: any) => {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.searchResultComponent.instance.hidden = true;
      }
    });

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: any) => {
      if (event.key === 'Enter') {
        const selectedItem = this.searchResultComponent.instance.items[this.selectionIndex()];
        if (selectedItem) {
          this.elementRef.nativeElement.value = selectedItem;
          this.ngxAutoCompleteItemSelected.emit(selectedItem);
          this.elementRef.nativeElement.blur();
        }
        this.searchResultComponent.instance.hidden = true;
      }
    });

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: any) => {
      if (event.key === 'Escape') {
        this.searchResultComponent.instance.hidden = true;
        this.elementRef.nativeElement.blur();
      }
    });

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: any) => {
      if (event.key === 'ArrowDown') {
        this.selectionIndex.set(this.selectionIndex() + 1);

        if (this.selectionIndex() >= this.searchResultComponent.instance.items.length) {
          this.selectionIndex.set(0);
        }

        this.elementRef.nativeElement.value = this.searchResultComponent.instance.items[this.selectionIndex()];

        const childItems = this.searchResultComponent.instance.elementRef.nativeElement.children[0].children;

        this.renderer.addClass(childItems[this.selectionIndex()], 'highlight');
        if (this.selectionIndex() > 0) {
          this.renderer.removeClass(childItems[this.selectionIndex() - 1], 'highlight');
        } else {
          this.renderer.removeClass(childItems[childItems.length - 1], 'highlight');
        }
      }

    });

    fromEvent(document, 'keydown').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: any) => {
      if (event.key === 'ArrowUp') {
        this.selectionIndex.set(this.selectionIndex() - 1);

        if (this.selectionIndex() < 0) {
          this.selectionIndex.set(this.searchResultComponent.instance.items.length - 1);
        }

        this.elementRef.nativeElement.value = this.searchResultComponent.instance.items[this.selectionIndex()];

        const childItems = this.searchResultComponent.instance.elementRef.nativeElement.children[0].children;

        this.renderer.addClass(childItems[this.selectionIndex()], 'highlight');
        if (this.selectionIndex() < childItems.length - 1) {
          this.renderer.removeClass(childItems[this.selectionIndex() + 1], 'highlight');
        } else {
          this.renderer.removeClass(childItems[0], 'highlight');
        }

      }
    });
  }

  ngOnDestroy(): void {

  }

}

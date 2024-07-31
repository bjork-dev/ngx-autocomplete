import {Component, ElementRef, EventEmitter, HostListener} from '@angular/core';
import {NgStyle} from "@angular/common";

@Component({
  selector: 'search-result',
  standalone: true,
  imports: [
    NgStyle
  ],
  styles: [
    `
      .card {
        border: 1px solid #c3c3c3;
        border-radius: 0 0 8px 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        background-color: white;
        max-height: 400px;
        overflow-y: auto;
        width: 100%;
      }

      .item {
        padding: 8px;
      }

      .item:hover {
        background-color: #f9f9f9;
      }

      .highlight {
        background-color: #f9f9f9;
      }
    `
  ],
  template: `
    @if (!hidden) {
      <div class="card">
        @for (item of items; track item) {
          <div class="item" (click)="selectItem(item)">{{ item }}</div>
        }
      </div>
    }
  `
})
export class SearchResultComponent {
  // width = 200;
  hidden = false;
  items: string[] = [];

  itemSelected = new EventEmitter<string>();

  constructor(public elementRef: ElementRef) {

  }

  selectItem(item: string) {
    this.itemSelected.emit(item);
  }
}

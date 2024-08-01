import {Component, ElementRef, EventEmitter} from '@angular/core';
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
        border-radius: 8px 8px 8px 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        background-color: white;
        max-height: 400px;
        overflow-y: auto;
      }

      .item {
        padding: 12px;
        width: 100%;
        user-select: none;
        font-family: inherit;
      }

      .item:hover {
        background-color: #f9f9f9;
      }

      .highlight {
        background-color: #f9f9f9;
      }

      .container {
        display: flex;
        width: 100%;
      }
    `
  ],
  template: `
    @if (!hidden) {
      <div class="card">
        @for (item of items; track item) {
          <div class="container">

            <div class="item" (click)="selectItem(item)">
              @if (multiple) {
                <input type="checkbox" [checked]="checked(item)">
              }
              {{ item }}
            </div>
          </div>
        }
      </div>
    }
  `
})
export class SearchResultComponent {
  hidden = false;
  items: string[] = [];
  multiple = false;

  _selectedItems: string[] = [];

  itemSelected = new EventEmitter<string>();
  itemRemoved = new EventEmitter<string>();

  constructor(public elementRef: ElementRef) {

  }

  selectItem(item: string) {
    if (!this._selectedItems.includes(item)) {
      this._selectedItems.push(item);
      this.itemSelected.emit(item);
    } else {
      this.removeItem(item);
    }
  }

  removeItem(item: string) {
    this._selectedItems = this._selectedItems.filter(i => i !== item);
    this.itemRemoved.emit(item);
  }

  checked(item: string): boolean {
    return this._selectedItems.includes(item);
  }
}

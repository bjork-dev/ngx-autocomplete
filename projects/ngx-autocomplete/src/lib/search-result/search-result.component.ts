import {Component, ElementRef, EventEmitter, Renderer2, signal} from '@angular/core';
import {NgClass, NgStyle} from "@angular/common";

@Component({
  selector: 'search-result',
  standalone: true,
  imports: [
    NgStyle,
    NgClass
  ],
  styles: [
    `
      .ngx-autocomplete-card {
        border: 1px solid #c3c3c3;
        border-radius: 8px 8px 8px 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        overflow-y: auto;
      }

      .light {
        background-color: white;
        color: #353535;
      }

      .dark {
        background-color: #3a3a3a;
        color: white;
      }

      .item {
        padding: 12px;
        width: 100%;
        user-select: none;
      }

      .light .item:hover {
        background-color: #f9f9f9;
      }

      .dark .item:hover {
        background-color: #2a2a2a;
      }

      .light .highlight {
        background-color: #f9f9f9;
      }

      .dark .highlight {
        background-color: #2a2a2a;
      }

      .container {
        display: flex;
        width: 100%;
      }
    `
  ],
  template: `
    @if (!hidden()) {
      <div class="ngx-autocomplete-card" [ngClass]="{
        'light': style() === 'light',
        'dark': style() === 'dark'
      }" [ngStyle]="{'max-height': maxHeight()
      } ">
        @for (item of items(); track item) {
          <div class="container">
            <div class="item"
                 (click)="selectOrRemoveItem(item)">
              @if (multiple()) {
                <input type="checkbox" [ngStyle]="{'accent-color': checkboxColor()}" [checked]="checked(item)">
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
  hidden = signal(true);
  items = signal<string[]>([]);
  multiple = signal(false);
  style = signal<'light' | 'dark'>('light');
  checkboxColor = signal<string>('#a8a8a8');
  maxHeight = signal<string>('400px');

  _selectedItems = signal<string[]>([]);

  itemSelected = new EventEmitter<string>();
  itemRemoved = new EventEmitter<string>();

  constructor(public renderer: Renderer2, public elementRef: ElementRef) {

  }

  selectOrRemoveItem(item: string) {
    if (!this._selectedItems().includes(item)) {
      this._selectedItems.update(i => [...i, item]);
      this.itemSelected.emit(item);
    } else {
      this.removeItem(item);
    }
  }

  removeItem(item: string) {
    this._selectedItems.update(i => i.filter(i => i !== item));
    this.itemRemoved.emit(item);
  }

  checked(item: string): boolean {
    return this._selectedItems().includes(item);
  }
}

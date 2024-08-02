import {Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NxgAutoCompleteDirective} from "../../../ngx-autocomplete/src/lib/ngx-autocomplete.directive";
import {NgxAutoCompleteWindowEvent} from "../../../ngx-autocomplete/src/lib/ngx-auto-complete-window.event";
import {bigSampleData} from "./big-data";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NxgAutoCompleteDirective],
  styles: [
    `
      .row {
        display: flex;
        justify-content: space-around;
      }

      .column {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      input {
        display: block; /* Block needed for popup window to render properly */
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 50%;
      }

      .dark {
        background-color: #3a3a3a;
        color: white;
      }
    `
  ],
  template: `
    <div class="row">
      <div class="column">
        <h1>Multiple selection</h1>
        <h3>Selected: {{ multipleItems() }}</h3>
        <h3>
          Window opened: {{ multipleWindowOpened() }}
        </h3>
        <div>
          <input [ngxAutoComplete]="sampleData"
                 [multiple]="true"
                 [showWindowOnFocus]="true"
                 (ngxAutoCompleteItemSelected)="onMultipleItemSelected($event)"
                 (ngxAutoCompleteItemRemoved)="onMultipleItemRemoved($event)"
                 (ngxAutCompleteWindowChanged)="onMultipleWindowChange($event)"
                 placeholder="🔎Search">

        </div>
      </div>

      <div class="column">

        <h1>Single selection</h1>
        <h3>Selected: {{ singleItem() }}</h3>
        <h3>
          Window opened: {{ singleWindowOpened() }}
        </h3>
        <div>
          <input
            [ngxAutoComplete]="sampleData"
            [showWindowOnFocus]="true"
            [multiple]="false"
            (ngxAutoCompleteItemSelected)="onSingleItemSelected($event)"
            (ngxAutoCompleteItemRemoved)="onSingleItemRemoved()"
            (ngxAutCompleteWindowChanged)="onSingleWindowChange($event)"
            placeholder="🔎Search">

        </div>
      </div>
    </div>
    <div style="height: 300px"></div>

    <div class="row">
      <div class="column">
        <h1>Dark mode with custom checkbox color</h1>
        <div>
          <input class="dark"
                 [ngxAutoComplete]="bigSampleData"
                 [showWindowOnFocus]="true"
                 [multiple]="true"
                 [style]="'dark'"
                 [checkboxColor]="'#00ef0b'"
                 [maxHeight]="'150px'"
                 [ngxAutoCompleteMaxResults]="3"
                 placeholder="🔎Search">
        </div>
      </div>
    </div>
  `
})
export class AppComponent {
  sampleData = ['Stockholm', 'Oslo', 'Copenhagen', 'Helsinki', 'Amsterdam', 'Figi'];

  singleItem = signal<string>('');
  multipleItems = signal<string[]>([]);

  singleWindowOpened = signal(false);
  multipleWindowOpened = signal(false);

  onMultipleItemSelected(item: string) {
    this.multipleItems.set([...this.multipleItems(), item]);
  }

  onSingleItemSelected(item: string) {
    this.singleItem.set(item);
  }

  onMultipleItemRemoved(item: string) {
    if (item === '') {
      this.multipleItems.set([]);
      return;
    }

    this.multipleItems.update(items => items.filter(i => i !== item));
  }

  onSingleItemRemoved() {
    this.singleItem.set('');
  }

  onSingleWindowChange(event: NgxAutoCompleteWindowEvent) {
    this.singleWindowOpened.set(event.opened);
  }

  onMultipleWindowChange(event: NgxAutoCompleteWindowEvent) {
    this.multipleWindowOpened.set(event.opened);
  }

  protected readonly bigSampleData = bigSampleData;
}

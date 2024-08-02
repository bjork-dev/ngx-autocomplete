import {Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NxgAutoCompleteDirective} from "../../../ngx-autocomplete/src/lib/ngx-autocomplete.directive";
import {NgxAutoCompleteWindowEvent} from "../../../ngx-autocomplete/src/lib/ngx-auto-complete-window.event";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NxgAutoCompleteDirective],
  styles: [
    `
      input {
        display: block; /* Block needed for popup window to render properly */
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 50%;
      }
    `
  ],
  template: `
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
    <div style="height: 300px"></div>
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
}

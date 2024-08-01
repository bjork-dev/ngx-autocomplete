import {Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NxgAutoCompleteDirective} from "../../../ngx-autocomplete/src/lib/ngx-autocomplete.directive";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NxgAutoCompleteDirective],
  styles: [
    `
      .container {
        position: absolute;
        top:0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        width: 50%;
        height: 100px;
      }

      .card {
        border: 1px solid #c3c3c3;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        padding: 12px;
      }

      input {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        display: block;
        width: 97%;
      }
    `
  ],
  template: `
    <div class="card container">
      <input [ngxAutoComplete]="sampleData"
             [multiple]="multiple()"
             (ngxAutoCompleteItemSelected)="onItemSelected($event)"
             (ngxAutoCompleteItemRemoved)="onItemRemoved($event)"
             placeholder="🔎Search">

      <div>
        <div>
        </div>
      </div>
    </div>
    <h1>Selected: {{ selectedItems() }}</h1>

  `
})
export class AppComponent {
  sampleData = ['Stockholm', 'Oslo', 'Copenhagen', 'Helsinki', 'Amsterdam', 'Figi'];

  selectedItems = signal<string[]>([]);

  multiple = signal(true);

  onItemSelected(item: string) {
    if(this.multiple()) {
      this.selectedItems.set([...this.selectedItems(), item]);
      return;
    }
    this.selectedItems.set([item]);
  }

  onItemRemoved(item: string) {

    if(item === '') {
      this.selectedItems.set([]);
      return;
    }

    this.selectedItems.update(items => items.filter(i => i !== item));
  }
}

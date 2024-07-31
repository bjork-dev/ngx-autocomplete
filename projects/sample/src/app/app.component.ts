import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NxgAutoCompleteDirective} from "../../../ngx-autocomplete/src/lib/ngx-autocomplete.directive";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NxgAutoCompleteDirective],
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
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
        width: 100%;
      }
    `
  ],
  template: `
    <div class="card container">
      <input [ngxAutoComplete]="sampleData" (ngxAutoCompleteItemSelected)="onItemSelected($event)"
             placeholder="🔎Search">

      <div>
        <h1 style="font-family: 'Corbel Light',sans-serif">Selected item: {{ selectedItem() }}</h1>
      </div>
    </div>
  `
})
export class AppComponent {
  sampleData = ['Stockholm', 'Oslo', 'Copenhagen', 'Helsinki', 'Amsterdam', 'Figi'];

  selectedItem = signal('');

  onItemSelected(item: string) {
    this.selectedItem.set(item);
  }
}

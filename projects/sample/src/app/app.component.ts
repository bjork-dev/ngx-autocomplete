import {ChangeDetectionStrategy, Component, effect, signal} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {NxgAutoCompleteDirective} from "../../../ngx-autocomplete/src/lib/ngx-autocomplete.directive";
import {NgxAutoCompleteWindowEvent} from "../../../ngx-autocomplete/src/lib/events/ngx-auto-complete-window.event";
import {bigSampleData} from "./big-data";

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NxgAutoCompleteDirective],
  styles: [
    `

      .search {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        width: 50%;
      }

      .card {
        border: 1px solid #c3c3c3;
        border-radius: 8px 8px 8px 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        padding: 20px;
        margin: 0 30px 0 30px;
      }

      .container {
        display: flex;
        width: 100%;
        justify-content: center;
        align-items: center;
        height: 100%;
      }

    `
  ],
  template: `
    <h1>ngx-autocomplete Demo</h1>
    <div class="card">
      <h3>Configure</h3>
        <div>
          <input type="number" [value]="maxResults()" (input)="setMaxResults($event.target)" style="width: 80px"
                 min="0" max="999">
          <label style="margin-left: 10px">Max Results (0 = All)</label>
        </div>
        <div style="margin: 20px 0 20px 0"></div>
        <div>
          <input type="checkbox" [checked]="multiple()" (change)="setMultiple($event.target)">
          <label style="margin-left: 10px">Multiple</label>
        </div>
        <div style="margin: 20px 0 20px 0"></div>
        <div>
          <input type="checkbox" [checked]="showWindowOnFocus()" (change)="setShowWindowOnFocus($event.target)">
          <label style="margin-left: 10px">Show Window on Focus</label>
        </div>
        <div style="margin: 20px 0 20px 0"></div>
        <div>
          <select (change)="setStyle($event.target)" style="width: 88px">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <label style="margin-left: 10px">Style</label>
        </div>
        <div style="margin: 20px 0 20px 0"></div>
        <div>
          <input type="text" [value]="checkboxColor()" (input)="setCheckboxColor($event.target)" style="width: 80px">
          <label style="margin-left: 10px">Checkbox Color</label>
        </div>
        <div style="margin: 20px 0 20px 0"></div>
        <div>
          <input type="text" [value]="maxHeight()" (input)="setMaxHeight($event.target)" style="width: 80px">
          <label style="margin-left: 10px">Max Height</label>
        </div>
      </div>

    <h3>Selected: {{ items() }}</h3>

    <h3>
      Window opened: {{ windowOpened() }}
    </h3>

    <div class="card">
      <div class="container">
        <input class="search"
               [ngxAutoComplete]="bigSampleData"
               [multiple]="multiple()"
               [ngxAutoCompleteMaxResults]="maxResults()"
               [showWindowOnFocus]="showWindowOnFocus()"
               [style]="style()"
               [checkboxColor]="checkboxColor()"
               [maxHeight]="maxHeight()"
               (ngxAutoCompleteItemSelected)="onItemSelected($event)"
               (ngxAutoCompleteItemRemoved)="onItemRemoved($event)"
               (ngxAutCompleteWindowChanged)="onWindowChange($event)"
               placeholder="🔎Search">

      </div>
    </div>
  `
})
export class AppComponent {
  maxResults = signal<number>(0);
  multiple = signal<boolean>(true);
  showWindowOnFocus = signal<boolean>(true);
  style = signal<'light' | 'dark'>('light');
  checkboxColor = signal<string>('#a8a8a8');
  maxHeight = signal<string>('400px');

  items = signal<string[]>([]);

  windowOpened = signal(false);

  constructor() {
    effect(() => {
      const multiple = this.multiple();

      this.items.set([]);
    }, {
      allowSignalWrites: true
    });
  }

  onItemSelected(item: string) {
    this.multiple()
      ? this.items.set([...this.items(), item])
      : this.items.set([item]);
  }

  onItemRemoved(item: string) {
    if (item === '') {
      this.items.set([]);
      return;
    }

    this.multiple()
      ? this.items.set(this.items().filter(i => i !== item))
      : this.items.set([]);
  }


  onWindowChange(event: NgxAutoCompleteWindowEvent) {
    this.windowOpened.set(event.opened);
  }

  setMaxResults(value: EventTarget | null) {
    const parsedValue = value as HTMLInputElement;

    if (parsedValue?.value !== null) {
      let value = parseInt(parsedValue.value, 10);

      if (isNaN(value)) {
        value = 0;
      }

      if (value < 0) {
        value = 0;
      }

      if (value > 999) {
        value = 999;
      }

      this.maxResults.set(value);
    }
  }

  setMultiple(target: EventTarget | null) {
    this.multiple.set((target as HTMLInputElement).checked);
  }


  setShowWindowOnFocus(target: EventTarget | null) {
    this.showWindowOnFocus.set((target as HTMLInputElement).checked);
  }

  setStyle(target: EventTarget | null) {
    const style = (target as HTMLSelectElement).value as 'light' | 'dark';
    this.style.set(style);
  }

  setCheckboxColor(target: EventTarget | null) {
    this.checkboxColor.set((target as HTMLInputElement).value);
  }

  setMaxHeight(target: EventTarget | null) {
    this.maxHeight.set((target as HTMLInputElement).value);
  }

  protected readonly bigSampleData = bigSampleData;
}

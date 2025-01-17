# @bjorkdev/ngx-autocomplete

> This package is in pre-release, features are still being added and tested.

## [Demo](https://bjork-dev.github.io/ngx-autocomplete/)

# Overview
This library provides a directive that can turn any input field into an autocomplete field.

# Pre-release limitations
- Only supports string arrays as input. Objects will be supported in the future.
- Styling is limited to light and dark themes.
- Only returns strings. Key accessor to be added.
- Placement of the window is not configurable.

# Contents

- [Getting Started](#getting-started)
- [API Reference](#api-reference)
  - [Inputs](#inputs)
  - [Outputs](#outputs)
- [Navigation](#navigation)

# Getting Started

Import `NxgAutoCompleteDirective` to your component:

```ts
@Component({
  selector: 'whatever',
  standalone: true,
  imports: [NxgAutoCompleteDirective]
...
```

Apply the directive to the input element and provide the data:

```ts
const sampleData = ['apple', 'banana', 'cherry', 'date'];
```
```html
<input [ngxAutoComplete]="sampleData" />
```


# API Reference

## Inputs

|       Input        |        Type         | Description                                                                      | Default   |
| :----------------: |:-------------------:|:---------------------------------------------------------------------------------|:----------|
|        `ngxAutoComplete`        |     `string[]`      | The data to render.                                                              | `[]`      |
|       `ngxAutoCompleteMaxResults`       |      `number`       | Max amount of results to display in the window. Default will display everything. | `0`       |
|   `multiple`    |      `boolean`      | Configures the window to allow multiple selections.                              | `false`   |
|     `showWindowOnFocus`      |      `boolean`      | Sets whether the window should popup on input focus.                             | `false`   |
| `style` | `'light' or 'dark'` | Sets the color of the window.                                                    | `light`   |
| `checkboxColor` |      `string`       | The accent-color of the checkbox if `multiple` is selected.                      | `#a8a8a8` |
|   `maxHeight`   |      `string`       | Max height of the window.                                                        | `400px`   |

## Outputs

|             Input              |          Type          | Description                                  |
|:------------------------------:| :--------------------: |:---------------------------------------------|
| `ngxAutoCompleteItemSelected`  | `EventEmitter<string>` | Emitted when an item is selected.            |
|  `ngxAutoCompleteItemRemoved`  | `EventEmitter<string>` | Emitted when an item is unselected.          |
| `ngxAutoCompleteWindowChanged` | `EventEmitter<NgxAutoCompleteWindowEvent>` | Emitted when the window is opened or closed. |


# Navigation

|            Key            |                                        Meaning                                        |
|:-------------------------:|:-------------------------------------------------------------------------------------:|
| `arrow up` / `arrow down` |                             Navigate through the options.                             |
|          `enter`          |              Selects / adds the current active option from the dropdown.              |
|         `escape`          |                                  Hides the dropdown.                                  |
|        `Backspace`        | Removes the last item selected from the input or the last character if partial query. |


# Full Example
https://github.com/bjork-dev/ngx-autocomplete/blob/master/projects/sample/src/app/app.component.ts

# License

This project is licensed under the [MIT License](https://github.com/bjork-dev/ngx-autocomplete/blob/master/LICENSE).

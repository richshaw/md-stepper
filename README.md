# Angular Material Stepper

## Description

A stepper directive based on the [Material Design Specificationn](https://www.google.com/design/spec/components/steppers.html).


## Status

* Currently in development
* CSS is only present for horizontal stepper
* Vertical stepper is a todo
* Mobile stepper is a todo

## Dependencies 

Requires [Angular](https://github.com/angular/angular) and [Angular Material](https://github.com/angular/material)

## Demo

Demo is available on [Codepen](http://codepen.io/richshaw/pen/dGzorx)

## Installation

In your index.html file, include the stepper module and style sheet.

```html
<!-- style sheet -->
<link href="../md-stepper/src/stepper.css" rel="stylesheet" type="text/css"/>
<!-- module -->
<script type="text/javascript" src="../src/md-stepper/stepper.js"></script>
```

Include the material.components.stepper module as a dependency in your application.

```javascript
angular.module('myApp', ['ngMaterial', 'material.components.stepper']);
```

## Usage

### Basic markup

```html
<md-stepper md-direction="">
  <md-step>
      <md-step-circle></md-step-circle>
      <md-step-text></md-step-text>
  </md-step>
</md-stepper>
```

### Example markup
```html
<md-stepper class="margin-bottom" md-direction="horizontal">
  <md-step class="done">
      <md-step-circle><md-icon md-svg-icon="action:ic_done_24px"></md-icon></md-step-circle>
      <md-step-text>Create experiment</md-step-text>
  </md-step>
  <md-step class="done">
      <md-step-circle><md-icon md-svg-icon="action:ic_done_24px"></md-icon></md-step-circle>
      <md-step-text>Experiment settings</md-step-text>
  </md-step>
  <md-step class="active">
      <md-step-circle>3</md-step-circle>
      <md-step-text>Add ideas</md-step-text>
  </md-step>
  <md-step>
      <md-step-circle>4</md-step-circle>
      <md-step-text>Launch</md-step-text>
  </md-step>
</md-stepper>
```

### Parameters

* md-direction = horizontal (vertical layout hasn't been implemented yet)

## License

This software is provided free of charge and without restriction under the MIT License.

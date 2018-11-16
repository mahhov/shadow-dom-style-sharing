## what is this

polyfills `::theme` and `::part` to support sharing css styling between custom elements

see `https://meowni.ca/posts/part-theme-explainer/` for more information on these selectors

## setup

### install package

`npm i -s shadow-dom-style-sharing`

### import

#### using as a node modules 

`const {process} = require('shadow-dom-style-sharing')`

#### using as a es6 modules

`import {process} from 'build-path-to-shared-styling/es6/index.js';`

#### using <es6 with no build tool

```html
<script>window.module = {};</script>
<script src="build-path-to-shared-styling/src/index.js"></script>
```

### usage `process(root, changed)`

invoke `process` each time you'd like to update the styling. this will typically need to be done once the DOM loads:

```html
document.addEventListener('DOMContentLoaded', () => {
   process(document); 
});
```

and again when new elements are added to the DOM:

```html
let myElement = document.createElement('my-element');
document.appendChild(myElement);
process(document, myElement);
```

the first argument to `process` should be the root element style rules are relative to. This is typically always the document.

the second argument to `process` is optional and scopes the style rules to only be added to that element. This is useful to avoid css rule duplication when invoking `process` multiple times; e.g. when dynamically adding elements to the DOM after it has loaded.

## limitations

### syntax

at the moment, to avoid having to re-parse the css styling, we reuse the browser's parsed `document.styleSheets`. Unfortunately, browsers prune invalid `css` when generating `document.styleSheets`. This means we're unable to use custom pseudo-selectors such as `::theme` and `::part`, and instead use the `.theme` and `.part` syntax. Furthermore, as class selectors, e.g. `.part`, can't have parenthetical parameters, we must use `.pend` to indicate the end of .part, otherwise it will be assumed to end at the next `.theme`, `.part`, or `;`.

## example

### .theme

```html
!example[./test/themeTest.html]
```

### .part

```html
!example[./test/partTest.html]
```

### styling dynamically modified dom

```html
!example[./test/processTest.html]
```

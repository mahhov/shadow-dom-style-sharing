## what is this

polyfills `::theme` and `::part` to support sharing css styling between custom elements

see `https://meowni.ca/posts/part-theme-explainer/` for more information on these selectors

## setup

### install package

`npm i -s shadow-dom-style-sharing`

### import

#### html

`<script src="build-path-to-shadow-dom-style-sharing/index.js"></script>`

#### js: if using browserify

`require('shadow-dom-style-sharing')`

#### js: if using some other build bundler

`import --todo--`

## limitations

### syntax

at the moment, to avoid having to re-parse the css styling, we reuse the browser's parsed `document.styleSheets`. Unfortunately, browsers prune invalid `css` when generating `document.styleSheets`. This means we're unable to use custom pseudo-selectors such as `::theme` and `::part`, and instead use the `.theme` and `.part` syntax. Furthermore, as class selectors, e.g. `.part`, can't have parenthetical parameters, we must use `.partend` to indicate the end of .part, otherwise it will be assumed to end at the next `.theme`, `.part`, or `;`.

## example

### .theme

```html
!example[./test/themeTest.html]
```

### .part

```html
!example[./test/partTest.html]
```

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

`const {process} = require('shadow-dom-style-sharing')`

#### js: if using some other build bundler

`import {process} from '../node_modules_build_path/shadow-dom-style-sharing.js'
`
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
<!-- styling -->

<style>
	.theme .line-orange {
		color: orange;
		border: 1px solid orange;
	}
</style>

<!-- html -->

<p class="line-orange">inline black</p>

<my-element></my-element>

<template id="my-template">
	<p class="line-orange">element orange</p>
	<my-element-nested part="nested-element"></my-element-nested>
	<div part="nested-div">
		<p class="line-orange">nested div orange</p>
	</div>
</template>

<template id="my-element-nested">
	<p class="line-orange">nested element orange</p>
</template>

<!-- set up custom elements -->

<script>
	customElements.define('my-element', class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({mode: 'open'});
			const template = document.getElementById('my-template').content.cloneNode(true);
			this.shadowRoot.appendChild(template);
		}
	});

	customElements.define('my-element-nested', class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({mode: 'open'});
			const template = document.getElementById('my-element-nested').content.cloneNode(true);
			this.shadowRoot.appendChild(template);
		}
	});
</script>

<!-- apply shared css styling -->

<script type="module">
	import {process} from '../src/index.js'
	document.addEventListener('DOMContentLoaded', () => process(document));
</script>

```

### .part

```html
<!-- styling -->

<style>
	my-element .part line-orange,
	my-element .part nested-element .partend .part nested-line-orange,
	my-element .part nested-div .partend .line-orange {
		color: orange;
		border: 1px solid orange;
	}
</style>

<!-- html -->

<p class="line-orange">inline black</p>

<my-element></my-element>

<template id="my-template">
	<p part="line-orange">element black</p>
	<my-element-nested part="nested-element"></my-element-nested>
	<div part="nested-div">
		<p class="line-orange">nested div orange</p>
	</div>
</template>

<template id="my-element-nested">
	<p part="nested-line-orange">nested element part orange</p>
</template>

<!-- set up custom elements -->

<script>
	customElements.define('my-element', class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({mode: 'open'});
			const template = document.getElementById('my-template').content.cloneNode(true);
			this.shadowRoot.appendChild(template);
		}
	});

	customElements.define('my-element-nested', class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({mode: 'open'});
			const template = document.getElementById('my-element-nested').content.cloneNode(true);
			this.shadowRoot.appendChild(template);
		}
	});
</script>

<!-- apply shared css styling -->


<script type="module">
	import {process} from '../src/index.js'
	document.addEventListener('DOMContentLoaded', () => process(document));
</script>


```

### styling dynamically modified dom

```html
<!-- styling -->

<style>
	.theme .line-orange {
		color: orange;
		border: 1px solid orange;
	}
</style>

<!-- html -->

<p class="line-orange">inline black</p>

<my-element></my-element>

<template id="my-template">
	<p class="line-orange">element orange</p>
	<div id="nested-element-placeholder"></div>
	<div part="nested-div">
		<p class="line-orange">nested div orange</p>
	</div>
</template>

<template id="my-element-nested">
	<p class="line-orange">nested element orange</p>
</template>

<!-- set up custom elements -->

<script>
	customElements.define('my-element', class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({mode: 'open'});
			const template = document.getElementById('my-template').content.cloneNode(true);
			this.shadowRoot.appendChild(template);
		}
	});

	customElements.define('my-element-nested', class extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({mode: 'open'});
			const template = document.getElementById('my-element-nested').content.cloneNode(true);
			this.shadowRoot.appendChild(template);
		}
	});
</script>

<!-- apply shared css styling -->

<script type="module">
	import {process} from '../src/index.js'

	document.addEventListener('DOMContentLoaded', () => process(document));

	setTimeout(() => {
		let nestedElement = document.createElement('my-element-nested');
		document.querySelector('my-element').shadowRoot.querySelector('#nested-element-placeholder').appendChild(nestedElement);
		process(document, nestedElement);
	}, 500);

	setTimeout(() => {
		let nestedElement = document.createElement('my-element-nested');
		document.querySelector('my-element').shadowRoot.querySelector('#nested-element-placeholder').appendChild(nestedElement);
		process(document, nestedElement);
	}, 1000);
</script>

```


<br><br><sub><sub>this markdown was generated by [de-document-examples](https://www.npmjs.com/package/de-document-examples)</sub></sub>
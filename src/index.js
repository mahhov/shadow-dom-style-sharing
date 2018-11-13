// given a list of roots, returns new roots that match a select query within those roots
let queryRoots = (roots, select) =>
	roots.flatMap(root => [...root.querySelectorAll(select)]);

// given a list of roots, returns the shadowRoots of all the roots that have shadowRoots
let getShadowRoots = roots =>
	roots
		.filter(element => element.shadowRoot)
		.map(element => element.shadowRoot);

// given a list of roots, returns direct decedent shadowRoots nested within the roots
let selectDirectShadowRoots = roots =>
	roots.flatMap(root => getShadowRoots([...root.querySelectorAll('*')]));

// given a list of roots, returns decedent shadowRoots nested within the roots
let selectShadowRoots = roots => {
	roots = selectDirectShadowRoots(roots);
	for (let i = 0; i < roots.length; i++)
		roots.push(...selectDirectShadowRoots([roots[i]]));
	return roots;
};

// given a shadowRoot, gives the edit style of the shadowRoot
let getShadowRootEditStyle = shadowRoot => {
	if (shadowRoot.editStyle)
		return shadowRoot.editStyle;
	shadowRoot.appendChild(document.createElement('style'));
	return shadowRoot.editStyle = shadowRoot.styleSheets[0];
};

document.addEventListener('DOMContentLoaded', () => {
	[...document.styleSheets]
		.flatMap(styleSheet => [...styleSheet.rules])
		.forEach(rule => {
			if (!rule.selectorText)
				return;

			if (!/\.(theme|part)[^\w-]/.test(rule.selectorText))
				return;

			let styleText = rule.cssText.match(/{(.*)}/)[1];

			rule.selectorText.split(',').forEach(subSelectorText => {
				let shadowSelects = subSelectorText
					.split(/(\.(?:theme|partend|part))/)
					.map(select => select.trim())
					.filter(select => select);

				if (shadowSelects.length <= 1)
					return;

				let roots = [document];
				let remainderPartSelector = '';
				let skip = 0;

				shadowSelects.forEach((select, i) => {
					if (skip) {
						skip--;
						return;
					}

					let nextSelect = shadowSelects[i + 1] || '';

					switch (select) {
						case '.theme':
							if (remainderPartSelector)
								roots = queryRoots(roots, remainderPartSelector);
							roots = selectShadowRoots(roots);
							break;
						case '.part':
							if (remainderPartSelector)
								roots = queryRoots(roots, remainderPartSelector);
							remainderPartSelector = `[part=${nextSelect}]`;
							skip += 2;
							roots = getShadowRoots(roots);
							break;
						default:
							remainderPartSelector += ' ' + select;
					}
				});

				roots
					.map(getShadowRootEditStyle)
					.forEach(styleSheet => styleSheet.addRule(remainderPartSelector, styleText));
			});
		});
});

/*
  LIMITATIONS

  must use `.part` instead of `::part`, and `.theme` instead of `::theme`
  as the browser prunes out invalid css rules form the `StyleSheetList`'s.

  .part cannot be followed by further selectors (since we assume whatever
  follows is the part identifier); e.g. `.part .x.y .z` is assumed to search
  for `<w part=".x.y .z">, unless using .partend to indicate where .part's
  parameter ends
*/

// todo
// check :host is correctly applies <link> rules
// iterate all style sheets, not just document's style sheet
// support dynamic run time application of .theme and .part to new shadow dom's added or new style rules added
// support ::theme and ::part() instead of .theme, .part, and .partend

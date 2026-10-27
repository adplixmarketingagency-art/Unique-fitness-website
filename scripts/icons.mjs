const paths = {
  "arrow-up-right": "M5 19 19 5M5 5h14v14",
  "arrow-right": "M4 12h16M13 5l7 7-7 7",
  "arrow-left": "M20 12H4m7-7-7 7 7 7",
  "arrow-down": "M12 4v16m-7-7 7 7 7-7",
};

export function renderIcon(name) {
  if (!paths[name]) throw new Error(`Unknown icon: ${name}`);
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${paths[name]}"/></svg>`;
}

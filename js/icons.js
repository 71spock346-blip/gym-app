/* Stay Strong — UI icon set.
 * Monoline 24×24 glyphs (stroke = currentColor) used everywhere the app
 * needs a small symbol: chips, buttons, stats, notes. One consistent set
 * instead of platform emoji, so the app looks the same on every phone. */

const UI_ICONS = {
  flame: '<path d="M12 3.5c.5 2.8 3.6 4.4 3.6 8.1a3.6 3.6 0 0 1-7.2 0c0-1.3.4-2.4 1.1-3.3.2 1.1.8 1.9 1.7 2.2-.2-2.4-.7-4.6.8-7z"/>',
  dumbbell: '<path d="M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12"/>',
  barbell: '<path d="M2 12h2M20 12h2M4 9v6M7 8v8M17 8v8M20 9v6M7 12h10"/>',
  machine: '<path d="M3 21h18M5 21v-6h6v6M8 15V9M5.5 8.5h5M14 5h6v16h-6zM14 9h6M14 13h6M14 17h6"/>',
  pullupBar: '<path d="M4 6h16M6 6v14M18 6v14M9 6v4M15 6v4"/>',
  trophy: '<path d="M8 4h8v4.5a4 4 0 0 1-8 0zM8 6H5.5a2.5 2.5 0 0 0 2.5 2.5M16 6h2.5A2.5 2.5 0 0 1 16 8.5M12 12.5V16M9 20h6M10 16h4v4h-4z"/>',
  calendar: '<path d="M4 6.5h16v13.5H4zM4 10.5h16M8 3.5v4M16 3.5v4"/>',
  book: '<path d="M4 5h5.5a2.5 2.5 0 0 1 2.5 2.5V20a2.5 2.5 0 0 0-2.5-2.5H4zM20 5h-5.5A2.5 2.5 0 0 0 12 7.5V20a2.5 2.5 0 0 1 2.5-2.5H20z"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/>',
  swap: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
  undo: '<path d="M9 14l-4-4 4-4M5 10h9a5 5 0 0 1 0 10h-3"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3"/>',
  hourglass: '<path d="M7 3h10M7 21h10M8 3c0 5 4 6 4 9s-4 4-4 9M16 3c0 5-4 6-4 9s4 4 4 9"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
  bolt: '<path d="M13 2.5L5 13h6l-1 8.5L19 10.5h-6z"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/>',
  activity: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor" stroke="none"/>',
  dot: '<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>',
  film: '<path d="M4 5h16v14H4zM8 5v14M16 5v14M4 9h4M4 15h4M16 9h4M16 15h4"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
};

/* Inline SVG for an icon; sized by CSS (.ico) and coloured by currentColor. */
function ico(name, cls = '') {
  const body = UI_ICONS[name] || UI_ICONS.dot;
  return `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
    `stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

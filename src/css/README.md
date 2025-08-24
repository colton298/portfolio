# Split CSS Guide

These files were split from your original `styles.css` while preserving order and specificity.
Include them in this order to maintain identical appearance, either via multiple <link> tags 
or a single `index.css` that uses `@import`.

## Files (load in this order)
01-base.css
02-links.css
03-components.css
04-forms-auth.css
05-contact.css
06-resume.css
07-projects.css
08-todo.css
09-schedule-timeline.css
10-week-view.css
11-month-view.css
12-themes.css

## Quick start (option A): One index file
Replace your existing reference with:

  <link rel="stylesheet" href="/css/index.css">

and place all split files together next to `index.css`.

## Quick start (option B): Multiple links
<link rel="stylesheet" href="/css/01-base.css">
<link rel="stylesheet" href="/css/02-links.css">
<link rel="stylesheet" href="/css/03-components.css">
<link rel="stylesheet" href="/css/04-forms-auth.css">
<link rel="stylesheet" href="/css/05-contact.css">
<link rel="stylesheet" href="/css/06-resume.css">
<link rel="stylesheet" href="/css/07-projects.css">
<link rel="stylesheet" href="/css/08-todo.css">
<link rel="stylesheet" href="/css/09-schedule-timeline.css">
<link rel="stylesheet" href="/css/10-week-view.css">
<link rel="stylesheet" href="/css/11-month-view.css">
<link rel="stylesheet" href="/css/12-themes.css">

## Notes
- The theme tokens and overrides stay identical. The `12-themes.css` file contains both light and pink themes.
- Small "Projects subheader" rules (the sticky subnav) were moved into `07-projects.css` from the end of the original file for clarity.
- If you use a build tool (Vite, Webpack, PostCSS), you can import `index.css` from your main entry instead of <link> tags.
- If you prefer SCSS, you can rename these to partials and `@use` them in the same order.

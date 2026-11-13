# Changelog

## v0.1.2

- Prepared for listing on [themes.gohugo.io](https://themes.gohugo.io/): complete `theme.toml` metadata (description, homepage, license link, tags, features, author), `[module.hugoVersion]` in the theme's `hugo.toml`, and a `go.mod` so the theme can also be imported as a Hugo Module.
- The README is now in English by default; the Chinese version moved to `README.zh-CN.md`. Images and links in both use absolute URLs.
- New screenshot and thumbnail showing the icons and the bunny.

## v0.1.1

- Icons: line icons for navigation menu items (home, archives, series, tags and about are matched automatically; override or disable with `params.icon`), dates in post lists and series pages, the article header (published/updated date, word count, reading time, tags), the series and tag overview pages, and the footer RSS link. New `params.header.navIcons` switch.
- Footer links: new `params.footer.links`, shown on the same line as the copyright and RSS, each with an icon (GitHub and email are detected automatically).
- Bunny: a little bunny that hops along the bottom of the page, blinks, follows the mouse with its eyes and jumps with a heart when clicked. Respects reduced motion and is hidden in print. Controlled by `params.pet.enable`, on by default.
- Narrow-screen header: the site title is no longer squeezed by the menu; the navigation shows text only on narrow screens.

## v0.1.0

- First release.

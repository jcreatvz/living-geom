# Living Geom

An experimental, browser-local kinetic typography studio. Static app; no build or server required. Serve `dist/` over HTTP.

## Run locally

From the repository root:

```sh
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. There is no dependency install or build step. Serve the app over HTTP rather than opening the HTML file directly, because the JavaScript uses ES modules. Google Fonts enhance the interface when available; system font fallbacks work offline.

The `dist/` directory contains the hand-authored application source, not generated build output. Deploy that directory to any static host. This repository does not enable GitHub Pages or configure automatic deployment.

## Parking lot — requested October 16, 2026

These items are recorded for later work. This repository import does not implement them.

- [ ] **Reorder type layers:** move a type layer up/down in the layer list and change its front-to-back stacking order on the artboard. Preserve the order in project save/load and all exports.
- [ ] **Multiple images:** support multiple independently selectable image layers, each with its own placement, scale, opacity, visibility and stacking order. Preserve them in saved projects and exports. Currently the editor supports one background photograph.
- [ ] **Motion speed:** expose a playback-speed control separately from duration, with a clear multiplier such as 0.25×–4×. Define how the speed applies to preview and animated exports. The engine already has a `speed` setting, but the interface does not expose it.
- [ ] **Custom font upload — verify and refine:** keep the requested upload workflow on the roadmap and test it in-browser, including glyph coverage and save/load. A basic **Type → Upload your own font** control already accepts WOFF, WOFF2, TTF and OTF (up to 5 MB) and embeds the uploaded font in project JSON. Multiple uploaded-font management is not implemented.

## Working in this version

- Live Canvas text mask sampling, multiline text and wrapping, font upload embedded into project JSON, typography controls and independent stable grid cells.
- Nineteen geometry choices (including two-color split circles, crossed bars, bowties and curved quarter modules), eight pattern rules, six palettes and nineteen editable visual presets.
- Independent text layers; exact sampled glyph membership and double-click letter selection; selection scale, rotate, flip and duplicate; select / shift-select / marquee, move, pan, paint, erase, repel, attract, rotation, scale, scatter and restoration brushes; cell locking and 35 undo states.
- Background photography: local JPG/PNG/WebP upload, cover fitting, zoom, drag, opacity, darkening, grayscale and visibility. Photos are resized to at most 2400 px on the longest side and embedded in JSON projects and SVG exports.
- Twelve motion choices including still life, five stagger orders, layered spin, timeline scrubbing, loop / ping-pong / once and intensity keyframes with smooth interpolation.
- Chromatic offset, echo, grain and scanlines.
- Current-frame PNG (up to 3×), vector SVG, real-time WebM where supported, 16-frame sprite sheet and editable JSON. Browser local storage keeps the last explicitly saved project as a convenient recovery copy.
- Keyboard shortcuts, reduced-motion defaults and responsive stacked controls.

## Scope for the next phases

This release is the functional creative core, not the complete advanced roadmap. General multi-track per-property keyframes, editable easing curves, custom symbol imports, true silhouette-following topographic contours, reorderable effect stacks, GPU shader effects, GIF and MP4 encoding are not implemented. Current Topographic Type uses concentric cell geometry, while Outline Contours samples the silhouette perimeter. SVG omits raster print effects. Font glyph coverage depends on the selected system or uploaded font. WebM records in real time and requires an active tab. Sprite sheets contain 16 frames in a 4×4 arrangement at 600 pixels per frame width.

## Source

- `dist/engine.js`: sampler, independent cell model, deterministic seeded patterns and animation, shared geometry, canvas and SVG rendering.
- `dist/app.js`: state, type layers, photo loading, selection, tools, history, timeline, project serialization and export.
- `dist/style.css`: responsive editor shell.
- `dist/index.html`: accessible control markup.

## Verification

JavaScript syntax checks passed. A Node Canvas harness rendered every preset and geometry and checked multiline / accented text / punctuation, empty text, stable IDs, determinism, contour filtering, per-cell properties, intensity keyframe interpolation and transparent SVG. Additional checks passed for two-color geometry, embedded SVG photography, photo cover/zoom/position/transparency, glyph membership, independent text-layer edits, per-selection styling, selection transforms, JSON roundtrip and undo/redo. Default canvas rendering visually inspected. Browser UI and MediaRecorder integration not verified because the supported browser QA capability was unavailable. No preview server was started.

## Composing modular type over photography

1. Open **Photo** and upload the background image. Use photo zoom/position sliders or the canvas photo tool to crop and position it.
2. Use **Apply modular black & white style**, or choose **Modular Editorial** in Presets.
3. In **Type**, add independent layers for words or characters. Select a layer to edit its source text. Editing that source regenerates only that layer; its existing manual cell positions are replaced. Undo recovers the prior composition.
4. Double-click a letter to select its cells. Switch to Move to drag it, or use the contextual scale/rotate/flip controls. Click or marquee to select individual cells and change their shape, size, ink, accent and motion.
5. Save JSON to retain the photograph, type layers and all cell properties. Export PNG/SVG for the composition, or WebM/sprites for motion. **Hide paper & photo** deliberately exports typography with transparency.

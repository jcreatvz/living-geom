# Living Geom

An experimental, browser-local kinetic typography studio. Static app; no build or server required. Serve the repository root over HTTP.

**Open the app:** https://jcreatvz.github.io/living-geom/

## Run locally

From the repository root:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. There is no dependency install or build step. Serve the app over HTTP rather than opening the HTML file directly, because the JavaScript uses ES modules. Google Fonts enhance the interface when available; system font fallbacks work offline.

The application lives at the repository root. GitHub Pages serves `main` from `/ (root)`; `.nojekyll` keeps the files static. The old `/dist/` URL redirects to the root app. No build step or third-party deployment workflow is required.

## Completed parking lot — October 16, 2026

- [x] **Reorder layers:** arrows in the Type layer list move type and image layers forward/backward. The top of the list is the front of the composition. Order is shared by canvas rendering, hit-testing, SVG, PNG, GIF, video and sprite exports; undo/redo and project files preserve it.
- [x] **Multiple images:** upload several JPG, PNG or WebP files, then select a layer in Photo to change its position, scale, opacity, visibility, grayscale or darkening. Up to 20 images; transparent PNG/WebP uploads retain transparency. Images can sit between type layers.
- [x] **Motion speed:** 0.25×–4× speed is separate from timeline duration. A 6-second timeline at 2× plays and exports its forward cycle in 3 seconds. Scrubbing remains in timeline seconds. Sprite exports include a timing JSON file with the playback interval.
- [x] **Custom fonts:** upload multiple WOFF, WOFF2, TTF or OTF files (up to 5 MB each; up to 20). Each has its own family in the font selector, so different type layers can use different uploads. Fonts are embedded in project JSON; unused fonts can be removed. Font preview follows the current layer.
- [x] **Root app URL:** `https://jcreatvz.github.io/living-geom/`.
- [x] **Per-layer grid controls:** Cell size and Density are in Type. Artboard’s grid uses the selected type layer’s cell size and shows its name/pitch. The grid is a source sampling guide anchored to the artboard; it does not distort with individually displaced cells.
- [x] **Cell rotation:** Individual spin and layered cell rotation retain their X/Y/Z axis controls, with Z as the default.
- [x] **Whole-word rotation:** enable it for the selected type layer, independently of cell motion. Choose X/Y/Z (default Z), orthographic or perspective view, turns and starting angle. Every cell rotates around one shared center; Canvas and SVG project the complete geometry. Use separate type layers to spin words independently. These are rotating flat shapes, not extruded text. Word and cell motion share duration, speed and playback mode. Integer turns give seamless full rotations.
- [x] **Animated GIF:** Export → GIF supports 480/720/960 px maximum long edge and 10/15/24 fps, including speed, loop, ping-pong and once. Up to 600 frames; longer animations reduce frame rate while preserving duration. GIF uses 256 colors and hard-edge transparency. Encoding runs in a local worker and can be cancelled.

## Project compatibility

New projects use schema version 2, with `images`, `fonts`, and `layerOrder` arrays. Optional `blocks[].motion` stores whole-word rotation; older projects default to disabled. Version 1 projects still open: their single photograph and uploaded font become asset entries. Editable cells are preserved without rerasterizing saved work. Project data remains local unless you explicitly download/share it. The browser’s last-save recovery is best-effort; if browser storage is full, the downloaded JSON is the complete saved project.

## Working in this version

- Live Canvas text mask sampling, multiline text and wrapping, font upload embedded into project JSON, typography controls and independent stable grid cells.
- Nineteen geometry choices (including two-color split circles, crossed bars, bowties and curved quarter modules), eight pattern rules, six palettes and nineteen editable visual presets.
- Independent text layers; exact sampled glyph membership and double-click letter selection; selection scale, rotate, flip and duplicate; select / shift-select / marquee, move, pan, paint, erase, repel, attract, rotation, scale, scatter and restoration brushes; cell locking and 35 undo states.
- Multiple image layers: local JPG/PNG/WebP upload, cover fitting, zoom, drag, opacity, darkening, grayscale and visibility. Images are resized to at most 2400 px on the longest side and embedded in JSON projects and SVG exports.
- Twelve motion choices including still life, five stagger orders, layered spin, timeline scrubbing, loop / ping-pong / once and intensity keyframes with smooth interpolation.
- Chromatic offset, echo, grain and scanlines.
- Current-frame PNG (up to 3×), vector SVG, animated GIF, real-time WebM where supported, 16-frame sprite sheet and editable JSON. Browser local storage keeps the last explicitly saved project as a convenient recovery copy.
- Keyboard shortcuts, reduced-motion defaults and responsive stacked controls.

## Scope for the next phases

This release is the functional creative core, not the complete advanced roadmap. General multi-track per-property keyframes, editable easing curves, custom symbol imports, true silhouette-following topographic contours, reorderable effect stacks, GPU shader effects and MP4 encoding are not implemented. Current Topographic Type uses concentric cell geometry, while Outline Contours samples the silhouette perimeter. SVG omits raster print effects. Font glyph coverage depends on the selected system or uploaded font. WebM records in real time and requires an active tab. Sprite sheets contain 16 frames in a 4×4 arrangement at 600 pixels per frame width.

## Source

- `engine.js`: sampler, independent cell model, deterministic seeded patterns and animation, shared geometry, canvas and SVG rendering.
- `app.js`: state, type layers, photo loading, selection, tools, history, timeline, project serialization and export.
- `style.css`: responsive editor shell.
- `index.html`: accessible control markup.
- `assets.js`: validated image/font metadata and backward-compatible project migration.
- `word-motion.js`: shared-center rotation, projection, inverse editing transforms and playback timing.
- `gif-export.js`, `gif-worker.js`, `gif-codec.js`: deterministic frame capture and worker-based GIF encoding.
- `vendor/gifenc.js`: vendored gifenc 1.0.3 (MIT; license included), with no runtime CDN dependency.

## Verification

JavaScript syntax checks passed. A Node Canvas harness rendered every preset and geometry and checked multiline / accented text / punctuation, empty text, stable IDs, determinism, contour filtering, per-cell properties, intensity keyframe interpolation and transparent SVG. Additional checks passed for two-color geometry, embedded SVG photography, photo cover/zoom/position/transparency, glyph membership, independent text-layer edits, per-selection styling, selection transforms, JSON roundtrip and undo/redo. Default canvas rendering visually inspected. The v0.2 checks also cover mixed image/type layer order in Canvas/SVG, opacity/visibility, X/Y/Z projections, version 1 migration, multiple embedded fonts decoded with native font rendering, layer-specific grid settings, speed persistence and image removal/undo. The v0.3 checks cover whole-word shared pivots and inverse transforms, all shape projections, independent cell/word motion, UI state and JSON roundtrip. GIFs were decoded to verify frame count, playback duration, looping and exact per-frame transparency masks; cancellation also passed. Browser UI and MediaRecorder integration not verified because the supported browser QA capability was unavailable. No preview server was started.

## Composing modular type over photography

1. Open **Photo** and upload one or more images. Select an image layer to edit it. Use photo zoom/position sliders or the canvas photo tool to crop and position it.
2. Use **Apply modular black & white style**, or choose **Modular Editorial** in Presets.
3. In **Type**, add independent layers for words or characters. Use ↑ / ↓ to reorder the composition; the top list item renders in front. Select a layer to edit its source text. Editing that source regenerates only that layer; its existing manual cell positions are replaced. Undo recovers the prior composition.
4. Double-click a letter to select its cells. Switch to Move to drag it, or use the contextual scale/rotate/flip controls. Click or marquee to select individual cells and change their shape, size, ink, accent and motion.
5. Save JSON to retain the photograph, type layers and all cell properties. Export PNG/SVG for the composition, or GIF/WebM/sprites for motion. **Hide paper & images** deliberately exports typography with transparency.

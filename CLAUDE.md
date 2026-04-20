# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ioBroker.vis-2-widgets-material is a Material Design widget library for ioBroker vis-2. It provides 19 interactive widgets for smart home control: thermostats, switches, blinds, RGB lights, cameras, locks, vacuum cleaners, etc.

Architecture: Root package orchestrates the build via `tasks.js`; `src-widgets/` contains the actual widget source code built with Vite + Module Federation.

## Build Commands

```bash
npm run build              # Full build: clean → npm install → tsc+vite build → copy to widgets/
npm run copy-files         # Copy built artifacts from src-widgets/build/ to widgets/
npm run npm                # Install deps in both root and src-widgets/ (uses -f for src-widgets)
npm run lint               # ESLint with @iobroker/eslint-config + Prettier
npm run test               # Run all tests (integration + package)
npm run test:integration   # Mocha browser tests (spawns full ioBroker instance)
npm run test:package       # Package validation (package.json, io-package.json, CHANGELOG.md)
```

### Dev Server

```bash
cd src-widgets && npm start   # Vite dev server on port 4173, proxies to ioBroker at localhost:8082
```

## Build Pipeline (tasks.js)

1. Deletes `src-widgets/build/` and `widgets/`
2. `npm install` in `src-widgets/`
3. `tsc && vite build` via `@iobroker/build-tools`
4. Copies build output to `widgets/vis-2-widgets-material/`
   - Patches echarts/zrender SVG renderer bug: injects `isFunction` definition before its first use in `installSVGRenderer` chunks

## Widget Architecture

### Base Class: Generic.tsx

All widgets extend `Generic<RxData, State>` which inherits from `window.visRxWidget` (provided by vis-2 runtime). Provides:
- `getPropertyValue(stateName)` — reads reactive state values
- `getI18nPrefix()` — returns `'vis_2_widgets_material_'` (auto-prepended to all i18n keys)
- `getHistoryInstance()` — detects history/sql/influxdb adapters
- `getObjectIcon()` / `getParentObject()` — ioBroker object helpers

### Widget Registration Pattern

Each widget file exports a class with:
1. `static getWidgetInfo(): RxWidgetInfo` — declares widget ID (e.g. `'tplMaterial2Actual'`), metadata, and configuration fields grouped in tabs
2. `render()` — React JSX with Material-UI components
3. State access via `this.state.values`, config via `this.state.rxData`, socket via `this.props.context.socket`

### Module Federation (vite.config.ts)

Federation name: `vis2materialWidgets`, entry: `customWidgets.js`. Exposes 19 widget modules + translations. Shared dependencies managed by `@iobroker/types-vis-2/modulefederation.vis.config`.

### Adding a New Widget

1. Create `src-widgets/src/NewWidget.tsx` extending `Generic<RxData, State>`
2. Implement `static getWidgetInfo()` with widget metadata and config fields
3. Implement `render()` with React/MUI
4. Add translation keys to all 11 `src-widgets/src/i18n/*.json` files (en, de, ru, pt, nl, fr, it, es, pl, uk, zh-cn)
5. Add expose entry in `src-widgets/vite.config.ts` exposes object

### Key Widget Files

- **Switches.tsx** — most versatile widget; handles switch, button, slider, blinds, thermostat, RGB, lock via device type detection
- **RGBLight.tsx** — largest widget (~55KB); 8 color modes (RGB, RGBW, HSL, Hue/Sat/Lum, CT, white)
- **deviceWidget.ts** — SVG icon mappings for `@iobroker/type-detector` device types, common icon constants
- **Static.tsx** — utility/base; not exposed via federation
- **Components/** — shared components: BlindsBase, ObjectChart (ECharts), PinCodeDialog, DoorAnimation, etc.

## Internationalization

- 11 languages, JSON files in `src-widgets/src/i18n/`
- All widget i18n keys are auto-prefixed with `vis_2_widgets_material_` (defined in `Generic.getI18nPrefix()`)
- When adding/changing widget config fields, update all 11 JSON files

## Code Quality

- ESLint config: `eslint.config.mjs` using `@iobroker/eslint-config` with Prettier integration
- JSDoc rules disabled (`jsdoc/require-jsdoc`, `jsdoc/require-param` both off)
- Prettier: `prettier.config.mjs` with `endOfLine: 'auto'`
- TypeScript: strict mode, ESNext target, `noEmit: true` (Vite handles compilation)
- Lint ignores: `src-widgets/build/`, `widgets/`, `test/`, `src-widgets/.__mf__temp/`

## CI/CD

`.github/workflows/test-and-release.yml`:
1. Check and Lint (Node 24.x)
2. Adapter Tests (Node 22.x) — build + test
3. Deploy on version tags (`v*.*.*`) — publishes to NPM

Release: `@alcalzone/release-script` bumps version, generates changelog, creates git tag.

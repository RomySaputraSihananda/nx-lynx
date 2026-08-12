# nx-lynx

[![npm version](https://img.shields.io/npm/v/@romysaputrasihanandaa/nx-lynx?style=flat-square)](https://www.npmjs.com/package/@romysaputrasihanandaa/nx-lynx)
[![lynx version](https://img.shields.io/badge/lynx-stable-22d3ee?style=flat-square)](https://lynxjs.org)
[![license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)

> Nx plugin adding first-class support for [Lynx](https://lynxjs.org) — ByteDance's cross-platform UI framework — in your Nx workspace

<p align="center"><img src="https://raw.githubusercontent.com/RomySaputraSihananda/nx-lynx/main/images/nx-lynx-logo.svg" width="450"></p>

## Contents

- [Features](#features)
- [Setup](#setup)
- [Usage](#usage)
- [Executors](#executors)
- [Testing](#testing)
- [Compatibility with Nx](#compatibility-with-nx)
- [Roadmap](#roadmap)

## Features

- ✅ Zero-config **project detection** — any project with a `lynx.config.ts` gets `dev`/`build`/`preview` targets automatically, no `project.json` required
- ✅ **Correct caching** — `build`'s cached `outputs` are read from the project's actual `rspeedy` config instead of assumed, so a customized output directory doesn't silently break cache restores
- ✅ **Android packaging** — embed a built Lynx bundle into a native Android host project and assemble an APK, wired to the Lynx project by name (not a hand-written path)
- ✅ Configurable target names, so `dev`/`build`/`preview` can be renamed to avoid clashing with existing targets

## Setup

This plugin wraps [`rspeedy`](https://lynxjs.org/rspeedy/) (Lynx's own build CLI), so any project it manages needs `rspeedy` installed already — typically via [`create-rspeedy`](https://lynxjs.org/guide/start/quick-start.html).

Install the plugin:

```
npm install @romysaputrasihanandaa/nx-lynx --save-dev
```

Then register it in `nx.json`:

```json
{
  "plugins": ["@romysaputrasihanandaa/nx-lynx"]
}
```

Any project with a `lynx.config.{ts,js,mjs,mts,cjs,cts}` now automatically gets `dev`, `build`, and `preview` targets — run `nx show project <name>` to confirm.

## Usage

Prefer explicit config over inference, or need to override an option? Wire the executors directly in `project.json` instead:

```json
{
  "targets": {
    "dev": { "executor": "@romysaputrasihanandaa/nx-lynx:dev" },
    "build": { "executor": "@romysaputrasihanandaa/nx-lynx:build" },
    "preview": { "executor": "@romysaputrasihanandaa/nx-lynx:preview" }
  }
}
```

Either way, `nx build my-lynx-app` / `nx dev my-lynx-app` run `rspeedy` under the hood, with Nx's task graph and caching layered on top. `dev`/`preview` are marked `continuous: true` (long-running dev servers); `build` is cached.

## Executors

| Executor  | Options                                                                                                            | Description                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `dev`     | —                                                                                                                    | Runs `rspeedy dev`. Continuous.                                                    |
| `build`   | —                                                                                                                    | Runs `rspeedy build`. Cached; `outputs` resolved from the project's own config.    |
| `preview` | —                                                                                                                    | Runs `rspeedy preview`. Continuous; depends on `build`.                            |
| `android` | `lynxApp` (required) · `bundleFileName` · `variant` (`debug` &#124; `release`, default `debug`) · `assetName`       | Embeds a built Lynx bundle into a native Android host project and runs Gradle.      |

### `android` in depth

Lynx itself doesn't produce a standalone APK — `rspeedy build` only
produces the JS bundle. This executor is the glue: copy that bundle into
`app/src/main/assets/`, then run `./gradlew assemble<Variant>`. The
native Android project (Gradle, `LynxService` init, a `LynxView` host
Activity) still has to exist and be built by hand once — see [Lynx's
Android integration
guide](https://lynxjs.org/guide/start/integrate-with-existing-apps?platform=android)
— this executor doesn't generate it.

```json
{
  "targets": {
    "android": {
      "executor": "@romysaputrasihanandaa/nx-lynx:android",
      "options": {
        "lynxApp": "web",
        "variant": "debug"
      },
      "dependsOn": ["web:build"]
    }
  }
}
```

`lynxApp` names the Lynx project to embed rather than a hand-written
path — the actual bundle location is resolved the same way `build`'s
own `outputs` are (reading that project's `lynx.config.ts`), so it can't
drift out of sync if that project changes its output directory.

`variant: "release"` needs a real signing config on the Android project
to be useful — this plugin never generates or auto-signs a keystore.

Verified end-to-end against a real Android host project: `nx run
android:android` builds the Lynx app, embeds its bundle, and produces an
installable `app-debug.apk` — confirmed rendering correctly on a
physical device, not just a successful Gradle exit code.

## Testing

```
npm test
```

Runs the unit tests (`node --test`, no test framework dependency)
against a hand-rolled fake `@lynx-js/rspeedy` fixture — no network, no
real (heavy) rspeedy install needed.

`npm pack` was also verified end-to-end: installing the resulting
tarball (a real copy, not the `file:` symlink used during development)
into a throwaway workspace and running `nx show project` confirmed
inference still resolves correctly from a genuine install.

## Compatibility with Nx

| Plugin Version | Nx Workspace version |
| --------------- | --------------------- |
| `>=0.1.x`        | `>=20.x.x`             |

## Roadmap

- [x] `executors` for `build` / `dev` / `preview` wrapping `rspeedy`
- [x] `createNodes` for inferred targets from `lynx.config.ts`
- [x] `android` executor to assemble an APK from a native host project
- [x] unit tests + a verified `npm pack` install
- [ ] `generators` for scaffolding a new Lynx app (`nx g nx-lynx:app`)
- [ ] a generator to scaffold the Android host project itself

## License

Copyright (c) 2026-present Romy Saputra Sihananda. Licensed under the MIT License (MIT)

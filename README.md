# @romysaputrasihanandaa/nx-lynx

Nx plugin for [Lynx](https://lynxjs.org) — ByteDance's cross-platform UI
framework. Wraps the `rspeedy` CLI so Lynx apps get Nx task caching, the
project graph, and (eventually) generators for scaffolding new apps —
without hand-writing `run-commands` config in every `project.json`.

## Status

Early — executors, inference, and `android` all work and are covered by
tests; not yet published to npm.

## Usage

In a Lynx app's `project.json`:

```json
{
  "targets": {
    "dev": { "executor": "@romysaputrasihanandaa/nx-lynx:dev" },
    "build": { "executor": "@romysaputrasihanandaa/nx-lynx:build" },
    "preview": { "executor": "@romysaputrasihanandaa/nx-lynx:preview" }
  }
}
```

Then `nx build my-lynx-app` / `nx dev my-lynx-app` run `rspeedy` under the
hood, with Nx's task graph and caching layered on top.

Or skip `project.json` entirely — the plugin infers `build`/`dev`/`preview`
for any project with a `lynx.config.ts` once it's registered in `nx.json`:

```json
{
  "plugins": ["@romysaputrasihanandaa/nx-lynx"]
}
```

`dev`/`preview` are marked `continuous: true` (long-running dev servers);
`build` is cached, with `outputs` resolved from the project's own
`lynx.config.ts` (`output.distPath.root`, default `'dist'`) rather than
assumed — a project that customizes it still caches correctly instead of
Nx restoring an empty `dist/` that nothing ever wrote to. Target names
are configurable via plugin options (`buildTargetName`, `devTargetName`,
`previewTargetName`) in case they'd otherwise clash with existing targets.

Verified end-to-end against the `learn-lynx` app: inference detects the
project, `nx build` runs `rspeedy build` and gets cached (0.49s on a
cache hit vs. 35s cold), `nx dev` runs `rspeedy dev` as a continuous task.

## `android` executor

Embeds a built `.lynx.bundle` into a native Android host project (Gradle
project with the Lynx SDK wired in — see [Lynx's Android integration
guide](https://lynxjs.org/guide/start/integrate-with-existing-apps?platform=android))
and assembles an APK:

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

Lynx itself doesn't produce a standalone APK — `rspeedy build` only
produces the JS bundle. This executor is the glue: copy that bundle into
`app/src/main/assets/`, then run `./gradlew assemble<Variant>`. The
native Android project (Gradle, `LynxService` init, `LynxView` host
Activity) still has to exist and be built by hand once; this doesn't
generate it.

`lynxApp` names the Lynx project to embed rather than a hand-written
path — the actual bundle location is resolved the same way `build`'s
own `outputs` are (reading that project's `lynx.config.ts`), so it can't
drift out of sync if that project changes its output directory.

Verified end-to-end against a real Android host project in
`lynx-monorepo-demo`: `nx run android:android` builds `web`, embeds its
bundle, and produces an installable `app-debug.apk` with the bundle
inside. `variant: "release"` needs a real signing config to be useful —
not set up here.

## Testing

```
npm test
```

Runs the unit tests (`node --test`, no test framework dependency) against
a fake `@lynx-js/rspeedy` fixture — no network, no real rspeedy install
needed. Separately, `npm pack` was verified end-to-end: installing the
resulting tarball (a real copy, not the `file:` symlink used during dev)
into a throwaway workspace and running `nx show project` confirmed
inference still resolves correctly from a genuine install.

## Planned

- [x] `executors` for `build` / `dev` / `preview` wrapping `rspeedy`
- [x] `createNodes` for inferred targets from `lynx.config.ts`
- [x] `android` executor to assemble an APK from a native host project
- [x] unit tests + a verified `npm pack` install
- [ ] `generators` for scaffolding a new Lynx app (`nx g nx-lynx:app`)

## License

MIT

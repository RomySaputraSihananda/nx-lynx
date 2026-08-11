# @romysaputrasihanandaa/nx-lynx

Nx plugin for [Lynx](https://lynxjs.org) — ByteDance's cross-platform UI
framework. Wraps the `rspeedy` CLI so Lynx apps get Nx task caching, the
project graph, and (eventually) generators for scaffolding new apps —
without hand-writing `run-commands` config in every `project.json`.

## Status

Early — executors work, not yet published to npm.

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
`build` is cached (`outputs: ["{projectRoot}/dist"]`). Target names are
configurable via plugin options (`buildTargetName`, `devTargetName`,
`previewTargetName`) in case they'd otherwise clash with existing targets.

Verified end-to-end against the `learn-lynx` app: inference detects the
project, `nx build` runs `rspeedy build` and gets cached (0.49s on a
cache hit vs. 35s cold), `nx dev` runs `rspeedy dev` as a continuous task.

## Planned

- [x] `executors` for `build` / `dev` / `preview` wrapping `rspeedy`
- [x] `createNodes` for inferred targets from `lynx.config.ts`
- [ ] `generators` for scaffolding a new Lynx app (`nx g nx-lynx:app`)

## License

MIT

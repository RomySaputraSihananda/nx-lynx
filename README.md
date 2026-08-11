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

## Planned

- [x] `executors` for `build` / `dev` / `preview` wrapping `rspeedy`
- [ ] `createNodesV2` for inferred targets from `lynx.config.ts`
- [ ] `generators` for scaffolding a new Lynx app (`nx g nx-lynx:app`)

## License

MIT

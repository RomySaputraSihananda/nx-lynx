# @romysaputrasihanandaa/nx-lynx

Nx plugin for [Lynx](https://lynxjs.org) — ByteDance's cross-platform UI
framework. Wraps the `rspeedy` CLI so Lynx apps get Nx task caching, the
project graph, and (eventually) generators for scaffolding new apps —
without hand-writing `run-commands` config in every `project.json`.

## Status

Early scaffolding — not yet published. See issues for planned work.

## Planned

- [ ] `executors` for `build` / `dev` / `preview` wrapping `rspeedy`
- [ ] `createNodesV2` for inferred targets from `lynx.config.ts`
- [ ] `generators` for scaffolding a new Lynx app (`nx g nx-lynx:app`)

## License

MIT

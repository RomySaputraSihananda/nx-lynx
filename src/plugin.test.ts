import assert from 'node:assert/strict'
import { join } from 'node:path'
import { test } from 'node:test'
import type { CreateNodesContext } from '@nx/devkit'

import { createNodes, createNodesV2 } from './plugin.js'

// Resolved from the package root (npm always runs scripts with that as
// cwd), not from this file's own location — see resolve-lynx-output.test.ts.
const fixtureDir = join(process.cwd(), 'src', 'utils', '__fixtures__', 'fake-lynx-project')

const context: CreateNodesContext = {
  workspaceRoot: fixtureDir,
  nxJsonConfiguration: {},
}

const [, createNodesFn] = createNodes

test('createNodesV2 is the same reference as createNodes (back-compat alias)', () => {
  assert.strictEqual(createNodesV2, createNodes)
})

test('infers build/dev/preview targets with the right executors', async () => {
  const results = await createNodesFn(['lynx.config.ts'], undefined, context)
  const [file, result] = results[0]!

  assert.strictEqual(file, 'lynx.config.ts')
  const targets = result.projects?.['.']?.targets
  assert.ok(targets)

  assert.strictEqual(targets.build?.executor, '@romysaputrasihanandaa/nx-lynx:build')
  assert.strictEqual(targets.dev?.executor, '@romysaputrasihanandaa/nx-lynx:dev')
  assert.strictEqual(targets.preview?.executor, '@romysaputrasihanandaa/nx-lynx:preview')
})

test('marks dev and preview as continuous (long-running dev servers)', async () => {
  const results = await createNodesFn(['lynx.config.ts'], undefined, context)
  const targets = results[0]![1].projects?.['.']?.targets

  assert.strictEqual(targets?.dev?.continuous, true)
  assert.strictEqual(targets?.preview?.continuous, true)
  assert.strictEqual(targets?.build?.continuous, undefined)
})

test('preview depends on build', async () => {
  const results = await createNodesFn(['lynx.config.ts'], undefined, context)
  const targets = results[0]![1].projects?.['.']?.targets

  assert.deepStrictEqual(targets?.preview?.dependsOn, ['build'])
})

test('build outputs reflect the resolved rspeedy dist dir, not a hardcoded "dist"', async () => {
  const results = await createNodesFn(['lynx.config.ts'], undefined, context)
  const targets = results[0]![1].projects?.['.']?.targets

  assert.deepStrictEqual(targets?.build?.outputs, ['{projectRoot}/custom-dir-from-fake'])
})

test('target names are configurable via plugin options', async () => {
  const options = {
    buildTargetName: 'lynx-build',
    devTargetName: 'lynx-dev',
    previewTargetName: 'lynx-preview',
  }
  const results = await createNodesFn(['lynx.config.ts'], options, context)
  const targets = results[0]![1].projects?.['.']?.targets

  assert.ok(targets?.['lynx-build'])
  assert.ok(targets?.['lynx-dev'])
  assert.ok(targets?.['lynx-preview'])
  assert.deepStrictEqual(targets?.['lynx-preview']?.dependsOn, ['lynx-build'])
})

test('project root is the config file\'s directory', async () => {
  const results = await createNodesFn(['apps/foo/lynx.config.ts'], undefined, context)
  const projects = results[0]![1].projects

  assert.ok(projects?.['apps/foo'])
})

import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { resolveLynxOutputDir } from './resolve-lynx-output.js'

// Resolved from the package root (npm always runs scripts with that as
// cwd), not from this file's own location — the compiled test output
// lives elsewhere, but the fixtures stay put in the source tree.
const fixtureDir = join(process.cwd(), 'src', 'utils', '__fixtures__', 'fake-lynx-project')

test('resolveLynxOutputDir reads output.distPath.root via the project\'s own rspeedy', async () => {
  const result = await resolveLynxOutputDir('lynx.config.ts', fixtureDir)
  assert.strictEqual(result, 'custom-dir-from-fake')
})

test('resolveLynxOutputDir strips a leading "./" so it composes into {projectRoot}/<dir>', async () => {
  const result = await resolveLynxOutputDir('lynx.config.ts', fixtureDir)
  assert.ok(!result.startsWith('./'), `expected no leading "./", got "${result}"`)
})

test('resolveLynxOutputDir falls back to "dist" when rspeedy is not resolvable', async () => {
  const emptyDir = mkdtempSync(join(tmpdir(), 'nx-lynx-no-rspeedy-'))
  const result = await resolveLynxOutputDir('lynx.config.ts', emptyDir)
  assert.strictEqual(result, 'dist')
})

import assert from 'node:assert/strict'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { findLynxConfigFile } from './lynx-config-file.js'

const workspaceRoot = join(process.cwd(), 'src', 'utils', '__fixtures__')

test('findLynxConfigFile finds lynx.config.ts in a project directory', () => {
  const result = findLynxConfigFile(workspaceRoot, 'fake-lynx-project')
  assert.strictEqual(result, join('fake-lynx-project', 'lynx.config.ts'))
})

test('findLynxConfigFile returns null when no lynx.config.* exists', () => {
  const emptyDir = mkdtempSync(join(tmpdir(), 'nx-lynx-no-config-'))
  const result = findLynxConfigFile(emptyDir, '.')
  assert.strictEqual(result, null)
})

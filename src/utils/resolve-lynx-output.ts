import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const DEFAULT_OUTPUT_DIR = 'dist'

interface RspeedyModule {
  loadConfig(options: { configPath: string, cwd: string }): Promise<{
    content: { output?: { distPath?: { root?: string } } }
  }>
}

/**
 * Resolves `@lynx-js/rspeedy`'s real entry file starting from the
 * project's own directory (not this plugin's), via the `require.resolve`
 * of its `package.json` — that subpath is a plain unconditional export
 * that every package resolves the same way in CJS or ESM, unlike the
 * package's `"."` export, whose "import"-only condition makes plain
 * `require.resolve('@lynx-js/rspeedy')` throw `ERR_PACKAGE_PATH_NOT_EXPORTED`
 * for this (ESM-only) package.
 */
function resolveRspeedyEntry(projectDir: string): string {
  const require = createRequire(join(projectDir, 'package.json'))
  const pkgJsonPath = require.resolve('@lynx-js/rspeedy/package.json')
  const pkgDir = dirname(pkgJsonPath)
  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'))
  const entry = pkg.exports?.['.']?.import ?? pkg.exports?.['.']?.default ?? pkg.main
  return join(pkgDir, entry)
}

/**
 * Resolves the project's actual configured rspeedy output directory
 * (`output.distPath.root`, default `'dist'`) by loading its own installed
 * `@lynx-js/rspeedy` and evaluating `lynx.config.ts` with it — the same
 * config-loading rspeedy itself uses, so this reflects reality instead of
 * assuming every project left the default alone.
 *
 * Falls back to the default on any failure (rspeedy not resolvable, a
 * broken config, etc.) rather than breaking the whole project graph over
 * a single project's output path.
 */
export async function resolveLynxOutputDir(
  configFilePath: string,
  workspaceRoot: string,
): Promise<string> {
  const absoluteConfigPath = join(workspaceRoot, configFilePath)
  const projectDir = dirname(absoluteConfigPath)

  try {
    const rspeedyEntry = resolveRspeedyEntry(projectDir)
    const rspeedy = await import(pathToFileURL(rspeedyEntry).href) as RspeedyModule
    const { content } = await rspeedy.loadConfig({
      configPath: absoluteConfigPath,
      cwd: projectDir,
    })
    const root = content.output?.distPath?.root ?? DEFAULT_OUTPUT_DIR
    // Strip a leading './' so it composes cleanly into '{projectRoot}/<dir>'.
    return root.replace(/^\.\/+/, '')
  } catch {
    return DEFAULT_OUTPUT_DIR
  }
}

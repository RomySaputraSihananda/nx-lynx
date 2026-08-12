import { existsSync } from 'node:fs'
import { join } from 'node:path'

/** Every extension rspeedy accepts for its config file. */
export const LYNX_CONFIG_EXTENSIONS = ['ts', 'js', 'mjs', 'mts', 'cjs', 'cts'] as const

/** Glob for `createNodes` — matches a `lynx.config.*` in any extension above. */
export const LYNX_CONFIG_GLOB = `**/lynx.config.{${LYNX_CONFIG_EXTENSIONS.join(',')}}`

/**
 * Finds a project's actual `lynx.config.*` file, trying each supported
 * extension. Returns the path relative to `workspaceRoot` (matching what
 * `resolveLynxOutputDir` expects), or `null` if none exists.
 */
export function findLynxConfigFile(workspaceRoot: string, projectRoot: string): string | null {
  for (const ext of LYNX_CONFIG_EXTENSIONS) {
    const relativePath = join(projectRoot, `lynx.config.${ext}`)
    if (existsSync(join(workspaceRoot, relativePath))) {
      return relativePath
    }
  }
  return null
}

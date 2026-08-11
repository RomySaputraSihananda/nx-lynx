import { copyFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { ExecutorContext } from '@nx/devkit'
import { runGradle } from '../../utils/run-gradle.js'

export interface AndroidExecutorSchema {
  /** Path (relative to the workspace root) to the built `.lynx.bundle` to embed, e.g. `packages/web/dist/main.lynx.bundle`. */
  bundlePath: string
  /** Gradle build variant to assemble. Defaults to `debug` — `release` needs a real signing config to be useful. */
  variant?: 'debug' | 'release'
  /** Filename the bundle is copied to under `app/src/main/assets/`. Must match what the host Activity loads. */
  assetName?: string
}

/**
 * Copies a built Lynx bundle into the Android host project's assets, then
 * runs `./gradlew assemble<Variant>` — the two steps `nx build` for the
 * Lynx app itself doesn't know or need to know about.
 */
export default async function androidExecutor(
  options: AndroidExecutorSchema,
  context: ExecutorContext,
) {
  const projectName = context.projectName
  if (!projectName) {
    throw new Error('nx-lynx:android must run against a project.')
  }

  const projectRoot = context.projectsConfigurations?.projects[projectName]?.root
  if (projectRoot === undefined) {
    throw new Error(`Could not resolve the root of project "${projectName}".`)
  }

  if (!options.bundlePath) {
    throw new Error('nx-lynx:android requires a "bundlePath" option pointing at the built .lynx.bundle.')
  }

  const cwd = `${context.root}/${projectRoot}`
  const variant = options.variant ?? 'debug'
  const assetName = options.assetName ?? 'main.lynx.bundle'

  const src = `${context.root}/${options.bundlePath}`
  const assetsDir = join(cwd, 'app', 'src', 'main', 'assets')
  await mkdir(assetsDir, { recursive: true })
  await copyFile(src, join(assetsDir, assetName))

  const task = `assemble${variant.charAt(0).toUpperCase()}${variant.slice(1)}`
  return runGradle(task, cwd)
}

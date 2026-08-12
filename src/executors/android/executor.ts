import { copyFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import type { ExecutorContext } from '@nx/devkit'
import { findLynxConfigFile } from '../../utils/lynx-config-file.js'
import { resolveLynxOutputDir } from '../../utils/resolve-lynx-output.js'
import { runGradle } from '../../utils/run-gradle.js'

export interface AndroidExecutorSchema {
  /** Name of the Lynx (rspeedy) project whose built bundle should be embedded — e.g. `web`. */
  lynxApp: string
  /** Bundle filename to look for under that project's resolved output dir. */
  bundleFileName?: string
  /** Gradle build variant to assemble. Defaults to `debug` — `release` needs a real signing config to be useful. */
  variant?: 'debug' | 'release'
  /** Filename the bundle is copied to under `app/src/main/assets/`. Must match what the host Activity loads. */
  assetName?: string
}

/**
 * Copies a built Lynx bundle into the Android host project's assets, then
 * runs `./gradlew assemble<Variant>` — the two steps `nx build` for the
 * Lynx app itself doesn't know or need to know about.
 *
 * Takes a Lynx project *name* (`lynxApp`) rather than a hand-written
 * bundle path — the actual output directory is resolved the same way
 * `createNodes` resolves it for that project's own `build` target
 * (reading its `lynx.config.ts`), so a hardcoded path here can't drift
 * out of sync with wherever that project actually configured its output.
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

  if (!options.lynxApp) {
    throw new Error('nx-lynx:android requires a "lynxApp" option naming the Lynx (rspeedy) project to embed.')
  }

  const lynxProjectRoot = context.projectsConfigurations?.projects[options.lynxApp]?.root
  if (lynxProjectRoot === undefined) {
    throw new Error(`nx-lynx:android could not find a project named "${options.lynxApp}" in the workspace.`)
  }

  const lynxConfigPath = findLynxConfigFile(context.root, lynxProjectRoot)
  if (lynxConfigPath === null) {
    throw new Error(
      `nx-lynx:android could not find a lynx.config.* file in "${lynxProjectRoot}" (project "${options.lynxApp}").`,
    )
  }

  const outputDir = await resolveLynxOutputDir(lynxConfigPath, context.root)
  const bundleFileName = options.bundleFileName ?? 'main.lynx.bundle'
  const src = join(context.root, lynxProjectRoot, outputDir, bundleFileName)

  const cwd = join(context.root, projectRoot)
  const variant = options.variant ?? 'debug'
  const assetName = options.assetName ?? bundleFileName

  const assetsDir = join(cwd, 'app', 'src', 'main', 'assets')
  await mkdir(assetsDir, { recursive: true })
  await copyFile(src, join(assetsDir, assetName))

  const task = `assemble${variant.charAt(0).toUpperCase()}${variant.slice(1)}`
  return runGradle(task, cwd)
}

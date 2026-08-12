import { dirname } from 'node:path'
import {
  createNodesFromFiles,
  type CreateNodes,
  type CreateNodesContext,
  type CreateNodesResult,
} from '@nx/devkit'
import { LYNX_CONFIG_GLOB } from './utils/lynx-config-file.js'
import { resolveLynxOutputDir } from './utils/resolve-lynx-output.js'

export interface NxLynxPluginOptions {
  buildTargetName?: string
  devTargetName?: string
  previewTargetName?: string
}

/**
 * Infers `build`/`dev`/`preview` targets for any project with a
 * `lynx.config.ts` (rspeedy's config file) — no manual `project.json`
 * wiring needed. Register in `nx.json`:
 * `"plugins": ["@romysaputrasihanandaa/nx-lynx"]`.
 */
export const createNodes: CreateNodes<NxLynxPluginOptions> = [
  LYNX_CONFIG_GLOB,
  (configFiles, options, context) =>
    createNodesFromFiles(createNodesInternal, configFiles, options ?? {}, context),
]

/**
 * @deprecated kept as an alias so Nx versions older than the unified
 * `createNodes` contract (pre-20) can still load this plugin.
 */
export const createNodesV2 = createNodes

async function createNodesInternal(
  configFilePath: string,
  options: NxLynxPluginOptions | undefined,
  context: CreateNodesContext,
): Promise<CreateNodesResult> {
  const projectRoot = dirname(configFilePath)

  const buildTargetName = options?.buildTargetName ?? 'build'
  const devTargetName = options?.devTargetName ?? 'dev'
  const previewTargetName = options?.previewTargetName ?? 'preview'

  // Reflects whatever `output.distPath.root` the project actually
  // configured in lynx.config.ts (default 'dist') instead of assuming
  // every project left it alone — a wrong path here means Nx caches the
  // build under a path nothing gets written to, so a "cache hit" silently
  // restores nothing.
  const outputDir = await resolveLynxOutputDir(configFilePath, context.workspaceRoot)

  return {
    projects: {
      [projectRoot]: {
        targets: {
          [buildTargetName]: {
            executor: '@romysaputrasihanandaa/nx-lynx:build',
            outputs: [`{projectRoot}/${outputDir}`],
            cache: true,
          },
          [devTargetName]: {
            executor: '@romysaputrasihanandaa/nx-lynx:dev',
            continuous: true,
          },
          [previewTargetName]: {
            executor: '@romysaputrasihanandaa/nx-lynx:preview',
            dependsOn: [buildTargetName],
            continuous: true,
          },
        },
      },
    },
  }
}

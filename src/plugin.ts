import { dirname } from 'node:path'
import {
  createNodesFromFiles,
  type CreateNodes,
  type CreateNodesContext,
  type CreateNodesResult,
} from '@nx/devkit'

const LYNX_CONFIG_GLOB = '**/lynx.config.{ts,js,mjs,mts,cjs,cts}'

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

function createNodesInternal(
  configFilePath: string,
  options: NxLynxPluginOptions | undefined,
  _context: CreateNodesContext,
): CreateNodesResult {
  const projectRoot = dirname(configFilePath)

  const buildTargetName = options?.buildTargetName ?? 'build'
  const devTargetName = options?.devTargetName ?? 'dev'
  const previewTargetName = options?.previewTargetName ?? 'preview'

  return {
    projects: {
      [projectRoot]: {
        targets: {
          [buildTargetName]: {
            executor: '@romysaputrasihanandaa/nx-lynx:build',
            outputs: [`{projectRoot}/dist`],
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

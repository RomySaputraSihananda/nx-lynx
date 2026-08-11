import type { ExecutorContext } from '@nx/devkit'
import { runRspeedy } from '../../utils/run-rspeedy.js'

export interface BuildExecutorSchema {
  [key: string]: unknown
}

export default async function buildExecutor(
  _options: BuildExecutorSchema,
  context: ExecutorContext,
) {
  return runRspeedy('build', [], context)
}

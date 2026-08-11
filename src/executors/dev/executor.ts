import type { ExecutorContext } from '@nx/devkit'
import { runRspeedy } from '../../utils/run-rspeedy.js'

export interface DevExecutorSchema {
  [key: string]: unknown
}

export default async function devExecutor(
  _options: DevExecutorSchema,
  context: ExecutorContext,
) {
  return runRspeedy('dev', [], context)
}

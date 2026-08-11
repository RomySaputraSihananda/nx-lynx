import type { ExecutorContext } from '@nx/devkit'
import { runRspeedy } from '../../utils/run-rspeedy.js'

export interface PreviewExecutorSchema {
  [key: string]: unknown
}

export default async function previewExecutor(
  _options: PreviewExecutorSchema,
  context: ExecutorContext,
) {
  return runRspeedy('preview', [], context)
}

import { spawn } from 'node:child_process'
import type { ExecutorContext } from '@nx/devkit'

export interface RspeedyExecutorResult {
  success: boolean
}

/**
 * Runs `rspeedy <command>` inside a project's root, streaming its output
 * straight through. Every rspeedy-wrapping executor (dev/build/preview)
 * is a thin call to this — the CLI is the source of truth, Nx just adds
 * caching and the task graph around it.
 */
export function runRspeedy(
  command: 'dev' | 'build' | 'preview',
  extraArgs: string[],
  context: ExecutorContext,
): Promise<RspeedyExecutorResult> {
  const projectName = context.projectName
  if (!projectName) {
    throw new Error('nx-lynx executors must run against a project.')
  }

  const projectRoot = context.projectsConfigurations?.projects[projectName]?.root
  if (projectRoot === undefined) {
    throw new Error(`Could not resolve the root of project "${projectName}".`)
  }

  const cwd = `${context.root}/${projectRoot}`

  return new Promise((resolve) => {
    const child = spawn('npx', ['rspeedy', command, ...extraArgs], {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })

    child.on('exit', (code) => resolve({ success: code === 0 }))
    child.on('error', (err) => {
      console.error(err)
      resolve({ success: false })
    })
  })
}

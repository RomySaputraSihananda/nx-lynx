import { spawn } from 'node:child_process'

export interface GradleResult {
  success: boolean
}

/** Runs a Gradle task via the project's own wrapper (`./gradlew`). */
export function runGradle(task: string, cwd: string): Promise<GradleResult> {
  const wrapper = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'

  return new Promise((resolve) => {
    const child = spawn(wrapper, [task], {
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

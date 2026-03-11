import fs from 'node:fs'
import path from 'node:path'

/**
 * Recursively search `rootDir` for JS files containing focused test markers
 * such as `describe.only`, `it.only`, `fit`, `fdescribe`, `iit`, `ddescribe`.
 * Returns an array of spec paths relative to `baseDir` (prefixed with `./`).
 */
export function findFilesWithOnly (rootDir, baseDir = process.cwd()) {
  const matches = []
  const focusedMarkerRe = /(\b(?:describe|it|context|suite|test|specify)\.only\s*\(|\b(?:fit|fdescribe|iit|ddescribe)\s*\()/m
  const isScriptFile = (entry, fullPath) => entry.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.mjs'))
  const hasFocusedMarker = (fullPath) => focusedMarkerRe.test(fs.readFileSync(fullPath, 'utf8'))

  try {
    if (!fs.existsSync(rootDir)) {
      return matches
    }

    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          walk(full)
        } else if (isScriptFile(entry, full)) {
          if (hasFocusedMarker(full)) {
            const rel = './' + path.relative(baseDir, full).replaceAll('\\', '/')
            matches.push(rel)
          }
        } else {
          // Ignore non-script entries.
        }
      }
    }

    walk(rootDir)
  } catch (err) {
    console.warn('Unable to search for focused e2e specs:', err)
  }
  return matches
}

export default findFilesWithOnly

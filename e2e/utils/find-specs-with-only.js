import fs from 'node:fs'
import path from 'node:path'

const focusedMarkerRe = /(\b(?:describe|it|context|suite|test|specify)\.only\s*\(|\b(?:fit|fdescribe|iit|ddescribe)\s*\()/m

function isScriptFile (entryName) {
  return entryName.endsWith('.js') || entryName.endsWith('.mjs')
}

function hasFocusedMarker (fullPath) {
  return focusedMarkerRe.test(fs.readFileSync(fullPath, 'utf8'))
}

function toRelativeSpecPath (baseDir, fullPath) {
  return './' + path.relative(baseDir, fullPath).replaceAll('\\', '/')
}

function collectFocusedSpecs (dir, baseDir, matches) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      collectFocusedSpecs(fullPath, baseDir, matches)
    } else if (entry.isFile() && isScriptFile(entry.name) && hasFocusedMarker(fullPath)) {
      matches.push(toRelativeSpecPath(baseDir, fullPath))
    } else {
      // Ignore non-script entries and files without focused markers.
    }
  }
}

/**
 * Recursively search `rootDir` for JS files containing focused test markers
 * such as `describe.only`, `it.only`, `fit`, `fdescribe`, `iit`, `ddescribe`.
 * Returns an array of spec paths relative to `baseDir` (prefixed with `./`).
 */
export function findFilesWithOnly (rootDir, baseDir = process.cwd()) {
  const matches = []

  try {
    if (!fs.existsSync(rootDir)) {
      return matches
    }
    collectFocusedSpecs(rootDir, baseDir, matches)
  } catch (err) {
    console.warn('Unable to search for focused e2e specs:', err)
  }
  return matches
}

export default findFilesWithOnly

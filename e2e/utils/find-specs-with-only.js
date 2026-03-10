import fs from 'node:fs'
import path from 'node:path'

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

    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          walk(full)
          continue
        }
        if (!entry.isFile()) {
          continue
        }
        if (!full.endsWith('.js') && !full.endsWith('.mjs')) {
          continue
        }
        const content = fs.readFileSync(full, 'utf8')
        const re = /(\b(?:describe|it|context|suite|test|specify)\.only\s*\(|\b(?:fit|fdescribe|iit|ddescribe)\s*\()/m
        if (re.test(content)) {
          const rel = './' + path.relative(baseDir, full).replace(/\\/g, '/')
          matches.push(rel)
        }
      }
    }

    walk(rootDir)
  } catch (_) { /* ignore errors */ }
  return matches
}

export default findFilesWithOnly

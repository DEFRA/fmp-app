export const definePage = ({ key, slug, title }) => {
  if (!key) throw new Error('definePage(): missing key')
  if (!slug) throw new Error(`definePage(${key}): missing slug`)
  if (!title) throw new Error(`definePage(${key}): missing title`)
  return { key, slug, title }
}

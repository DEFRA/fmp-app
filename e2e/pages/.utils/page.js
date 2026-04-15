export const definePage = ({ slug, title }) => {
  if (!slug) throw new Error('definePage(): missing slug')
  if (!title) throw new Error('definePage(): missing title')
  return { slug, title }
}

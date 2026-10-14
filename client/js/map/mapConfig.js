let defraMapConfig

export const getDefraMapConfig = async () => {
  if (defraMapConfig === undefined) {
    const response = await window.fetch('/defra-map/config')
    defraMapConfig = await response.json()
  }
  return defraMapConfig
}

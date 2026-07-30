export const getQueryParam = (name, defaultValue = null) => {
  const value = new URLSearchParams(window.location.search).get(name)
  return value === null ? defaultValue : value
}

export const setQueryParam = (key, value) => {
  const url = new URL(window.location.href)
  const params = url.searchParams

  if (value === null || value === undefined || value === '') {
    params.delete(key)
  } else {
    params.set(key, value)
  }

  // Update the URL without reloading
  url.search = decodeURIComponent(url.search)
  window.history.replaceState({}, '', url.toString())
}

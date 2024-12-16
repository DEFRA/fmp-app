export const setCookie = (cName, cValue, expDays) => {
  const date = new Date()
  // date.setTime(date.getTime() + expDays * 24 * 60 * 60 * 1000)
  date.setTime(date.getTime() + expDays * 1000)
  const expires = 'expires=' + date.toUTCString()
  document.cookie = cName + '=' + cValue + '; ' + expires + '; path=/'
}

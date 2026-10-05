const DEFAULT_VALUE = 0.75

const initialState = {
  ready: false,
  value: DEFAULT_VALUE
}

const setReady = (state) => ({ ...state, ready: true })
const setValue = (state, value) => ({ ...state, value })

const actions = {
  SET_READY: setReady,
  SET_VALUE: setValue
}

export {
  initialState,
  actions
}

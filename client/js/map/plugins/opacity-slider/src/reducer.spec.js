const { initialState, actions } = require('./reducer.js')

describe('initialState', () => {
  it('should default to not ready with an opacity of 0.75', () => {
    expect(initialState).toEqual({ ready: false, value: 0.75 })
  })
})

describe('actions.SET_READY', () => {
  it('should mark the state as ready without changing the value', () => {
    const result = actions.SET_READY({ ready: false, value: 0.5 })

    expect(result).toEqual({ ready: true, value: 0.5 })
  })
})

describe('actions.SET_VALUE', () => {
  it('should replace the value without changing the ready flag', () => {
    const result = actions.SET_VALUE({ ready: true, value: 0.75 }, 0.3)

    expect(result).toEqual({ ready: true, value: 0.3 })
  })
})

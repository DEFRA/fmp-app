
const response = {
  token: 'TEST_TOKEN',
  refreshToken: () => {
    response.token = 'REFRESHED_TOKEN'
    return response.token
  }
}
const _invalidateToken = () => { response.token = undefined }

const _resetToken = () => { response.token = 'TEST_TOKEN' }

const ApplicationCredentialsManager = {
  fromCredentials: () => (response)
}

module.exports = { ApplicationCredentialsManager, _invalidateToken, _resetToken }

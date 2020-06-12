function AuthViewModel (data) {
  if (data) {
    this.isAuthenticated = data.isAuthenticated
    this.token = data.token
  }
}
module.exports = AuthViewModel

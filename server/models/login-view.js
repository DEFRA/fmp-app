function LoginViewModel (data, errors) {
  if (data) {
    this.username = data.username
    this.password = data.password
  }
  if (errors) {
    this.errors = {}
    // UserName
    const userNameErrors = errors.find(e => e.path[0] === 'username')
    if (userNameErrors) {
      this.errors.username = 'You need to a username'
    }
    // Password
    const passwordErrors = errors.find(e => e.path[0] === 'password')
    if (passwordErrors) {
      this.errors.password = 'You need to provide a password'
    }
  }
}
module.exports = LoginViewModel

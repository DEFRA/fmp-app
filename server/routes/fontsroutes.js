module.exports = {
    method: 'GET',
    path: '/{path*}',
    options: {
        handler: {
            directory: {
                path: [
                    'server/public/assets/stylesheets/fonts/'
                ]
            }
        }
    }
}
module.exports = {
  'facebookAuth': {
    'clientID': '',
    'clientSecret': '',
    'callbackURL': 'http://localhost:8080/auth/facebook/callback',
    'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name, ;ast_name, email',
    'profileFields': ['id', 'email', 'name']
  },
}

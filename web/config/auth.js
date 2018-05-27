module.exports = {
  'facebookAuth': {
    'clientID': '843930439103568',
    'clientSecret': '75daf458e42a0c0f40048d16055a1dab',
    'callbackURL': 'http://localhost:8080/auth/facebook/callback',
    'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name, last_name, email',
    'profileFields': ['id', 'email', 'name']
  },
  jwt: {
    'key': 'jwtsecretekey'
  }
}

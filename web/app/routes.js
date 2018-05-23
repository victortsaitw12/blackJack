// app/routes.js

module.exports = function(app, passport) {
  app.get('/', (req, res) => {
    res.render('index.ejs'); // load the index.ejs file  
  });
  app.get('/login', (req, res) => {
    res.render('login.ejs', {
      message: req.flash('loginMessage')
    });
  });
  app.post('/login', passport.authenticate('local-login', {
    // redirect to the secure profile section
    successRedirect: '/profile',
    // redirect back to the signup page if there is an error
    failureRedirect: '/login', 
    failureFlash: true // allow flash messages
  }));
  // signup
  app.get('/signup', (req, res) => {
    // render the page and pass in any flash data if it exists
    res.render('signup.ejs', {
      message: req.flash('signupMessage')
    });
  });
  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFalsh: true // allow flash messages
  }));
  // profile section
  app.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile.ejs', {
      user: req.user
    });
  });
  // facebook routes
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
  }));
  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
  }));
  // logout
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
};

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect('/');
}

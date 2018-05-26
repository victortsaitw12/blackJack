// app/routes.js
var jwt = require('jsonwebtoken');
module.exports = function(app, passport) {
  app.get('/', (req, res) => {
    res.render('index.ejs', {
      app_id: '843930439103568'
    }); // load the index.ejs file  
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
  //app.get('/auth/facebook', passport.authenticate('facebook', {
  //  scope: ['public_profile', 'email']
  //}));
  // handle the callback after facebook has authenticated the user
  //app.get('/auth/facebook/callback',
  //  passport.authenticate('facebook', {
  //    successRedirect: '/profile',
  //    failureRedirect: '/'
  //}));
  app.get('/auth/facebook/token',
    passport.authenticate('facebook-token'), (req, res) => {
      console.log(req.user);
      var token = jwt.sign({
        user_id: req.user._id
      }, 'jwtsecretekey', {
        expiresIn: 60  
      });
      res.end(token);
  });
  // logout
  app.get('/logout', (req, res) => {
    req.session.destroy();
    req.logout();
    res.redirect('/');
  });
  // Authorize
  app.get('/connect/local', (req, res) => {
    res.render('connect-local.ejs', {
      message: req.flash('loginMessage')
    })
  });
  app.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/connect/local',
    failureFlash: true
  }));
  app.get('/connect/facebook', passport.authorize('facebook', {
    scope: ['public_profile', 'email']
  }));
  app.get('/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));
  app.get('/unlink/local', (req, res) => {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(err => {
      res.redirect('/profile');  
    });
  });
  app.get('/unlink/facebook', (req, res) => {
    var user = req.user;
    user.facebook.token = undefined;
    user.save(err => {
      res.redirect('/profile');  
    });
  });
  //app.get('/webClient', isLoggedIn, (req, res) => {
  //  console.log('==================');
  //  console.log(req.query.token);
  //  res.render('webclient.ejs', {
  //    user: req.user
  //  });
  //});
  app.get('/gamePanel', passport.authenticate('jwt', {
    session: false,
  }), (req, res) => {
    if(req.user){
      res.render('webclient.ejs', {
        user: req.user
      });
    }
  });
};

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect('/');
}

'use strict'
var LocalStrategy = require('passport-local').Strategy;
var User = require('../app/models/user');
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('./auth');

module.exports = function(passport){
  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);  
  });

  // used to deseiralize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);  
    });  
  });
  // Local Login
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, (req, email, password, done) => {
    process.nextTick(() => {
      User.findOne({ 'local.email': email }, (err, user) => {
        if (err) return done(err);
        if (user) {
          return done(null, false,
            req.flash('signupMessage', 'That email has been taken')
          );
        } else {
          var newUser = new User();
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);
          // save the user
          newUser.save((err) => {
            if (err) throw err;
            return done(null, newUser);
          });
        }
      });  
    });
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, (req, email, password, done) => {
    User.findOne({ 'local.email': email }, (err, user) => {
      if(err) return done(err);
      if(!user) 
        return done(null, false,
          req.flash('loginMessage', 'No user found.')
        );
      if(!user.validPassword(password))
        return done(null, false,
          req.flash('loginMessage', 'Oops! Wrong password.')
        );
      return done(null, user);
    });
  }));
  // facebook
  passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: configAuth.facebookAuth.profileFields,
  // facebook will send back the token and profile
  }, (token, refreshToken, profile, done) => { 

    console.log(profile);
    console.log(token);
    console.log(refreshToken);
    // asynchronous
    process.nextTick(() => {
      // find the user in database based on thier facebook id
      User.findOne({'facebook.id': profile.id}, (err, user) => {
        if (err) return done(err);
        if (user) {
          return done(null, user);
        } else {
          // if there is no user found with that facebook id, create them
          var newUser = new User();
          newUser.facebook.id = profile.id;
          newUser.facebook.token = token;
          newUser.facebook.name = profile.name.givenName + ' ' +
            profile.name.familyName;
          newUser.facebook.email = profile.emails[0].value;
          newUser.save(err => {
            if (err) throw err;
            return done(null, newUser);
          });
        }
      });
    });
  }));
};

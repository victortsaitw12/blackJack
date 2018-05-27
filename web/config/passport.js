'use strict'
var LocalStrategy = require('passport-local').Strategy;
var User = require('../app/models/user');
var FacebookStrategy = require('passport-facebook').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token');
var JwtStrategy = require('passport-jwt').Strategy;
var jwt = require('jsonwebtoken');
var ExtractJwt = require('passport-jwt').ExtractJwt;
var configAuth = require('./auth');

function makeJWT(user_id){
  return jwt.sign({
    user_id: user_id
  }, 'jwtsecretekey', {
    expiresIn: 60  
  });
}

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
      User.findOne({ 'local.email': email }, (err, existingUser) => {
        if (err) return done(err);

        // check to see if there's a already a user with that email
        if (existingUser)
          return done(null, false, 
            req.flash('signupMessage', 'That email is already taken.')
          );
        // If we're logged in, we're connecting a new local account.
        if (req.user){
          var user = req.user;
          user.local.email = email;
          user.local.password = user.generateHash(password);
          user.save(err => {
            if (err) throw err;
            return done(null, user);
          });
        } else {
          var newUser = new User();
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);
          newUser.save(err => {
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
  /*
  passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL,
    profileFields: configAuth.facebookAuth.profileFields,
    passReqToCallback: true
  // facebook will send back the token and profile
  }, (req, token, refreshToken, profile, done) => { 

    console.log(profile);
    console.log(token);
    console.log(refreshToken);
    // asynchronous
    process.nextTick(() => {

      if (!req.user) {
        User.findOne({ 'facebook.id': profile.id }, (err, user) => {
          if (err) return done(err);
          if (user) {
            if (!user.facebook.token) {
              user.facebook.token = token;
              user.facebook.name = profile.name.givenName + ' '+
                profile.name.familyName;
              user.facebook.email = profile.emails[0].value;
              user.updated_dt = Date.now();
              user.save(err => {
                if (err) throw err;
                return done(null, user);
              });
            }
            return done(null, user);
          } else {
            var newUser = new User();
      
            newUser.facebook.id = profile.id;
            newUser.facebook.token = token;
            newUser.facebook.name = profile.name.givenName + ' ' +
              profile.name.familyName;
            newUser.facebook.email = profile.emails[0].value;
            newUser.nickname = newUser.facebook.name;
            newUser.money = 1000;
            newUser.exp = 0;
            newUser.level = 0;
            newUser.created_dt = Date.now();
            newUser.updated_dt = Date.now();
            newUser.save(err => {
              if (err) throw err;
              return done(null, newUser);
            });
          }
        });
      } else {
        var user = req.user; // pull the user out of the session
        user.facebook.id = profile.id;
        user.facebook.token = token;
        user.facebook.name = profile.name.givenName + ' ' +
          profile.name.familyName;
        user.facebook.email = profile.emails[0].value;
        user.updated_dt = Date.now();
        user.save(err => {
          if (err) throw err;
          return done(null, user);
        });
      }
    });
  }));
  */
  passport.use('facebook-token', new FacebookTokenStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
  }, (token, refreshToken, profile, done) => {
    process.nextTick(function(){
      User.findOne({ 'facebook.id': profile.id }, (err, user) => {
        if (err) return done(err);
        if (user) {
          if (!user.facebook.token) {
            user.facebook.token = token;
            user.facebook.name = profile.name.givenName + ' '+
              profile.name.familyName;
            user.facebook.email = profile.emails[0].value;
            user.updated_dt = Date.now();
            user.save(err => {
              if (err) throw err;
              return done(null,
                Object.assign(user, {
                  jwt_token: makeJWT(user._id)
                })
              );
            });
          }
          return done(null, 
            Object.assign(user, {
              jwt_token: makeJWT(user._id)
            })
          );
        } else {
          var newUser = new User();
          newUser.facebook.id = profile.id;
          newUser.facebook.token = token;
          newUser.facebook.name = profile.name.givenName + ' ' +
          profile.name.familyName;
          newUser.facebook.email = profile.emails[0].value;
          newUser.nickname = newUser.facebook.name;
          newUser.money = 1000;
          newUser.exp = 0;
          newUser.level = 0;
          newUser.created_dt = Date.now();
          newUser.updated_dt = Date.now();
          newUser.save(err => {
          if (err) throw err;
            return done(null, 
              Object.assign(user, {
                jwt_token: makeJWT(newUser._id)
              })
            );
          });
        }
      })
    });
  }));
  passport.use('jwt', new JwtStrategy({
    // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
    secretOrKey: configAuth.jwt.key,
  }, (payload, done) => {
    process.nextTick(function(){
      User.findById(payload.user_id, (err, user) => {
        if (err) return done(err);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      })
    });
  }));
};

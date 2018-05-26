'use strict'
var express = require('express');
var app = express();
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var configDB = require('./config/database.js');
var morgan = require('morgan');
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for config

// set up our express application
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
// required for passport
app.use(session({
  store: new RedisStore({
    host: 'redis',
    port: 6379
  }),
  secret: 'iamvictortsai',
  resave: false
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

require('./app/routes.js')(app, passport);

app.listen(port);
console.log('The magic happens on port =' + port);

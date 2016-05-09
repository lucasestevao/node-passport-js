//libraries required
//express framework
var express = require('express');
var app = express();
//mongo connector
var mongoose = require('mongoose');
//Passport
var passport = require('passport');
//Flash messages stored in session
var flash = require('connect-flash');
//log request to the log
var morgan = require('morgan');
//read cookies
var cookieParser = require('cookie-parser');
//get information from html forms
var bodyParser = require('body-parser');
//session
var session = require('express-session');

var PORT = process.env.PORT || 8080;

//database
var databaseConfig = require('./config/database.js');
mongoose.connect(databaseConfig.url);

//passport
require('./config/passport')(passport);

//APP use
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); //Returns middleware that only parses urlencoded bodies. This parser accepts only UTF-8 encoding of the body and supports automatic inflation of gzip and deflate encodings.

//setup view
app.set('view engine', 'ejs');

//session setup
app.use(session({ secret: 'avenuecode-passport-training', resave: true, saveUninitialized: false }));
//secret - This is the secret used to sign the session ID cookie
//resave - Forces the session to be saved back to the session store, even if the session was never modified during the request. 
//saveUninitialized - Forces a session that is "uninitialized" to be saved to the store.
//https://www.npmjs.com/package/express-session

//passport setup
app.use(passport.initialize());
app.use(passport.session());

//flash message setup
app.use(flash());

//routes
require('./app/routes.js')(app, passport);

//listen to port
app.listen(PORT, function() {
    console.log("Open your browser at http://localhost:" + PORT);
});

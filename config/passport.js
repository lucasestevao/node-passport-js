//Loading Strategies
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LinkedinStrategy = require('passport-linkedin').Strategy;
var BitbucketStrategy = require('passport-bitbucket').Strategy;
var InstagramStrategy = require('passport-instagram').Strategy;
var EvernoteStrategy = require('passport-evernote').Strategy;
var DropboxStrategy = require('passport-dropbox').Strategy;

// load up the user model
var User = require('../app/models/user');

// load the auth config
var configAuth = require('./auth');

module.exports = function(passport) {

    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });


    //Local login
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(request, email, password, done) {
            if (email) {
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
            }

            // asynchronous
            process.nextTick(function() {
                User.findOne({ 'local.email': email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // no user found
                    if (!user){
                        // return console.log('No user found.');
                        return done(null, false, request.flash('loginMessage', 'No user found.'));
                    }

                    // invalid password
                    if (!user.validPassword(password)){
                        return done(null, false, request.flash('loginMessage', 'Invalid password.'));
                        // return console.log('Invalid password');
                    }

                    // all is well, return user
                    else
                        return done(null, user);
                });
            });
        }));


    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(request, email, password, done) {
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function() {
                // if the user is not already logged in:
                if (!request.user) {
                    User.findOne({ 'local.email': email }, function(err, user) {
                        // if there are any errors, return the error
                        if (err) {
                            return done(err);
                        }

                        // check to see if theres already a user with that email
                        if (user) {
                            // return console.log('That email is already taken.');
                            return done(null, false, request.flash('signupMessage', 'That email is already taken.'));
                        } else {

                            // create the user
                            var newUser = new User();

                            newUser.local.email = email;
                            newUser.local.password = newUser.generateHash(password);

                            newUser.save(function(err) {
                                if (err) {
                                    return done(err);
                                }

                                return done(null, newUser);
                            });
                        }

                    });
                    // if the user is logged in but has no local account...
                } else if (!request.user.local.email) {
                    //let's check if the email used to connect a local account is being used by another user
                    User.findOne({ 'local.email': email }, function(err, user) {
                        if (err) {
                            return done(err);
                        }

                        if (user) {
                            // return console.log('That email is already taken.');
                            return done(null, false, request.flash('loginMessage', 'That email is already taken.'));
                            // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                        } else {
                            var user = request.user;
                            user.local.email = email;
                            user.local.password = user.generateHash(password);
                            user.save(function(err) {
                                if (err) {
                                    return done(err);
                                }

                                return done(null, user);
                            });
                        }
                    });
                } else {
                    // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                    return done(null, request.user);
                }

            });

        }));

    //facebook
    passport.use(new FacebookStrategy({

            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            profileFields: ['id', 'name', 'email'],
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function(request, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // check if the user is already logged in
                if (!request.user) {

                    User.findOne({ 'facebook.id': profile.id }, function(err, user) {
                        if (err) {
                            return done(err);
                        }

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.facebook.token) {
                                user.facebook.token = token;
                                user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                                user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                                user.save(function(err) {
                                    if (err) {
                                        return done(err);
                                    }

                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.facebook.id = profile.id;
                            newUser.facebook.token = token;
                            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                            newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

                            newUser.save(function(err) {
                                if (err) {
                                    return done(err);
                                }

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = request.user; // pull the user out of the session

                    user.facebook.id = profile.id;
                    user.facebook.token = token;
                    user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                    user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                    user.save(function(err) {
                        if (err) {
                            return done(err);
                        }

                        return done(null, user);
                    });

                }
            });

        }));


    //twitter
    passport.use(new TwitterStrategy({

            consumerKey: configAuth.twitterAuth.consumerKey,
            consumerSecret: configAuth.twitterAuth.consumerSecret,
            callbackURL: configAuth.twitterAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function(request, token, tokenSecret, profile, done) {

            // asynchronous
            process.nextTick(function() {

                // check if the user is already logged in
                if (!request.user) {

                    User.findOne({ 'twitter.id': profile.id }, function(err, user) {
                        if (err) {
                            return done(err);
                        }

                        if (user) {
                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.twitter.token) {
                                user.twitter.token = token;
                                user.twitter.username = profile.username;
                                user.twitter.displayName = profile.displayName;

                                user.save(function(err) {
                                    if (err) {
                                        return done(err);
                                    }

                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.twitter.id = profile.id;
                            newUser.twitter.token = token;
                            newUser.twitter.username = profile.username;
                            newUser.twitter.displayName = profile.displayName;

                            newUser.save(function(err) {
                                if (err) {
                                    return done(err);
                                }

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = request.user; // pull the user out of the session

                    user.twitter.id = profile.id;
                    user.twitter.token = token;
                    user.twitter.username = profile.username;
                    user.twitter.displayName = profile.displayName;

                    user.save(function(err) {
                        if (err) {
                            return done(err);
                        }

                        return done(null, user);
                    });
                }

            });

        }));

   	//Google
   	passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(request, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!request.user) {

                User.findOne({ 'google.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.google.token) {
                            user.google.token = token;
                            user.google.name  = profile.displayName;
                            user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                            user.save(function(err) {
                                if (err){
                                    return done(err);
                                }
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        var newUser          = new User();

                        newUser.google.id    = profile.id;
                        newUser.google.token = token;
                        newUser.google.name  = profile.displayName;
                        newUser.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                        newUser.save(function(err) {
                            if (err){
                                return done(err);
                            }
                                
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user               = request.user; // pull the user out of the session

                user.google.id    = profile.id;
                user.google.token = token;
                user.google.name  = profile.displayName;
                user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email

                user.save(function(err) {
                    if (err){
                        return done(err);
                    }
                        
                    return done(null, user);
                });

            }

        });

    }));

    //LinkedIn
    passport.use(new LinkedinStrategy({

        consumerKey     : configAuth.linkedinAuth.clientID,
        consumerSecret  : configAuth.linkedinAuth.clientSecret,
        callbackURL     : configAuth.linkedinAuth.callbackURL,
        profileFields   : ['id', 'first-name', 'last-name', 'email-address', 'headline'],
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(request, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!request.user) {

                User.findOne({ 'linkedin.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.linkedin.token) {
                            user.linkedin.token = token;
                            user.linkedin.name  = profile.displayName;
                            user.linkedin.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
                            user.linkedin.headline  = JSON.parse(profile._raw).headline;

                            user.save(function(err) {
                                if (err){
                                    return done(err);
                                }
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        var newUser          = new User();

                        newUser.linkedin.id    = profile.id;
                        newUser.linkedin.token = token;
                        newUser.linkedin.name  = profile.displayName;
                        newUser.linkedin.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
                        newUser.linkedin.headline  = JSON.parse(profile._raw).headline;

                        newUser.save(function(err) {
                            if (err){
                                return done(err);
                            }
                                
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user               = request.user; // pull the user out of the session

                user.linkedin.id    = profile.id;
                user.linkedin.token = token;
                user.linkedin.name  = profile.displayName;
                user.linkedin.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
                user.linkedin.headline  = JSON.parse(profile._raw).headline;

                user.save(function(err) {
                    if (err){
                        return done(err);
                    }
                        
                    return done(null, user);
                });

            }

        });

    }));

    //Bitbucket
    passport.use(new BitbucketStrategy({

        consumerKey     : configAuth.bitbucketAuth.clientID,
        consumerSecret  : configAuth.bitbucketAuth.clientSecret,
        callbackURL     : configAuth.bitbucketAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(request, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!request.user) {

                User.findOne({ 'bitbucket.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.bitbucket.token) {
                            user.bitbucket.token = token;
                            user.bitbucket.name  = profile.displayName;
                            user.bitbucket.username  = profile.username;

                            user.save(function(err) {
                                if (err){
                                    return done(err);
                                }
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        var newUser          = new User();

                        newUser.bitbucket.id    = profile.id;
                        newUser.bitbucket.token = token;
                        newUser.bitbucket.name  = profile.displayName;
                        newUser.bitbucket.username  = profile.username;

                        newUser.save(function(err) {
                            if (err){
                                return done(err);
                            }
                                
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user               = request.user; // pull the user out of the session

                user.bitbucket.id    = profile.id;
                user.bitbucket.token = token;
                user.bitbucket.name  = profile.displayName;
                user.bitbucket.username  = profile.username;

                user.save(function(err) {
                    if (err){
                        return done(err);
                    }
                        
                    return done(null, user);
                });

            }

        });

    }));

    //Instagram
    passport.use(new InstagramStrategy({

        clientID        : configAuth.instagramAuth.clientID,
        clientSecret    : configAuth.instagramAuth.clientSecret,
        callbackURL     : configAuth.instagramAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(request, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!request.user) {

                User.findOne({ 'instagram.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.instagram.token) {
                            user.instagram.token = token;
                            user.instagram.name  = profile.displayName;
                            user.instagram.picture  = JSON.parse(profile._raw).data.profile_picture;

                            user.save(function(err) {
                                if (err){
                                    return done(err);
                                }
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        var newUser          = new User();

                        newUser.instagram.id    = profile.id;
                        newUser.instagram.token = token;
                        newUser.instagram.name  = profile.displayName;
                        newUser.instagram.picture  = JSON.parse(profile._raw).data.profile_picture;

                        newUser.save(function(err) {
                            if (err){
                                return done(err);
                            }
                                
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user               = request.user; // pull the user out of the session

                user.instagram.id    = profile.id;
                user.instagram.token = token;
                user.instagram.name  = profile.displayName;
                user.instagram.picture  = JSON.parse(profile._raw).data.profile_picture;

                user.save(function(err) {
                    if (err){
                        return done(err);
                    }
                        
                    return done(null, user);
                });

            }

        });

    }));

    //Evernote
    passport.use(new EvernoteStrategy({

        consumerKey       : configAuth.evernoteAuth.clientID,
        consumerSecret    : configAuth.evernoteAuth.clientSecret,
        callbackURL       : configAuth.evernoteAuth.callbackURL,
        requestTokenURL   : configAuth.evernoteAuth.requestTokenURL,
        accessTokenURL    : configAuth.evernoteAuth.accessTokenURL,
        userAuthorizationURL : configAuth.evernoteAuth.userAuthorizationURL,
        passReqToCallback    : true

    },

    function(request, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!request.user) {

                User.findOne({ 'evernote.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.evernote.token) {
                            user.evernote.token = token;

                            user.save(function(err) {
                                if (err){
                                    return done(err);
                                }
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        var newUser          = new User();

                        newUser.evernote.id    = profile.id;
                        newUser.evernote.token = token;

                        newUser.save(function(err) {
                            if (err){
                                return done(err);
                            }
                                
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user               = request.user; // pull the user out of the session

                user.evernote.id    = profile.id;
                user.evernote.token = token;

                user.save(function(err) {
                    if (err){
                        return done(err);
                    }
                        
                    return done(null, user);
                });

            }

        });

    }));

    //Dropbox
    passport.use(new DropboxStrategy({

        consumerKey     : configAuth.dropboxAuth.clientID,
        consumerSecret  : configAuth.dropboxAuth.clientSecret,
        callbackURL     : configAuth.dropboxAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(request, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!request.user) {

                User.findOne({ 'dropbox.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.dropbox.token) {
                            user.dropbox.token = token;
                            user.dropbox.name  = profile.displayName;

                            user.save(function(err) {
                                if (err){
                                    return done(err);
                                }
                                    
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        var newUser          = new User();

                        newUser.dropbox.id    = profile.id;
                        newUser.dropbox.token = token;
                        newUser.dropbox.name  = profile.displayName;

                        newUser.save(function(err) {
                            if (err){
                                return done(err);
                            }
                                
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user               = request.user; // pull the user out of the session

                user.dropbox.id    = profile.id;
                user.dropbox.token = token;
                user.dropbox.name  = profile.displayName;

                user.save(function(err) {
                    if (err){
                        return done(err);
                    }
                        
                    return done(null, user);
                });

            }

        });

    }));
};

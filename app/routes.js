var express = require('express');
var appRouter = express.Router();
var authRouter = express.Router();
var connectRouter = express.Router();
var unlinkRouter = express.Router();

module.exports = function(app, passport) {
    /* Regular Routes - BEGIN */

    //index
    appRouter.get('/', function(request, response) {
        response.render('index.ejs', { message: request.flash('loginMessage') });
    });

    //profile if logged
    appRouter.get('/profile', isLoggedIn, function(request, response) {
        response.render('profile.ejs', {
            user: request.user
        });
    });

    //logout
    appRouter.get('/logout', function(request, response) {
        request.logout();
        response.redirect('/');
    });

    /* Regular Routes - END */

    /* First login - BEGIN */

    //local
    //login form
    appRouter.get('/login', function(request, response) {
        response.render('login.ejs', { message: request.flash('loginMessage') });
    });

    //process login form
    appRouter.post('/login', passport.authenticate('local-login', {
        // redirect to the secure profile section
        successRedirect: '/profile',
        // redirect back to the signup page if there is an error
        failureRedirect: '/login',
        // allow flash messages
        failureFlash: true
    }));

    appRouter.get('/signup', function(request, response) {
        response.render('signup.ejs', { message: request.flash('signupMessage') });
    });

    appRouter.post('/signup', passport.authenticate('local-signup', {
        // redirect to the secure profile section
        successRedirect: '/profile',
        // redirect back to the signup page if there is an error
        failureRedirect: '/signup',
        // allow flash messages
        failureFlash: true
    }))

    //facebook
    authRouter.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));

    authRouter.get('/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    //twitter
    authRouter.get('/twitter', passport.authenticate('twitter', { scope: 'email' }));

    authRouter.get('/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    //google
    authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    authRouter.get('/google/callback', passport.authenticate('google', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    //linkedin
    authRouter.get('/linkedin', passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));

    authRouter.get('/linkedin/callback', passport.authenticate('linkedin', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    //bitbucket
    authRouter.get('/bitbucket', passport.authenticate('bitbucket', { scope: ['profile', 'email'] }));

    authRouter.get('/bitbucket/callback', passport.authenticate('bitbucket', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    //instagram
    authRouter.get('/instagram', passport.authenticate('instagram', { scope: 'basic' }));

    authRouter.get('/instagram/callback', passport.authenticate('instagram', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    //evernote
    authRouter.get('/evernote', passport.authenticate('evernote', { scope: 'basic' }));

    authRouter.get('/evernote/callback', passport.authenticate('evernote', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    //dropbox
    authRouter.get('/dropbox', passport.authenticate('dropbox', { scope: 'basic' }));

    authRouter.get('/dropbox/callback', passport.authenticate('dropbox', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

    /* First login - END */

    /* Logged in, connecting other social account login - BEGIN */

    //local
    connectRouter.get('/local', function(request, response) {
        response.render('connect-local.ejs', { message: request.flash('loginMessage') });
    });
    connectRouter.post('/local', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    //facebook
    connectRouter.get('/facebook', passport.authorize('facebook', { scope: 'email' }));

    connectRouter.get('/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    //twitter
    connectRouter.get('/twitter', passport.authorize('twitter', { scope: 'email' }));

    connectRouter.get('/twitter/callback',
        passport.authorize('twitter', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    //google
    connectRouter.get('/google', passport.authorize('google', { scope: ['profile', 'email'] }));

    connectRouter.get('/google/callback',
        passport.authorize('google', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    //linkedin
    connectRouter.get('/linkedin', passport.authorize('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));

    connectRouter.get('/linkedin/callback',
        passport.authorize('linkedin', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    //bitbucket
    connectRouter.get('/bitbucket', passport.authorize('bitbucket', { scope: ['profile', 'email'] }));

    connectRouter.get('/bitbucket/callback',
        passport.authorize('bitbucket', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    //instagram
    connectRouter.get('/instagram', passport.authorize('instagram', { scope: 'basic' }));

    connectRouter.get('/instagram/callback',
        passport.authorize('instagram', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    //evernote
    connectRouter.get('/evernote', passport.authorize('evernote', { scope: 'basic' }));

    connectRouter.get('/evernote/callback',
        passport.authorize('evernote', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    //dropbox
    connectRouter.get('/dropbox', passport.authorize('dropbox', { scope: 'basic' }));

    connectRouter.get('/dropbox/callback',
        passport.authorize('dropbox', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));

    /* Logged in, connecting other social account login - END */

    /* Unlink - BEGIN */

    //local
    unlinkRouter.get('/local', function(request, response) {
        var user            = request.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            response.redirect('/profile');
        });
    });

    //facebook
    unlinkRouter.get('/facebook', function(request, response) {
        var user            = request.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            response.redirect('/profile');
        });
    });

    //twitter
    unlinkRouter.get('/twitter', function(request, response) {
        var user           = request.user;
        user.twitter.token = undefined;
        user.save(function(err) {
           response.redirect('/profile');
        });
    });

    //google
    unlinkRouter.get('/google', function(request, response) {
        var user          = request.user;
        user.google.token = undefined;
        user.save(function(err) {
           response.redirect('/profile');
        });
    });

    //linkedin
    unlinkRouter.get('/linkedin', function(request, response) {
        var user          = request.user;
        user.linkedin.token = undefined;
        user.save(function(err) {
           response.redirect('/profile');
        });
    });

    //bitbucket
    unlinkRouter.get('/bitbucket', function(request, response) {
        var user          = request.user;
        user.bitbucket.token = undefined;
        user.save(function(err) {
           response.redirect('/profile');
        });
    });

    //instagram
    unlinkRouter.get('/instagram', function(request, response) {
        var user          = request.user;
        user.instagram.token = undefined;
        user.save(function(err) {
           response.redirect('/profile');
        });
    });

    //evernote
    unlinkRouter.get('/evernote', function(request, response) {
        var user          = request.user;
        user.evernote.token = undefined;
        user.save(function(err) {
           response.redirect('/profile');
        });
    });

    //dropbox
    unlinkRouter.get('/dropbox', function(request, response) {
        var user          = request.user;
        user.dropbox.token = undefined;
        user.save(function(err) {
           response.redirect('/profile');
        });
    });

    /* Unlink - END */

    app.use('/', appRouter);
    app.use('/auth', authRouter);
    app.use('/connect', connectRouter);
    app.use('/unlink', unlinkRouter);
};

//middleware that will verify whether user is logged in
var isLoggedIn = function(request, response, next) {

    if (request.isAuthenticated()) {
        return next();
    }

    response.redirect('/');
}

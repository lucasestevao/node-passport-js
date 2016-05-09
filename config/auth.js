// expose our config directly to our application using module.exports
module.exports = {

    //https://developers.facebook.com/
    'facebookAuth': {
        'clientID': '1750692608509297',
        'clientSecret': '3d8b469eda8ecda5c3b005045aed2487',
        'callbackURL': 'http://localhost:8080/auth/facebook/callback'
    },

    //https://dev.twitter.com/
    'twitterAuth': {
        'consumerKey': 'nmAq4DgDI2AvYsQDuywy731d8',
        'consumerSecret': 'uwgx8DCeevH9CUpXG8hiV1z4S1XJ5dI0qRNR2h91TyEr3k3jo8',
        'callbackURL': 'http://localhost:8080/auth/twitter/callback'
    },

    //console.developer.google.com or https://console.cloud.google.com
    'googleAuth': {
        'clientID': '263408916942-p4tvlngc28t71jk01hkpng4ui2t94acj.apps.googleusercontent.com',
        'clientSecret': 'MI9UEaRvuNnbYxUrXuU3ZSiO',
        'callbackURL': 'http://localhost:8080/auth/google/callback'
    },

    //https://www.linkedin.com/developer/apps/
    'linkedinAuth': {
        'clientID': '776ssnlds9l048',
        'clientSecret': '3AOEzN0Cm8XhBdjm',
        'callbackURL': 'http://localhost:8080/auth/linkedin/callback'
    },

    //https://bitbucket.org/account/user/<USERNAME>/api
    'bitbucketAuth': {
        'clientID': 'bvch8nUhLxjAeE34Tt',
        'clientSecret': 'a5vqSEuZUqMXbSN8LzVYMH2EJSjHTgYD',
        'callbackURL': 'http://localhost:8080/auth/bitbucket/callback'
    },

    //https://www.instagram.com/developer/clients/manage/
    'instagramAuth': {
        'clientID': '8c9a809b749345569ab0ad424ba90868',
        'clientSecret': 'efaf1635794d42d1875530ae39f7b76e',
        'callbackURL': 'http://localhost:8080/auth/instagram/callback'
    },

    //https://dev.evernote.com/key.php
    'evernoteAuth': {
        'requestTokenURL': 'https://sandbox.evernote.com/oauth',
        'accessTokenURL': 'https://sandbox.evernote.com/oauth',
        'userAuthorizationURL': 'https://sandbox.evernote.com/OAuth.action',
        'evernoteHostName': 'https://sandbox.evernote.com',
        'clientID': 'lucasestevaods-7664',
        'clientSecret': '129cda47e7f6ea75',
        'callbackURL': 'http://localhost:8080/auth/evernote/callback'
    },

    //https://www.dropbox.com/developers/apps
    'dropboxAuth': {
        'clientID': 'er7zkmpgohot2l9',
        'clientSecret': 'cnreymg72wsbchw',
        'callbackURL': 'http://localhost:8080/auth/dropbox/callback'
    },

};

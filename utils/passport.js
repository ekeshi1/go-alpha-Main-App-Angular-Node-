const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/userModel');
const userHelper = require('../db/userHelper');

module.exports= function(passport){
    let opts={};

    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = 'my secret';

    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        console.log("Came here");
        console.log(jwt_payload);
        console.log(jwt_payload.email);
        userHelper.getUserById(jwt_payload.email, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                user.password=null;
                return done(null, user);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        });
    }));

}

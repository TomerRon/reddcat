const   LocalStrategy   = require('passport-local').Strategy,
        models  = require('../models/index'),
        JwtStrategy = require('passport-jwt').Strategy,
        ExtractJwt = require('passport-jwt').ExtractJwt,
        jwt = require('jsonwebtoken');

module.exports = function(passport, eventEmitter) {

    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = process.env.SESSION_SECRET;
    
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        models.user.findById(id).then(user => {
            done(null, user);
        });
    });
    
    /*
    JWT Strategy
    Returns user information
    */
    passport.use('jwt', new JwtStrategy(opts, function(jwt_payload, done) {
        models.user.findById(jwt_payload.id)
        .then((user) => {
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));
    
    /*
    Guest Strategy
    Used to create a guest user as soon as the website is opened for the first time
    Returns JWT token
    */
    passport.use('guest', new LocalStrategy({
        passReqToCallback : true
    },
    function(req, username, password, done) {
        process.nextTick(function() {
            let guestUser = models.user.build({ username: 'guest'+(Math.random().toString().slice(2,9)), password: models.user.generateHash('guest'), type: 'guest' });
            guestUser.save().then(() => {
                models.campaign.build( { keywords: ['amazon'], userId: guestUser.id } ).save()
                .then(campaign => {
                    models.event.build( { message: 'Campaign added with keywords '+ campaign.keywords, campaignId: campaign.id } ).save()
                    .then(e => {
                        campaign.dataValues.events = [e];
                        eventEmitter.emit('addCampaign', campaign);
                        models.campaign.build( { keywords: ['iphone'], userId: guestUser.id } ).save()
                        .then(campaign2 => {
                            models.event.build( { message: 'Campaign added with keywords '+ campaign2.keywords, campaignId: campaign2.id } ).save()
                            .then(e2 => {
                                campaign.dataValues.events = [e2];
                                eventEmitter.emit('addCampaign', campaign2);
                                models.campaign.build( { keywords: ['bitcoin'], userId: guestUser.id } ).save()
                                .then(campaign3 => {
                                    models.event.build( { message: 'Campaign added with keywords '+ campaign3.keywords, campaignId: campaign3.id } ).save()
                                    .then(e3 => {
                                        campaign.dataValues.events = [e3];
                                        eventEmitter.emit('addCampaign', campaign3);
                                        const payload = {id: guestUser.id};
                                        const token = jwt.sign(payload, opts.secretOrKey);
                                        return done(null, {message: "ok", token: "bearer "+token});
                                    })
                                });
                            })
                        });
                    });
                })
            });
        });    
    }));
    
    /*
    Signup Strategy
    Used to change a guest user into a normal user
    Returns JWT token
    */
    passport.use('local-signup', new LocalStrategy({
        passReqToCallback : true
    },
    function(req, username, password, done) {
        process.nextTick(function() {
            models.user.findOne({ where: { username: username }}).then(user => {
                if (user) {
                    return done(null, false, 'That username is already taken.');
                } else {
                    var newUser            = models.user.build({ username: username, password: models.user.generateHash(password), type: 'default'});
                    newUser.save().then(() => {
                        var payload = {id: newUser.id};
                        var token = jwt.sign(payload, opts.secretOrKey);
                        return done(null, {message: "ok", token: "bearer "+token});
                    });
                }
            });
        });
    }));
    
    /*
    Login Strategy
    Returns JWT token
    */
    passport.use('local-login', new LocalStrategy({
        passReqToCallback : true
    },
    function(req, username, password, done) {
        
        models.user.findOne({ where: { username: username }}).then(user => {

            if (!user)
                return done(null, false, {message: "No user found."});

            if (!user.validPassword(password))
                return done(null, false, {message: "Wrong password."})
            
            var payload = {id: user.id};
            var token = jwt.sign(payload, opts.secretOrKey);
            return done(null, {message: "ok", token: "bearer "+token});
        });

    }));
};

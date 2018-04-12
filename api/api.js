const models     = require('../models/index'),
      Op         = models.Sequelize.Op,
      ExtractJwt = require('passport-jwt').ExtractJwt,
      jwt        = require('jsonwebtoken'),
      json2csv   = require('json2csv').parse;

const MAX_COMMENTS = 50;

module.exports = function(router, eventEmitter, passport) {

    //  ===
    //  AUTH API
    //      Uses JWT for authentication.
    //      All actions except POST /guest require a token.
    //  ===

    /*
    POST create guest user
    Returns JSON web token
    */
    router.post('/guest', createGuestUserIfNotLoggedIn, function(req, res){
      passport.authenticate('guest', function(err, response, info){
        if(err){res.json({message: err});}
        if(!response) {
            res.json({message: info});
        } else {
            res.json(response);
        }
      }) (req, res);
    });
    
    /*
    POST signup - from guest user to normal user
    Returns JSON web token
    */
    router.post('/signup', passport.authenticate('jwt', { session: false }), (req, res) => {
        if (req.user && req.user.type == 'guest' && Object.prototype.hasOwnProperty.call(req.body, 'username') && Object.prototype.hasOwnProperty.call(req.body, 'password')) {
            let opts = {};
            opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
            opts.secretOrKey = process.env.SESSION_SECRET;
            models.user.findOne({ where: { username: req.body.username }}).then(user => {
                if (user) {
                    res.json({message: 'That username is already taken.'});
                } else {
                    models.user.findById(req.user.id).then((u) => {
                        u.update({ username: req.body.username, password: models.user.generateHash(req.body.password), type: 'default'})
                        .then((u) => {
                            let payload = {id: u.id};
                            let token = jwt.sign(payload, opts.secretOrKey);
                            res.json({message: "ok", token: "bearer "+token});
                        });
                    })
                    .catch(e => { res.status(400).json(e); });
                }
            });
        }
    });
    
    /*
    POST login
    Returns JSON web token
    */
    router.post('/login', function(req, res){
      passport.authenticate('local-login', function(err, response, info){
        if(err){res.json({message: err});}
        if(!response) {
            res.json({message: info.message});
        } else {
            res.json(response);
        }
      }) (req, res);
    });
    
    /*
    POST auth
    Returns user information
    */
    router.post('/auth', passport.authenticate('jwt', { session: false }),
        function(req, res) {
            res.json(req.user);
        }
    );
    
    //  ===
    //  CAMPAIGNS API
    //  ===
    
    /*
    GET campaigns list
    */
    router.get('/campaigns', passport.authenticate('jwt', { session: false }), (req, res) => {
        models.campaign.findAll( { where: { userId: req.user.id }})
        .then(camps => {
            getCommentsFromCampaigns(camps).then(response => {
                res.json(response);
            });
        })
        .catch(e => { res.status(400).json(e); });
    });
    
    /*
    GET campaign
    */
    router.get('/campaign/:campaignId', passport.authenticate('jwt', { session: false }), (req, res) => {
        models.campaign.findOne({where: {id: req.params.campaignId}, include: [models.comment, models.event]})
        .then(campaign => {
            if (campaign == null || campaign.userId != req.user.id) {
                res.json({'message':'Campaign not found!'});
            } else {
                res.json(campaign);
            }
        })
        .catch(e => { res.status(400).json(e); });
    });
    
    /*
    POST new campaign
    */
    router.post('/campaigns', passport.authenticate('jwt', { session: false }), (req, res) => {
        if (!req.body.keywords) return res.status(400).json({ message: "Keywords are required."});
        models.campaign.build( { keywords: req.body.keywords.split(','), userId: req.user.id } ).save()
        .then(campaign => {
            models.event.build( { message: 'Campaign added with keywords '+ campaign.keywords, campaignId: campaign.id } ).save()
            .then(e => {
                campaign.dataValues.events = [e];
                eventEmitter.emit('addCampaign', campaign);
                res.json({ message: "Campaign added!", campaign });
            });
        })
        .catch(e => { res.status(400).json(e); });
    });
    
    /*
    PUT update campaign
    */
    router.put('/campaign/:campaignId', passport.authenticate('jwt', { session: false }), (req, res) => {
        models.campaign.findById(req.params.campaignId)
        .then(campaign => {
            if (campaign == null || campaign.userId != req.user.id) {
                res.json({'message':'Campaign not found!'});
            } else {
                let params = {};
                if (req.body.keywords) { params.keywords = req.body.keywords.split(',') }
                if (req.body.lastSeenCommentId) { params.lastSeenCommentId = req.body.lastSeenCommentId }
                models.CampaignComment.count({ where: { campaignId: campaign.id } }).then(c => {
                    let notFull = (c < MAX_COMMENTS);
                    if ('active' in req.body) {
                        let canUpdateActive = (req.body.active && notFull) || (!req.body.active);
                        if (canUpdateActive) { params.active = req.body.active }
                    }
                    campaign.update( params )
                    .then(c => {
                        if (req.body.keywords) {
                            models.event.build( { message: 'Campaign keywords changed to '+ c.keywords, campaignId: c.id } ).save()
                            .then(e => {
                                c.getEvents().then(events => {
                                    c.dataValues.events = events;
                                    eventEmitter.emit('updateCampaign', c);
                                    res.json({message:'Campaign updated!', campaign: c});
                                });
                            });
                        } else {
                            c.getEvents().then(events => {
                                c.dataValues.events = events;
                                eventEmitter.emit('updateCampaign', c);
                                res.json({message:'Campaign updated!', campaign: c});
                            });
                        }
                    })
                    .catch(e => { res.status(400).json(e); });
                });
            }
        })
        .catch(e => { res.status(400).json(e); });
    });
    
    /*
    POST clear campaign comments
    */
    router.post('/campaign/:campaignId/clear', passport.authenticate('jwt', { session: false }), (req, res) => {
        models.campaign.findOne({where: {id: req.params.campaignId}, include: [models.comment]})
        .then(campaign => {
            if (campaign == null || campaign.userId != req.user.id) {
                res.json({'message':'Campaign not found!'});
            } else {
                models.CampaignComment.destroy({ where: { campaignId: campaign.id } })
                .then(() => {
                    destroyOrphanComments(campaign);
                    campaign.count = 0;
                    eventEmitter.emit('updateCampaign', campaign);
                    res.json({message:'Campaign cleared!', campaign: campaign});
                });
            }
        })
        .catch(e => { res.status(400).json(e); });
    });
    
    /*
    GET export campaign to CSV
    */
    router.get('/campaign/:campaignId/export', passport.authenticate('jwt', { session: false }), (req, res) => {
        models.campaign.findOne({where: {id: req.params.campaignId}, include: [models.comment]})
        .then(campaign => {
            if (campaign == null || campaign.userId != req.user.id) {
                res.json({'message':'Campaign not found!'});
            } else {
                const fields = ['createdAt', 'author', 'body', 'subreddit', 'post_title', 'comment_link'];
                const data = json2csv(campaign.comments, { fields });
                res.type('text/csv');
                res.setHeader('Content-disposition', 'attachment; filename=data.csv');
                res.status(200).send(data);
            }
        })
        .catch(e => { res.status(400).json(e); });
    });
    
    /*
    DELETE campaign
    */
    router.delete('/campaign/:campaignId', passport.authenticate('jwt', { session: false }), (req, res) => {
        models.campaign.findOne({where: {id: req.params.campaignId}, include: [models.comment]})
        .then(campaign => {
            if (campaign == null || campaign.userId != req.user.id) {
                res.json({'message':'Campaign not found!'});
            } else {
                eventEmitter.emit('removeCampaign', campaign);
                campaign.destroy()
                .then(() => {
                    destroyOrphanComments(campaign);
                    res.json({'message':'Campaign deleted!'});
                });
            }
        })
        .catch(e => { res.status(400).json(e); });
    });
    
    //  ===
    //  Helper functions
    //  ===
    
    // Destroys any comments in the (cleared/deleted) campaign that are no longer associated with any campaign
    function destroyOrphanComments(camp) {
        if (!camp.comments) return;
        for (let i = 0; i < camp.comments.length; i++) {
            models.CampaignComment.count({
                where: { commentId: camp.comments[i].id }
            })
            .then(count => {
                if (count <= 0) {
                    models.comment.destroy({ where: { id: camp.comments[i].id }});
                }
            });
        }
    }
    
    // For each campaign:
    // Counts the # of comments
    // Counts the # of new comments
    // Gets the info of the latest comment
    function getCommentsFromCampaigns(camps) {
        return new Promise((resolve, reject) => {
            var promises = [];
            var promise = (last, i) => new Promise((resolve, reject) => {
                models.CampaignComment.count( { where: { campaignId: camps[i].id, commentId: { [Op.gt]: last } } } ).then(nc => {
                    camps[i].dataValues.newCommentsCount = nc;
                    models.CampaignComment.count({ where: { campaignId: camps[i].id } }).then(c => {
                        camps[i].dataValues.commentsCount = c;
                        camps[i].getComments({ limit: 1, order: [ [ 'createdAt', 'DESC' ]]})
                        .then(latestComment => {
                            camps[i].dataValues.latestComment = latestComment ? latestComment[0] : null;
                            resolve();
                        })
                    });
                });
            });
            for (let i = 0; i < camps.length; i++) {
                let last = (camps[i].lastSeenCommentId ? camps[i].lastSeenCommentId : 0);
                promises.push(promise(last, i));
            }
            Promise.all(promises).then(() => { resolve(camps) });
        });
    }
    
    //  ===
    //  Middlewares
    //  ===
    
    function createGuestUserIfNotLoggedIn(req, res, next) {
        if (req.user) return next();
        // Fix for passport guest auth, which will fail if username or password fields are empty
        req.body.username = ' ';
        req.body.password = ' ';
        next();
    }
};
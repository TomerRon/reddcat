require('dotenv').config()
const   Snoowrap        = require('snoowrap'),
        Snoostorm       = require('snoostorm'),
        EventEmitter    = require('events'),
        models          = require('./models/index');

class Redditbot {
    
    constructor() {
        const r = new Snoowrap({
            userAgent: 'reddcat-v1',
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            username: process.env.REDDIT_USER,
        	password: process.env.REDDIT_PASS
        });
        
        const client = new Snoostorm(r);
        
        const streamOpts = {
            subreddit: 'all',
            results: 2000,
            "pollTime": 10000
        };
        
        this._MAXCOMMENTS = 50;
        
        this._stream = client.CommentStream(streamOpts);
        
        this._campaigns = [];
        
        this._keywords = [];
        
        this._eventEmitter = new EventEmitter();
        
        this._useDb = false;
    }
    
    get stream() {
        return this._stream;
    }
    
    get campaigns() {
        return this._campaigns;
    }
    
    get keywords() {
        return this._keywords;
    }
    
    setCampaigns(camps) {
        let that = this;
        return new Promise(function (res, rej) {
            if (camps === undefined) {
                models.campaign.findAll().then(campaigns => {
                    campaigns.forEach((camp) => {
                        models.CampaignComment.count({ where: { campaignId: camp.id } })
                        .then(c => {
                            camp.count = c;
                        });
                    });
                    console.log('reddit bot using database');
                    that._campaigns = campaigns;
                    that.setKeywords(campaigns);
                    that._useDb = true;
                    res(true);
                });
            } else {
                console.log('reddit bot using local setting without saving to database');
                that._useDb = false;
                that._campaigns = camps;
                that.setKeywords(camps);
                res(true);
            }
        });
    }
    
    setKeywords(camps) {
        let keywords = [];
        camps.forEach((c) =>{
            if (c.active) { Array.prototype.push.apply(keywords, c.keywords) }
        });
        this._keywords = this.removeDuplicateStringsFromArray(keywords); // clear keywords list of duplicates
        console.log('got keywords '+this._keywords);
    }
    
    addCampaign(camp) {
        let exists = this._campaigns.filter(function( obj ) {
            return obj.id == camp.id;
        });
        if (!exists.length) {
            if (this._useDb) {
                models.CampaignComment.count({ where: { campaignId: camp.id } })
                        .then(c => {
                            camp.count = c;
                            this._campaigns.push(camp);
                            this.setKeywords(this._campaigns);
                        });
            } else {
                this._campaigns.push(camp);
                this.setKeywords(this._campaigns);
            }
        }
    }
    
    removeCampaign(camp) {
        this._campaigns = this._campaigns.filter(function( obj ) {
            return obj.id !== camp.id;
        });
        this.setKeywords(this._campaigns);
    }
    
    updateCampaign(camp) {
        this._campaigns = this._campaigns.filter(function( obj ) {
            if (obj.id == camp.id) {
                obj.keywords = camp.keywords;
                obj.active = camp.active;
                if (camp.hasOwnProperty('count')) obj.count = camp.count;
            }
            
            return obj;
        });
        this.setKeywords(this._campaigns);
    }
    
    start() {
        let that = this;
        console.log('reddit bot starting...');
        this._stream.on('comment', (comment) => {
            let relevantCampaigns = [];
            this._keywords.forEach((key) =>{
                let regex = new RegExp("(?:^| )"+key);
                let commentString = comment.body + " " + comment.author.name;
                if (commentString.toLowerCase().match(regex)) {
                    this._campaigns.forEach((c) =>{
                        if (relevantCampaigns.includes(c) || !c.active) return;
                        let containsAll = c.keywords.every((k) => {
                            let regex = new RegExp("(?:^| )"+k);
                            return commentString.toLowerCase().match(regex);
                        });
                        if (containsAll) {
                            c.count++;
                            if (c.count == that._MAXCOMMENTS) { 
                                c.setReachedLimit = true;
                            }
                            relevantCampaigns[relevantCampaigns.length] = c;
                        }
                    });
                }
            });
            if (relevantCampaigns.length) {
                this._eventEmitter.emit('newComment', comment);
                relevantCampaigns = this.removeDuplicateObjectsFromArray(relevantCampaigns);
                let params = {
                    author: comment.author.name,
                    body: comment.body,
                    reddit_id: comment.id,
                    subreddit: comment.subreddit.display_name,
                    post_title: comment.link_title,
                    post_link: comment.link_permalink,
                    comment_link: comment.link_permalink+comment.id
                };
                if (this._useDb) {
                    let newComment = models.comment.build( params );
                    relevantCampaigns = relevantCampaigns.filter((relevantCamp) =>{
                        return (relevantCamp.active && relevantCamp.count <= that._MAXCOMMENTS);
                    });
                    if (relevantCampaigns.length) {
                        newComment.save()
                        .then(c => {
                            console.log(c.body.length > 150 ? c.body.substr(0,147)+'...' : c.body);
                            relevantCampaigns.forEach((relevantCamp => {
                                console.log('Added to campaign '+relevantCamp.id);
                                relevantCamp.addComment(c);
                                if (relevantCamp.hasOwnProperty('setReachedLimit') && relevantCamp.setReachedLimit) {
                                    relevantCamp.active = false;
                                    relevantCamp.setReachedLimit = false;
                                    models.event.build( { message: 'Limit reached', campaignId: relevantCamp.id } ).save();
                                    relevantCamp.update({active: false});
                                    that.setKeywords(that._campaigns);
                                }
                            }));
                        });
                    }
                }
            }
        });
    }
    
    removeDuplicateObjectsFromArray(a) {
        let seen = {};
        let out = [];
        let len = a.length;
        let j = 0;
        for(let i = 0; i < len; i++) {
             let item = a[i];
             if(seen[item.id] !== 1) {
                   seen[item.id] = 1;
                   out[j++] = item;
             }
        }
        return out;
    }
    
    removeDuplicateStringsFromArray(a) {
        let seen = {};
        let out = [];
        let len = a.length;
        let j = 0;
        for(let i = 0; i < len; i++) {
             let item = a[i];
             if(seen[item] !== 1) {
                   seen[item] = 1;
                   out[j++] = item;
             }
        }
        return out;
    }
}

module.exports = Redditbot;

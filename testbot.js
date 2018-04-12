const Redditbot = require('./redditbot');
const campaigns = [
        { active: true, keywords: ['reddit'] },
        { active: true, keywords: ['iphone', '6s'] }
    ];

// Start reddit bot with predefined campaigns to use it in standalone mode without saving to database
const r = new Redditbot();
r.setCampaigns(campaigns).then(() => {
    r.start();
    
    r._eventEmitter.on('newComment', (comment) => {
        console.log("New comment by", comment.author.name, comment.link_permalink + comment.id);
        console.log(comment.body.length > 150 ? comment.body.substr(0,147)+'...' : comment.body);
        console.log("===");
    })
});
require('dotenv').config()
const   express         = require('express'),
        app             = express(),
        router          = express.Router(),
        cookieParser    = require('cookie-parser'),
        session         = require('express-session'),
        path            = require('path'),
        EventEmitter    = require('events'),
        passport        = require('passport');

let eventEmitter = new EventEmitter();
require('./config/passport')(passport, eventEmitter);
require('./api/api')(router, eventEmitter, passport);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', router);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const port = process.env.PORT || '3000';
app.set('port', port);
app.listen(port, () => {
    console.log(`Running on localhost:${port}`);
    });

if (process.argv.indexOf("bot") > -1) {
    const Redditbot = require('./redditbot');
    let r = new Redditbot();
    r.setCampaigns().then(function (res) {
        r.start();
    });
    
    eventEmitter.on('addCampaign', (c)=> {
        r.addCampaign(c);
    });
    
    eventEmitter.on('removeCampaign', (c)=> {
        r.removeCampaign(c);
    });
    
    eventEmitter.on('updateCampaign', (c)=> {
        r.updateCampaign(c);
    });
}
    
module.exports = app;
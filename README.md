# Reddcat

Reddcat is a web app that allows you to track mentions of your keywords or phrases across the reddit community in real-time.

Live demo: https://reddcat.herokuapp.com

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

- Clone this repository:

```
git clone https://github.com/TomerRon/reddcat
cd reddcat
```

- Install the required node modules:

```
npm install
```

- [Create a reddit application](https://old.reddit.com/prefs/apps/) - it takes 5 seconds, and you will get a client ID and a secret which you will need to fill in the next step.

### Setting it up

Create a file called `.env` in the root folder and set your environment variables:

```
touch .env
```
```
CLIENT_ID=your-reddit-client-id     // get these values from the reddit applications page
CLIENT_SECRET=your-reddit-secret
REDDIT_USER=your-reddit-username    // same user that was used to create the application
REDDIT_PASS=your-reddit-password

# .env file in development:
DB_DEVELOPMENT_USERNAME=your-db-username
DB_DEVELOPMENT_PASSWORD=your-db-password
DB_DEVELOPMENT_DBNAME=your-db-name
DB_DEVELOPMENT_HOST=your-db-host
SESSION_SECRET=your-super-secret

# .env file in production:
DB_PRODUCTION_USERNAME=your-db-username
DB_PRODUCTION_PASSWORD=your-db-password
DB_PRODUCTION_DBNAME=your-db-name
DB_PRODUCTION_HOST=your-db-host
SESSION_SECRET=your-super-secret
```

Make sure you enter correct database information. If you are having trouble, check the `/config/db.js` file.

Finally, run the database migrations:

```
node_modules/.bin/sequelize db:migrate
```

### Running the tests

```
npm test
```

### Running the app

```
npm start
```

#### Using as a standalone web app

This will only run the API and Angular app, without activating the reddit bot

```
node server.js
```

#### Using as a standalone reddit bot

The reddit bot can imported as a standalone module:

```
const Redditbot = require('./redditbot');
const campaigns = [
        { active: true, keywords: ['reddit'] },
        { active: true, keywords: ['iphone', '6s'] }
    ];
const r = new Redditbot();

// Start reddit bot with predefined campaigns to use it in standalone mode without saving to database
r.setCampaigns(campaigns).then(() => {

    r.start();

    r._eventEmitter.on('newComment', (comment) => {
        console.log("New comment by", comment.author.name, comment.link_permalink + comment.id);
        console.log(comment.body.length > 150 ? comment.body.substr(0,147)+'...' : comment.body);
        console.log("===");
    })
});
```

## Built With

* [Node.js](https://nodejs.org)
* [Angular 5](https://angular.io/) + [Angular CLI](https://cli.angular.io/)
* [Express](https://expressjs.com/)
* [Sequelize](https://github.com/sequelize/sequelize) + [Sequelize CLI](https://github.com/sequelize/cli) + PostgreSQL
* [Snoowrap](https://github.com/not-an-aardvark/snoowrap) + [Snoostorm](https://github.com/MayorMonty/Snoostorm)
* [Passport](http://www.passportjs.org/) JWT authentication
* [Mocha](https://mochajs.org/) / [Chai](http://www.chaijs.com/) tests

## File structure

```bash
├── api                 # Reddcat API
├── config              # config files
│   ├── db.js               # database configuration
│   └── passport.js         # passport configuration (authentication)
├── migrations          # database migrations
├── models              # model definitions for Sequelize
├── src                 # Angular app
├── test                # Mocha tests
├── .angular-cli.json
├── .env                # environment variables
├── .sequelizerc
├── LICENSE.md
├── README.md
├── package-lock.json
├── package.json
├── redditbot.js        # reddit bot
├── server.js           # app entry point
├── tsconfig.json
└── tslint.json
```

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details.
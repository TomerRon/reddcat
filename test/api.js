const   chai        = require('chai'),
        expect      = require('chai').expect,
        chaiHttp    = require('chai-http'),
        app         = require('../server'),
        models      = require('../models/index');

chai.use(chaiHttp);

describe('API',  function() {
    
    this.timeout(5000);
    
    let newUser = {username: 'test_'+Math.random().toString(36).substring(7), password: 'password1'};
    let newUserToken;
    
    after(() => {
        models.user.destroy({where: { id: newUser.id } });
    })
        
    describe('users', function() {
        
        it('POST guest creates guest user', ()=> {
            return chai.request(app)
            .post('/api/guest')
            .set('content-type', 'application/x-www-form-urlencoded')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('token');
                expect(res.body).to.have.property('message').eql('ok');
                newUserToken = res.body.token;
            });
        });
        
        it('POST signup with valid params', ()=> {
            return chai.request(app)
            .post('/api/signup')
            .set('content-type', 'application/x-www-form-urlencoded')
            .set('Authorization', newUserToken)
            .send(newUser)
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('token');
                expect(res.body).to.have.property('message').eql('ok');
            });
        });
        
        it('POST login with valid params', ()=> {
            return chai.request(app)
            .post('/api/login')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send(newUser)
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('token');
                expect(res.body).to.have.property('message').eql('ok');
                newUserToken = res.body.token;
            });
        });
        
        it('POST auth JWT with valid params', ()=> {
            return chai.request(app)
            .post('/api/auth')
            .set('Authorization', newUserToken)
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('username');
                newUser.id = res.body.id;
            });
        });
    });
    
    describe('campaigns', function() {
        
        let newCampaign;
        
        it('GET campaigns', function() {
            return chai.request(app)
            .get('/api/campaigns')
            .set('Authorization', newUserToken)
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('array');
            });
        });
        
        it('POST with valid params', ()=> {
            return chai.request(app)
            .post('/api/campaigns')
            .set('Authorization', newUserToken)
            .send({keywords:'amazon,store'})
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.campaign).to.be.an('object');
                expect(res.body.campaign).to.have.property('id');
                expect(res.body.campaign.keywords).to.eql(['amazon', 'store']);
                expect(res.body).to.have.property('message').eql('Campaign added!');
                newCampaign = res.body.campaign;
            });
        });
        
        it('POST with invalid params', ()=> {
            return chai.request(app)
            .post('/api/campaigns')
            .set('Authorization', newUserToken)
            .send({keywords:null})
            .then(
                () => expect.fail(null, null, 'should not succeed.'),
                (res) => {
                    expect(res).to.have.status(400);
                }
            );
        });
        
        it('POST with no auth', ()=> {
            return chai.request(app)
            .post('/api/campaigns')
            .send({keywords:'amazon,store'})
            .then(
                () => expect.fail(null, null, 'should not succeed.'),
                (res) => {
                    expect(res).to.have.status(401);
                }
            );
        });

        it('GET campaign', function() {
            return chai.request(app)
            .get('/api/campaign/'+newCampaign.id)
            .set('Authorization', newUserToken)
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('id');
                expect(res.body).to.have.property('keywords');
                expect(res.body).to.have.property('comments');
                expect(res.body).to.have.property('events');
                expect(res.body.id).to.equal(newCampaign.id);
            });
        });
        
        it('PUT', function() {
            return chai.request(app)
            .put('/api/campaign/'+newCampaign.id)
            .set('Authorization', newUserToken)
            .send({keywords:'spotify'})
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').eql('Campaign updated!');
                expect(res.body.campaign.keywords).to.eql(['spotify']);
            });
        });
        
        it('POST clear to clear campaign comments', function() {
            return chai.request(app)
            .post('/api/campaign/'+newCampaign.id+'/clear')
            .set('Authorization', newUserToken)
            .send({keywords:'spotify'})
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').eql('Campaign cleared!');
                expect(res.body.campaign.keywords).to.eql(['spotify']);
            });
        });
        
        it('DELETE', function() {
            return chai.request(app)
            .delete('/api/campaign/'+newCampaign.id)
            .set('Authorization', newUserToken)
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').eql('Campaign deleted!');
                return chai.request(app)
                .get('/api/campaign/'+newCampaign.id)
                .set('Authorization', newUserToken)
                .then(function(res) {
                    expect(res.body).to.have.property('message').eql('Campaign not found!');
                });
            });
        });
        
    });
});

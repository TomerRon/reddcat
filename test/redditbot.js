const   expect      = require('chai').expect,
        Redditbot   = require('../redditbot');

describe('reddit bot',  function() {
    
    this.timeout(50000);
    let r;
    let camp;
    
    before(() => {
        r = new Redditbot;
    });
    
    it('authenticates with reddit', function() {
        expect(r.stream).to.be.a('object');
        expect(r.campaigns).to.be.an('array').that.is.empty;
        expect(r.keywords).to.be.an('array').that.is.empty;
    });
    
    it('gets campaigns and keywords', function() {
        return r.setCampaigns([ { keywords: ['amazon', 'store'], active: true } , { keywords: ['steam', 'store'], active: true }, { keywords: ['steam'], active: true }, { keywords: ['game'], active: true } ]).then(function (res) {
            expect(r.campaigns).to.be.an('array').that.is.not.empty;
            expect(r.keywords).to.eql([ 'amazon', 'store', 'steam', 'game' ])
        });
    });
    
    it('adds a new campaign', function() {
        camp = { id: 999, keywords: ['kickstarter'], active: true };
        r.addCampaign(camp);
        expect(r.campaigns).to.include(camp);
        expect(r.keywords).to.include('kickstarter');
    });
    
    it('updates a campaign', function() {
        camp.keywords = ['spotify'];
        r.updateCampaign(camp);
        expect(r.campaigns).to.include(camp);
        expect(r.keywords).to.include('spotify');
        expect(r.keywords).to.not.include('kickstarter');
    });
    
    it('removes a campaign', function() {
        r.removeCampaign(camp);
        expect(r.campaigns).to.not.include(camp);
        expect(r.keywords).to.not.include('kickstarter');
        expect(r.keywords).to.not.include('spotify');
    });
    
});

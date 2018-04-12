import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CampaignService {

    _autoRefresh;
    _showWelcomeMsg;
    _campaigns;
    _totalNewComments;

    constructor(private http: HttpClient, private _titleService: Title) {

        this._campaigns = [];
        this._totalNewComments = 0;
        setInterval(() => {
          this.getCampaigns();
        }, 10000);

        if (!this.canUseLocalStorage) {
            this._showWelcomeMsg = true;
            this._autoRefresh = true;
        } else {
            const welcomeMsgSetting = JSON.parse(localStorage.getItem('showWelcomeMsg'));
            if (typeof welcomeMsgSetting === 'boolean') {
                this._showWelcomeMsg = welcomeMsgSetting;
            } else {
                this._showWelcomeMsg = true;
                localStorage.setItem('showWelcomeMsg', 'true');
            }
            const autoRefreshSetting = JSON.parse(localStorage.getItem('autoRefresh'));
            if (typeof autoRefreshSetting === 'boolean') {
                this._autoRefresh = autoRefreshSetting;
            } else {
                this._autoRefresh = true;
                localStorage.setItem('autoRefresh', 'true');
            }
        }
    }

    get campaigns() {
        return this._campaigns;
    }

    set campaigns(camps) {
        this.calcNewComments(camps);
        this._campaigns = camps;
    }

    getCampaigns() {
        this.http.get('/api/campaigns', this.headers)
        .subscribe((res: any) => {
            this.campaigns = res;
        },
        err => {
          if (err.statusText === 'Unauthorized') { localStorage['token'] = ''; }
        });
    }

    getCampaign(id) {
        return this.http.get('/api/campaign/' + id, this.headers);
    }

    createCampaign(keywords) {
        keywords = this.cleanupKeywords(keywords);
        return this.http.post('/api/campaigns', {keywords: keywords}, this.headers);
    }

    updateCampaign(c) {
        return this.http.put('/api/campaign/' + c.id, c, this.headers);
    }

    clearCampaign(c) {
        return this.http.post('/api/campaign/' + c.id + '/clear', c, this.headers);
    }

    deleteCampaign(c) {
        return this.http.delete('/api/campaign/' + c.id, this.headers);
    }

    exportCampaign(c) {
        return this.http.get('/api/campaign/' + c.id + '/export', {responseType: 'text', headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token })});
    }

    get token() {
        return (localStorage.getItem('token') || '');
    }

    get headers() {
        return { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': this.token }) };
    }

    toggleAutoRefresh() {
        this.autoRefresh = !this.autoRefresh;
    }

    toggleShowWelcomeMsg() {
        this.showWelcomeMsg = !this.showWelcomeMsg;
    }

    get autoRefresh() {
        return this._autoRefresh;
    }

    set autoRefresh(autoRefresh: boolean) {
        localStorage.setItem('autoRefresh', '' + autoRefresh);
        this._autoRefresh = autoRefresh;
    }

    get showWelcomeMsg() {
        return this._showWelcomeMsg;
    }

    set showWelcomeMsg(showWelcomeMsg: boolean) {
        localStorage.setItem('showWelcomeMsg', '' + showWelcomeMsg);
        this._showWelcomeMsg = showWelcomeMsg;
    }

    cleanupKeywords(keywords) {
        const re = /[a-zA-Z0-9 ,]/g;
        if (!re.test(keywords)) { return ''; }
        const k = keywords.match(re).join('').split(',').filter(key => key).map(key => key.trim());
        return k.toString().toLowerCase();
    }

    calcNewComments(newCamps) {
        let previousTotal = 0;
        if (this.campaigns) {
            for (let i = 0; i < this.campaigns.length; i++) {
                previousTotal += this.campaigns[i].newCommentsCount;
            }
        }
        let newTotal = 0;
        for (const c of newCamps) {
            newTotal += c.newCommentsCount;
        }
        this._totalNewComments = newTotal > previousTotal ? newTotal - previousTotal : 0;
        const titleStr = newTotal > 0 ? '(' + newTotal + ') ' : '';
        this._titleService.setTitle(titleStr + 'Reddcat');
    }
    canUseLocalStorage() {
        return (localStorage && localStorage.setItem);
    }
}

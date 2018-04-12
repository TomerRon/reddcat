import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Injectable()
export class AuthService {

    _user;

    constructor(private http: HttpClient) {
        this._user = null;
    }

    signUp(f) {
        return this.http.post('/api/signup', f, { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') }) });
    }

    login(f) {
        return this.http.post('/api/login', f, { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) });
    }

    getUser() {
        if (this.isLoggedIn()) {
            return this.http.post('/api/auth', null, { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': localStorage.getItem('token') }) });
        } else {
            return Observable.of(false);
        }
    }

    createGuestUser() {
        if (!this.isLoggedIn()) {
            return this.http.post('/api/guest', null, { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) });
        } else {
            return Observable.of(false);
        }
    }

    logOut() {
        this.user = null;
        localStorage.removeItem('token');
        window.location.reload();
    }

    get user(){
        return this._user;
    }

    set user(u) {
        this._user = u;
    }

    isLoggedIn() {
        return localStorage.getItem('token');
    }
}

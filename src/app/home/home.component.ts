import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationStart, NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CampaignService } from '../campaign.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'rc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  mobileHide;

  @HostListener('window:focus', ['$event'])
  onFocus(event: any): void {
    this._campaignService.getCampaigns();
  }

  constructor(private _authService: AuthService, private _campaignService: CampaignService, private router: Router) {
    this.mobileHide = true;
  }

  ngOnInit() {
    this.router.events.subscribe(
    (event) => {
      if (event instanceof NavigationEnd) {
        if (localStorage.getItem('token')) {
          this.getUser();
        } else {
          this.createGuestUser();
        }
      }
      if (event instanceof NavigationStart) {
        this.mobileHide = true;
        this._campaignService.getCampaigns();
      }
    });
  }

  getUser() {
    this._authService.getUser()
    .subscribe(
      (r) => {
        if (r.hasOwnProperty('username')) {
          this._authService.user = r;
          this._campaignService.getCampaigns();
        }
      },
      (e) => {
        this._authService.user = null;
        localStorage.removeItem('token');
        window.location.reload();
      }
    );
  }

  createGuestUser() {
    this._authService.createGuestUser()
    .subscribe(
      (r: any) => {
        if (r) {
          localStorage['token'] = r.token;
          this.getUser();
        }
      }
    );
  }
}

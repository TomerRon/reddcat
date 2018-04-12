import { AfterViewInit, Component } from '@angular/core';
import { CampaignService } from '../campaign.service';

declare const $: any;

@Component({
  selector: 'rc-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements AfterViewInit {

  constructor(private _campaignService: CampaignService) { }

  ngAfterViewInit() {
    $('.setting').tooltip();
  }

  toggleAutoRefresh() {
    this._campaignService.toggleAutoRefresh();
  }

  toggleShowWelcomeMsg() {
    this._campaignService.toggleShowWelcomeMsg();
  }
}

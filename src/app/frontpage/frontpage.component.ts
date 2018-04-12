import { Component } from '@angular/core';
import { CampaignService } from '../campaign.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'rc-frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.css']
})
export class FrontpageComponent {

  constructor(private _campaignService: CampaignService, private _authService: AuthService) { }

  trunc(str) {
    return str.length > 200 ? str.substr(0, 197) + '...' : str;
  }
}

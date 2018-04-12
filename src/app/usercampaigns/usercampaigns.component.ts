import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CampaignService } from '../campaign.service';

declare const $: any;
declare const tagit: any;

@Component({
  selector: 'rc-usercampaigns',
  templateUrl: './usercampaigns.component.html',
  styleUrls: ['./usercampaigns.component.css']
})
export class UserCampaignsComponent implements OnInit, AfterViewInit {

  createCampaignForm: FormGroup;
  message;

  constructor(private _campaignService: CampaignService, private router: Router, private fb: FormBuilder) { }

  ngOnInit() {
    this.createCampaignForm = this.fb.group({
      keywords: ['', Validators.required],
    });
  }

  ngAfterViewInit() {
    $('#createCampaignInput').tagit({
      allowSpaces: true,
      tagLimit: 3,
      afterTagAdded: (event, ui) => {
        if (ui.tagLabel.length < 3) {
          $('#createCampaignInput').tagit('removeTagByLabel', ui.tagLabel);
        }
      }
    });
  }

  createCampaign() {
    const keywords = $('#createCampaignInput').tagit('assignedTags').toString();
    this._campaignService.createCampaign(keywords)
    .subscribe(
    (res: any) => {
      if (res.campaign) {
        $('#createCampaignInput').tagit('removeAll');
        this.createCampaignForm = this.fb.group({
          keywords: ['', Validators.required],
        });
        return this.router.navigate(['campaign/' + res.campaign.id]);
      }
      if (res.message) {
        this.message = res.message;
      }
    },
    (err) => {
      this.router.navigate(['/']);
    });
  }

  isValidForm() {
    return (
      ($('#createCampaignForm .tagit-new input').length && $('#createCampaignForm .tagit-new input').val().length > 2)
      ||
      $('#createCampaignForm .tagit-choice').length
    );
  }
}

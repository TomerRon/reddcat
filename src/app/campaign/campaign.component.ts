import { AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CampaignService } from '../campaign.service';

declare const $: any;
declare const tagit: any;

@Component({
  selector: 'rc-campaign',
  templateUrl: './campaign.component.html',
  styleUrls: ['./campaign.component.css']
})
export class CampaignComponent implements AfterViewInit, OnDestroy, OnInit {

  campaign;
  id;
  campaignForm: FormGroup;
  formInitialized;
  activatedRouteSubscription;
  routerSubscription;
  timerInterval;

  @HostListener('window:focus', ['$event'])
  onFocus(event: any): void {
    this.getCampaign();
  }

  constructor(private _campaignService: CampaignService, private route: ActivatedRoute, private fb: FormBuilder, private router: Router) {
    this.timerInterval = setInterval(() => {
      if (this._campaignService.autoRefresh) {
        this.getCampaign();
      }
    }, 2000);
  }

  ngOnInit() {
    this.campaignForm = this.fb.group({
      keywords: ['', Validators.required],
    });
    if (this.activatedRouteSubscription) { this.activatedRouteSubscription.unsubscribe(); }
    if (this.routerSubscription) { this.routerSubscription.unsubscribe(); }
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart && this.campaign) {
        const comments = this.campaign.comments.sort((a, b) => a.id - b.id ); // Sort by ID
        if (comments.length) {
          const lastCommentId = comments[comments.length - 1].id;
          if (lastCommentId !== this.campaign.lastSeenCommentId) {
            this.updateCampaign({ id: this.campaign.id, lastSeenCommentId: lastCommentId });
          }
        }
      }
    });
    this.activatedRouteSubscription = this.route.params.subscribe(params => {
      this.formInitialized = false;
      if (params['id']) {
        this.id = params['id'];
      }
      this.getCampaign();
    });
  }

  ngAfterViewInit() {
    $('[data-toggle="tooltip"]').tooltip();
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }

  getCampaign() {
    if (this.id) {
      this._campaignService.getCampaign(this.id)
      .subscribe((res: any) => {
        if (!res.id) { return this.router.navigate(['/']); }
        this.campaign = res;
        if (!this.formInitialized) {
          const that = this;
          $(document).ready(function() {
            that.createForm();
          });
        }
      }, (err) => {
        this.router.navigate(['/']);
      });
    }
  }

  updateCampaign(c) {
    this._campaignService.updateCampaign(c)
    .subscribe((res: any) => {
      this.getCampaign();
    });
  }

  clearCampaign() {
    this._campaignService.clearCampaign(this.campaign)
    .subscribe((res: any) => {
      this.getCampaign();
    });
  }

  deleteCampaign() {
    this._campaignService.deleteCampaign(this.campaign)
    .subscribe((res: any) => {
      this.campaign = null;
      this.router.navigate(['/']);
    });
  }

  toggleCampaign() {
    this.updateCampaign({ id: this.campaign.id, active: !this.campaign.active});
  }

  exportCampaign() {
    const popup = window.open('', '_blank');
    this._campaignService.exportCampaign(this.campaign)
    .subscribe((res: any) => {
      const blob = new Blob([res], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = $('<a style="display: none;"/>');
      const filename = 'Reddcat-' + Date.now() + '-' + this.campaign.keywords.join('-') + '.csv';
      a.attr('href', url);
      a.attr('download', filename);
      $('body').append(a);
      a[0].click();
      window.URL.revokeObjectURL(url);
      a.remove();
    });
  }

  createForm() {
    const camp = this.campaign;
    $('#changeKeywordsInput').tagit({
      allowSpaces: true,
      tagLimit: 3,
      afterTagAdded: (event, ui) => {
        if (ui.tagLabel.length < 3) {
          $('#changeKeywordsInput').tagit('removeTagByLabel', ui.tagLabel);
        }
      }
    });
    $('#changeKeywordsInput').tagit('removeAll');
    for (const k of camp.keywords) {
      $('#changeKeywordsInput').tagit('createTag', k);
    }
    this.formInitialized = true;
  }

  submitForm() {
    const keywords = this._campaignService.cleanupKeywords($('#changeKeywordsInput').tagit('assignedTags').toString());
    if (this.campaign.keywords != keywords) {
      const formElem = document.activeElement as HTMLElement;
      formElem.blur();
      this.updateCampaign({ id: this.campaign.id, keywords: keywords });
    }
  }

  isValidForm() {
    return (
      ($('#campaignForm .tagit-new input').length && $('#campaignForm .tagit-new input').val().length > 2)
      ||
      $('#campaignForm .tagit-choice').length
    );
  }

  getCommentsAndEvents() {
    let result = [];
    if (this.campaign.events) {
      result = result.concat(this.campaign.events);
    }
    if (this.campaign.comments) {
      result = result.concat(this.campaign.comments);
    }
    return result;
  }
}

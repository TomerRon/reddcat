import { NgModule } from '@angular/core';

import { BrowserModule, Title } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgPipesModule } from 'ngx-pipes';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CampaignComponent } from './campaign/campaign.component';
import { CommentComponent } from './comment/comment.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { UserCampaignsComponent } from './usercampaigns/usercampaigns.component';
import { FrontpageComponent } from './frontpage/frontpage.component';
import { SettingsComponent } from './settings/settings.component';

import { CampaignService } from './campaign.service';
import { AuthService } from './auth.service';

const appRoutes: Routes = [
  { path: 'campaign/:id',      component: CampaignComponent },
  { path: 'signup',      component: SignupComponent },
  { path: 'login',      component: LoginComponent },
  { path: '', component: FrontpageComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    CampaignComponent,
    CommentComponent,
    HomeComponent,
    SignupComponent,
    LoginComponent,
    UserCampaignsComponent,
    FrontpageComponent,
    SettingsComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgPipesModule,
    RouterModule.forRoot(appRoutes),
    ReactiveFormsModule
  ],
  providers: [CampaignService, AuthService, Title],
  bootstrap: [AppComponent]
})
export class AppModule { }

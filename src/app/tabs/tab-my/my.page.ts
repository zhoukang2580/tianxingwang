import { AppHelper } from 'src/app/appHelper';
import { Component, OnInit } from '@angular/core';

import { OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { IdentityEntity } from 'src/app/services/identity/identity.entity';

@Component({
  selector: 'app-my',
  templateUrl: 'my.page.html',
  styleUrls: ['my.page.scss']
})
export class MyPage implements OnDestroy, OnInit {
  identity: IdentityEntity;
  constructor(
    private router: Router, private identityService: IdentityService) {

  }
  onSettings() {
    this.router.navigate([AppHelper.getRoutePath("account-setting")]);
  }
  ngOnInit() {
    setTimeout(async () => {
      this.identity = await this.identityService.getIdentity();
    }, 0);
  }
  ngOnDestroy() {
  }
  goToMyDetail(){
    this.router.navigate([AppHelper.getRoutePath("/tabs/my/my-detail")]);
  }
}

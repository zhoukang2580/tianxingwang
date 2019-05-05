import { AppHelper } from 'src/app/appHelper';
import { Component } from '@angular/core';

import { OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-me',
  templateUrl: 'my.page.html',
  styleUrls: ['my.page.scss']
})
export class MyPage implements OnDestroy {

  constructor(
    private router: Router) {

  }
  onSettings() {
    this.router.navigate([AppHelper.getRoutePath("account-setting")]);
  }

  ngOnDestroy() {
  }
}

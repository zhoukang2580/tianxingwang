import { AppHelper } from 'src/app/appHelper';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-authorize',
  templateUrl: './no-authorize.page.html',
  styleUrls: ['./no-authorize.page.scss'],
})
export class NoAuthorizePage implements OnInit {
  isApp = AppHelper.isApp();
  constructor(private router: Router) { }
  login() {
    this.router.navigate(['login']);
  }
  exitApp() {
    if (navigator["app"] && navigator["app"].exitApp) { navigator["app"].exitApp(); }
  }
  ngOnInit() {
  }

}

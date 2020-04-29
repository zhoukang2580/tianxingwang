import { Component, OnInit } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { Router } from '@angular/router';

@Component({
  selector: 'app-business-list',
  templateUrl: './business-list.page.html',
  styleUrls: ['./business-list.page.scss'],
})
export class BusinessListPage implements OnInit {

  constructor(private router: Router,) { }

  ngOnInit() {
  }
  goAddApply(){
    this.router.navigate([AppHelper.getRoutePath("add-apply")]);
  }
}

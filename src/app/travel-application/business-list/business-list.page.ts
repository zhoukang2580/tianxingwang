import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { Router } from '@angular/router';
import { TravelService, SearchModel } from '../travel.service';
import { Subscription } from 'rxjs';
import { TravelFormEntity } from 'src/app/tmc/tmc.service';

@Component({
  selector: 'app-business-list',
  templateUrl: './business-list.page.html',
  styleUrls: ['./business-list.page.scss'],
})
export class BusinessListPage implements OnInit,OnDestroy {
  private subscription=Subscription.EMPTY;
  items: TravelFormEntity[];
  searchModel: SearchModel;
  constructor(private router: Router, private service: TravelService) { }

  ngOnInit() {
    this.searchModel={} as any;
    this.searchModel.PageIndex=0;
    this.searchModel.PageSize=20;
    this.gettravel()
  }
  ngOnDestroy(){
    this.subscription.unsubscribe()
  }
  goAddApply() {
    this.router.navigate([AppHelper.getRoutePath("add-apply")]);
  }
  gettravel() {
  this.subscription=  this.service.getlist(this.searchModel).subscribe(r => {
      this.items = r && r.Data.TravelForms|| []
    })
  }
  doRefresh() {

  }
}

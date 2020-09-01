import { async } from '@angular/core/testing';
import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { TravelService, SearchModel, ApprovalStatusType } from '../travel.service';
import { AppHelper } from 'src/app/appHelper';

@Component({
  selector: 'app-travel-apply-detail',
  templateUrl: './travel-apply-detail.page.html',
  styleUrls: ['./travel-apply-detail.page.scss'],
})
export class TravelApplyDetailPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  detail: SearchModel;
  router: any;
  // tslint:disable-next-line: ban-types
  isflag: Boolean = true;
  ApprovalStatusType = ApprovalStatusType;
  istime:Boolean = true;
  constructor(private route: ActivatedRoute, private service: TravelService,) { }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.subscription = this.route.queryParamMap.subscribe((q) => {
      if (q.get("id")) {
        this.getDetail(q.get('id'))
      }
    });
  }
  private replaceTime(datetime: string) {
    if (datetime) {
      return datetime.substr(0, 10).replace(/-/g, '.').replace(/:/g, ".");
    }
    return "";
  }
  private initTrips() {
    if (this.detail && this.detail.TravelForm && this.detail.TravelForm.Trips) {
      this.detail.TravelForm.Trips.forEach(trip => {
        trip.StartDate = this.replaceTime(trip.StartDate);
        trip.EndDate = this.replaceTime(trip.EndDate);
        if (trip.FromCityName) {
          trip.FromCityName = trip.FromCityName.replace(/,/g, '·');
        }
        if (trip.ToCityName) {
          trip.ToCityName = trip.ToCityName.replace(/,/g, '·');
        }
        if (trip.TravelTool) {
          const tools = trip.TravelTool.split(",");// ['Flight']
          trip['hasFlight'] = tools.some(it => it.toLowerCase() == 'flight');
          trip['hasHotel'] = tools.some(it => it.toLowerCase() == 'hotel');
          trip['hasTrain'] = tools.some(it => it.toLowerCase() == 'train');
        }
      });
    }
  }
  private initTime() {
    if (this.detail && this.detail.TravelForm) {
      const date = this.detail.TravelForm.ApplyTime.substr(0, 10).replace(/-/g, '.');
      const time = this.detail.TravelForm.ApplyTime.substr(10, 6).replace(/T/g,' ');// 2020-09-10T12:40:34
      const appdate = this.detail.TravelForm.ApprovalTime.substr(0, 10).replace(/-/g, '.');
      const sub = this.detail.TravelForm.ApprovalTime.substr(0,2);
      this.detail.TravelForm.applyTimeDate = date;
      this.detail.TravelForm.applyTimeTime = time;
      this.detail.TravelForm.approvalTimeDate = appdate || sub;

      if(sub == '18' || sub == '00'){
        this.istime = false;
      }
     // this.detail.TravelForm.applyTimeTime = times;
      // tslint:disable-next-line: triple-equals
      // if (times == "18" || times == "00") {
      //   this.getoutTime = false;
      // }
    }

    // const times = this.detail.TravelForm.applyTimeTime;
    // console.log('123123123123'+ times);
    // const timers = times.substring(0, 2);
    // // tslint:disable-next-line: triple-equals
    // if (timers == "18" || timers == "00") {
    //   this.getoutTime = false;
    // }
  }

  private async getDetail(id: string) {
    
    this.detail = await this.service.getTravelDetail(id).catch(() => null);
    this.initTrips();
    this.initTime();
  }
  onToggle(trip: any) {
    trip.isHideButtons = !trip.isHideButtons;
  }

  async inRefuse() {
  }


  async onAdopt() {
    console.log('通过');
    await this.service.travelSubmit(this.detail);
    this.router.navigate([AppHelper.getRoutePath("business-list")], {
      queryParams: { doRefresh: true },
    });
  }

    
}

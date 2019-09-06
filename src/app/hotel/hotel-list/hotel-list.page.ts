import { HotelEntity } from "./../models/HotelEntity";
import { HotelResultEntity } from "./../models/HotelResultEntity";
import { HotelQueryComponent } from "./../components/hotel-query/hotel-query.component";
import { HotelQueryEntity } from "./../models/HotelQueryEntity";
import { Router } from "@angular/router";
import { HotelService } from "./../hotel.service";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  HostBinding,
  ViewChildren,
  QueryList,
  AfterViewInit
} from "@angular/core";
import {
  NavController,
  IonContent,
  IonHeader,
  IonSearchbar,
  IonRefresher
} from "@ionic/angular";
import { Subscription } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";
import { QueryTabComponent } from "../components/hotel-query/query-tab/query-tab.component";

@Component({
  selector: "app-hotel-list",
  templateUrl: "./hotel-list.page.html",
  styleUrls: ["./hotel-list.page.scss"]
})
export class HotelListPage implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[] = [];
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(HotelQueryComponent) queryComp: HotelQueryComponent;
  @ViewChildren(IonSearchbar) searchbarEls: QueryList<IonSearchbar>;
  @HostBinding("class.show-search-bar")
  isShowSearchBar = false;
  hotelQueryModal: HotelQueryEntity = new HotelQueryEntity();
  hotels: HotelEntity[];
  vmKeyowrds = "";
  loadDataSub = Subscription.EMPTY;
  constructor(
    private navCtrl: NavController,
    private hotelService: HotelService,
    private router: Router
  ) {}
  onSearchItemClick() {
    this.isShowSearchBar = false;
  }
  ngAfterViewInit() {
    this.autofocusSearchBarInput();
  }
  private autofocusSearchBarInput() {
    if (this.searchbarEls) {
      const sub = this.searchbarEls.changes.subscribe(_ => {
        if (this.searchbarEls.first) {
          this.searchbarEls.first.getInputElement().then(input => {
            if (input) {
              input.focus();
            }
          });
        }
      });
      this.subscriptions.push(sub);
    }
  }
  onHotelQueryChange(query: HotelQueryEntity) {
    this.hotelQueryModal = { ...query };
    this.doRefresh();
  }
  doRefresh() {
    if (this.refresher) {
      this.refresher.complete();
    }
    if (this.queryComp) {
      this.queryComp.onReset();
    }
    this.hotelQueryModal.PageIndex = 0;
    this.hotelQueryModal.PageSize = 20;
    this.loadMore();
  }
  loadMore() {
    if (this.loadDataSub) {
      this.loadDataSub.unsubscribe();
    }
    this.loadDataSub = this.hotelService
      .getHotelList(this.hotelQueryModal)
      .subscribe(
        result => {
          if (result && result.Data) {
          }
        },
        e => {}
      );
  }
  onDateClick() {
    this.hotelService.openCalendar();
  }
  onCityClick() {
    this.router.navigate([AppHelper.getRoutePath("hotel-city")]);
  }
  onSearchClick() {
    this.isShowSearchBar = true;
  }
  back() {
    this.navCtrl.back();
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
    this.subscriptions = null;
  }
  ngOnInit() {
    const sub = this.hotelService.getSearchHotelModelSource().subscribe(m => {
      console.log(m);
      if (m) {
        this.hotelQueryModal.CityCode =
          m.destinationCity && m.destinationCity.Code;
        this.hotelQueryModal.CityName =
          m.destinationCity && m.destinationCity.Name;
        this.hotelQueryModal.BeginDate = m.checkInDate;
        this.hotelQueryModal.EndDate = m.checkOutDate;
        this.hotelQueryModal.City = m.destinationCity;
      }
    });
    this.subscriptions.push(sub);
  }
}

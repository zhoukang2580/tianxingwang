import { HotelEntity } from "./../models/HotelEntity";
import { HotelResultEntity } from "./../models/HotelResultEntity";
import { HotelQueryComponent } from "./../components/hotel-query/hotel-query.component";
import { HotelQueryEntity } from "./../models/HotelQueryEntity";
import { Router } from "@angular/router";
import { HotelService, SearchHotelModel } from "./../hotel.service";
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
  IonRefresher,
  IonInfiniteScroll
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
import { HotelDayPriceEntity } from "../models/HotelDayPriceEntity";
import { finalize } from "rxjs/operators";

@Component({
  selector: "app-hotel-list",
  templateUrl: "./hotel-list.page.html",
  styleUrls: ["./hotel-list.page.scss"]
})
export class HotelListPage implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[] = [];
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(HotelQueryComponent) queryComp: HotelQueryComponent;
  @ViewChildren(IonSearchbar) searchbarEls: QueryList<IonSearchbar>;
  @HostBinding("class.show-search-bar")
  isShowSearchBar = false;
  isLoading = false;
  searchHotelModel: SearchHotelModel;
  hotelQueryModal: HotelQueryEntity = new HotelQueryEntity();
  hotelDayPrices: HotelDayPriceEntity[] = [];
  vmKeyowrds = "";
  loadDataSub = Subscription.EMPTY;
  constructor(
    private navCtrl: NavController,
    private hotelService: HotelService,
    private router: Router
  ) { }
  onSearchItemClick() {
    this.isShowSearchBar = false;
  }
  ngAfterViewInit() {
    this.autofocusSearchBarInput();
  }
  getStars(hotel: HotelEntity) {
    if (hotel && hotel.Category) {
      hotel.Category = `${hotel.Category}`;
      if (+hotel.Category >= 5) {
        return new Array(5).fill(1);
      }
      if (hotel.Category.includes('.')) {
        const a = hotel.Category.split('.');
        return new Array(+a[0]).fill(1).concat([0.5]);
      }
      return new Array(+hotel.Category).fill(1);
    }
    return [];
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
    this.hotelQueryModal = {
      ...query
    };
    this.doRefresh(true);
  }
  doRefresh(isKeepQueryCondition = false) {
    if (this.refresher) {
      this.refresher.complete();
    }
    if (this.queryComp) {
      this.queryComp.onReset();
    }
    if (!isKeepQueryCondition) {
      this.hotelQueryModal = new HotelQueryEntity();
    }
    this.hotelQueryModal.PageIndex = 0;
    this.hotelQueryModal.PageSize = 20;
    this.hotelDayPrices = [];
    this.loadMore();
  }
  loadMore() {
    if (this.loadDataSub) {
      this.loadDataSub.unsubscribe();
    }
    this.isLoading = this.hotelQueryModal && this.hotelQueryModal.PageIndex == 0;
    this.loadDataSub = this.hotelService
      .getHotelList(this.hotelQueryModal)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          setTimeout(() => {
            if (this.scroller) {
              this.scroller.complete();
            }
          }, 10);
        })
      )
      .subscribe(
        result => {
          if (result && result.Data && result.Data.HotelDayPrices) {
            const arr = result.Data.HotelDayPrices;
            if (this.scroller) {
              this.scroller.disabled = arr.length == 0;
            }
            if (arr.length) {
              this.hotelQueryModal.PageIndex++;
              this.hotelDayPrices = [...this.hotelDayPrices, ...arr];
            }
            console.log("this.scroller.disabled",this.scroller.disabled)
          }
        },
        e => {
          console.error(e);
        }
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
        this.searchHotelModel = m;
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
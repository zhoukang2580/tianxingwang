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
  IonSearchbar
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

@Component({
  selector: "app-hotel-list",
  templateUrl: "./hotel-list.page.html",
  styleUrls: ["./hotel-list.page.scss"]
})
export class HotelListPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(IonContent) content: IonContent;
  @ViewChildren(IonSearchbar) searchbarEls: QueryList<IonSearchbar>;
  private subscriptions: Subscription[] = [];
  @HostBinding("class.show-search-bar")
  isShowSearchBar = false;
  hotelQueryModal: HotelQueryEntity = new HotelQueryEntity();
  searchItems: any[];
  vmKeyowrds="";
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

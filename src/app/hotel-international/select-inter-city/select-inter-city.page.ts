import { BackButtonComponent } from "./../../components/back-button/back-button.component";
import { Subscription, of } from "rxjs";
import {
  InternationalHotelService,
  ISearchTextValue
} from "./../international-hotel.service";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef
} from "@angular/core";
import {
  debounceTime,
  take,
  tap,
  distinctUntilChanged,
  finalize
} from "rxjs/operators";
import {
  IonSearchbar,
  IonContent,
  IonTabBar,
  Platform,
  IonInfiniteScroll,
  NavController
} from "@ionic/angular";
import { flyInOut } from "src/app/animations/flyInOut";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { trigger, transition, style, animate } from "@angular/animations";
import { DestinationAreaType } from "src/app/tmc/models/DestinationAreaType";
import { AppHelper } from "src/app/appHelper";
import { RefresherComponent } from "src/app/components/refresher";
interface ITab {
  active?: boolean;
  name: "非洲" | "欧洲" | "南美洲" | "北美洲" | "大洋洲" | "亚洲";
  id: string;
  areaTypes: DestinationAreaType[];
  enName:
    | "Africa"
    | "Europe"
    | "SouthAmerica"
    | "NorthAmerica"
    | "Oceanica"
    | "Asia";
}
@Component({
  selector: "app-select-inter-city",
  templateUrl: "./select-inter-city.page.html",
  styleUrls: ["./select-inter-city.page.scss"],
  animations: [
    flyInOut,
    trigger("showfab", [
      transition(":enter", [
        style({ opacity: 0, transform: "translateX(100%) scale(0.1)" }),
        animate(
          "200ms ease-in-out",
          style({ opacity: 1, transform: "translateX(0) scale(1)" })
        )
      ]),
      transition(":leave", [
        animate(
          "200ms 100ms ease-in-out",
          style({ opacity: 0, transform: "translateX(100%) scale(0.1)" })
        )
      ])
    ])
  ]
})
export class SelectInterCityPage implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[] = [];
  private searchCitySubscription = Subscription.EMPTY;
  private pageIndex = 0;
  private pageSize = 20;
  selectedCity: ISearchTextValue;
  tabs: ITab[];
  tab: ITab;
  searchCityKeyWords = "";
  searchResults: ISearchTextValue[];
  @ViewChildren("continentTab") continentTabs: QueryList<
    ElementRef<HTMLElement>
  >;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  isLoading = false;
  constructor(
    private hotelService: InternationalHotelService,
    private plt: Platform
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  onActiveTab(tab: ITab) {
    if (this.tabs) {
      this.tabs = this.tabs.map(it => {
        it.active = it == tab;
        return it;
      });
    }
    this.tab = tab;
    if (this.continentTabs && this.continentTabs.length) {
      const el = this.continentTabs.find(
        it => it.nativeElement.getAttribute("dataid") == tab.id
      );
      this.scrollTabToCenter(el && el.nativeElement);
    }
    this.goToTop();
    this.onSearch();
  }
  onCitySelected(city: any) {
    console.log("选择的城市", city);
    this.selectedCity = city;
    if (this.selectedCity) {
      this.hotelService.setSearchConditionSource({
        ...this.hotelService.getSearchCondition(),
        destinationCity: {
          Code: this.selectedCity.Value,
          Name: this.selectedCity.Text,
          CityName: this.selectedCity.Text,
          Id: this.selectedCity.Id,
          Country: {
            Id: this.selectedCity.CountryId,
            CountryName: this.selectedCity.CountryName,
            EnglishName: this.selectedCity.CountryEnName,
            Code: this.selectedCity.CountryCode
          }
        } as TrafficlineEntity
      });
    }
    setTimeout(() => {
      this.back();
    }, 200);
  }
  back() {
    this.backBtn.popToPrePage();
  }
  private onSearch() {
    this.pageIndex = 0;
    this.searchResults = [];
    this.loadMoreData();
  }
  async loadMoreData() {
    this.isLoading = this.pageIndex <= 0;
    this.searchCitySubscription = this.hotelService
      .searchHotelCity({
        name: this.searchCityKeyWords,
        areaTypes: this.tab ? this.tab.areaTypes || [] : [],
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      })
      .pipe(
        finalize(() => {
          if (this.pageIndex <= 1) {
            this.refresher.complete();
          }
          this.isLoading = false;
        })
      )
      .subscribe(res => {
        const searchResults = (res && res.Data) || [];
        this.scroller.disabled = searchResults.length < this.pageSize;
        if (searchResults.length) {
          this.pageIndex++;
        }
        this.scroller.complete();
        this.searchResults = this.searchResults.concat(searchResults);
      });
  }
  ngOnInit() {
    this.initTabs();
    // if (this.hotelService.getSearchCondition().destinationCity) {
    //   this.searchCityKeyWords = this.hotelService.getSearchCondition().destinationCity.Name;
    // }
    this.pageIndex = 0;
    this.searchResults = [];
    this.loadMoreData();
  }
  private goToTop() {
    if (this.content) {
      requestAnimationFrame(async () => {
        const ele = await this.content.getScrollElement();
        if (ele && ele.scrollTop > 0) {
          this.content.scrollToTop(100);
        }
      });
    }
  }
  private scrollTabToCenter(ele: HTMLElement) {
    if (ele) {
      const container = ele.parentElement;
      const half = this.plt.width() / 2;
      const rect = ele.getBoundingClientRect();
      if (rect) {
        container.scrollBy({ left: rect.left - half, behavior: "smooth" });
      }
    }
  }
  doRefresh() {
    this.searchResults = [];
    this.pageIndex = 0;
    this.searchCityKeyWords = "";
    this.resetTabActive();
    this.loadMoreData();
  }
  private resetTabActive() {
    this.tabs = this.tabs.map(it => {
      it.active = false;
      return it;
    });
    this.tab = this.tabs.find(it => it.active);
  }
  onSearchCities() {
    this.searchCitySubscription.unsubscribe();
    this.pageIndex = 0;
    this.searchResults = [];
    this.loadMoreData();
    this.goToTop();
  }
  ngAfterViewInit() {}

  private initTabs() {
    this.tabs = [];
    this.tabs.push({
      name: "亚洲",
      areaTypes: [
        DestinationAreaType.EastAsia,
        DestinationAreaType.MiddleAsia,
        DestinationAreaType.SoutheastAsia,
        DestinationAreaType.WestAsia,
        DestinationAreaType.HongKongMacaoTaiwan
      ],
      enName: "Asia",
      id: AppHelper.uuid()
    });
    this.tabs.push({
      name: "南美洲",
      areaTypes: [DestinationAreaType.SouthAmerica],
      enName: "SouthAmerica",
      id: AppHelper.uuid()
    });
    this.tabs.push({
      name: "北美洲",
      areaTypes: [DestinationAreaType.NorthAmerica],
      enName: "NorthAmerica",
      id: AppHelper.uuid()
    });
    this.tabs.push({
      name: "非洲",
      areaTypes: [DestinationAreaType.Africa],
      enName: "Africa",
      id: AppHelper.uuid()
    });
    this.tabs.push({
      name: "欧洲",
      areaTypes: [DestinationAreaType.Europe],
      enName: "Europe",
      id: AppHelper.uuid()
    });

    this.tabs.push({
      name: "大洋洲",
      areaTypes: [DestinationAreaType.Oceanica],
      enName: "Oceanica",
      id: AppHelper.uuid()
    });
  }
}

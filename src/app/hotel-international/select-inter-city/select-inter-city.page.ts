import { BackButtonComponent } from "./../../components/back-button/back-button.component";
import { Subscription, of } from "rxjs";
import { InternationalHotelService } from "./../international-hotel.service";
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
import { debounceTime, take, tap, distinctUntilChanged } from "rxjs/operators";
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
import { CountryEntity } from "src/app/tmc/models/CountryEntity";
import { trigger, transition, style, animate } from "@angular/animations";
type ITab = {
  active?: boolean;
  name: string;
  id: string;
  enName: string;
  trafficlines: TrafficlineEntity[];
};
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
  private trafficlines: TrafficlineEntity[];
  private pageSize = 25;
  private isFirstInit = false;
  searchCities: TrafficlineEntity[];
  searchContinents: any[];
  selectedCity: any;
  tabs: ITab[];
  tab: ITab;
  searchCityKeyWords = "";
  searchCountrykeywords = "";
  @ViewChildren("searchCountryEle") searchCountryEles: QueryList<IonSearchbar>;
  @ViewChildren("continentTab") continentTabs: QueryList<
    ElementRef<HTMLElement>
  >;
  @ViewChild("searchcity") searchcityEle: IonSearchbar;
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  isLoadingContinents = false;
  constructor(
    private internationalHotelService: InternationalHotelService,
    private plt: Platform,
    private navCtrl: NavController
  ) {}

  ngOnDestroy() {
    this.isFirstInit = true;
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
    this.searchCities = [];
    this.onGoToTop();
    this.loadMoreData();
  }
  onCitySelected(city: any) {
    console.log("选择的城市", city);
    this.selectedCity = city;
    if (this.selectedCity) {
      this.internationalHotelService.setSearchConditionSource({
        ...this.internationalHotelService.getSearchCondition(),
        destinationCity: this.selectedCity
      });
    }
    setTimeout(() => {
      this.back();
    }, 200);
  }
  private enableScroller(enabled = true) {
    if (this.scroller) {
      this.scroller.disabled = enabled;
    }
  }
  back() {
    this.backBtn.backToPrePage();
  }

  private filterCities(cities: TrafficlineEntity[], name: string = "") {
    cities = cities || [];
    const keys = [
      "Name",
      "CityName",
      "EnglishName",
      "CityEnglishName",
      // "PinYin",
      "Nickname"
    ];
    name = (name || "").trim().toLowerCase();
    let tempCities = cities;
    if (name) {
      tempCities = [];
      tempCities = cities.filter(c => {
        return keys.some(key => {
          const value: string = (c[key] || "").trim().toLowerCase();
          const ok =
            value &&
            (value == name || value.includes(name) || name.includes(value));
          return ok;
        });
      });
    }
    console.log(name, tempCities);
    let result = tempCities.slice(
      this.searchCities.length,
      this.searchCities.length + this.pageSize
    );
    return result;
  }
  async loadMoreData() {
    let arr: any[];
    const tab = this.tabs && this.tabs.find(it => it.active);
    if (tab) {
      arr = this.filterCities(tab.trafficlines, this.searchCityKeyWords);
    } else {
      arr = this.filterCities(this.trafficlines, this.searchCityKeyWords);
    }
    if (this.scroller) {
      this.scroller.complete();
    }
    if (arr && arr.length) {
      this.searchCities = this.searchCities.concat(arr);
    }
    this.enableScroller(arr.length > this.pageSize);
  }
  ngOnInit() {
    this.searchCities = [];
    setTimeout(
      async () => {
        await this.getTrafficlines();
        this.isFirstInit = true;
        this.loadMoreData();
      },
      !this.isFirstInit ? 500 : 0
    );
  }
  onGoToTop() {
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
  onSearchCities() {
    if (this.tabs) {
      this.tabs = this.tabs.map(it => {
        it.active = false;
        return it;
      });
    }
    this.searchCitySubscription.unsubscribe();
    this.searchCitySubscription = of(this.searchCityKeyWords)
      .pipe(distinctUntilChanged(), debounceTime(300))
      .subscribe(_ => {
        console.log("searchcity", _);
        this.searchCities = [];
        this.loadMoreData();
        this.onGoToTop();
      });
  }
  ngAfterViewInit() {
    const sub = this.searchCountryEles.changes.subscribe(_ => {
      if (this.searchCountryEles.last) {
        setTimeout(() => {
          this.searchCountryEles.last.setFocus();
        }, 0);
      }
    });
    this.subscriptions.push(sub);
    if (this.searchcityEle) {
      const sub1 = this.searchcityEle.ionFocus.subscribe(_ => {
        if (!this.trafficlines || !this.trafficlines.length) {
          setTimeout(
            () => {
              this.getTrafficlines();
            },
            !this.isFirstInit ? 500 : 0
          );
        }
      });
      this.subscriptions.push(sub1);
    }
  }

  private initTabs() {
    this.tabs = [];
    if (this.trafficlines) {
      this.trafficlines.forEach(t => {
        const desttype = t.DestinationAreaType;
        const desttypename = t.DestinationAreaTypeName;
        let tab = this.tabs.find(it => it.name == desttypename);
        if (tab) {
          tab.trafficlines.push(t);
        } else {
          tab = {} as any;
          tab.id = t.DestinationAreaType;
          tab.enName = t.DestinationAreaType;
          tab.name = t.DestinationAreaTypeName;
          tab.trafficlines = [t];
          this.tabs.push(tab);
        }
      });
    }
  }
  private async getTrafficlines() {
    this.isLoadingContinents = true;
    this.trafficlines = await this.internationalHotelService
      .getTrafficlinesAsync()
      .catch(_ => []);
    this.isLoadingContinents = false;
    this.initTabs();
  }
}

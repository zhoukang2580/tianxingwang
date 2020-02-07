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
  private countries: any[];
  private subscriptions: Subscription[] = [];
  private searchCountrySubscription = Subscription.EMPTY;
  private searchCitySubscription = Subscription.EMPTY;
  private trafficlines: TrafficlineEntity[];
  private pageSize = 25;
  private isFirstInit = false;
  searchCountries: any[];
  searchCities: any[];
  searchContinents: any[];
  tabs: ITab[];
  tab: ITab;
  searchCityKeyWords = "";
  searchCountrykeywords = "";
  @ViewChildren("searchCountryEle") searchCountryEles: QueryList<IonSearchbar>;
  @ViewChildren("continentTab") continentTabs: QueryList<
    ElementRef<HTMLElement>
  >;
  @ViewChild("searchcity", { static: false }) searchcityEle: IonSearchbar;
  @ViewChild(IonContent, { static: false }) content: IonContent;
  @ViewChild(IonInfiniteScroll, { static: false }) scroller: IonInfiniteScroll;
  selectedCountry: any;
  selectedCity: any;
  isSearchingCountry = false;
  isLoadingCountries = false;
  isLoadingContinents = false;
  constructor(
    private internationalHotelService: InternationalHotelService,
    private plt: Platform,
    private navCtrl: NavController
  ) {}
  async onToggleSearchingCountry() {
    if (!this.countries || this.countries.length) {
      await this.getCountries();
    }
    this.isSearchingCountry = !this.isSearchingCountry;
  }
  ngOnDestroy() {
    this.isFirstInit = true;
    this.searchCountrySubscription.unsubscribe();
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
    // this.totalCities = this.totalCities.map(it => {
    //   it.selected = it == city;
    //   return it;
    // });
    if (this.selectedCountry) {
      this.selectedCity = city;
      setTimeout(() => {
        this.back();
      }, 200);
    }
  }
  private enableScroller(enabled = true) {
    if (this.scroller) {
      this.scroller.disabled = enabled;
    }
  }
  back() {
    if (this.selectedCountry && this.selectedCity) {
      this.internationalHotelService.setSearchConditionSource({
        ...this.internationalHotelService.getSearchCondition(),
        destinationCity: this.selectedCity,
        country: this.selectedCountry
      });
    }
    this.navCtrl.back();
  }
  private filterCountries(countries: any[], name: string) {
    const keys = ["Code", "Name", "PinYin", "EnglishName"];
    name = (name || "").trim().toLowerCase();
    let tempCountries = countries;
    if (name) {
      tempCountries = countries.filter(c => {
        return keys.some(key => {
          const value: string = (c[key] || "").trim().toLowerCase();
          return value == name || value.includes(name) || name.includes(value);
        });
      });
    }
    return tempCountries.slice(
      this.searchCountries.length,
      this.searchCountries.length + this.pageSize
    );
  }
  private filterCities(
    cities: TrafficlineEntity[],
    countries: CountryEntity[],
    name: string = ""
  ) {
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
    if (countries) {
      result = result.map(it => {
        const c = countries.find(con => con.Code == it.CountryCode);
        it.CountryName = c && `${c.Name}(${c.EnglishName})`;
        return it;
      });
    }
    return result;
  }
  private initTotalCities() {
    // if (!this.totalCities || !this.totalCities.length) {
    //   this.totalCities = this.totalCities || [];
    // }
  }
  async loadMoreData() {
    let arr: any[];
    if (!this.countries) {
      await this.getCountries();
    }
    if (this.isSearchingCountry) {
      arr = this.filterCountries(this.countries, this.searchCountrykeywords);
      if (this.scroller) {
        this.scroller.complete();
      }
      if (arr && arr.length) {
        this.searchCountries = this.searchCountries.concat(arr);
      }
    } else {
      const tab = this.tabs && this.tabs.find(it => it.active);
      if (tab) {
        arr = this.filterCities(
          tab.trafficlines,
          this.countries,
          this.searchCityKeyWords
        );
      } else {
        this.initTotalCities();
        arr = this.filterCities(
          this.trafficlines,
          this.countries,
          this.searchCityKeyWords
        );
      }
      if (this.scroller) {
        this.scroller.complete();
      }
      if (arr && arr.length) {
        this.searchCities = this.searchCities.concat(arr);
      }
    }
    this.enableScroller(arr.length > this.pageSize);
  }
  ngOnInit() {
    this.searchCities = [];
    this.searchCountries = [];
    this.selectedCountry = {
      Name: "中国",
      Code: "CN"
    };
    setTimeout(
      async () => {
        this.getCountries();
        await this.getTrafficlines();
        this.initTotalCities();
        this.isFirstInit = true;
        this.loadMoreData();
      },
      !this.isFirstInit ? 500 : 0
    );
  }
  async onGoToTop() {
    if (this.content) {
      const ele = await this.content.getScrollElement();
      if (ele && ele.scrollTop > 0) {
        this.content.scrollToTop(100);
      }
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
  onSearchCityFocus() {
    this.isSearchingCountry = false;
  }
  onSelectCountry(country: any) {
    this.selectedCountry = country;
    this.isSearchingCountry = false;
    this.onGoToTop();
  }
  onSearchCountry() {
    this.searchCountrySubscription.unsubscribe();
    this.searchCountrySubscription = of(this.searchCountrykeywords)
      .pipe(
        tap(v => console.log(v)),
        debounceTime(300),
        take(1)
      )
      .subscribe((name: string) => {
        this.searchCountries = [];
        this.loadMoreData();
        this.onGoToTop();
      });
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
      .getTrafficlines()
      .catch(_ => []);
    this.isLoadingContinents = false;
    this.initTabs();
  }
  private async getCountries() {
    this.isLoadingCountries = true;
    this.countries = await this.internationalHotelService
      .getCountries()
      .catch(_ => []);
    this.isLoadingCountries = false;
  }
}

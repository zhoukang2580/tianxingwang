import { TmcService } from "./../../../tmc/tmc.service";
import { GeoEntity } from "./../../models/GeoEntity";
import { AmenityEntity } from "./../../models/AmenityEntity";
import {
  IFilterTab,
  IFilterTabItem,
  HotelFilterComponent
} from "./hotel-filter/hotel-filter.component";
import { HotelService } from "./../../hotel.service";
import { HotelQueryEntity } from "./../../models/HotelQueryEntity";
import { style, state } from "@angular/animations";
import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  Output,
  EventEmitter,
  ViewChild,
  Input,
  OnDestroy
} from "@angular/core";
import { trigger, transition, animate } from "@angular/animations";
import { HotelConditionModel } from "../../models/ConditionModel";
import { Storage } from "@ionic/storage";
import {
  RecommendRankComponent
} from "./recommend-rank/recommend-rank.component";
import { QueryTabComponent } from "./query-tab/query-tab.component";
import { BrandEntity } from "../../models/BrandEntity";
import { IGeoTab, IGeoItem } from "./hotel-geo/hotel-geo.component";
import {
  IStarPriceTab,
  IStarPriceTabItem,
  HotelStarPriceComponent
} from "./hotel-starprice/hotel-starprice.component";
import { environment } from "src/environments/environment";
import { Subscription } from 'rxjs';
interface ITab {
  label: string;
  id: string;
  isActive?: boolean;
}
@Component({
  selector: "app-hotel-query",
  templateUrl: "./hotel-query.component.html",
  styleUrls: ["./hotel-query.component.scss"],
  animations: [
    trigger("openClose", [
      state("true", style({ height: "*", opacity: 1 })),
      state("false", style({ height: "0", opacity: 0 })),
      transition("true<=>false", animate("200ms"))
    ])
  ]
})
export class HotelQueryComponent implements OnInit, OnDestroy {
  private hotelQueryModel: HotelQueryEntity;
  private hotelQueryModelSub = Subscription.EMPTY;
  @Output() hotelQueryChange: EventEmitter<any>;
  @ViewChildren(QueryTabComponent) queryTabComps: QueryList<QueryTabComponent>;
  @ViewChild(HotelFilterComponent) hotelFilterComp: HotelFilterComponent;
  @ViewChild(HotelStarPriceComponent)
  @ViewChild(RecommendRankComponent)
  hotelRecommendRankComp: RecommendRankComponent;
  @Input() conditions: HotelConditionModel;
  hotelStarPriceComp: HotelStarPriceComponent;
  isActiveTab = false;
  activeTab: ITab;
  constructor(
    private hotelService: HotelService,
    private storage: Storage,
    private tmcService: TmcService
  ) {
    this.hotelQueryChange = new EventEmitter();
  }
  ngOnDestroy() {
    this.hotelQueryModelSub.unsubscribe();
  }

  async onReset() {
    // this.conditions = await this.storage.get("mock-hotel-condition");
    console.log("query component ,onreset", this.conditions);
    this.hotelQueryModel = new HotelQueryEntity();
    this.hotelService.setHotelQuerySource(this.hotelQueryModel);
    if (this.hotelFilterComp) {
      this.hotelFilterComp.onReset();
    }
    if (this.queryTabComps) {
      this.queryTabComps.forEach(it => {
        if (it) {
          it.onReset();
        }
      });
    }
    if (this.hotelFilterComp) {
      this.hotelFilterComp.onReset();
    }
    if (this.hotelRecommendRankComp) {
      this.hotelRecommendRankComp.onReset();
    }
    if (this.hotelStarPriceComp) {
      this.hotelStarPriceComp.onReset();
    }
  }
  isStarPriceHasConditionFiltered() {
    return this.hotelQueryModel && this.hotelQueryModel.starAndPrices && this.hotelQueryModel.starAndPrices.some(t => t.hasItemSelected);
  }
  isLocationAreasHasConditionFiltered() {
    return this.hotelQueryModel && this.hotelQueryModel.locationAreas && this.hotelQueryModel.locationAreas.some(it => it.hasFilterItem);
  }
  isRanksHasConditionFiltered() {
    return this.hotelQueryModel && this.hotelQueryModel.ranks && this.hotelQueryModel.ranks.some(it => it.value != 'Category');
  }
  isFiltersConditionFiltered() {
    return this.hotelQueryModel && this.hotelQueryModel.filters && this.hotelQueryModel.filters.some(it => it.hasFilterItem);
  }
  onActiveTab(tab: ITab) {
    if (this.queryTabComps) {
      this.queryTabComps.forEach(comp => {
        comp.isActive = comp.label == tab.label && tab.isActive;
      });
    }
    this.activeTab = tab;
  }
  onStarPriceChange() {
    let query = { ...this.hotelService.getHotelQueryModel() };
    if (query && query.starAndPrices && query.starAndPrices.some(it => it.hasItemSelected)) {
      const customeprice = query.starAndPrices.find(it => it.tag == "customeprice");
      const starAndPrices = query.starAndPrices.filter(it => it.hasItemSelected).filter(it => !!it);
      console.log("onStarPriceChange starAndPrices ", starAndPrices);
      this.hideQueryPannel();
      const tabs = starAndPrices.filter(
        it => it.tag == "price" || it.tag == "customeprice"
      );
      if (tabs.filter(it => it.hasItemSelected).length == 0) {
        delete query.BeginPrice;
        delete query.EndPrice;
      }
      console.log("price customeprice", tabs, query);
      let { lower, upper } = tabs
        .map(tab => tab.items)
        .reduce(
          (p, items) => {
            items
              .filter(it => it.isSelected)
              .forEach(item => {
                p.lower = Math.min(item.minPrice, p.lower) || item.minPrice;
                p.upper = Math.max(item.maxPrice, p.upper) || item.maxPrice;
              });
            return p;
          },
          {} as { lower: number; upper: number }
        );
      if (customeprice && customeprice.hasItemSelected) {
        upper = customeprice.items[0].maxPrice;
        lower = customeprice.items[0].minPrice;
      }
      console.log("价格：", lower, upper);
      if (lower == 0 || lower) {
        query.BeginPrice = lower + "";
      }
      if (upper) {
        query.EndPrice = upper == Infinity ? "10000000" : `${upper}`;
      }
      const stars = starAndPrices.find(it => it.tag == "stars");
      if (stars && stars.items && stars.items.some(it => it.isSelected)) {
        query.Stars = stars.items
          .filter(it => it.isSelected)
          .map(it => it.value);
      }
      const types = starAndPrices.find(it => it.tag == "types");
      if (types && types.items && types.items.some(it => it.isSelected)) {
        query.Categories = types.items
          .filter(it => it.isSelected)
          .map(it => it.value);
      }
    } else {
      query.Stars = null;
      query.Categories = null;
    }
    this.doRefresh(query);
  }
  onFilterGeo() {
    const query = this.hotelService.getHotelQueryModel();
    if (query && query.locationAreas) {
      query.Geos = query.Geos || [];
      const geoTabs = query.locationAreas.filter(tab => tab.hasFilterItem)
      console.log("geo 搜索", geoTabs);
      if (geoTabs.length) {
        geoTabs.forEach(tab => {
          tab.items.forEach(item => {
            if (item.items && item.items.length) {// level 3
              item.items.forEach(t => {
                if (t.isSelected) {
                  query.Geos.push(t.id);
                }
              })
            } else {// level 2
              if (item.isSelected) {
                query.Geos.push(item.id);
              }
            }
          });
        });
        this.hotelService.setHotelQuerySource(query);
      }
      this.doRefresh(query);
    }
  }
  onFilter() {
    const query = this.hotelService.getHotelQueryModel();
    if (!query.filters || !query.filters.some(it => it.hasFilterItem)) {
      query.Themes = null;
      query.Brands = null;
      query.Services = null;
      query.Facilities = null;
      this.doRefresh(query);
      return;
    }
    const filter: IFilterTab<any>[] = query.filters.filter(it => it.hasFilterItem);
    const theme = filter.find(it => it.tag == "Theme");
    const brand = filter.find(it => it.tag == "Brand");
    const services = filter.find(it => it.tag == "Service");
    const facility = filter.find(it => it.tag == "Facility");
    if (theme) {
      query.Themes = [];
      const themes =
        theme.items &&
        theme.items.filter(it => it.items && it.items.some(k => k.IsSelected));
      if (themes) {
        themes.forEach(t => {
          if (t.items) {
            t.items.forEach(k => {
              if (k.IsSelected) {
                query.Themes.push(k.Id);
              }
            });
          }
        });
      }
    }
    if (brand) {
      query.Brands = [];
      const brands =
        brand.items &&
        brand.items.filter(it => it.items && it.items.some(k => k.IsSelected));
      if (brands) {
        brands.forEach(t => {
          if (t.items) {
            t.items.forEach(k => {
              if (k.IsSelected) {
                query.Brands.push(k.Id);
              }
            });
          }
        });
      }
    }
    if (services) {
      query.Services = [];
      const s =
        services.items &&
        services.items.filter(
          it => it.items && it.items.some(k => k.IsSelected)
        );
      if (s) {
        s.forEach(t => {
          if (t.items) {
            t.items.forEach(k => {
              if (k.IsSelected) {
                query.Services.push(k.Id);
              }
            });
          }
        });
      }
    }
    if (facility) {
      query.Facilities = [];
      const facilities =
        facility.items &&
        facility.items.filter(
          it => it.items && it.items.some(k => k.IsSelected)
        );
      if (facilities) {
        facilities.forEach(t => {
          if (t.items) {
            t.items.forEach(k => {
              if (k.IsSelected) {
                query.Facilities.push(k.Id);
              }
            });
          }
        });
      }
    }
    this.doRefresh(query);
  }
  onRank() {
    const query = this.hotelService.getHotelQueryModel();
    if (query && query.ranks) {
      const tab = query.ranks.find(it => it.isSelected);
      query.Orderby = tab.orderBy;
      this.doRefresh(query);
    }
    this.hotelService.setHotelQuerySource(query);
  }
  ngOnInit() {
    this.hotelQueryModelSub = this.hotelService.getHotelQuerySource().subscribe(query => {
      this.hotelQueryModel = query;
    })
  }
  doRefresh(query?: HotelQueryEntity) {
    this.hotelQueryModel = new HotelQueryEntity();
    if (query) {
      this.hotelQueryModel = {
        ...query
      };
    }
    this.hideQueryPannel();
    this.emitQueryModel();
  }
  private emitQueryModel() {
    this.hotelQueryChange.emit(this.hotelQueryModel);
  }
  private hideQueryPannel() {
    // if (this.queryTabComps) {
    //   this.queryTabComps.forEach(tab => {
    //     if (tab) {
    //       tab.onReset();
    //     }
    //   });
    // }
    setTimeout(() => {
      this.activeTab = {
        label: "initial",
        isActive: false
      } as any;
    }, 100);
  }
}

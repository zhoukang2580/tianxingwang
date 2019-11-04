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
  Input
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
export class HotelQueryComponent implements OnInit {
  private hotelQueryModel: HotelQueryEntity;
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
  private async initConditions() {
    if (
      !this.conditions ||
      !this.conditions.Amenities ||
      !this.conditions.Brands ||
      !this.conditions.Geos
    ) {
      const conditions = await this.hotelService
        .getConditions(true)
        .catch(_ => null);
      // console.log(JSON.stringify(this.conditions));
      if (conditions) {
        if (conditions.Geos) {
          conditions.Geos = conditions.Geos.map(geo => {
            if (geo.Variables) {
              geo.VariablesJsonObj = JSON.parse(geo.Variables);
            }
            return geo;
          });
        }
        if (!conditions.Tmc) {
          conditions.Tmc = await this.tmcService.getTmc().catch(_ => null);
        }
        // if (!environment.production) {
        //   await this.storage.set("mock-hotel-condition", conditions);
        // }
      }
    }
  }
  async onReset() {
    // this.conditions = await this.storage.get("mock-hotel-condition");
    console.log("query component ,onreset", this.conditions);
    await this.initConditions();
    this.hotelQueryModel = new HotelQueryEntity();
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
    const query = this.hotelService.getHotelQueryModel();
    return query && query.starAndPrices && query.starAndPrices.some(t => t.hasItemSelected);
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
    const query = this.hotelService.getHotelQueryModel();
    if (query && query.starAndPrices) {
      const customeprice = query.starAndPrices.find(it => it.tag == "customeprice");
      const evt = [
        ...query.starAndPrices.filter(it => it.hasItemSelected),
        customeprice ? customeprice : null
      ].filter(it => !!it);
      console.log(evt);
      this.hideQueryPannel();
      const tabs = evt.filter(
        it => it.tag == "price" || it.tag == "customeprice"
      );
      console.log(tabs);
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
      if (customeprice) {
        upper = customeprice.items[0].maxPrice;
        lower = customeprice.items[0].minPrice;
      }
      console.log("价格：", lower, upper);
      if (lower == 0 || lower) {
        query.BeginPrice = lower + "";
      }
      if (upper) {
        query.EndPrice = upper == Infinity ? "" : `${upper}`;
      }
      const stars = evt.find(it => it.tag == "stars");
      if (stars && stars.items && stars.items.some(it => it.isSelected)) {
        query.Stars = stars.items
          .filter(it => it.isSelected)
          .map(it => it.value);
      }
      const types = evt.find(it => it.tag == "types");
      if (types && types.items && types.items.some(it => it.isSelected)) {
        query.Categories = types.items
          .filter(it => it.isSelected)
          .map(it => it.value);
      }
    }
    this.doRefresh(query);
  }
  onFilterGeo() {
    const query = this.hotelService.getHotelQueryModel();
    if (query && query.locationAreas) {
      query.Geos=query.Geos||[];
      const geoTabs = query.locationAreas.filter(tab => tab.hasFilterItem)
      console.log("geo 搜索", geoTabs);
      if (geoTabs.length) {
        geoTabs.forEach(tab => {
          tab.items.forEach(item => {
            if (item.items&&item.items.length) {// level 3
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
  onFilter(filter: IFilterTab<IFilterTabItem<BrandEntity | AmenityEntity>>[]) {
    console.log(filter);
    const theme = filter.find(it => it.tag == "Theme");
    const brand = filter.find(it => it.tag == "Brand");
    const services = filter.find(it => it.tag == "Service");
    const facility = filter.find(it => it.tag == "Facility");
    this.hotelQueryModel = new HotelQueryEntity();
    if (theme) {
      this.hotelQueryModel.Themes = [];
      const themes =
        theme.items &&
        theme.items.filter(it => it.items && it.items.some(k => k.IsSelected));
      if (themes) {
        themes.forEach(t => {
          if (t.items) {
            t.items.forEach(k => {
              if (k.IsSelected) {
                this.hotelQueryModel.Themes.push(k.Id);
              }
            });
          }
        });
      }
    }
    if (brand) {
      this.hotelQueryModel.Brands = [];
      const brands =
        brand.items &&
        brand.items.filter(it => it.items && it.items.some(k => k.IsSelected));
      if (brands) {
        brands.forEach(t => {
          if (t.items) {
            t.items.forEach(k => {
              if (k.IsSelected) {
                this.hotelQueryModel.Brands.push(k.Id);
              }
            });
          }
        });
      }
    }
    if (services) {
      this.hotelQueryModel.Services = [];
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
                this.hotelQueryModel.Services.push(k.Id);
              }
            });
          }
        });
      }
    }
    if (facility) {
      this.hotelQueryModel.Facilities = [];
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
                this.hotelQueryModel.Facilities.push(k.Id);
              }
            });
          }
        });
      }
    }
    this.doRefresh(this.hotelQueryModel);
  }
  onRank() {
    const query = this.hotelService.getHotelQueryModel();
    if (query && query.ranks) {
      const tab = query.ranks.find(it => it.isSelected);
      query.Orderby = tab.orderBy;
      this.doRefresh(query);
    }
  }
  ngOnInit() {
    this.onReset();
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
    if (this.queryTabComps) {
      this.queryTabComps.forEach(tab => {
        if (tab) {
          tab.onReset();
        }
      });
    }
    setTimeout(() => {
      this.activeTab = {
        label: "initial",
        isActive: false
      } as any;
    }, 100);
  }
}

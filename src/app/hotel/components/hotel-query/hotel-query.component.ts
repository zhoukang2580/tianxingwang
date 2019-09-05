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
  ViewChild
} from "@angular/core";
import { trigger, transition, animate } from "@angular/animations";
import { ConditionModel } from "../../models/ConditionModel";
import { Storage } from "@ionic/storage";
import {
  IRankItem,
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
  @Output() hotelQueryChange: EventEmitter<HotelQueryEntity>;
  @ViewChildren(QueryTabComponent) queryTabComps: QueryList<QueryTabComponent>;
  @ViewChild(HotelFilterComponent) hotelFilterComp: HotelFilterComponent;
  @ViewChild(HotelStarPriceComponent)
  hotelStarPriceComp: HotelStarPriceComponent;
  @ViewChild(RecommendRankComponent)
  hotelRecommendRankComp: RecommendRankComponent;
  hotelQueryModel: HotelQueryEntity;
  conditions: ConditionModel;
  isActiveTab = false;
  activeTab: ITab;
  constructor(
    private hotelService: HotelService,
    private storage: Storage,
    private tmcService: TmcService
  ) {
    this.hotelQueryChange = new EventEmitter();
  }
  async onReset() {
    // this.conditions = await this.storage.get("mock-hotel-condition");
    if (
      !this.conditions ||
      !this.conditions.Amenities ||
      !this.conditions.Brands ||
      !this.conditions.Geos
    ) {
      this.conditions = await this.hotelService
        .getConditions()
        .catch(_ => null);
      // console.log(JSON.stringify(this.conditions));
      if (this.conditions) {
        if (this.conditions.Geos) {
          this.conditions.Geos = this.conditions.Geos.map(geo => {
            if (geo.Variables) {
              geo.VariablesJsonObj = JSON.parse(geo.Variables);
            }
            return geo;
          });
        }
        if (!this.conditions.Tmc) {
          this.conditions.Tmc = await this.tmcService.getTmc().catch(_ => null);
        }
        await this.storage.set("mock-hotel-condition", this.conditions);
      }
    }
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

  onActiveTab(tab: ITab) {
    if (this.queryTabComps) {
      this.queryTabComps.forEach(comp => {
        comp.isActive = comp.label == tab.label && tab.isActive;
      });
    }
    this.activeTab = tab;
  }
  onStarPriceChange(evt: IStarPriceTab<IStarPriceTabItem>[]) {
    console.log(evt);
    this.hotelQueryModel = new HotelQueryEntity();
    this.hideQueryPannel();
    const tabs = evt.find(it => it.tag == "price" || it.tag == "customeprice");
    const { lower, upper } = tabs.items.reduce(
      (p, item) => {
        p.lower = Math.min(item.minPrice, p.lower) || item.minPrice;
        p.upper = Math.max(item.maxPrice, p.upper) || item.maxPrice;
        return p;
      },
      {} as { lower: number; upper: number }
    );
    console.log("价格：", lower, upper);
    this.hotelQueryModel.BeginPrice = lower + "";
    this.hotelQueryModel.EndPrice = `${upper}` == "Infinity" ? "" : `${upper}`;
    const stars = evt.find(it => it.tag == "stars");
    if (stars && stars.items && stars.items.some(it => it.isSelected)) {
      this.hotelQueryModel.Stars = stars.items
        .filter(it => it.isSelected)
        .map(it => it.value);
    }
    const types = evt.find(it => it.tag == "types");
    if (types && types.items && types.items.some(it => it.isSelected)) {
      this.hotelQueryModel.Categories = types.items
        .filter(it => it.isSelected)
        .map(it => it.value);
    }
    this.doRefresh(this.hotelQueryModel);
  }
  onFilterGeo(geoTabs: IGeoTab<IGeoItem<GeoEntity>>[]) {
    console.log("geo 搜索", geoTabs);
    if (geoTabs.length) {
      this.hotelQueryModel = new HotelQueryEntity();
      this.hotelQueryModel.Geos = [];
      geoTabs.forEach(it => {
        it.items.forEach(item => {
          if (item.isSelected) {
            this.hotelQueryModel.Geos.push(item.id);
          }
        });
      });
      this.doRefresh(this.hotelQueryModel);
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
      this.hotelQueryModel.Themes = [];
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
      this.hotelQueryModel.Themes = [];
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
      this.hotelQueryModel.Themes = [];
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
  onRank(tab: IRankItem) {
    this.doRefresh();
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
        label: "initial"
      } as any;
    }, 300);
  }
}

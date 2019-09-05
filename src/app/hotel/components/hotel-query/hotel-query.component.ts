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
    this.hideQueryPannel();
  }
  onFilterGeo(geoTabs: IGeoTab<IGeoItem<GeoEntity>>[]) {
    console.log("geo 搜索", geoTabs);
    this.hideQueryPannel();
  }
  onFilter(filter: IFilterTab<IFilterTabItem<BrandEntity | AmenityEntity>>[]) {
    console.log(filter);
    this.hideQueryPannel();
    const theme = filter.find(it => it.tag == "Theme");
  }
  onRank(tab: IRankItem) {
    this.hideQueryPannel();
  }
  ngOnInit() {
    this.onReset();
    this.hideQueryPannel();
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

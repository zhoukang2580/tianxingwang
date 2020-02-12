import { delay } from "rxjs/operators";
import { HotelService } from "./../../hotel.service";
import { HotelQueryEntity } from "./../../models/HotelQueryEntity";
import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";
import { Subscription } from "rxjs";
import { QueryTabComponent } from '../query-tab/query-tab.component';
interface ITab {
  label: string;
  id: string;
  isActive?: boolean;
}
@Component({
  selector: "app-hotel-query",
  templateUrl: "./hotel-query.component.html",
  styleUrls: ["./hotel-query.component.scss"]
})
export class HotelQueryComponent implements OnInit, OnDestroy {
  private hotelQueryModel: HotelQueryEntity;
  private hotelQueryModelSub = Subscription.EMPTY;
  filterItemInfo: {
    isRanks: boolean;
    isFilters: boolean;
    isStarPrice: boolean;
    isLocationAreas: boolean;
  };

  @Output() activeFilter: EventEmitter<any>;
  @Output() hotelQueryChange: EventEmitter<any>;
  @ViewChildren(QueryTabComponent) private queryTabComps: QueryList<
    QueryTabComponent
  >;
  isActiveTab = false;
  activeTab: ITab;
  constructor(private hotelService: HotelService) {
    this.activeFilter = new EventEmitter();
    this.hotelQueryChange = new EventEmitter();
  }
  ngOnDestroy() {
    this.hotelQueryModelSub.unsubscribe();
  }
  onActiveTab(tab: ITab) {
    if (!tab) {
      return;
    }
    if (this.queryTabComps) {
      this.queryTabComps.forEach(comp => {
        if (comp) {
          comp.isActive = comp.label == tab.label && tab.isActive;
        }
      });
    }
    this.activeTab = tab;
    this.activeFilter.emit(this.activeTab);
  }
  get isRanksHasConditionFiltered() {
    return !!(
      this.hotelQueryModel &&
      this.hotelQueryModel.ranks &&
      this.hotelQueryModel.ranks.some(it => it.value != "Category")
    );
  }
  get isFiltersConditionFiltered() {
    return !!(
      this.hotelQueryModel &&
      this.hotelQueryModel.filters &&
      this.hotelQueryModel.filters.some(it => it.hasFilterItem)
    );
  }
  get isStarPriceHasConditionFiltered() {
    return !!(
      this.hotelQueryModel &&
      this.hotelQueryModel.starAndPrices &&
      this.hotelQueryModel.starAndPrices.some(t => t.hasItemSelected)
    );
  }
  get isLocationAreasHasConditionFiltered() {
    return !!(
      this.hotelQueryModel &&
      this.hotelQueryModel.locationAreas &&
      this.hotelQueryModel.locationAreas.some(it => it.hasFilterItem)
    );
  }
  async onReset() {
    this.hotelQueryModel = new HotelQueryEntity();
    this.hotelService.setHotelQuerySource(this.hotelQueryModel);
    if (this.queryTabComps) {
      this.queryTabComps.forEach(it => {
        if (it) {
          it.onReset();
        }
      });
    }
    if (this.hotelQueryModel) {
      this.hotelQueryModel.searchGeoId = "";
      this.hotelQueryModel.ranks = [];
      this.hotelQueryModel.starAndPrices = [];
      this.hotelQueryModel.locationAreas = [];
      this.hotelQueryModel.filters = [];
    }
    this.hideQueryPannel();
    this.hotelService.setHotelQuerySource(this.hotelQueryModel);
  }
  ngOnInit() {
    this.hotelQueryModelSub = this.hotelService
      .getHotelQuerySource()
      .pipe(delay(0))
      .subscribe(query => {
        this.hotelQueryModel = query;
        this.filterItemInfo = {
          isFilters: this.isFiltersConditionFiltered,
          isLocationAreas: this.isLocationAreasHasConditionFiltered,
          isRanks: this.isRanksHasConditionFiltered,
          isStarPrice: this.isStarPriceHasConditionFiltered
        };
        // console.log("filter infor", this.filterItemInfo);
      });
  }
  doRefresh(query?: HotelQueryEntity) {
    this.hotelQueryModel = new HotelQueryEntity();
    if (query) {
      this.hotelQueryModel = {
        ...query,
        searchGeoId:
          query.Geos && query.Geos.length && !query.searchGeoId
            ? query.Geos[0]
            : query.searchGeoId || ""
      };
    }
    this.hideQueryPannel();
    this.emitQueryModel();
  }
  private emitQueryModel() {
    this.hotelQueryChange.emit(this.hotelQueryModel);
  }
  private hideQueryPannel() {
    setTimeout(() => {
      this.activeTab = {
        label: "none",
        isActive: false
      } as any;
      this.activeFilter.emit(this.activeTab);
    }, 100);
  }
}

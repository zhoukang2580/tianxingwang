import { Subscription } from "rxjs";
import { InternationalHotelService } from "../../international-hotel.service";
import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  HostBinding,
  Output,
  ViewChild
} from "@angular/core";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";
import { AppHelper } from "src/app/appHelper";
import { IonRange } from "@ionic/angular";
import {
  HotelQueryEntity,
  IRankItem
} from "src/app/hotel/models/HotelQueryEntity";
import { InterHotelStarPriceComponent } from "../inter-hotel-starprice/inter-hotel-starprice.component";
export interface IInterHotelQueryTab {
  label: "rank" | "starsAndPrice" | "close";
  name: "Recommended " | "Price & Star";
  active?: boolean;
  id: string;
}
@Component({
  selector: "app-inter-hotel-query_en",
  templateUrl: "./inter-hotel-query_en.component.html",
  styleUrls: ["./inter-hotel-query_en.component.scss"],

  // exportAs: "hotelQueryComp"
})
export class InterHotelQueryEnComponent implements OnInit, OnDestroy {
  @ViewChild(IonRange) rangeEle: IonRange;
  @ViewChild(InterHotelStarPriceComponent)
  starAndPriceComp: InterHotelStarPriceComponent;
  private subscriptions: Subscription[] = [];
  starAndPrices: any[];
  ranks: IRankItem[];
  tabs: IInterHotelQueryTab[] = [];
  tab: IInterHotelQueryTab;
  hotelQuery: HotelQueryEntity;
  @Output() queryFilter: EventEmitter<any>;
  @Output() showPanel: EventEmitter<any>;
  isShowPanel = false;
  constructor(private hotelService: InternationalHotelService) {
    this.queryFilter = new EventEmitter();
    this.showPanel = new EventEmitter();
  }

  ngOnInit() {
    this.observeHotelQuery();
    this.initTabs();
    this.initRanks();
  }
  private initRanks() {
    this.onResetRanks();
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  private onShowPanel() {
    this.isShowPanel = this.tabs.some(it => it.active);
    this.showPanel.emit(this.tab);
  }
  onTabClick(tab: IInterHotelQueryTab) {
    const active = tab.active;
    this.tabs = this.tabs.map(it => {
      it.active = false;
      return it;
    });
    if (this.tab && this.tab.id == tab.id) {
      this.tab.active = !active;
    } else {
      tab.active = true;
      this.tab = tab;
    }
    // this.tab.active = !this.tab.active;
    this.onShowPanel();
  }
  checkHasItemSelected(tab: IInterHotelQueryTab) {
    if (tab) {
      if (tab.label == "starsAndPrice") {
        return !!(
          this.hotelQuery &&
          this.hotelQuery.starAndPrices &&
          this.hotelQuery.starAndPrices.some(it => it.hasItemSelected)
        );
      }
    }
    return false;
  }
  private initTabs() {
    this.tabs = [];
    this.tabs.push({ name: "Recommended ", label: "rank", id: "1" });
    this.tabs.push({ name: "Price & Star", label: "starsAndPrice", id: "2" });
    this.tabs = this.tabs.map(it => {
      it.active = false;
      return it;
    });
  }
  private observeHotelQuery() {
    this.subscriptions.push(
      this.hotelService.getHotelQuerySource().subscribe(query => {
        this.hotelQuery = query;
      })
    );
  }
  onResetRanks() {
    this.ranks = [];
    this.ranks.push({
      id: 0,
      label: "????????????-?????????",
      value: "Category",
      orderBy: "CategoryAsc",
      isSelected: true
    });
    this.ranks.push({
      id: 1,
      label: "????????????-?????????",
      value: "Category",
      orderBy: "CategoryDesc",
      isSelected: false
    });
    this.ranks.push({
      id: 2,
      label: "????????????-?????????",
      value: "Price",
      orderBy: "PriceAsc"
    });
    this.ranks.push({
      id: 3,
      label: "????????????-?????????",
      value: "Price",
      orderBy: "PriceDesc"
    });
    let rank = this.ranks.find(it => it.isSelected) || this.ranks[0];
    if (this.hotelQuery) {
      rank =
        this.ranks.find(it => it.orderBy == this.hotelQuery.Orderby) || rank;
    }
    rank.isSelected = true;
  }
  onResetFilters() {
    this.onResetRanks();
    if (this.starAndPriceComp) {
      this.starAndPriceComp.onReset();
    }
  }
}

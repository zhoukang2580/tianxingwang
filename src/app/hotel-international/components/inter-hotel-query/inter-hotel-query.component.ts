import { Subscription } from "rxjs";
import { InternationalHotelService } from "./../../international-hotel.service";
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
import { InterHotelStarPriceComponent } from "./inter-hotel-starprice/inter-hotel-starprice.component";
import { HotelQueryEntity, IRankItem } from 'src/app/hotel/models/HotelQueryEntity';
interface ITab {
  tab: "rank" | "starsAndPrice";
  name: "推荐排序" | "星级价格";
  active?: boolean;
}
@Component({
  selector: "app-inter-hotel-query",
  templateUrl: "./inter-hotel-query.component.html",
  styleUrls: ["./inter-hotel-query.component.scss"],
  animations: [
    trigger("openClose", [
      state("true", style({ height: "*", opacity: 1 })),
      state("false", style({ height: "0", opacity: 0 })),
      transition("true<=>false", animate("200ms"))
    ])
  ]
})
export class InterHotelQueryComponent implements OnInit, OnDestroy {
  @ViewChild(IonRange) rangeEle: IonRange;
  @ViewChild(InterHotelStarPriceComponent)
  starAndPriceComp: InterHotelStarPriceComponent;
  private subscriptions: Subscription[] = [];
  starAndPrices: any[];
  ranks: IRankItem[];
  tabs: ITab[] = [];
  tab: ITab;
  hotelQuery: HotelQueryEntity;
  @Output() queryFilter: EventEmitter<any>;
  @Output() showPanel: EventEmitter<any>;
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
    this.showPanel.emit(this.tabs.find(it => it.active));
  }
  onToggleTab(tab: ITab) {
    if (!tab) {
      return;
    }
    if (tab.tab == (this.tab && this.tab.tab)) {
      this.tab.active = !this.tab.active;
    } else {
      this.tabs = this.tabs.map(t => {
        t.active = t.tab == tab.tab;
        return t;
      });
      this.tab = tab;
    }
    this.onShowPanel();
  }
  checkHasItemSelected(tab: ITab) {
    if (tab) {
      if (tab.tab == "starsAndPrice") {
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
    this.tabs.push({ name: "推荐排序", tab: "rank" });
    this.tabs.push({ name: "星级价格", tab: "starsAndPrice" });
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
      label: "星级【低-高↑】",
      value: "Category",
      orderBy: "CategoryAsc",
      isSelected: true
    });
    this.ranks.push({
      id: 1,
      label: "星级【高-低↓】",
      value: "Category",
      orderBy: "CategoryDesc",
      isSelected: false
    });
    this.ranks.push({
      id: 2,
      label: "价格【低-高↑】",
      value: "Price",
      orderBy: "PriceAsc"
    });
    this.ranks.push({
      id: 3,
      label: "价格【高-低↓】",
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
  onRank(r: IRankItem) {
    if (r) {
      this.ranks = this.ranks.map(it => {
        it.isSelected = it.id == r.id;
        return it;
      });
      if (this.hotelQuery) {
        this.hotelQuery.Orderby = r.orderBy;
        this.hotelService.setHotelQuerySource(this.hotelQuery);
        setTimeout(() => {
          this.onToggleTab(this.tab);
        }, 200);
        this.queryFilter.emit();
      }
    }
  }
  hideQueryPannel() {
    if (this.tabs) {
      this.tabs = this.tabs.map(t => {
        t.active = false;
        return t;
      });
    }
  }
  onStarPriceChange() {
    const query = { ...this.hotelService.getHotelQueryModel() };
    if (
      query &&
      query.starAndPrices &&
      query.starAndPrices.some(it => it.hasItemSelected)
    ) {
      const customeprice = query.starAndPrices.find(
        it => it.tag == "customeprice"
      );
      const starAndPrices = query.starAndPrices
        .filter(it => it.hasItemSelected)
        .filter(it => !!it);
      console.log("onStarPriceChange starAndPrices ", starAndPrices);
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
        .reduce((p, items) => {
          items
            .filter(it => it.isSelected)
            .forEach(item => {
              p.lower = Math.min(item.minPrice, p.lower) || item.minPrice;
              p.upper = Math.max(item.maxPrice, p.upper) || item.maxPrice;
            });
          return p;
        }, {} as { lower: number; upper: number });
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
      query.Stars = null;
      if (stars && stars.items && stars.items.some(it => it.isSelected)) {
        query.Stars = stars.items
          .filter(it => it.isSelected)
          .map(it => it.value);
      }
      const types = starAndPrices.find(it => it.tag == "types");
      query.Categories = null;
      if (types && types.items && types.items.some(it => it.isSelected)) {
        query.Categories = types.items
          .filter(it => it.isSelected)
          .map(it => it.value);
      }
    } else {
      query.Stars = null;
      query.Categories = null;
    }
    this.hotelService.setHotelQuerySource(query);
    this.hideQueryPannel();
    this.queryFilter.emit();
  }
  onResetFilters() {
    this.onResetRanks();
    if (this.starAndPriceComp) {
      this.starAndPriceComp.onReset();
    }
    this.hideQueryPannel();
  }
}

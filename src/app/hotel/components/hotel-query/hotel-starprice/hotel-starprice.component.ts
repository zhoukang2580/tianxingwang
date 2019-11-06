import { Subscription } from 'rxjs';
import { AppHelper } from "./../../../../appHelper";
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  Input,
  OnDestroy
} from "@angular/core";
import { IonRange } from "@ionic/angular";
import { HotelQueryEntity } from 'src/app/hotel/models/HotelQueryEntity';
import { HotelService } from 'src/app/hotel/hotel.service';
export interface IStarPriceTab<T> {
  isActive?: boolean;
  id?: string;
  label: string;
  items: T[];
  hasItemSelected?: boolean;
  tag: "stars" | "customeprice" | "price" | "types";
}
export interface IStarPriceTabItem {
  label: string;
  value?: string;
  id?: string;
  isSelected?: boolean;
  isMulti?: boolean;
  minPrice: number;
  maxPrice: number;
}
interface ILowerUper { lower: number; upper: number }
@Component({
  selector: "app-hotel-starprice",
  templateUrl: "./hotel-starprice.component.html",
  styleUrls: ["./hotel-starprice.component.scss"]
})
export class HotelStarPriceComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  private customepriceTab: IStarPriceTab<IStarPriceTabItem> = {
    label: "自定义价格",
    tag: "customeprice",
    hasItemSelected: false,
    items: [
      {
        label: "",
        isSelected: false,
        minPrice: 0,
        maxPrice: Infinity
      }
    ]
  };
  value: ILowerUper = { lower: 0, upper: Infinity };
  hotelQuery: HotelQueryEntity;
  @ViewChild(IonRange) rangeEle: IonRange;
  @Output() starPriceChange: EventEmitter<any>;
  constructor(private hotelService: HotelService) {
    this.starPriceChange = new EventEmitter();
  }
  private onStarPriceChange() {
    this.hotelService.setHotelQuerySource(this.hotelQuery);
    this.starPriceChange.emit();
  }
  onFilter() {
    this.onStarPriceChange();
  }
  ngAfterViewInit() {
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  onPriceRangeChange(evt: CustomEvent) {
    console.log(`onPriceRangeChange`, evt.detail);
    if (evt.detail.value) {
      this.value = evt.detail.value as ILowerUper;
      const value = {...this.value};
      value.upper = this.value.upper >= 1000 ? Infinity : this.value.upper;
      this.customepriceTab.items[0].minPrice = value.lower;
      this.customepriceTab.items[0].maxPrice = value.upper;
      this.customepriceTab.hasItemSelected = value.lower > 0 || value.upper < Infinity;
      if (this.customepriceTab.hasItemSelected && this.hotelQuery && this.hotelQuery.starAndPrices && !this.hotelQuery.starAndPrices.find(it => it.tag == 'customeprice')) {
        this.hotelQuery.starAndPrices.push(this.customepriceTab);
      }
    }
  }

  private resetTabs() {
    this.hotelQuery = this.hotelService.getHotelQueryModel();
    if (this.hotelQuery) {
      this.hotelQuery.starAndPrices = [];
      this.hotelQuery.starAndPrices.push({
        label: "星级(可多选)",
        tag: "stars",
        items: ["一星", "二星", "三星", "四星", "五星"].map((it, idx) => {
          return {
            label: `${it}`,
            isMulti: true,
            id: `${idx + 1}`,
            value: `${idx + 1}`
          } as IStarPriceTabItem;
        })
      });
      this.hotelQuery.starAndPrices.push({
        tag: "types",
        label: "分类(可多选)",
        items: ["公寓", "客栈", "舒适", "高档", "豪华"].map((it, idx) => {
          return {
            label: `${it}`,
            isMulti: true,
            id: `${idx}`,
            value: `${idx + 1}`,
          } as IStarPriceTabItem;
        })
      });
      this.hotelQuery.starAndPrices.push({
        label: "价格",
        tag: "price",
        items: ["150以下", "150-300", "300-450", "450-600", "600以上"].map(
          (it, idx) => {
            const minPrice = idx === 0 ? 0 : it.includes("上") ? 600 : it.split("-")[0];
            const maxPrice = idx === 0 ? 150 : it.includes("上") ? Infinity : it.split("-")[1];
            return {
              label: `${it}`,
              isMulti: false,
              id: `${idx + 1}`,
              minPrice,
              maxPrice
            } as IStarPriceTabItem;
          }
        )
      });
      this.hotelQuery.starAndPrices.push(this.customepriceTab);
    }
  }
  onResetCustomePrice(isUnlimited = false) {
    if (this.rangeEle) {
      this.value = { lower: 0, upper: 1000 };
      console.log("重置自定义价格，onResetCustomePrice", this.value);
      this.customepriceTab.items[0].minPrice = this.value.lower;
      this.customepriceTab.items[0].maxPrice = this.value.upper;
      this.customepriceTab.hasItemSelected = false;
      this.rangeEle.value = this.value;
      if (this.hotelQuery.starAndPrices) {
        this.hotelQuery.starAndPrices = this.hotelQuery.starAndPrices.filter(it => it.tag != 'customeprice');
      }
      this.hotelService.setHotelQuerySource(this.hotelQuery);
    }
  }
  onReset() {
    this.hotelQuery = new HotelQueryEntity();
    this.resetTabs();
    this.onResetCustomePrice();
    this.hotelService.setHotelQuerySource(this.hotelQuery);
  }
  onItemClick(item: IStarPriceTabItem, tab: IStarPriceTab<IStarPriceTabItem>) {
    if (item) {
      if (tab.items.filter(it => it.isSelected).length > 2) {
        item.isSelected = false;
        AppHelper.toast(`${tab.label}不能超过3个`, Infinity, "middle");
        return;
      }
      item.isSelected = !item.isSelected;
      if (!item.isMulti && tab.items) {
        tab.items = tab.items.map(it => {
          it.isSelected = it.id == item.id && item.isSelected;
          return it;
        });
      }
      if (tab && tab.items) {
        tab.hasItemSelected = tab.items.some(it => it.isSelected);
      }
    }
  }
  resetItems(tab: IStarPriceTab<IStarPriceTabItem>) {
    if (tab && tab.items) {
      tab.items = tab.items.map(item => {
        item.isSelected = false;
        return item;
      });
      tab.hasItemSelected = false;
    }
    this.hotelService.setHotelQuerySource(this.hotelQuery);
  }
  ngOnInit() {
    this.subscription = this.hotelService.getHotelQuerySource().subscribe(query => {
      console.log("starAndPrices :", query.starAndPrices);
      this.hotelQuery = query;
      if (this.hotelQuery && !this.hotelQuery.starAndPrices) {
        this.onReset();
      } else {
        const custome = this.hotelQuery.starAndPrices.find(it => it.tag == "customeprice");
        if (custome && custome.items && custome.items[0]) {
          this.value.lower = custome.items[0].minPrice;
          this.value.upper = custome.items[0].maxPrice;
          if (this.rangeEle) {
            this.rangeEle.value = this.value;
          }
        }
      }
    });
    const query = this.hotelService.getHotelQueryModel();
    this.hotelQuery = query;
    if (query && !query.starAndPrices) {
      this.onReset();
    }
  }
}

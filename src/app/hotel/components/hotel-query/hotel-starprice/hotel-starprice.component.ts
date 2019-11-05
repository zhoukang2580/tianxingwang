import { AppHelper } from "./../../../../appHelper";
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  Input
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
export class HotelStarPriceComponent implements OnInit, AfterViewInit {
  private isResetRange = false;
  private customepriceTab: IStarPriceTab<IStarPriceTabItem> = {
    label: "自定义价格",
    tag: "customeprice",
    hasItemSelected: false,
    items: [
      {
        label: "",
        isSelected: false,
        minPrice: 0,
        maxPrice: 1000
      }
    ]
  };
  value: ILowerUper = { lower: 0, upper: 1000 };
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
  ngAfterViewInit() { }
  onPriceRangeChange(evt: CustomEvent) {
    console.log(`onPriceRangeChange,isResetRange=${this.isResetRange}`, evt.detail);
    if (evt.detail.value) {
      this.value = evt.detail.value as ILowerUper;
      this.customepriceTab.items[0].minPrice = this.value.lower;
      this.customepriceTab.items[0].maxPrice = this.value.upper;
      this.customepriceTab.hasItemSelected = !this.isResetRange;
    }
    this.isResetRange = false;
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
            isSelected: this.hotelQuery && this.hotelQuery.Type == it
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
  onResetCustomePrice() {
    this.isResetRange = true;
    console.log("onResetCustomePrice", this.value);
    if (this.rangeEle) {
      this.value = { lower: 0, upper: 1000 };
      this.rangeEle.value = this.value;
      this.customepriceTab.items[0].minPrice = this.value.lower;
      this.customepriceTab.items[0].maxPrice = this.value.upper;
      this.customepriceTab.hasItemSelected = false;
    }
  }
  onReset() {
    this.resetTabs();
    this.onResetCustomePrice();
  }
  onItemClick(item: IStarPriceTabItem, tab: IStarPriceTab<IStarPriceTabItem>) {
    if (item) {
      if (tab.items.filter(it => it.isSelected).length > 2) {
        item.isSelected = false;
        AppHelper.toast(`${tab.label}不能超过3个`, 1000, "middle");
        return;
      }
      item.isSelected = !item.isSelected;
      if (!item.isMulti && tab.items) {
        tab.items = tab.items.map(it => {
          it.isSelected = it.id == item.id && item.isSelected;
          return it;
        });
      }
      if (tab) {
        tab.hasItemSelected = item.isSelected;
      }
    }
  }
  resetItems(tab: IStarPriceTab<IStarPriceTabItem>) {
    if (tab && tab.items) {
      tab.items = tab.items.map(item => {
        item.isSelected = false;
        return item;
      });
    }
  }
  ngOnInit() {
    this.hotelService.getHotelQuerySource().subscribe(query => {
      this.hotelQuery = query;
      if (this.hotelQuery && !this.hotelQuery.starAndPrices) {
        this.onReset();
        this.hotelService.setHotelQuerySource(this.hotelQuery);
      }
    });
    const query = this.hotelService.getHotelQueryModel();
    this.hotelQuery = query;
    if (query && !query.starAndPrices) {
      this.onReset();
    }
  }
}

import { AppHelper } from "./../../../../appHelper";
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import { IonRange } from "@ionic/angular";
export interface IStarPriceTabItem {
  label: string;
  value?: string;
  id?: string;
  isSelected?: boolean;
  isMulti?: boolean;
  minPrice: number;
  maxPrice: number;
}
export interface IStarPriceTab<T> {
  isActive?: boolean;
  id?: string;
  label: string;
  items: T[];
  hasItemSelected?: boolean;
  tag: "stars" | "customeprice" | "price" | "types";
}
@Component({
  selector: "app-hotel-starprice",
  templateUrl: "./hotel-starprice.component.html",
  styleUrls: ["./hotel-starprice.component.scss"]
})
export class HotelStarPriceComponent implements OnInit, AfterViewInit {
  @ViewChild(IonRange) rangeEle: IonRange;
  @Output() starPriceChange: EventEmitter<any>;
  tabs: IStarPriceTab<IStarPriceTabItem>[] = [];
  value: { lower: number; upper: number } = { lower: 0, upper: 1000 };
  constructor() {
    this.starPriceChange = new EventEmitter();
  }
  private onStarPriceChange() {
    const priceTab: IStarPriceTab<IStarPriceTabItem> = {
      label: "自定义价格",
      tag: "customeprice",
      items: [
        {
          label: "",
          isSelected: true,
          minPrice: this.value.lower,
          maxPrice: this.value.upper
        }
      ]
    };
    priceTab.hasItemSelected = true;
    this.starPriceChange.emit([
      ...this.tabs.filter(it => it.hasItemSelected),
      priceTab
    ]);
  }
  onFilter() {
    this.onStarPriceChange();
  }
  ngAfterViewInit() {}
  onPriceRangeChange(evt: CustomEvent) {
    if (evt.detail.value) {
      this.value = evt.detail.value;
    }
  }
  private initTabs() {
    this.tabs = [];
    this.tabs.push({
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
    this.tabs.push({
      tag: "types",
      label: "分类(可多选)",
      items: ["公寓", "客栈", "舒适", "高档", "豪华"].map((it, idx) => {
        return {
          label: `${it}`,
          isMulti: true,
          id: `${idx}`,
          value: `${idx + 1}`
        } as IStarPriceTabItem;
      })
    });
    this.tabs.push({
      label: "价格",
      tag: "price",
      items: ["150以下", "150-300", "300-450", "450-600", "600以上"].map(
        (it, idx) => {
          return {
            label: `${it}`,
            isMulti: false,
            id: `${idx + 1}`,
            minPrice:
              it.includes("下") || it.includes("上") ? 0 : it.split("-")[0],
            maxPrice: it.includes("下")
              ? 150
              : it.includes("上")
              ? 600
              : it.split("-")[1]
          } as IStarPriceTabItem;
        }
      )
    });
  }
  onResetCustomePrice() {
    if (this.rangeEle) {
      this.rangeEle.value = {
        lower: 0,
        upper: 1000
      };
    }
  }
  onReset() {
    this.initTabs();
    this.onResetCustomePrice();
  }
  onItemClick(item: IStarPriceTabItem, tab: IStarPriceTab<IStarPriceTabItem>) {
    if (item) {
      if (tab.items.filter(it => it.isSelected).length >= 3) {
        item.isSelected = false;
        AppHelper.toast(`${tab.label}不能超过3个`, 1000, "middle");
        return;
      }
      item.isSelected = !item.isSelected;
      if (!item.isMulti && tab.items) {
        tab.items.forEach(it => {
          it.isSelected = it.id == item.id && item.isSelected;
        });
      }
      if (tab) {
        tab.hasItemSelected = item.isSelected;
      }
    }
  }
  resetItems(tab: IStarPriceTab<IStarPriceTabItem>) {
    if (tab && tab.items) {
      tab.items.forEach(item => (item.isSelected = false));
    }
  }
  ngOnInit() {
    this.onReset();
  }
}

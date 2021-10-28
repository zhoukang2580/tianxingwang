import { LangService } from 'src/app/services/lang.service';
import { AppHelper } from "src/app/appHelper";
import { Subscription } from "rxjs";
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  Input,
  OnDestroy,
  ElementRef
} from "@angular/core";
import { IonRange } from "@ionic/angular";
import {
  IStarPriceTab,
  IStarPriceTabItem,
  HotelQueryEntity
} from "src/app/hotel/models/HotelQueryEntity";
import { InternationalHotelService } from "../../international-hotel.service";
import { ThemeService } from 'src/app/services/theme/theme.service';
interface ILowerUper {
  lower: number;
  upper: number;
}
@Component({
  selector: "app-inter-hotel-starprice",
  templateUrl: "./inter-hotel-starprice.component.html",
  styleUrls: ["./inter-hotel-starprice.component.scss"]
})
export class InterHotelStarPriceComponent
  implements OnInit, AfterViewInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  private customepriceTab: IStarPriceTab<IStarPriceTabItem> = {
    label: "自定义价格",
    tag: "customeprice",
    id: AppHelper.uuid(),
    hasItemSelected: false,
    items: [
      {
        label: "",
        isSelected: false,
        id: AppHelper.uuid(),
        minPrice: 0,
        maxPrice: Infinity
      }
    ]
  };
  @Input() langOpt = {
    customprice: "自定义价格",
    any: "不限",
    reset: "重置",
    determine: "确定"
  };
  value: ILowerUper = { lower: 0, upper: Infinity };
  hotelQuery: HotelQueryEntity;
  @ViewChild(IonRange) rangeEle: IonRange;
  @Output() starPriceChange: EventEmitter<any>;
  constructor(
    private hotelService: InternationalHotelService,
    private refEle: ElementRef<HTMLElement>,
    private themeService: ThemeService,
  ) {
    this.starPriceChange = new EventEmitter();
    this.themeService.getModeSource().subscribe(m => {
      if (m == 'dark') {
        this.refEle.nativeElement.classList.add("dark")
      } else {
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
  }
  private onStarPriceChange() {
    this.hotelService.setHotelQuerySource(this.hotelQuery);
    this.starPriceChange.emit();
  }
  onFilter() {
    this.onStarPriceChange();
  }
  ngAfterViewInit() { }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  onPriceRangeChange(evt: CustomEvent) {
    // console.log(`onPriceRangeChange`, evt.detail);
    if (evt.detail.value) {
      this.value = evt.detail.value as ILowerUper;
      const value = { ...this.value };
      value.upper = this.value.upper > 1000 ? Infinity : this.value.upper;
      this.customepriceTab.items[0].minPrice = value.lower;
      this.customepriceTab.items[0].maxPrice = value.upper;
      this.customepriceTab.hasItemSelected =
        value.lower > 0 || value.upper < Infinity;
      if (this.hotelQuery && this.hotelQuery.starAndPrices) {
        this.hotelQuery.starAndPrices = this.hotelQuery.starAndPrices.filter(
          it => it.tag != "customeprice"
        );
      }
      if (
        this.customepriceTab.hasItemSelected &&
        this.hotelQuery &&
        this.hotelQuery.starAndPrices
      ) {
        this.hotelQuery.starAndPrices.unshift(this.customepriceTab);
      }
    }
  }

  private resetTabs() {
    if (this.hotelQuery) {
      this.hotelQuery.starAndPrices = [];
      // this.hotelQuery.starAndPrices.push({
      //   id: AppHelper.uuid(),
      //   tag: "types",
      //   label: "分类(可多选)",
      //   items: ["公寓", "客栈", "舒适", "高档", "豪华"].map((it, idx) => {
      //     return {
      //       label: `${it}`,
      //       isMulti: true,
      //       id: `${idx}`,
      //       value: `${idx + 1}`
      //     } as IStarPriceTabItem;
      //   })
      // });
      this.hotelQuery.starAndPrices.push(this.customepriceTab);

      this.hotelQuery.starAndPrices.push({
        id: AppHelper.uuid(),
        label: "价格",
        tag: "price",
        items: ["400以下", "401-700", "701-1000", "1001-1300", "1300以上"].map(
          (it, idx) => {
            const minPrice =
              idx === 0 ? 0 : it.includes("上") ? 1300 : it.split("-")[0];
            const maxPrice =
              idx === 0 ? 400 : it.includes("上") ? Infinity : it.split("-")[1];
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

      this.hotelQuery.starAndPrices.push({
        id: AppHelper.uuid(),
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
    }
  }
  onResetCustomePrice() {
    if (this.rangeEle) {
      this.value = { lower: 0, upper: 1001 };
      // console.log("重置自定义价格，onResetCustomePrice", this.value);
      this.customepriceTab.items[0].minPrice = this.value.lower;
      this.customepriceTab.items[0].maxPrice = this.value.upper;
      this.customepriceTab.hasItemSelected = false;
      this.rangeEle.value = this.value;
      setTimeout(() => {
        if (this.customepriceTab) {
          this.customepriceTab.hasItemSelected = false;
        }
      }, 0);
      if (this.hotelQuery.starAndPrices) {
        this.hotelQuery.EndPrice = "1000000";
        this.hotelQuery.starAndPrices = this.hotelQuery.starAndPrices.filter(
          it => it.tag != "customeprice"
        );
      }
      this.hotelService.setHotelQuerySource(this.hotelQuery);
    }
  }
  onReset() {
    this.resetTabs();
    this.onResetCustomePrice();
    this.hotelQuery.starAndPrices = null;
    delete this.hotelQuery.BeginPrice;
    delete this.hotelQuery.EndPrice;
    this.hotelQuery.Categories = null;
    this.hotelService.setHotelQuerySource({ ...this.hotelQuery });
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
      if (this.hotelQuery && this.hotelQuery.starAndPrices) {
        this.hotelQuery.starAndPrices = this.hotelQuery.starAndPrices.map(
          it => {
            if (it.id == tab.id) {
              it.items = it.items.map(item => {
                item.isSelected = false;
                return item;
              });
              it.hasItemSelected = false;
            }
            return it;
          }
        );
      }
    }
    this.hotelService.setHotelQuerySource(this.hotelQuery);
  }
  ngOnInit() {
    this.subscription = this.hotelService
      .getHotelQuerySource()
      .subscribe(query => {
        console.log("starAndPrices :", query.starAndPrices);
        this.hotelQuery = query;
        if (this.hotelQuery && !this.hotelQuery.starAndPrices) {
          this.resetTabs();
          this.onResetCustomePrice();
        } else {
          const custome = this.hotelQuery.starAndPrices.find(
            it => it.tag == "customeprice"
          );
          if (custome && custome.items && custome.items[0]) {
            this.value.lower = custome.items[0].minPrice;
            this.value.upper = custome.items[0].maxPrice;
            if (this.rangeEle) {
              this.rangeEle.value = this.value;
            }
          }
        }
      });
    const q = this.hotelService.getHotelQueryModel();
    this.hotelQuery = q;
    if ((q && !q.starAndPrices) || !q.starAndPrices.length) {
      setTimeout(() => {
        this.onReset();
      }, 200);
    }
  }
}

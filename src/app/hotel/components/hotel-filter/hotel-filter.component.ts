import { Subscription } from "rxjs";
import {
  HotelQueryEntity,
  IFilterTabItem,
  IFilterTab,
} from "src/app/hotel/models/HotelQueryEntity";
import { TmcService } from "src/app/tmc/tmc.service";
import {
  Component,
  OnInit,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ElementRef,
} from "@angular/core";
import { BrandEntity } from "src/app/hotel/models/BrandEntity";
import { HotelConditionModel } from "src/app/hotel/models/ConditionModel";
import { ToastController, ModalController } from "@ionic/angular";
import { AmenityEntity } from "../../models/AmenityEntity";
import { HotelService } from "../../hotel.service";
import { ThemeService } from "src/app/services/theme/theme.service";

@Component({
  selector: "app-hotel-filter",
  templateUrl: "./hotel-filter.component.html",
  styleUrls: ["./hotel-filter.component.scss"],
})
export class HotelFilterComponent implements OnInit, OnDestroy {
  @Input() langOpt = {
    any: "不限",
    Reset: "重置",
    determine: "确定",
  };
  private subscription = Subscription.EMPTY;
  private conditionModel: HotelConditionModel;
  @Output() filter: EventEmitter<any>;
  isShowFilter = false;
  hotelQuery: HotelQueryEntity;
  items: IFilterTabItem<BrandEntity | AmenityEntity>[];
  constructor(
    private toastCtrl: ToastController,
    private hotelService: HotelService,
    private modalCtrl: ModalController,
    private refEle:ElementRef<HTMLElement>,
    private themeService:ThemeService,

    ) {
      this.filter = new EventEmitter();
      this.themeService.getModeSource().subscribe(m=>{
           if(m=='dark'){
             this.refEle.nativeElement.classList.add("dark")
           }else{
             this.refEle.nativeElement.classList.remove("dark")
           }
         })
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  onFilter() {
    this.modalCtrl.getTop().then((top) => {
      if (top) {
        top.dismiss();
      }
    });
    this.filter.emit();
  }
  
  onActive(tab: IFilterTab<any>) {
    this.hotelQuery.filters = this.hotelQuery.filters.map((it) => {
      it.active = it.id == tab.id;
      return it;
    });
    const active = this.hotelQuery.filters.find((it) => it.active);
    if (active) {
      this.items = active.items;
    }
  }
  async ngOnInit() {
    const query = this.hotelService.getHotelQueryModel();
    this.subscription = this.hotelService
      .getHotelQuerySource()
      .subscribe((q) => {
        this.hotelQuery = q;
        if (
          !this.hotelQuery ||
          !this.hotelQuery.filters ||
          !this.hotelQuery.filters.length
        ) {
          this.onReset();
        }
      });
    this.conditionModel = await this.hotelService.getConditions();
    if (!query || !query.filters) {
      this.onReset();
    } else {
      this.onActive(query.filters[0]);
    }
  }
  private async resetTabs() {
    if (this.hotelQuery) {
      this.hotelQuery.filters = [];
      if (!this.conditionModel) {
        this.conditionModel = await this.hotelService.getConditions();
      }
      if (!this.conditionModel || !this.conditionModel.Brands) {
        return;
      }
      console.log("resetTabs");
      this.resetTabBrand();
      this.resetTabTheme();
      this.resetTabService();
      this.resetTabFacility();
      this.hotelQuery.filters = this.hotelQuery.filters.map((it, idx) => {
        it.id = `${idx}`;
        it.hasFilterItem = false;
        if (it.items) {
          it.items.forEach((itm) => {
            if (itm.items) {
              itm.items.forEach((k) => {
                k.IsSelected = false;
              });
            }
          });
        }
        return it;
      });
      if (this.hotelQuery.filters.length) {
        this.hotelQuery.filters[0].active = true;
        this.items = this.hotelQuery.filters[0].items;
      }
      this.hotelService.setHotelQuerySource(this.hotelQuery);

      console.log(this.hotelQuery.filters,"filter");
    }
  }
  private async resetTabBrand() {
    if (
      !this.conditionModel ||
      !this.conditionModel.Brands ||
      !this.hotelQuery ||
      !this.hotelQuery.filters
    ) {
      return;
    }
    const brands = this.conditionModel.Brands.slice(0, 8);
    const economy = this.conditionModel.Brands.filter(
      (it) => it.Tag == "Economy"
    ).slice(0, 20);

    const comfort = this.conditionModel.Brands.filter(
      (it) => it.Tag == "Comfort"
    ).slice(0, 10);

    const high = this.conditionModel.Brands.filter(
      (it) => it.Tag == "High"
    ).slice(0, 10);

    const luxury = this.conditionModel.Brands.filter(
      (it) => it.Tag == "Luxury"
    ).slice(0, 10);

    const tabBrand: IFilterTab<IFilterTabItem<BrandEntity>> = {
      label: "品牌",
      tag: "Brand",
      items: [
        {
          label: "热门品牌（可多选）",
          isMulti: true,
          items: brands.map((it) => {
            it.IsSelected = false;
            return { ...it } as any;
          }),
        },
        {
          label: "经济（可多选）",
          isMulti: true,
          items: economy.map((it) => {
            it.IsSelected = false;
            return { ...it } as any;
          }),
        },
        {
          label: "舒适（可多选）",
          isMulti: true,
          items: comfort.map((it) => {
            it.IsSelected = false;
            return { ...it } as any;
          }),
        },
        {
          label: "高端（可多选）",
          isMulti: true,
          items: high.map((it) => {
            it.IsSelected = false;
            return { ...it } as any;
          }),
        },
        {
          label: "豪华（可多选）",
          isMulti: true,
          items: luxury.map((it) => {
            it.IsSelected = false;
            return { ...it } as any;
          }),
        },
      ],
    };
    this.hotelQuery.filters.push(tabBrand);
  }
  private resetTabTheme() {
    if (!this.conditionModel || !this.conditionModel.Amenities) {
      return;
    }
    const amenities = this.conditionModel.Amenities.filter(
      (it) => it.Tag == "Theme"
    );
    const tab: IFilterTab<IFilterTabItem<AmenityEntity>> = {
      label: "主题",
      tag: "Theme",
      items: [
        {
          label: "主题类型",
          isMulti: true,
          items: amenities,
        },
      ],
    };
    this.hotelQuery.filters.push(tab);
  }
  private resetTabService() {
    if (!this.conditionModel || !this.conditionModel.Amenities) {
      return;
    }
    const amenities = this.conditionModel.Amenities.filter(
      (it) => it.Tag == "Service"
    );
    const tab: IFilterTab<IFilterTabItem<AmenityEntity>> = {
      label: "服务",
      tag: "Service",
      items: [
        {
          label: "服务类型",
          isMulti: true,
          items: amenities,
        },
      ],
    };
    this.hotelQuery.filters.push(tab);
  }
  private resetTabFacility() {
    if (!this.conditionModel || !this.conditionModel.Amenities) {
      return;
    }
    const amenities = this.conditionModel.Amenities.filter(
      (it) => it.Tag == "Facility"
    );
    const tab: IFilterTab<IFilterTabItem<AmenityEntity>> = {
      label: "设施",
      tag: "Facility",
      items: [
        {
          label: "设施服务",
          isMulti: true,
          items: amenities,
        },
      ],
    };
    this.hotelQuery.filters.push(tab);
  }
  resetItems(item: IFilterTabItem<BrandEntity | AmenityEntity>) {
    if (item && item.items) {
      item.items = item.items.map((it) => {
        it.IsSelected = false;
        return it;
      });
    }
    this.resetHasFilterItem();
  }
  onItemClick(
    it: BrandEntity | AmenityEntity,
    item: IFilterTabItem<BrandEntity | AmenityEntity>
  ) {
    if (item.isMulti) {
      it.IsSelected = !it.IsSelected;
      if (
        item &&
        item.items &&
        item.items.filter((j) => j.IsSelected).length > 3
      ) {
        this.toastCtrl
          .create({
            message: `${item.label}不能超过3个`,
            position: "middle",
            duration: 1000,
          })
          .then((t) => t.present());
        it.IsSelected = false;
      }
    } else {
      item.items.forEach((i) => {
        i.IsSelected = i.Id == it.Id;
      });
    }
    this.resetHasFilterItem();
  }
  private resetHasFilterItem() {
    if (this.hotelQuery && this.hotelQuery.filters) {
      this.hotelQuery.filters = this.hotelQuery.filters.map((tab) => {
        if (tab.items) {
          tab.hasFilterItem = tab.items.some(
            (j) => j.items && j.items.some((k) => k.IsSelected)
          );
        }
        return tab;
      });
    }
    this.hotelService.setHotelQuerySource(this.hotelQuery);
  }
  onReset() {
    if (this.hotelQuery) {
      this.hotelQuery.searchGeoId = "";
      this.hotelQuery.filters = [];
    }
    this.resetTabs();
  }
}

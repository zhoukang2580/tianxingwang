import { AmenityEntity } from "./../../../models/AmenityEntity";
import { Component, OnInit, EventEmitter, Input, Output } from "@angular/core";
import { BrandEntity } from "src/app/hotel/models/BrandEntity";
import { ConditionModel } from "src/app/hotel/models/ConditionModel";
export interface IFilterTab<T> {
  hasFilterItem?: boolean;
  active?: boolean;
  label: string;
  items: T[];
  order?: number;
  tag?: "Brand" | "Service" | "Theme" | "Facility";
  id?: string;
}
export interface IFilterTabItem<T> {
  isMulti?: boolean;
  label: string;
  items: T[];
  order?: number;
  tag?: string;
  id?: string;
  showAll?: boolean;
}
@Component({
  selector: "app-hotel-filter",
  templateUrl: "./hotel-filter.component.html",
  styleUrls: ["./hotel-filter.component.scss"]
})
export class HotelFilterComponent implements OnInit {
  @Input() conditionModel: ConditionModel;
  @Output() filter: EventEmitter<any>;
  tabs: IFilterTab<IFilterTabItem<BrandEntity | AmenityEntity>>[];
  isShowFilter = false;
  items: IFilterTabItem<BrandEntity | AmenityEntity>[];
  constructor() {
    this.filter = new EventEmitter();
  }
  onFilter() {
    const result: IFilterTab<any>[] = this.tabs.filter(it => it.hasFilterItem);
    this.filter.emit(result);
  }
  onActive(tab: IFilterTab<any>) {
    this.tabs.forEach(it => {
      it.active = it.id == tab.id;
    });
    this.items = this.tabs.find(it => it.active).items;
  }
  ngOnInit() {
    if (this.conditionModel && this.conditionModel.Brands) {
      this.initTabs();
    }
  }
  private initTabs() {
    this.tabs = [];
    this.initTabBrand();
    this.initTabTheme();
    this.initTabService();
    this.initTabFacility();
    this.tabs = this.tabs.map((it, idx) => {
      it.id = `${idx}`;
      return it;
    });
    if (this.tabs.length) {
      this.tabs[0].active = true;
      this.items = this.tabs[0].items;
    }
  }
  private initTabBrand() {
    const brands = this.conditionModel.Brands.slice(0, 8);
    const economy = this.conditionModel.Brands.filter(
      it => it.Tag == "Economy"
    ).slice(0, 20);

    const comfort = this.conditionModel.Brands.filter(
      it => it.Tag == "Comfort"
    ).slice(0, 10);

    const high = this.conditionModel.Brands.filter(
      it => it.Tag == "High"
    ).slice(0, 10);

    const luxury = this.conditionModel.Brands.filter(
      it => it.Tag == "Luxury"
    ).slice(0, 10);

    const tabBrand: IFilterTab<IFilterTabItem<BrandEntity>> = {
      label: "品牌",
      tag: "Brand",
      items: [
        {
          label: "热门品牌（可多选）",
          isMulti: true,
          items: brands.map(it => {
            return { ...it };
          })
        },
        {
          label: "经济（可多选）",
          isMulti: true,
          items: economy.map(it => {
            return { ...it };
          })
        },
        {
          label: "舒适（可多选）",
          isMulti: true,
          items: comfort.map(it => {
            return { ...it };
          })
        },
        {
          label: "高端（可多选）",
          isMulti: true,
          items: high.map(it => {
            return { ...it };
          })
        },
        {
          label: "豪华（可多选）",
          isMulti: true,
          items: luxury.map(it => {
            return { ...it };
          })
        }
      ]
    };
    this.tabs.push(tabBrand);
  }
  private initTabTheme() {
    const amenities = this.conditionModel.Amenities.filter(
      it => it.Tag == "Theme"
    );
    const tab: IFilterTab<IFilterTabItem<AmenityEntity>> = {
      label: "主题",
      tag: "Theme",
      items: [
        {
          label: "主题类型",
          isMulti: true,
          items: amenities
        }
      ]
    };
    this.tabs.push(tab);
  }
  private initTabService() {
    const amenities = this.conditionModel.Amenities.filter(
      it => it.Tag == "Service"
    );
    const tab: IFilterTab<IFilterTabItem<AmenityEntity>> = {
      label: "服务",
      tag: "Service",
      items: [
        {
          label: "服务类型",
          isMulti: true,
          items: amenities
        }
      ]
    };
    this.tabs.push(tab);
  }
  private initTabFacility() {
    const amenities = this.conditionModel.Amenities.filter(
      it => it.Tag == "Facility"
    );
    const tab: IFilterTab<IFilterTabItem<AmenityEntity>> = {
      label: "设施",
      tag: "Facility",
      items: [
        {
          label: "设施服务",
          isMulti: true,
          items: amenities
        }
      ]
    };
    this.tabs.push(tab);
  }
  resetItems(item: IFilterTabItem<BrandEntity | AmenityEntity>) {
    if (item && item.items) {
      item.items.forEach(it => (it.IsSelected = false));
    }
  }
  onItemClick(
    it: BrandEntity | AmenityEntity,
    item: IFilterTabItem<BrandEntity | AmenityEntity>
  ) {
    if (item.isMulti) {
      it.IsSelected = !it.IsSelected;
    } else {
      item.items.forEach(i => {
        i.IsSelected = i.Id == it.Id;
      });
    }
    if (it.IsSelected) {
      this.tabs.forEach(tab => {
        if (tab.active) {
          tab.hasFilterItem = item.items.some(j => j.IsSelected);
        }
      });
    }
  }
  onReset() {
    if (this.tabs) {
      this.tabs.forEach(it => {
        if (it.items) {
          it.items.forEach(item => {
            this.resetItems(item);
          });
        }
      });
    }
  }
}

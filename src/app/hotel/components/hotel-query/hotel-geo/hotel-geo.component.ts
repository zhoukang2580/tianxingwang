import { GeoEntity } from "./../../../models/GeoEntity";
import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { ConditionModel } from "src/app/hotel/models/ConditionModel";
export interface IGeoTab<T> {
  id: string;
  label: string;
  active?: boolean;
  hasFilterItem?: boolean;
  items?: T[];
  tag?:
    | "Metro"
    | "RailwayStation"
    | "CarStation"
    | "Airport"
    | "District"
    | "Mall"
    | "CommericalCenter"
    | "Landmark"
    | "Hospital"
    | "University"
    | "Venue"
    | "InFeatureSpot"
    | "OutFeatureSpot"
    | "Group"
    | "Company";
}
export interface IGeoItem<T> {
  id?: string;
  label: string;
  items?: IGeoItem<T>[];
  parentId?: string;
  isSelected?: boolean;
  isMulti?: boolean;
  level: "normal" | "second" | "third";
  tag: string;
}
@Component({
  selector: "app-hotel-geo",
  templateUrl: "./hotel-geo.component.html",
  styleUrls: ["./hotel-geo.component.scss"]
})
export class HotelGeoComponent implements OnInit {
  @Input() conditionModel: ConditionModel;
  @Output() geoFilterChange: EventEmitter<any>;
  tabs: IGeoTab<IGeoItem<GeoEntity>>[];
  secondaryItems: IGeoItem<GeoEntity>[];
  thirdItems: IGeoItem<GeoEntity>[];
  normalItems: IGeoItem<GeoEntity>[];
  constructor() {
    this.geoFilterChange = new EventEmitter();
  }

  ngOnInit() {
    this.initTabs();
  }
  onItemClick(item: IGeoItem<GeoEntity>, items: IGeoItem<GeoEntity>[]) {
    if (!item) {
      return;
    }
    if (item.level == "second") {
      this.thirdItems = item.items;
    }
    if (!item.isMulti) {
      if (items) {
        items.forEach(it => {
          it.isSelected = it == item;
          if (it.items) {
            it.items.forEach(k => {
              k.isSelected = k == item;
            });
          }
        });
      }
    } else {
      item.isSelected = !item.isSelected;
    }
    this.checkTabsHasFilteredItem();
  }
  private checkTabsHasFilteredItem() {
    console.time("checkTabsHasFilteredItem");
    this.tabs.forEach(tab => {
      console.log(
        tab,
        tab.tag,
        tab.items.some(it => it.items && it.items.some(k => k.isSelected))
      );
      tab.hasFilterItem =
        tab.tag == "Metro"
          ? tab.items &&
            tab.items.some(it => it.items && it.items.some(k => k.isSelected))
          : tab.items && tab.items.some(it => it.isSelected);
    });
    console.timeEnd("checkTabsHasFilteredItem");
    console.log(this.tabs);
  }
  private scrollThirdListToTop() {
    setTimeout(() => {
      const list = document.querySelector(".third-list");
      if (list) {
        list.scrollTop = 0;
      }
    }, 300);
  }
  private scrollSecondaryListToTop() {
    setTimeout(() => {
      const secondList = document.querySelector(".secondary-list");
      if (secondList) {
        secondList.scrollTop = 0;
      }
    }, 300);
  }
  private scrollListsToTop() {
    setTimeout(() => {
      const secondList = document.querySelector(".secondary-list");
      const thirdList = document.querySelector(".third-list");
      if (secondList) {
        secondList.scrollTop = 0;
      }
      if (thirdList) {
        thirdList.scrollTop = 0;
      }
    }, 300);
  }
  onTabClick(tab: IGeoTab<IGeoItem<GeoEntity>>) {
    if (!tab) {
      return;
    }
    this.tabs.forEach(t => {
      t.active = t.tag == tab.tag;
    });
    this.secondaryItems = tab.items || [];
    if (this.secondaryItems.some(it => it.items && it.items.length > 0)) {
      this.thirdItems = this.secondaryItems[0].items;
    } else {
      this.normalItems = tab.items;
      this.secondaryItems = [];
      this.thirdItems = [];
    }
    this.scrollListsToTop();
  }
  private initTabs() {
    this.tabs = [];
    this.initMetros();
    this.initOtherTabs();
    if (this.tabs && this.tabs[0]) {
      this.onTabClick(this.tabs[0]);
    }
  }
  onReset() {
    this.initTabs();
  }
  onFilter() {
    this.geoFilterChange.emit(this.tabs.filter(tab => tab.hasFilterItem));
  }
  private initMetros() {
    if (!this.conditionModel || !this.conditionModel.Geos) {
      return;
    }
    const metros = this.conditionModel.Geos.filter(
      it => it.Tag == "Metro"
    ).reduce(
      (lines, metro) => {
        const line =
          metro.VariablesJsonObj && metro.VariablesJsonObj["SubName"];
        if (line) {
          if (lines[line]) {
            lines[line].push(metro);
          } else {
            lines[line] = [metro];
          }
        }
        return lines;
      },
      {} as { [key: string]: GeoEntity[] }
    );
    const metroTab: IGeoTab<IGeoItem<GeoEntity>> = {
      id: "metro",
      label: "地铁",
      tag: "Metro",
      items: Object.keys(metros).map(line => {
        return {
          label: line,
          level: "second",
          tag: metros[line][0].Tag,
          items: metros[line].map(geo => {
            return {
              label: geo.Name,
              id: geo.Id,
              isSelected: false,
              tag: geo.Tag,
              level: "third"
            } as IGeoItem<GeoEntity>;
          })
        } as IGeoItem<GeoEntity>;
      })
    };
    this.tabs.push(metroTab);
  }
  private initOtherTabs() {
    if (!this.conditionModel || !this.conditionModel.Geos) {
      return;
    }
    this.conditionModel.Geos.filter(
      it =>
        it.Tag != "RailwayStation" &&
        it.Tag != "CarStation" &&
        it.Tag != "Airport" &&
        it.Tag != "Metro" &&
        it.Tag != "Group" &&
        it.Tag != "Company"
    ).forEach(geo => {
      this.switchCase(geo);
    });
    if (this.conditionModel.Tmc && this.conditionModel.Tmc.GroupCompany) {
      this.conditionModel.Geos.filter(
        it =>
          (it.Tag == "Group" &&
            it.Number == this.conditionModel.Tmc.GroupCompany.Id) ||
          (it.Tag == "Company" && it.Number == this.conditionModel.Tmc.Id)
      ).forEach(geo => this.switchCase(geo));
    }
  }
  private switchCase(geo: GeoEntity) {
    switch (geo.Tag) {
      case "RailwayStation": {
        this.processCase("火车站", geo);
        break;
      }
      case "CarStation": {
        this.processCase("车站", geo);
        break;
      }
      case "Airport": {
        this.processCase("机场", geo);
        break;
      }
      case "District": {
        this.processCase("行政区", geo);
        break;
      }
      case "Mall": {
        this.processCase("购物中心", geo);
        break;
      }
      case "CommericalCenter": {
        this.processCase("商业中心", geo);
        break;
      }
      case "Landmark": {
        this.processCase("地标", geo);
        break;
      }
      case "Hospital": {
        this.processCase("医院", geo);
        break;
      }
      case "University": {
        this.processCase("大学", geo);
        break;
      }
      case "Venue": {
        this.processCase("演出场馆", geo);
        break;
      }
      case "InFeatureSpot": {
        this.processCase("市内景点", geo);
        break;
      }
      case "OutFeatureSpot": {
        this.processCase("市外景点", geo);
        break;
      }
      case "Group":
      case "Company": {
        this.processCase("兴趣点", geo, ["Company", "Group"]);
        break;
      }
    }
  }
  private processCase(label: string, geo: GeoEntity, tags?: string[]) {
    const tab = this.tabs.find(
      t => t.tag == geo.Tag || (tags && tags.some(tg => tg == t.tag))
    );
    if (!tab) {
      this.tabs.push({
        label: label,
        id: geo.Tag,
        tag: geo.Tag as any,
        items: []
      });
    } else {
      tab.items.push({
        label: geo.Name,
        id: geo.Id,
        level: "normal",
        tag: geo.Tag
      });
    }
  }
}

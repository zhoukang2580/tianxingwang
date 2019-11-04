import { TmcService } from "./../../../../tmc/tmc.service";
import { HotelService } from "./../../../hotel.service";
import { AppHelper } from "src/app/appHelper";
import { GeoEntity } from "./../../../models/GeoEntity";
import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
  OnDestroy
} from "@angular/core";
import { HotelConditionModel } from "src/app/hotel/models/ConditionModel";
import { HotelQueryEntity } from 'src/app/hotel/models/HotelQueryEntity';
import { Subscription } from 'rxjs';
export interface IGeoTab<T> {
  id: string;
  label: string;
  active?: boolean;
  hasFilterItem?: boolean;
  isMulti?: boolean;
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
export class HotelGeoComponent implements OnInit,OnDestroy {
  private conditionModel: HotelConditionModel;
  private subscription=Subscription.EMPTY;
  hotelQuery: HotelQueryEntity;
  @Output() geoFilterChange: EventEmitter<any>;
  secondaryItems: IGeoItem<GeoEntity>[];
  thirdItems: IGeoItem<GeoEntity>[];
  normalItems: IGeoItem<GeoEntity>[];
  constructor(private hotelService: HotelService) {
    this.geoFilterChange = new EventEmitter();
  }
  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
  async ngOnInit() {
   this.subscription= this.hotelService.getHotelQuerySource().subscribe(query=>{
      this.hotelQuery=query;
      console.log("geo filter ", this.hotelQuery);
      // this.conditionModel = await this.hotelService.getConditions();
      if (this.hotelQuery) {
        if (!this.hotelQuery.locationAreas){
          this.resetTabs();
        }else{
          this.onTabClick(this.hotelQuery.locationAreas[0]);
        }
      }
    })
  }
  onItemClick(item: IGeoItem<GeoEntity>, items: IGeoItem<GeoEntity>[]) {
    if (!item) {
      return;
    }
    const tab:IGeoTab<IGeoItem<GeoEntity>>=this.hotelQuery.locationAreas.find(it=>it.active);
    if (item.level == "second") {
      this.thirdItems = item.items;
    }
    if (items.filter(it => it.isSelected).length > 2) {
      AppHelper.toast(`${item.label}不能超过3个`, 1000, "middle");
      item.isSelected = false;
      return;
    }
    if (!item.isMulti) {
      if (items) {
        items.forEach(it => {
          it.isSelected = it.id == item.id;
          if (it.items) {
            it.items.forEach(k => {
              k.isSelected = k.id == item.id;
            });
          }
        });
      }
    } else {
      item.isSelected = !item.isSelected;
    }
    if(tab){
      if(this.thirdItems&&this.thirdItems.length){
        tab.hasFilterItem=this.thirdItems.some(it=>it.isSelected);
      }else{
        if(tab.items){
          tab.hasFilterItem=tab.items.some(it=>it.isSelected);
        }
      }
    }
  }
  private scrollListsToTop() {
    setTimeout(() => {
      const secondList = document.querySelector(".secondary-list");
      const thirdList = document.querySelector(".third-list");
      const normalList = document.querySelector(".normal-list");
      const sec = this.secondaryItems && this.secondaryItems.find(it => it.isSelected);
      this.scrollEleToView(secondList, sec && sec.id,this.secondaryItems&&this.secondaryItems.length);
      const third = this.thirdItems && this.thirdItems.find(it => it.isSelected);
      this.scrollEleToView(thirdList, third && third.id,this.thirdItems&&this.thirdItems.length);
      const nor = this.normalItems && this.normalItems.find(it => it.isSelected);
      this.scrollEleToView(normalList, nor && nor.id,this.normalItems&&this.normalItems.length);
    }, 300);
  }
  private scrollEleToView(container: Element, eleDataId: string, scrollItemsNum = 0) {
    if (container) {
      const ele = container.querySelector(`[dataid='${eleDataId}']`);
      const rect = ele && ele.getBoundingClientRect();
      const h = container.getBoundingClientRect() && container.getBoundingClientRect().height;
      if (ele && rect) {
        container.scrollBy({
          top: rect.top - h / 2,
          behavior: scrollItemsNum > 100 ? "auto" : "smooth"
        });
      } else {
        container.scrollTop = 0;
      }
    }
  }
  onTabClick(tab: IGeoTab<IGeoItem<GeoEntity>>) {
    if (!this.hotelQuery || !tab || !this.hotelQuery.locationAreas) {
      return;
    }
    this.hotelQuery.locationAreas = this.hotelQuery.locationAreas.map(t => {
      t.active = t.tag == tab.tag||t.id==tab.id;
      return t;
    });
    this.secondaryItems = tab.items || [];
    if (this.secondaryItems.some(it => it.items && it.items.length > 0)) {
      const s = this.secondaryItems.find(sec => sec.isSelected);
      if (!s) {
        this.secondaryItems[0].isSelected = true;
        this.thirdItems = this.secondaryItems[0].items;
      } else {
        this.thirdItems = s.items;
      }
    } else {
      this.normalItems = tab.items;
      this.secondaryItems = [];
      this.thirdItems = [];
    }
    this.scrollListsToTop();
  }
  private async resetTabs() {
    this.conditionModel = await this.hotelService.getConditions();
    this.hotelQuery.locationAreas = [];
    this.initMetros();
    this.initOtherTabs();
    if (this.hotelQuery.locationAreas && this.hotelQuery.locationAreas[0]) {
      this.onTabClick(this.hotelQuery.locationAreas[0]);
    }
  }
  async onReset() {
    if (this.hotelQuery) {
      this.hotelQuery.locationAreas = null;
      this.hotelService.setHotelQuerySource(this.hotelQuery);
      await this.resetTabs();
    }
  }
  onFilter() {
    this.geoFilterChange.emit();
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
    const mtros = Object.keys(metros);
    const metroTab: IGeoTab<IGeoItem<GeoEntity>> = {
      id: "metro",
      label: "地铁",
      tag: "Metro",
      items: mtros.map(line => {
        return {
          id: line,
          label: line,
          level: "second",
          tag: metros[line][0].Tag,
          items: metros[line].map(geo => {
            return {
              label: geo.Name,
              id: geo.Id,
              tag: geo.Tag,
              level: "third"
            } as IGeoItem<GeoEntity>;
          })
        } as IGeoItem<GeoEntity>;
      })
    };
    this.hotelQuery.locationAreas.push(metroTab);
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
    const geos = this.hotelQuery && this.hotelQuery.Geos || [];
    let tab = this.hotelQuery.locationAreas.find(
      t => t.tag == geo.Tag || (tags && tags.some(tg => tg == t.tag))
    );
    if (!tab) {
      tab = {
        label: label,
        id: geo.Id,
        tag: geo.Tag as any,
        items: [],
      };
      this.hotelQuery.locationAreas.push(tab);
    } else {
      tab.items.push({
        label: geo.Name,
        id: geo.Id,
        level: "normal",
        tag: geo.Tag,
        isSelected: !!geos.find(gid => gid == geo.Id)
      });
    }
    if (tab.isMulti) {
      tab.active = tab.items.some(it => it.isSelected);
    }
  }
}
export interface IMetros {
  hasItemSelected?: boolean;
  line: string;
  stops: {
    isSelected: boolean;
    stop: GeoEntity
  }[]
}
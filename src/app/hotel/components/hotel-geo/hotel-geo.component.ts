import { ModalController, DomController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ElementRef,
} from "@angular/core";
import { HotelConditionModel } from "src/app/hotel/models/ConditionModel";
import {
  HotelQueryEntity,
  IGeoItem,
  IGeoTab,
} from "src/app/hotel/models/HotelQueryEntity";
import { Subscription } from "rxjs";
import { GeoEntity } from "../../models/GeoEntity";
import { HotelService } from "../../hotel.service";
import { ThemeService } from "src/app/services/theme/theme.service";

@Component({
  selector: "app-hotel-geo",
  templateUrl: "./hotel-geo.component.html",
  styleUrls: ["./hotel-geo.component.scss"],
})
export class HotelGeoComponent implements OnInit, OnDestroy {
  @Input() langOpt = {
    determine: "确定",
    Reset: "重置",
  };
  private conditionModel: HotelConditionModel;
  private subscription = Subscription.EMPTY;
  hotelQuery: HotelQueryEntity;
  @Output() geoFilterChange: EventEmitter<any>;
  secondaryItems: IGeoItem<GeoEntity>[];
  thirdItems: IGeoItem<GeoEntity>[];
  normalItems: IGeoItem<GeoEntity>[];
  constructor(
    private hotelService: HotelService,
    private modalCtrl: ModalController,
    private domCtrl: DomController,
    private refEle:ElementRef<HTMLElement>,
    private themeService:ThemeService,
    
  ) {
    this.geoFilterChange = new EventEmitter();
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
  async ngOnInit() {
    this.subscription = this.hotelService
      .getHotelQuerySource()
      .subscribe((query) => {
        this.hotelQuery = query;
        // console.log("geo filter ", this.hotelQuery);
        // this.conditionModel = await this.hotelService.getConditions();
        if (!this.hotelQuery || !this.hotelQuery.locationAreas) {
          this.resetTabs();
        } else {
          this.onTabClick(
            this.hotelQuery.locationAreas.find((it) => it.active) ||
              this.hotelQuery.locationAreas[0]
          );
        }
      });
  }
  onItemClick(item: IGeoItem<GeoEntity>, items: IGeoItem<GeoEntity>[]) {
    if (!item) {
      return;
    }
    const tab: IGeoTab<IGeoItem<GeoEntity>> =
      this.hotelQuery &&
      this.hotelQuery.locationAreas &&
      this.hotelQuery.locationAreas.find((it) => it.active);
    this.hotelQuery.Geos = [];
    this.hotelQuery.locationAreas = this.hotelQuery.locationAreas.map((t) => {
      if (!t.active) {
        t.hasFilterItem = false;
        if (t.items) {
          t.items = t.items.map((m) => {
            m.isSelected = false;
            if (m.items) {
              m.items = m.items.map((s) => {
                s.isSelected = false;
                return s;
              });
            }
            return m;
          });
        }
      }
      return t;
    });
    if (item.level == "second") {
      this.thirdItems = item.items;
    }
    if (items.filter((it) => it.isSelected).length > 2) {
      AppHelper.toast(`${item.label}不能超过3个`, 1000, "middle");
      item.isSelected = false;
      return;
    }
    if (!item.isMulti) {
      if (items) {
        items.forEach((it) => {
          it.isSelected = it.id == item.id;
          if (it.items) {
            it.items.forEach((k) => {
              k.isSelected = k.id == item.id;
            });
          }
        });
      }
    } else {
      item.isSelected = !item.isSelected;
    }
    if (tab) {
      if (this.thirdItems && this.thirdItems.length) {
        tab.hasFilterItem = this.thirdItems.some((it) => it.isSelected);
      } else {
        if (tab.items) {
          tab.hasFilterItem = tab.items.some((it) => it.isSelected);
        }
      }
      // console.log(tab.label,tab.items.find(it=>it.isSelected).label,this.thirdItems.find(it=>it.isSelected).label,tab.hasFilterItem);
    }
  }
  private scrollListsToTop() {
    setTimeout(() => {
      const secondList = document.querySelector(".secondary-list");
      const thirdList = document.querySelector(".third-list");
      const normalList = document.querySelector(".normal-list");
      const sec =
        this.secondaryItems && this.secondaryItems.find((it) => it.isSelected);
      this.scrollEleToView(
        secondList,
        sec && sec.id,
        this.secondaryItems && this.secondaryItems.length
      );
      const third =
        this.thirdItems && this.thirdItems.find((it) => it.isSelected);
      this.scrollEleToView(
        thirdList,
        third && third.id,
        this.thirdItems && this.thirdItems.length
      );
      const nor =
        this.normalItems && this.normalItems.find((it) => it.isSelected);
      this.scrollEleToView(
        normalList,
        nor && nor.id,
        this.normalItems && this.normalItems.length
      );
    }, 300);
  }
  private scrollEleToView(
    container: Element,
    eleDataId: string,
    scrollItemsNum = 0
  ) {
    if (container) {
      this.domCtrl.read(() => {
        const ele = container.querySelector(`[dataid='${eleDataId}']`);
        const rect = ele && ele.getBoundingClientRect();
        const h =
          container.getBoundingClientRect() &&
          container.getBoundingClientRect().height;
        if (ele && rect) {
          container.scrollBy({
            top: rect.top - h / 2,
            behavior: scrollItemsNum > 50 ? "auto" : "smooth",
          });
        } else {
          container.scrollTop = 0;
        }
      });
    }
  }
  onTabClick(tab: IGeoTab<IGeoItem<GeoEntity>>) {
    if (!this.hotelQuery || !tab || !this.hotelQuery.locationAreas) {
      return;
    }
    this.hotelQuery.locationAreas = this.hotelQuery.locationAreas.map((t) => {
      t.active = t.tag == tab.tag || t.id == tab.id;
      return t;
    });
    this.secondaryItems = tab.items || [];
    if (this.secondaryItems.some((it) => it.items && it.items.length > 0)) {
      const s = this.secondaryItems.find((sec) => sec.isSelected);
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
    if (!this.hotelQuery || !this.conditionModel) {
      return;
    }
    console.log("resetTabs");
    this.hotelQuery.locationAreas = [];
    this.initMetros();
    this.initOtherTabs();
    const tab: IGeoTab<IGeoItem<GeoEntity>> =
      this.hotelQuery.locationAreas.find((it) => it.active) ||
      this.hotelQuery.locationAreas[0];
    this.onTabClick(tab);
    this.hotelService.setHotelQuerySource(this.hotelQuery);
  }
  async onReset() {
    if (this.hotelQuery) {
      this.hotelQuery.locationAreas = null;
      this.hotelQuery.Geos = [];
      this.hotelQuery.searchGeoId = "";
    }
    await this.resetTabs();
  }
  onFilter() {
    this.modalCtrl.getTop().then((t) => {
      if (t) {
        t.dismiss();
      }
    });
    this.geoFilterChange.emit();
  }
  private initMetros() {
    if (
      !this.conditionModel ||
      !this.conditionModel.Geos ||
      !this.hotelQuery ||
      !this.hotelQuery.locationAreas
    ) {
      return;
    }
    const metros = this.conditionModel.Geos.filter(
      (it) => it.Tag == "Metro"
    ).reduce((lines, metro) => {
      const line = metro.VariablesJsonObj && metro.VariablesJsonObj["SubName"];
      if (line) {
        if (lines[line]) {
          lines[line].push(metro);
        } else {
          lines[line] = [metro];
        }
      }
      return lines;
    }, {} as { [key: string]: GeoEntity[] });
    const mtros = Object.keys(metros);
    const metroTab: IGeoTab<IGeoItem<GeoEntity>> = {
      id: "metro",
      label: "地铁",
      tag: "Metro",
      items: mtros.map((line) => {
        return {
          id: line,
          label: line,
          level: "second",
          tag: metros[line][0].Tag,
          items: metros[line].map((geo) => {
            return {
              label: geo.Name,
              id: geo.Id,
              tag: geo.Tag,
              level: "third",
            } as IGeoItem<GeoEntity>;
          }),
        } as IGeoItem<GeoEntity>;
      }),
    };
    this.hotelQuery.locationAreas.push(metroTab);
  }
  private initOtherTabs() {
    if (!this.conditionModel || !this.conditionModel.Geos) {
      return;
    }
    this.conditionModel.Geos.filter(
      (it) =>
        it.Tag != "RailwayStation" &&
        it.Tag != "CarStation" &&
        it.Tag != "Airport" &&
        it.Tag != "Metro" &&
        it.Tag != "Group" &&
        it.Tag != "Company"
    ).forEach((geo) => {
      this.switchCase(geo);
    });
    if (this.conditionModel.Tmc && this.conditionModel.Tmc.GroupCompany) {
      this.conditionModel.Geos.filter(
        (it) =>
          (it.Tag == "Group" &&
            it.Number == this.conditionModel.Tmc.GroupCompany.Id) ||
          (it.Tag == "Company" && it.Number == this.conditionModel.Tmc.Id)
      ).forEach((geo) => this.switchCase(geo));
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
    if (!this.hotelQuery) {
      return;
    }
    const geos = (this.hotelQuery && this.hotelQuery.Geos) || [];
    let tab = this.hotelQuery.locationAreas.find(
      (t) => t.tag == geo.Tag || (tags && tags.some((tg) => tg == t.tag))
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
        isSelected: !!geos.find((gid) => gid == geo.Id),
      });
    }
    if (tab.isMulti) {
      tab.active = tab.items.some((it) => it.isSelected);
    }
  }
}

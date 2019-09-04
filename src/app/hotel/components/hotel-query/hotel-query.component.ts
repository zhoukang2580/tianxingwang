import { AmenityEntity } from "./../../models/AmenityEntity";
import {
  IFilterTab,
  IFilterTabItem,
  HotelFilterComponent
} from "./hotel-filter/hotel-filter.component";
import { HotelService } from "./../../hotel.service";
import { HotelQueryEntity } from "./../../models/HotelQueryEntity";
import { style } from "@angular/animations";
import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  Output,
  EventEmitter,
  ViewChild
} from "@angular/core";
import { trigger, transition, animate } from "@angular/animations";
import { ConditionModel } from "../../models/ConditionModel";
import { Storage } from "@ionic/storage";
import { IRankItem } from "./recommend-rank/recommend-rank.component";
import { QueryTabComponent } from "./query-tab/query-tab.component";
import { BrandEntity } from '../../models/BrandEntity';
interface ITab {
  label: string;
  id: string;
}
@Component({
  selector: "app-hotel-query",
  templateUrl: "./hotel-query.component.html",
  styleUrls: ["./hotel-query.component.scss"],
  animations: [
    trigger("flyInOut", [
      transition(
        ":enter",
        animate("1000ms", style({ opacity: 1, height: "*" }))
      ),
      transition(
        ":leave",
        animate("1000ms", style({ opacity: 0, height: "0" }))
      )
    ])
  ]
})
export class HotelQueryComponent implements OnInit {
  @Output() hotelQueryChange: EventEmitter<HotelQueryEntity>;
  @ViewChildren(QueryTabComponent) queryTabComps: QueryList<QueryTabComponent>;
  @ViewChild(HotelFilterComponent) hotelFilterComp: HotelFilterComponent;
  hotelQueryModel: HotelQueryEntity;
  conditions: ConditionModel;
  isActiveTab = false;
  activeTab: ITab;
  constructor(private hotelService: HotelService, private storage: Storage) {
    this.hotelQueryChange = new EventEmitter();
  }
  async onReset() {
    this.conditions = await this.storage.get("mock-hotel-condition");
    if (
      !this.conditions ||
      !this.conditions.Amenities ||
      !this.conditions.Brands ||
      !this.conditions.Geos
    ) {
      this.conditions = await this.hotelService
        .getConditions()
        .catch(_ => null);
      // console.log(JSON.stringify(this.conditions));
      if (this.conditions) {
        await this.storage.set("mock-hotel-condition", this.conditions);
      }
    }
    this.hotelQueryModel = new HotelQueryEntity();
    if (this.hotelFilterComp) {
      this.hotelFilterComp.onReset();
    }
    if (this.queryTabComps) {
      this.queryTabComps.forEach(it => {
        if (it) {
          it.onReset();
        }
      });
    }
  }
  onActiveTab(tab: ITab) {
    if (this.queryTabComps) {
      this.queryTabComps.forEach(comp => {
        comp.isActive = comp.label == tab.label;
      });
    }
    this.activeTab = tab;
  }
  onFilter(filter: IFilterTab<IFilterTabItem<BrandEntity | AmenityEntity>>[]) {
    console.log(filter);
    const theme = filter.find(it => it.tag == "Theme");
  }
  ngOnInit() {
    this.onReset();
  }
  onRank(tab: IRankItem) {
    this.hideQueryPannel();
  }
  private emitQueryModel() {
    this.hotelQueryChange.emit(this.hotelQueryModel);
  }
  private hideQueryPannel() {
    setTimeout(() => {
      this.activeTab = {
        label: "initial"
      } as any;
    }, 300);
  }
}

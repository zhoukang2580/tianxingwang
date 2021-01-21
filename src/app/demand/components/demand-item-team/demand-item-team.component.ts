import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import {
  FlightService,
  SearchFlightModel,
} from "src/app/flight/flight.service";
import { HotelCityService } from "src/app/hotel/hotel-city.service";
import { HotelService } from "src/app/hotel/hotel.service";
import { MapService } from "src/app/services/map/map.service";
import { CalendarService } from "src/app/tmc/calendar.service";
import {
  DemandService,
  DemandTeamModel,
  FlightType,
} from "../../demand.service";
import { MapSearchComponent } from "../map-search/map-search.component";

@Component({
  selector: "app-demand-item-team",
  templateUrl: "./demand-item-team.component.html",
  styleUrls: ["./demand-item-team.component.scss"],
})
export class DemandItemTeamComponent implements OnInit {
  searchFlightModel: SearchFlightModel;
  private curPos;
  @Input() demandTeamModel: DemandTeamModel;
  @Output() demandTeam: EventEmitter<any>;
  constructor(
    private apiservice: DemandService,
    private calendarService: CalendarService,
    private mapService: MapService
  ) {
    this.demandTeam = new EventEmitter();
  }

  ngOnInit() {
    this.onReset();
  }
  onReset() {
    this.demandTeamModel = {} as any;
    this.mapService
      .getCurMapPoint()
      .then((c) => {
        this.curPos = {
          ...c,
        };
        if (c && c.address) {
          this.demandTeamModel.FromAddress = `${c.address.province || ""}${c.address.city || ""
            }${c.address.district || ""}${c.address.street}`;
          this.demandTeamModel.ToAddress = `${c.address.province || ""}${c.address.city || ""
            }${c.address.district || ""}${c.address.street}`;
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }
  onSubmit() {
    try {
      if (this.demandTeamModel) {
        if (this.demandTeamModel.DepartureDate) {
          this.demandTeamModel.DepartureDate = this.demandTeamModel.DepartureDate.replace("T", " ").substring(
            0,
            10
          );
        }
        if (this.demandTeamModel.ReturnDate) {
          this.demandTeamModel.ReturnDate = this.demandTeamModel.ReturnDate.replace("T", " ").substring(
            0,
            10
          );
        }
      }
      if (this.demandTeamModel) {
        if (!this.demandTeamModel.LiaisonName) {
          AppHelper.alert("姓名不能为空");
          return;
        }
        if (!this.demandTeamModel.LiaisonPhone) {
          AppHelper.alert("电话不能为空");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!(reg.test(this.demandTeamModel.LiaisonPhone))) {
          AppHelper.alert("电话格式不正确");
          return;
        }

        if (!this.demandTeamModel.LiaisonEmail) {
          AppHelper.alert("邮箱不能为空");
          return;
        }

        const reg1 = /^\w+@[a-z0-9]+(\.[a-z]+){1,3}$/g;
        if (!(reg1.test(this.demandTeamModel.LiaisonEmail))) {
          AppHelper.alert("邮箱格式不正确");
          return;
        }

        if (!this.demandTeamModel.ProductType ||
          !this.demandTeamModel.FromAddress ||
          !this.demandTeamModel.ToAddress ||
          !this.demandTeamModel.DepartureDate ||
          !this.demandTeamModel.ReturnDate ||
          !this.demandTeamModel.PersonCount ||
          !this.demandTeamModel.PersonBudget ||
          !this.demandTeamModel.TravelType) {
          AppHelper.alert("请完善信息");
          return;
        }
      }
      this.demandTeam.emit({ demandTeamModel: this.demandTeamModel });
    } catch (e) {
      AppHelper.alert(e);
    }
  }

  async onSelectFromCity() {
    const m = await AppHelper.modalController.create({
      component: MapSearchComponent,
      componentProps: { curPos: this.curPos },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      this.demandTeamModel.FromAddress = `${c.address.province || ""}${c.address.city || ""
        }${c.address.district || ""}${c.address.street || c.address || ""}`;
    }
  }

  async onSelectToCity() {
    const m = await AppHelper.modalController.create({
      component: MapSearchComponent,
      componentProps: { curPos: this.curPos },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      this.demandTeamModel.ToAddress = `${c.address.province || ""}${c.address.city || ""
        }${c.address.district || ""}${c.address.street || c.address || ""}`;
    }
  }
}

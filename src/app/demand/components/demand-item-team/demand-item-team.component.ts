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
    this.demandTeamModel = {} as any;
    this.demandTeamModel.FromAddress = "上海";
    this.mapService
      .getCurMapPoint()
      .then((c) => {
        this.curPos = {
          ...c,
        };
        if (c && c.address) {
          this.demandTeamModel.FromAddress = `${c.address.province || ""}${
            c.address.city || ""
          }${c.address.district || ""}${c.address.street}`;
        }
      })
      .catch((e) => {
        console.error(e);
      });
    // this.onSubmit();
  }

  onSubmit() {
    this.demandTeam.emit({ demandTeamModel: this.demandTeamModel });
  }

  async onSelectCity(isFromCity = true) {
    // this.apiservice.onSelectCity(isFromCity);
    // if (!this.curPos) {
    //   this.curPos = await this.mapService.getCurMapPoint();
    // }
    const m = await AppHelper.modalController.create({
      component: MapSearchComponent,
      componentProps: { curPos: this.curPos },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      this.demandTeamModel.FromAddress = `${c.address.province || ""}${
        c.address.city || ""
      }${c.address.district || ""}${c.address.street || c.address || ""}`;
    }
  }

  async onOpenDate() {
    const r = await this.calendarService.openCalendar({
      goArrivalTime: "",
      isMulti: false,
      forType: null,
      beginDate: "",
      endDate: "",
    });
    if (r && r.length) {
      this.demandTeamModel.ReturnDate = r[0].date;
    }
  }
}

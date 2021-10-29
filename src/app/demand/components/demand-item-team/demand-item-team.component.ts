import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import {
  FlightService,
  SearchFlightModel,
} from "src/app/flight/flight.service";
import { HotelCityService } from "src/app/hotel/hotel-city.service";
import { HotelService } from "src/app/hotel/hotel.service";
import { MapService } from "src/app/services/map/map.service";
import { ThemeService } from "src/app/services/theme/theme.service";
import { CalendarService } from "src/app/tmc/calendar.service";
import {
  DemandService,
  DemandTeamModel,
  FlightType,
} from "../../demand.service";
import { DemandSearchComponent } from "../demand-search/demand-search.component";

@Component({
  selector: "app-demand-item-team",
  templateUrl: "./demand-item-team.component.html",
  styleUrls: ["./demand-item-team.component.scss"],
})
export class DemandItemTeamComponent implements OnInit {
  searchFlightModel: SearchFlightModel;
  @Input() demandTeamModel: DemandTeamModel;
  @Output() demandTeam: EventEmitter<any>;
  constructor(
    private apiservice: DemandService,
    private calendarService: CalendarService,
    private demandService: DemandService, // private mapService: MapService
    private refEle: ElementRef<HTMLElement>,
    private themeService: ThemeService,
  ) {
    this.demandTeam = new EventEmitter();
    this.themeService.getModeSource().subscribe(m => {
      if (m == 'dark') {
        this.refEle.nativeElement.classList.add("dark")
      } else {
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
  }

  ngOnInit() {
    this.onReset();
  }
  onReset() {
    this.demandTeamModel = {} as any;
  }
  onSubmit() {
    try {
      if (this.demandTeamModel) {
        if (this.demandTeamModel.DepartureDate) {
          this.demandTeamModel.DepartureDate = this.demandTeamModel.DepartureDate.replace(
            "T",
            " "
          ).substring(0, 10);
        }
        if (this.demandTeamModel.ReturnDate) {
          this.demandTeamModel.ReturnDate = this.demandTeamModel.ReturnDate.replace(
            "T",
            " "
          ).substring(0, 10);
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
        if (!reg.test(this.demandTeamModel.LiaisonPhone)) {
          AppHelper.alert("电话格式不正确");
          return;
        }

        if (!this.demandTeamModel.LiaisonEmail) {
          AppHelper.alert("邮箱不能为空");
          return;
        }

        const reg1 = /^\w+@[a-z0-9]+(\.[a-z]+){1,3}$/g;
        if (!reg1.test(this.demandTeamModel.LiaisonEmail)) {
          AppHelper.alert("邮箱格式不正确");
          return;
        }

        if (
          !this.demandTeamModel.ProductType ||
          !this.demandTeamModel.FromAddress ||
          !this.demandTeamModel.ToAddress ||
          !this.demandTeamModel.DepartureDate ||
          !this.demandTeamModel.ReturnDate ||
          !this.demandTeamModel.PersonCount ||
          !this.demandTeamModel.PersonBudget ||
          !this.demandTeamModel.TravelType
        ) {
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
    const cities = await this.demandService.getCities();
    const m = await AppHelper.modalController.create({
      component: DemandSearchComponent,
      componentProps: { dataSource: cities },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      this.demandTeamModel.FromAddress = `${c.Name}`;
      this.demandTeamModel.FromCityCode = `${c.Code}`;
    }
  }

  async onSelectToCity() {
    const cities = await this.demandService.getCities();
    const m = await AppHelper.modalController.create({
      component: DemandSearchComponent,
      componentProps: { dataSource: cities },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      this.demandTeamModel.ToAddress = `${c.Name}`;
      this.demandTeamModel.ToCityCode = `${c.Code}`;
    }
  }
}

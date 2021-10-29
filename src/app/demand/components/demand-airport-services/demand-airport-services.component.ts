import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { ThemeService } from "src/app/services/theme/theme.service";
import { CalendarService } from "src/app/tmc/calendar.service";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { DemandAirportServiceModel, DemandService } from "../../demand.service";
import { DemandSearchComponent } from "../demand-search/demand-search.component";

@Component({
  selector: "app-demand-airport-services",
  templateUrl: "./demand-airport-services.component.html",
  styleUrls: ["./demand-airport-services.component.scss"],
})
export class DemandAirportServicesComponent implements OnInit {
  @Input() demandAirportModel: DemandAirportServiceModel;
  @Output() demandAirport: EventEmitter<any>;
  airports: TrafficlineEntity[];
  airport: TrafficlineEntity;
  constructor(
    private calendarService: CalendarService,
    private demandService: DemandService,
    private refEle:ElementRef<HTMLElement>,
    private themeService:ThemeService,
  ) {
    this.demandAirport = new EventEmitter();
    this.themeService.getModeSource().subscribe(m=>{
      if(m=='dark'){
        this.refEle.nativeElement.classList.add("dark")
      }else{
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
  }

  ngOnInit() {
    this.demandAirportModel = {} as any;
    let date = new Date();
    this.demandAirportModel.DepartureDateDay = date.toLocaleDateString();
    this.demandAirportModel.DepartureDateHour = "12:30";
  }

  async onSelectCitys() {
    const cities = await this.demandService.getCities();
    const m = await AppHelper.modalController.create({
      component: DemandSearchComponent,
      componentProps: { dataSource: cities },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      this.demandAirportModel.City = `${c.Name}`;
      this.initAirports(true, c);
    }
  }
  private async initAirports(isFrom = true, c: TrafficlineEntity) {
    const airports = await this.demandService.getAirports();
    if (airports) {
      const arr = airports.filter((it) => it.CityCode == c.Code);
      console.log(arr, c.Code);

      if (isFrom) {
        this.airports = arr;
      } else {
        this.airports = arr;
      }
      this.airport = {} as any;
    }
  }
  onSubmit() {
    try {
      if (this.demandAirportModel) {
        if (this.demandAirportModel.DepartureDateDay) {
          this.demandAirportModel.DepartureDateDay = this.demandAirportModel.DepartureDateDay.replace(
            "T",
            " "
          ).substring(0, 10);
        }
      }
      if (this.airport) {
        this.demandAirportModel.AirportName = this.airport.Name;
      }
      if (this.demandAirportModel) {
        if (!this.demandAirportModel.LiaisonName) {
          AppHelper.alert("请输入联系人");
          return;
        }
        if (!this.demandAirportModel.LiaisonPhone) {
          AppHelper.alert("请输入联系电话");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!reg.test(this.demandAirportModel.LiaisonPhone)) {
          AppHelper.alert("电话格式不正确");
          return;
        }
        if (
          !this.demandAirportModel.ServiceType ||
          !this.demandAirportModel.AirportName ||
          !this.demandAirportModel.City ||
          !this.demandAirportModel.NumberOfPeople ||
          !this.demandAirportModel.Terminal ||
          !this.demandAirportModel.DepartureDateDay ||
          !this.demandAirportModel.DepartureDateHour
        ) {
          AppHelper.alert("请完善信息");
          return;
        }
      }
      this.demandAirport.emit({ demandAirportModel: this.demandAirportModel });
    } catch (e) {
      AppHelper.alert(e);
    }
  }
}

import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { MapService } from "src/app/services/map/map.service";
import { ThemeService } from "src/app/services/theme/theme.service";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import {
  CarType,
  DemandCharterCarModel,
  DemandDeliverFlightModel,
  DemandDeliverTrainModel,
  DemandPickUpFlightModel,
  DemandPickUpTrainModel,
  DemandService,
  OtherDemandModel,
} from "../../demand.service";
import { DemandSearchComponent } from "../demand-search/demand-search.component";

@Component({
  selector: "app-demand-item-car",
  templateUrl: "./demand-item-car.component.html",
  styleUrls: ["./demand-item-car.component.scss"],
})
export class DemandItemCarComponent implements OnInit {
  // carType = 'PickUpFlight' || 'DeliverFlight' || 'PickUpTrain' || 'DeliverTrain' || 'CharterCar';
  demandPickUpFlightModel: DemandPickUpFlightModel;
  demandDeliverFlightModel: DemandDeliverFlightModel;
  demandPickUpTrainModel: DemandPickUpTrainModel;
  demandDeliverTrainModel: DemandDeliverTrainModel;
  demandCharterCarModel: DemandCharterCarModel;
  otherDemandModel: OtherDemandModel;
  @Output() demandCar: EventEmitter<any>;
  fromAirports: any[];
  fromAirportCode: any[];
  toAirports: any[];
  toAirportCode: any[];
  fromStations: any[];
  toStations: any[];
  demandPickUpFlightAirport:any;
  demandPickUpTrainModelAirport:any;
  demandDeliverTrainModelAirport:any;
  CarType = CarType;
  demandCarType: CarType;
  constructor(
    private demandService: DemandService,
    private mapService: MapService,
    private refEle:ElementRef<HTMLElement>,
    private themeService:ThemeService,
  ) {
    this.demandCar = new EventEmitter();
    this.themeService.getModeSource().subscribe(m=>{
      if(m=='dark'){
        this.refEle.nativeElement.classList.add("dark")
      }else{
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
  }

  private seition;

  ngOnInit() {
    this.demandPickUpFlightModel = {} as any;
    this.demandDeliverFlightModel = {} as any;
    this.demandPickUpTrainModel = {} as any;
    this.demandDeliverTrainModel = {} as any;
    this.demandCharterCarModel = {} as any;
    this.otherDemandModel = {
      demandPickUpFlight: this.demandPickUpFlightModel,
      demandDeliverFlight: this.demandDeliverFlightModel,
      demandPickUpTrain: this.demandPickUpTrainModel,
      demandDeliverTrain: this.demandDeliverTrainModel,
      demandCharterCar: this.demandCharterCarModel,
    } as any;
    this.demandCarType = CarType.PickUpFlight;

    let date = new Date();
    this.demandPickUpFlightModel.FilghtDepartureDate = date.toLocaleDateString();
    this.demandDeliverFlightModel.DeliverFilghtDepartureDate = date.toLocaleDateString();
    this.demandDeliverFlightModel.DeliverFilghtDepartureTime = "12:30";
    this.demandPickUpTrainModel.PickUpUseCarDate = date.toLocaleDateString();
    this.demandPickUpTrainModel.PickUpUseCarTime = "12:30";
    this.demandDeliverTrainModel.DeliverUseCarDate = date.toLocaleDateString();
    this.demandDeliverTrainModel.DeliverUseCarTime = "12:30";
    this.demandCharterCarModel.CharterCarDate = date.toLocaleDateString();
    this.demandCharterCarModel.CharterCarTime = "12:30";
    if(this.demandPickUpFlightAirport){
      this.demandPickUpFlightAirport.Name = null;
    }
    if(this.demandPickUpTrainModelAirport){
      this.demandPickUpTrainModelAirport.Name = null;
    }
    if(this.demandDeliverTrainModelAirport){
      this.demandDeliverTrainModelAirport.Name = null;
    }
  }

  switchCarType(type: CarType) {
    this.demandCarType = type;
  }

  segmentChanged(evt: CustomEvent) {
    this.switchCarType(evt.detail.value);
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
      let temStr = `${c.Name}`;
      this.demandPickUpFlightModel.CityName = temStr;
      this.demandPickUpFlightModel.CityCode = c.Code;
      await this.initAirports(true, c);
    }
  }
  private async initAirports(isFrom = true, c: TrafficlineEntity) {
    const airports = await this.demandService.getAirports();
    if (airports) {
      const arr = airports.filter((it) => it.CityCode == c.Code);
      console.log(arr,c.Code);
      
      if (isFrom) {
        this.fromAirports = arr;
      } else {
        this.toAirports = arr;
      }
      if(this.demandPickUpFlightAirport){
        this.demandPickUpFlightAirport.Name = null;
      }
      
    }
  }
  async onSelectDetailCity() {
    const cities = await this.demandService.getCities();
    const m = await AppHelper.modalController.create({
      component: DemandSearchComponent,
      componentProps: { dataSource: cities },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      let temStr = `${c.Name}`;
      this.demandDeliverFlightModel.CityName = temStr;
      this.demandDeliverFlightModel.CityCode = c.Code;
      await this.initAirports(true, c);
    }
  }

  async onSelectPickUpCity() {
    const cities = await this.demandService.getCities();
    const m = await AppHelper.modalController.create({
      component: DemandSearchComponent,
      componentProps: { dataSource: cities },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      let temStr = `${c.Name}`;
      this.demandPickUpTrainModel.CityName = temStr;
      this.demandPickUpTrainModel.CityCode = c.Code;
      this.initStations(c, true);
    }
  }
  private async initStations(c: TrafficlineEntity, isFrom = true) {
    const stations = await this.demandService.getStations();
    if (stations) {
      const arr = stations.filter((it) => it.CityCode == c.Code);
      if (isFrom) {
        this.fromStations = arr;
      } else {
        this.toStations = arr;
      }
      if(this.demandPickUpTrainModelAirport){
        this.demandPickUpTrainModelAirport.Name = null;
      }
    }
  }
  private async initStation(c: TrafficlineEntity, isFrom = true) {
    const stations = await this.demandService.getStations();
    if (stations) {
      const arr = stations.filter((it) => it.CityCode == c.Code);
      if (isFrom) {
        this.fromStations = arr;
      } else {
        this.toStations = arr;
      }
      if(this.demandDeliverTrainModelAirport){
        this.demandDeliverTrainModelAirport.Name = null;
      }
    }
  }
  async onSelectDeliverCity() {
    const cities = await this.demandService.getCities();
    const m = await AppHelper.modalController.create({
      component: DemandSearchComponent,
      componentProps: { dataSource: cities },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      let temStr = `${c.Name}`;
      this.demandDeliverTrainModel.CityName = temStr;
      this.demandDeliverTrainModel.CityCode = c.Code;
      this.initStation(c, false);
    }
  }
  async onSelectStartCity() {
    const cities = await this.demandService.getCities();
    const m = await AppHelper.modalController.create({
      component: DemandSearchComponent,
      componentProps: { dataSource: cities },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      let temStr = `${c.Name}`;
      let temId = `${c.Id}`
      this.demandCharterCarModel.ServiceStartCity = temStr;
      this.demandCharterCarModel.ServiceStartCityId = temId;
    }
  }
  async onSelectEndCity() {
    const cities = await this.demandService.getCities();
    const m = await AppHelper.modalController.create({
      component: DemandSearchComponent,
      componentProps: { dataSource: cities },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      let temStr = `${c.Name}`;
      let temId = `${c.Id}`
      this.demandCharterCarModel.ServiceEndCity = temStr;
      this.demandCharterCarModel.ServiceEndCityId = temId;
    }
  }

  onSubmit() {
    let type: CarType;
    if (this.demandPickUpFlightModel) {
      if (this.demandPickUpFlightModel.FilghtDepartureDate) {
        this.demandPickUpFlightModel.FilghtDepartureDate = this.demandPickUpFlightModel.FilghtDepartureDate.replace(
          "T",
          " "
        ).substring(0, 10);
      }
    }
    if (this.demandCarType == CarType.PickUpFlight) {
      if (this.demandPickUpFlightModel) {
        if (!this.demandPickUpFlightModel.LiaisonName) {
          AppHelper.alert("请输入联系人");
          return;
        }
        if (!this.demandPickUpFlightModel.LiaisonPhone) {
          AppHelper.alert("请输入手机号");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!reg.test(this.demandPickUpFlightModel.LiaisonPhone)) {
          AppHelper.alert("电话格式不正确");
          return;
        }
        if (
          !this.demandPickUpFlightModel.CityName ||
          !this.demandPickUpFlightModel.FilghtDepartureDate ||
          !this.demandPickUpFlightModel.FlightNumber ||
          !this.demandPickUpFlightModel.Remarks ||
          !this.demandPickUpFlightAirport||
          !this.demandPickUpFlightAirport.Name ||
          !this.demandPickUpFlightAirport.Code
        ) {
          AppHelper.alert("请完善信息");
          return;
        }
      }
      this.demandPickUpFlightModel.AirportName = this.demandPickUpFlightAirport.Name;
      this.demandPickUpFlightModel.AirportCode = this.demandPickUpFlightAirport.Code;
      type = CarType.PickUpFlight;
    } else if (this.demandCarType == CarType.DeliverFlight) {
      if (this.demandDeliverFlightModel) {
        if (!this.demandDeliverFlightModel.LiaisonName) {
          AppHelper.alert("请输入联系人");
          return;
        }
        if (!this.demandDeliverFlightModel.LiaisonPhone) {
          AppHelper.alert("请输入手机号");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!reg.test(this.demandDeliverFlightModel.LiaisonPhone)) {
          AppHelper.alert("电话格式不正确");
          return;
        }
        if (
          !this.demandDeliverFlightModel.CityName ||
          !this.demandDeliverFlightModel.DeliverFilghtDepartureDate ||
          !this.demandDeliverFlightModel.FlightNumber ||
          !this.demandDeliverFlightModel.Remarks
        ) {
          AppHelper.alert("请完善信息");
          return;
        }
      }
      type = CarType.DeliverFlight;
    } else if (this.demandCarType == CarType.PickUpTrain) {
      if (this.demandPickUpTrainModel) {
        if (!this.demandPickUpTrainModel.LiaisonName) {
          AppHelper.alert("请输入联系人");
          return;
        }
        if (!this.demandPickUpTrainModel.LiaisonPhone) {
          AppHelper.alert("请输入手机号");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!reg.test(this.demandPickUpTrainModel.LiaisonPhone)) {
          AppHelper.alert("电话格式不正确");
          return;
        }
        if (
          !this.demandPickUpTrainModel.CityName ||
          !this.demandPickUpTrainModel.PickUpUseCarDate ||
          !this.demandPickUpTrainModel.Address ||
          !this.demandPickUpTrainModel.PickUpUseCarTime ||
          !this.demandPickUpTrainModelAirport ||
          !this.demandPickUpTrainModelAirport.Name ||
          !this.demandPickUpTrainModelAirport.Code
        ) {
          AppHelper.alert("请完善信息");
          return;
        }
        this.demandPickUpTrainModel.TrainStationName = this.demandPickUpTrainModelAirport.Name;
        this.demandPickUpTrainModel.TrainStationCode = this.demandPickUpTrainModelAirport.Code;
      }
      type = CarType.PickUpTrain;
    } else if (this.demandCarType == CarType.DeliverTrain) {
      if (this.demandPickUpTrainModel) {
        if (!this.demandDeliverTrainModel.LiaisonName) {
          AppHelper.alert("请输入联系人");
          return;
        }
        if (!this.demandDeliverTrainModel.LiaisonPhone) {
          AppHelper.alert("请输入手机号");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!reg.test(this.demandDeliverTrainModel.LiaisonPhone)) {
          AppHelper.alert("电话格式不正确");
          return;
        }
        if (
          !this.demandDeliverTrainModel.CityName ||
          !this.demandDeliverTrainModel.DeliverUseCarDate ||
          !this.demandDeliverTrainModel.DeliverUseCarTime ||
          !this.demandDeliverTrainModel.Address ||
          !this.demandDeliverTrainModelAirport ||
          !this.demandDeliverTrainModelAirport.Name ||
          !this.demandDeliverTrainModelAirport.Code
        ) {
          AppHelper.alert("请完善信息");
          return;
        }
        this.demandDeliverTrainModel.TrainStationName = this.demandDeliverTrainModelAirport.Name;
        this.demandDeliverTrainModel.TrainStationCode = this.demandDeliverTrainModelAirport.Code;
      }
      type = CarType.DeliverTrain;
    } else if (this.demandCarType == CarType.CharterCar) {
      if (this.demandCharterCarModel) {
        if (!this.demandCharterCarModel.LiaisonName) {
          AppHelper.alert("请输入联系人");
          return;
        }
        if (!this.demandCharterCarModel.LiaisonPhone) {
          AppHelper.alert("请输入手机号");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!reg.test(this.demandCharterCarModel.LiaisonPhone)) {
          AppHelper.alert("电话格式不正确");
          return;
        }
        if (
          !this.demandCharterCarModel.CharterCarDate ||
          !this.demandCharterCarModel.CharterCarDays ||
          !this.demandCharterCarModel.CharterCarType ||
          !this.demandCharterCarModel.ServiceEndCity ||
          !this.demandCharterCarModel.ServiceStartCity
        ) {
          AppHelper.alert("请完善信息");
          return;
        }
      }
      type = CarType.CharterCar;
    }
    
    this.demandCar.emit({ data: this.otherDemandModel, type });
  }
}

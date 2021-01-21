import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { MapService } from 'src/app/services/map/map.service';
import { CarType, DemandCharterCarModel, DemandDeliverFlightModel, DemandDeliverTrainModel, DemandPickUpFlightModel, DemandPickUpTrainModel, OtherDemandModel } from '../../demand.service';
import { MapSearchComponent } from '../map-search/map-search.component';

@Component({
  selector: 'app-demand-item-car',
  templateUrl: './demand-item-car.component.html',
  styleUrls: ['./demand-item-car.component.scss'],
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
  private curPos;
  CarType = CarType;
  demandCarType: CarType;
  constructor(
    private mapService: MapService
  ) {
    this.demandCar = new EventEmitter();
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
      demandCharterCar: this.demandCharterCarModel
    } as any;
    this.demandCarType = CarType.PickUpFlight;

    let date = new Date();
    this.demandPickUpFlightModel.FilghtDepartureDate = date.toLocaleDateString();
    this.demandDeliverFlightModel.DeliverFilghtDepartureDate = date.toLocaleDateString();
    this.demandDeliverFlightModel.DeliverFilghtDepartureTime = '12:30';
    this.demandPickUpTrainModel.PickUpUseCarDate = date.toLocaleDateString();
    this.demandPickUpTrainModel.PickUpUseCarTime = '12:30';
    this.demandDeliverTrainModel.DeliverUseCarDate = date.toLocaleDateString();
    this.demandDeliverTrainModel.DeliverUseCarTime = '12:30';
    this.demandCharterCarModel.CharterCarDate = date.toLocaleDateString();
    this.demandCharterCarModel.CharterCarTime = '12:30';

    this.mapService
      .getCurMapPoint()
      .then((c) => {
        let temStr = `${c.address.province || ""}${c.address.city || ""
          }${c.address.district || ""}${c.address.street}`;
        this.curPos = {
          ...c,
        };
        if (c && c.address) {
          this.demandPickUpFlightModel.CityName = temStr;

          this.demandDeliverFlightModel.Address = temStr;

          this.demandPickUpTrainModel.Address = temStr;

          this.demandDeliverTrainModel.Address = temStr;

          this.demandCharterCarModel.ServiceStartCity = temStr;

          this.demandCharterCarModel.ServiceEndCity = temStr;
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

  switchCarType(type: CarType) {
    this.demandCarType = type;
  }

  segmentChanged(evt: CustomEvent) {
    this.switchCarType(evt.detail.value);
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
      let temStr = `${c.address.province || ""}${c.address.city || ""
        }${c.address.district || ""}${c.address.street || c.address || ""}`;
      this.demandPickUpFlightModel.CityName = temStr;
    }
  }

  async onSelectDetailCity(){
    const m = await AppHelper.modalController.create({
      component: MapSearchComponent,
      componentProps: { curPos: this.curPos },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      let temStr = `${c.address.province || ""}${c.address.city || ""
        }${c.address.district || ""}${c.address.street || c.address || ""}`;
      this.demandDeliverFlightModel.Address = temStr;
      }
  }
  
  async onSelectPickUpCity(){
    const m = await AppHelper.modalController.create({
      component: MapSearchComponent,
      componentProps: { curPos: this.curPos },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      let temStr = `${c.address.province || ""}${c.address.city || ""
        }${c.address.district || ""}${c.address.street || c.address || ""}`;
      this.demandPickUpTrainModel.Address = temStr;
      }
  }

  async onSelectDeliverCity(){
    const m = await AppHelper.modalController.create({
      component: MapSearchComponent,
      componentProps: { curPos: this.curPos },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      let temStr = `${c.address.province || ""}${c.address.city || ""
        }${c.address.district || ""}${c.address.street || c.address || ""}`;
      this.demandDeliverTrainModel.Address = temStr;
      }
  }
  async onSelectStartCity(){
    const m = await AppHelper.modalController.create({
      component: MapSearchComponent,
      componentProps: { curPos: this.curPos },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      let temStr = `${c.address.province || ""}${c.address.city || ""
        }${c.address.district || ""}${c.address.street || c.address || ""}`;
        this.demandCharterCarModel.ServiceStartCity = temStr;
      }
  }
  async onSelectEndCity(){
    const m = await AppHelper.modalController.create({
      component: MapSearchComponent,
      componentProps: { curPos: this.curPos },
    });
    m.present();
    const d = await m.onDidDismiss();
    if (d && d.data) {
      const c = d.data;
      let temStr = `${c.address.province || ""}${c.address.city || ""
        }${c.address.district || ""}${c.address.street || c.address || ""}`;
        this.demandCharterCarModel.ServiceEndCity = temStr;
      }
  }

  

  onSubmit() {
    let type: CarType;
    if (this.demandCarType == CarType.PickUpFlight) {
      if(this.demandPickUpFlightModel){
        if(!this.demandPickUpFlightModel.LiaisonName){
          AppHelper.alert("请输入联系人");
          return;
        }
        if(!this.demandPickUpFlightModel.LiaisonPhone){
          AppHelper.alert("请输入手机号");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!(reg.test(this.demandPickUpFlightModel.LiaisonPhone))) {
          AppHelper.alert("电话格式不正确");
          return;
        }
        if(!this.demandPickUpFlightModel.CityName ||
          !this.demandPickUpFlightModel.FilghtDepartureDate ||
          !this.demandPickUpFlightModel.FlightNumber ||
          !this.demandPickUpFlightModel.Remarks){
          AppHelper.alert("请完善信息");
          return;
        }
      }
      type = CarType.PickUpFlight;
    } else if (this.demandCarType == CarType.DeliverFlight) {
      if(this.demandDeliverFlightModel){
        if(!this.demandDeliverFlightModel.LiaisonName){
          AppHelper.alert("请输入联系人");
          return;
        }
        if(!this.demandDeliverFlightModel.LiaisonPhone){
          AppHelper.alert("请输入手机号");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!(reg.test(this.demandDeliverFlightModel.LiaisonPhone))) {
          AppHelper.alert("电话格式不正确");
          return;
        }
        if(!this.demandDeliverFlightModel.CityName ||
          !this.demandDeliverFlightModel.DeliverFilghtDepartureDate ||
          !this.demandDeliverFlightModel.FlightNumber ||
          !this.demandDeliverFlightModel.Remarks){
          AppHelper.alert("请完善信息");
          return;
        }
      }
      type = CarType.DeliverFlight;
    } else if (this.demandCarType == CarType.PickUpTrain) {
      if(this.demandPickUpTrainModel){
        if(!this.demandPickUpTrainModel.LiaisonName){
          AppHelper.alert("请输入联系人");
          return;
        }
        if(!this.demandPickUpTrainModel.LiaisonPhone){
          AppHelper.alert("请输入手机号");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!(reg.test(this.demandPickUpTrainModel.LiaisonPhone))) {
          AppHelper.alert("电话格式不正确");
          return;
        }
        if(!this.demandPickUpTrainModel.CityName ||
          !this.demandPickUpTrainModel.PickUpUseCarDate ||
          !this.demandPickUpTrainModel.TrainStationName ||
          !this.demandPickUpTrainModel.Remarks||
          !this.demandPickUpTrainModel.Address||
          !this.demandPickUpTrainModel.PickUpUseCarTime){
          AppHelper.alert("请完善信息");
          return;
        }
      }
      type = CarType.PickUpTrain;
    } else if (this.demandCarType == CarType.DeliverTrain) {
      if(this.demandPickUpTrainModel){
        if(!this.demandDeliverTrainModel.LiaisonName){
          AppHelper.alert("请输入联系人");
          return;
        }
        if(!this.demandDeliverTrainModel.LiaisonPhone){
          AppHelper.alert("请输入手机号");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!(reg.test(this.demandDeliverTrainModel.LiaisonPhone))) {
          AppHelper.alert("电话格式不正确");
          return;
        }
        if(!this.demandDeliverTrainModel.CityName ||
          !this.demandDeliverTrainModel.DeliverUseCarDate ||
          !this.demandDeliverTrainModel.TrainStationName ||
          !this.demandDeliverTrainModel.Remarks||
          !this.demandDeliverTrainModel.Address||
          !this.demandDeliverTrainModel.DeliverUseCarTime){
          AppHelper.alert("请完善信息");
          return;
        }
      }
      type = CarType.DeliverTrain;
    } else if (this.demandCarType == CarType.CharterCar) {
      if(this.demandCharterCarModel){
        if(!this.demandCharterCarModel.LiaisonName){
          AppHelper.alert("请输入联系人");
          return;
        }
        if(!this.demandCharterCarModel.LiaisonPhone){
          AppHelper.alert("请输入手机号");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!(reg.test(this.demandCharterCarModel.LiaisonPhone))) {
          AppHelper.alert("电话格式不正确");
          return;
        }
        if(!this.demandCharterCarModel.CharterCarDate ||
          !this.demandCharterCarModel.CharterCarDays ||
          !this.demandCharterCarModel.CharterCarType ||
          !this.demandCharterCarModel.Remarks||
          !this.demandCharterCarModel.ServiceEndCity||
          !this.demandCharterCarModel.ServiceStartCity){
          AppHelper.alert("请完善信息");
          return;
        }
      }
      type = CarType.CharterCar
    }
    this.demandCar.emit({ data: this.otherDemandModel, type });
  }
}

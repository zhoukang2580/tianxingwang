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
    this.demandPickUpFlightModel.CityName = '上海市';
    this.demandDeliverFlightModel.DeliverFilghtDepartureDate = 'MU006'
    this.demandDeliverFlightModel.DeliverFilghtDepartureDate = date.toLocaleDateString();
    this.demandDeliverFlightModel.DeliverFilghtDepartureTime = '12:30';
    this.demandDeliverFlightModel.Address = '上海市';
    this.demandPickUpTrainModel.PickUpUseCarDate = date.toLocaleDateString();
    this.demandPickUpTrainModel.PickUpUseCarTime = '12:30';
    this.demandPickUpTrainModel.Address = '上海市';
    this.demandDeliverTrainModel.DeliverUseCarDate = date.toLocaleDateString();
    this.demandDeliverTrainModel.DeliverUseCarTime = '12:30';
    this.demandDeliverTrainModel.Address = '上海市';
    this.demandCharterCarModel.CharterCarDate = date.toLocaleDateString();
    this.demandCharterCarModel.CharterCarTime = '12:30';
    this.demandCharterCarModel.ServiceStartCity = '上海市徐汇区肇嘉浜路376号';
    this.demandCharterCarModel.ServiceEndCity = '上海市徐汇区肇嘉浜路376号';

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
      type = CarType.PickUpFlight;
    } else if (this.demandCarType == CarType.DeliverFlight) {
      type = CarType.DeliverFlight;
    } else if (this.demandCarType == CarType.PickUpTrain) {
      type = CarType.PickUpTrain;
    } else if (this.demandCarType == CarType.DeliverTrain) {
      type = CarType.DeliverTrain;
    } else if (this.demandCarType == CarType.CharterCar) {
      type = CarType.CharterCar
    }
    this.demandCar.emit({ data: this.otherDemandModel, type });
  }
}

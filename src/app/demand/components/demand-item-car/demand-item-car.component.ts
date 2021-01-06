import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { MapService } from 'src/app/services/map/map.service';
import { DemandCharterCarModel, DemandDeliverFlightModel, DemandDeliverTrainModel, DemandPickUpFlightModel, DemandPickUpTrainModel } from '../../demand.service';
import { MapSearchComponent } from '../map-search/map-search.component';

@Component({
  selector: 'app-demand-item-car',
  templateUrl: './demand-item-car.component.html',
  styleUrls: ['./demand-item-car.component.scss'],
})
export class DemandItemCarComponent implements OnInit {

  carType = 'PickUpFlight' || 'DeliverFlight' || 'PickUpTrain' || 'DeliverTrain' || 'CharterCar';
  @Input() demandPickUpFlightModel:DemandPickUpFlightModel;
  @Input() demandDeliverFlightModel:DemandDeliverFlightModel;
  @Input() demandPickUpTrainModel:DemandPickUpTrainModel;
  @Input() demandDeliverTrainModel:DemandDeliverTrainModel;
  @Input() demandCharterCarModel:DemandCharterCarModel;
  @Output() demandCar: EventEmitter<any>;
  private curPos;
  constructor(
    private mapService:MapService
  ) { }

  ngOnInit() {
    this.demandPickUpFlightModel = {} as any;
    this.demandDeliverFlightModel = {} as any;
    this.demandPickUpTrainModel = {} as any;
    this.demandDeliverTrainModel = {} as any;
    this.demandCharterCarModel = {} as any;

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
    this.demandCharterCarModel.ServiceStartCity = '上海市徐汇区肇嘉浜路376号';
    this.mapService
      .getCurMapPoint()
      .then((c) => {
        this.curPos = {
          ...c,
        };
        if (c && c.address) {
          this.demandPickUpFlightModel.CityName = `${c.address.province || ""}${
            c.address.city || ""
          }${c.address.district || ""}${c.address.street}`;
          
          this.demandDeliverFlightModel.Address = `${c.address.province || ""}${
            c.address.city || ""
          }${c.address.district || ""}${c.address.street}`;

          this.demandPickUpTrainModel.Address = `${c.address.province || ""}${
            c.address.city || ""
          }${c.address.district || ""}${c.address.street}`;

          this.demandDeliverTrainModel.Address = `${c.address.province || ""}${
            c.address.city || ""
          }${c.address.district || ""}${c.address.street}`;

          this.demandCharterCarModel.ServiceStartCity = `${c.address.province || ""}${
            c.address.city || ""
          }${c.address.district || ""}${c.address.street}`;

          this.demandCharterCarModel.ServiceEndCity = `${c.address.province || ""}${
            c.address.city || ""
          }${c.address.district || ""}${c.address.street}`;  
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

  switchCarType(type: string) {
    this.carType = type;
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
      this.demandPickUpFlightModel.CityName = `${c.address.province || ""}${
        c.address.city || ""
      }${c.address.district || ""}${c.address.street || c.address || ""}`;

      this.demandDeliverFlightModel.Address = `${c.address.province || ""}${
        c.address.city || ""
      }${c.address.district || ""}${c.address.street || c.address || ""}`;

      this.demandPickUpTrainModel.Address = `${c.address.province || ""}${
        c.address.city || ""
      }${c.address.district || ""}${c.address.street || c.address || ""}`;

      this.demandDeliverTrainModel.Address = `${c.address.province || ""}${
        c.address.city || ""
      }${c.address.district || ""}${c.address.street || c.address || ""}`;

      this.demandCharterCarModel.ServiceStartCity = `${c.address.province || ""}${
        c.address.city || ""
      }${c.address.district || ""}${c.address.street || c.address || ""}`;

      this.demandCharterCarModel.ServiceEndCity = `${c.address.province || ""}${
        c.address.city || ""
      }${c.address.district || ""}${c.address.street || c.address || ""}`;
    }
  }

  onSubmit(){
    if(this.carType = 'PickUpFlght'){
      this.demandCar.emit({demandPickUpFlightModel:this.demandPickUpFlightModel});
    }else if(this.carType = 'DeliverFlight'){
      this.demandCar.emit({demandDeliverFlightModel:this.demandDeliverFlightModel});
    }else if(this.carType = 'PickUpTrain'){
      this.demandCar.emit({demandPickUpTrainModel:this.demandPickUpTrainModel});
    }else if(this.carType = 'DeliverTrain'){
      this.demandCar.emit({demandDeliverFlightModel:this.demandDeliverFlightModel});
    }else{
      this.demandCar.emit({demandCharterCarModel:this.demandCharterCarModel});
    }
  }
}

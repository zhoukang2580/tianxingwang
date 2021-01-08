import { Component, OnInit } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { CarType, DemandService, DemandTeamModel, FlightType, OtherDemandModel } from '../demand.service';

@Component({
  selector: 'app-demand-list',
  templateUrl: './demand-list.page.html',
  styleUrls: ['./demand-list.page.scss'],
})
export class DemandListPage implements OnInit {
  teams: {
    Tag: string,
    DemandType: FlightType,
    Demand: any,
  }
  demandTeamModel: DemandTeamModel;

  DemandCarType: string;

  // carType = 'PickUpFlight' || 'DeliverFlight' || 'PickUpTrain' || 'DeliverTrain' || 'CharterCar';
  CarType = CarType;

  otherDemandModel: OtherDemandModel;
  FlightType = FlightType;
  constructor(
    private apiservice: DemandService
  ) { }

  ngOnInit() {
    this.demandTeamModel = {} as any;
    // this.otherDemandModel = {} as any;
    // this.otherDemandModel.demandTeam = {} as any;

    this.teams = {
      Tag: '',
      DemandType: FlightType.TeamDemand,
      Demand: this.demandTeamModel
    }
  }

  getListType(type: FlightType) {
    this.teams.DemandType = type;
  }

  segmentChanged(evt: CustomEvent) {
    this.getListType(evt.detail.value);
  }


  async onTeamSubmit(obj) {
    try {
      let teams = {
        ...this.teams,
        Demand: { ...obj.demandTeamModel, ProductType: (obj.demandTeamModel.ProductType || []).join(',') }
      }
      this.apiservice.saveDemand(teams);
      AppHelper.alert('添加成功');
      console.log(obj.demandTeamModel, this.teams.Demand);
      console.log("========================");
      console.log(obj.demandTeamModel.LiaisonName);
      obj.demandTeamModel.LiaisonName = "";
      this.teams = {
        Tag: '',
        DemandType: FlightType.TeamDemand,
        Demand: this.demandTeamModel
      }
    } catch (e) {
      AppHelper.alert(e)
    }
  }

  async onTourSubmit(obj) {
    try {
      this.teams.Demand = obj.demandTourModel;
      this.apiservice.saveDemand(this.teams);
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  async onVisaSubmit(obj) {
    try {
      this.teams.Demand = obj.demandVisaModel;
      this.apiservice.saveDemand(this.teams);
    } catch (e) {
      AppHelper.alert(e);
    }
  }

  async onAirportSubmit(obj) {
    try {
      this.teams.Demand = obj.DemandAirportServiceModel;
      this.apiservice.saveDemand(this.teams);
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  async onCarSubmit(obj) {
    try {
      const type = obj.type;
      const data: OtherDemandModel = obj.data;
      this.teams.Tag = type || "";
      if (type == this.CarType.PickUpFlight) {
        this.teams.Demand = data.demandPickUpFlight;
      } else if (type == this.CarType.DeliverFlight) {
        this.teams.Demand = data.demandDeliverFlight;
      } else if (type == this.CarType.PickUpTrain) {
        this.teams.Demand = data.demandPickUpTrain;
      } else if (type == this.CarType.DeliverTrain) {
        this.teams.Demand = data.demandDeliverTrain;
      } else if (type == this.CarType.CharterCar) {
        this.teams.Demand = data.demandCharterCar;
      }
      this.apiservice.saveDemand(this.teams);
    } catch (e) {
      AppHelper.alert(e)
    }
  }
}

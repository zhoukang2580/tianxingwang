import { Component, OnInit, ViewChild } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { DemandItemMeetingComponent } from '../components/demand-item-meeting/demand-item-meeting.component';
import { DemandItemTeamComponent } from '../components/demand-item-team/demand-item-team.component';
import { CarType, DemandService, DemandTeamModel, FlightType, OtherDemandModel } from '../demand.service';

@Component({
  selector: 'app-demand-list',
  templateUrl: './demand-list.page.html',
  styleUrls: ['./demand-list.page.scss'],
})
export class DemandListPage implements OnInit {
  @ViewChild(DemandItemTeamComponent)tcomp:DemandItemTeamComponent;
  @ViewChild(DemandItemMeetingComponent)tcomp2:DemandItemMeetingComponent;
  @ViewChild(DemandItemMeetingComponent)tcomp3:DemandItemMeetingComponent;
  @ViewChild(DemandItemMeetingComponent)tcomp4:DemandItemMeetingComponent;
  @ViewChild(DemandItemMeetingComponent)tcomp5:DemandItemMeetingComponent;
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

  private onReset(){
    if(this.tcomp){
      this.tcomp.onReset();
    }else if(this.tcomp2){
      this.tcomp2.ngOnInit();
    }
  }
  async onTeamSubmit(obj) {
    try {
      let teams = {
        ...this.teams,
        Demand: { ...obj.demandTeamModel, ProductType: (obj.demandTeamModel.ProductType || []).join(',') }
      }
      this.apiservice.saveDemand(teams);
      AppHelper.alert('添加成功');
      this.onReset();
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

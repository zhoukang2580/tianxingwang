import { Component, OnInit } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { DemandService, DemandTeamModel, FlightType, OtherDemandModel } from '../demand.service';

@Component({
  selector: 'app-demand-list',
  templateUrl: './demand-list.page.html',
  styleUrls: ['./demand-list.page.scss'],
})
export class DemandListPage implements OnInit {
  teams: {
    Tag: string,
    DemandType: number,
    Demand: any,
  }
  demandTeamModel: DemandTeamModel;

  otherDemandModel: OtherDemandModel;
  FlightType = FlightType;
  constructor(
    private apiservice: DemandService
  ) { }

  ngOnInit() {
    this.demandTeamModel = {} as any;
    this.otherDemandModel = {} as any;
    this.otherDemandModel.demandTeam = {} as any;
    this.teams = {
      Tag: '',
      DemandType: FlightType.TeamDemand,
      Demand: this.demandTeamModel
    }

    if (this.teams.DemandType == 9) {
      this.teams = {
        Tag: '',
        DemandType: FlightType.TourDemand,
        Demand: this.otherDemandModel.demandTour
      }
    }else if (this.teams.DemandType == 10) {
      this.teams = {
        Tag: '',
        DemandType: FlightType.VisaDemand,
        Demand: this.otherDemandModel.demandVisa
      }
    }else if (this.teams.DemandType == 12) {
      this.teams = {
        Tag: '',
        DemandType: FlightType.AirportDemand,
        Demand: this.otherDemandModel.demandAirportService
      }
    }
  }

  getListType(type: number) {
    this.teams.DemandType = type;
  }

  segmentChanged(evt: CustomEvent) {
    this.getListType(evt.detail.value);
  }


  async onTeamSubmit(obj) {
    try {
      // let type = this.teams.DemandType;
      // this.teams.Demand=obj.demandTeamModel;
      // if(type == 8){
      let teams = {
        ...this.teams,
        Demand: { ...obj.demandTeamModel, ProductType: (obj.demandTeamModel.ProductType || []).join(',') }
      }
      // }
      this.apiservice.saveDemand(teams);
      teams = null;
    } catch (e) {
      console.error(e)
    }
  }

  async onMeetingSubmit(obj) {
    try {
      let type = this.teams.DemandType;
      if(type == 9){
        this.teams.Demand = obj.demandTourModel;
      }else if(type == 10){
        this.teams.Demand = obj.demandVisaModel;
      }else if(type == 12){
        this.teams.Demand = obj.DemandAirportServiceModel;
      }
      this.apiservice.saveDemand(this.teams);
    } catch (e) {
      AppHelper.alert(e);
    }
  }
}

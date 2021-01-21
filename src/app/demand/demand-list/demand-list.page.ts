import { Component, OnInit, ViewChild } from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { DemandAirportServicesComponent } from "../components/demand-airport-services/demand-airport-services.component";
import { DemandItemCarComponent } from "../components/demand-item-car/demand-item-car.component";
import { DemandItemMeetingComponent } from "../components/demand-item-meeting/demand-item-meeting.component";
import { DemandItemTeamComponent } from "../components/demand-item-team/demand-item-team.component";
import { DemandItemVisaComponent } from "../components/demand-item-visa/demand-item-visa.component";
import {
  CarType,
  DemandService,
  DemandTeamModel,
  FlightType,
  OtherDemandModel,
} from "../demand.service";

@Component({
  selector: "app-demand-list",
  templateUrl: "./demand-list.page.html",
  styleUrls: ["./demand-list.page.scss"],
})
export class DemandListPage implements OnInit {
  @ViewChild(DemandItemTeamComponent) tcomp: DemandItemTeamComponent;
  @ViewChild(DemandItemMeetingComponent) tcomp2: DemandItemMeetingComponent;
  @ViewChild(DemandItemVisaComponent) tcomp3: DemandItemVisaComponent;
  @ViewChild(DemandItemCarComponent) tcomp4: DemandItemCarComponent;
  @ViewChild(DemandAirportServicesComponent)
  tcomp5: DemandAirportServicesComponent;
  teams: {
    Tag: string;
    DemandType: FlightType;
    Demand: any;
  };
  demandTeamModel: DemandTeamModel;

  DemandCarType: string;

  // carType = 'PickUpFlight' || 'DeliverFlight' || 'PickUpTrain' || 'DeliverTrain' || 'CharterCar';
  CarType = CarType;

  otherDemandModel: OtherDemandModel;
  FlightType = FlightType;
  constructor(private apiservice: DemandService) {}

  ngOnInit() {
    this.demandTeamModel = {} as any;
    // this.otherDemandModel = {} as any;
    // this.otherDemandModel.demandTeam = {} as any;

    this.teams = {
      Tag: "",
      DemandType: FlightType.TeamDemand,
      Demand: this.demandTeamModel,
    };
  }

  getListType(type: FlightType) {
    this.teams.DemandType = type;
  }
  private scrollTabToCenter(evt: CustomEvent) {
    const container = (evt.target as any) as HTMLElement;
    setTimeout(() => {
      try {
        const el = container.querySelector(".segment-button-checked");
        // console.log("el", el);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect) {
            const left =
              rect.left + rect.width / 2 - AppHelper.platform.width() / 2;
            container.scrollBy({ left, behavior: "smooth" });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 200);
  }
  segmentChanged(evt: CustomEvent) {
    this.scrollTabToCenter(evt);
    this.getListType(evt.detail.value);
  }

  private onReset() {
    if (this.tcomp) {
      this.tcomp.onReset();
    } else if (this.tcomp2) {
      this.tcomp2.onReset();
    } else if (this.tcomp3) {
      this.tcomp3.ngOnInit();
    } else if (this.tcomp4) {
      this.tcomp4.ngOnInit();
    } else if (this.tcomp5) {
      this.tcomp5.ngOnInit();
    }
  }
  async onTeamSubmit(obj) {
    try {
      let teams = {
        ...this.teams,
        Demand: {
          ...obj.demandTeamModel,
          ProductType: (obj.demandTeamModel.ProductType || []).join(","),
        },
      };
      this.apiservice.saveDemand(teams);
      AppHelper.alert("添加成功");
      this.onReset();
    } catch (e) {
      AppHelper.alert("添加失败" + e);
    }
  }

  async onTourSubmit(obj) {
    try {
      this.teams.Demand = obj.demandTourModel;
      this.apiservice.saveDemand(this.teams);
      AppHelper.alert("添加成功");
      this.onReset();
    } catch (e) {
      AppHelper.alert("添加失败" + e);
    }
  }
  async onVisaSubmit(obj) {
    try {
      this.teams.Demand = obj.demandVisaModel;
      this.apiservice.saveDemand(this.teams);
      AppHelper.alert("添加成功");
      this.onReset();
    } catch (e) {
      AppHelper.alert("添加失败" + e);
    }
  }

  async onAirportSubmit(obj) {
    try {
      this.teams.Demand = obj.DemandAirportServiceModel;
      this.apiservice.saveDemand(this.teams);
      AppHelper.alert("添加成功");
      this.onReset();
    } catch (e) {
      AppHelper.alert("添加失败" + e);
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
      AppHelper.alert('添加成功');
      this.onReset();
    } catch (e) {
      AppHelper.alert(e);
    }
  }
}

import { TrainScheduleEntity } from "../../models/TrainScheduleEntity";
import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";

@Component({
  selector: "app-trainschedule",
  templateUrl: "./trainschedule.component.html",
  styleUrls: ["./trainschedule.component.scss"]
})
export class TrainscheduleComponent implements OnInit {
  schedules: TrainScheduleEntity[];
  vmFromCity: TrafficlineEntity;
  vmToCity: TrafficlineEntity;
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}
  back() {
    this.modalCtrl.getTop().then(t => {
      t.dismiss();
    });
  }
  getTimeColor(arrivalTime: number) {
    const now = new Date();
    return (
      Math.floor(Date.now() / 1000) >
      Math.floor(
        new Date(
          `${now.getFullYear}-${now.getMonth() + 1}-${arrivalTime}`
        ).getTime() / 1000
      )
    );
  }
}

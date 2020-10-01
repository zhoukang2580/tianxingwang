import { TrainScheduleEntity } from "../../models/TrainScheduleEntity";
import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { TrainEntity } from "../../models/TrainEntity";
import { AppHelper } from "src/app/appHelper";

@Component({
  selector: "app-trainschedule",
  templateUrl: "./trainschedule.component.html",
  styleUrls: ["./trainschedule.component.scss"],
})
export class TrainscheduleComponent implements OnInit {
  schedules: TrainScheduleEntity[];
  vmFromCity: TrafficlineEntity;
  vmToCity: TrafficlineEntity;
  train: TrainEntity;
  constructor(private modalCtrl: ModalController) {}
  private initColor() {
    const ngClazz: { [key: string]: boolean } = {};
    if (this.schedules) {
      this.schedules.forEach((s, idx) => {
        ngClazz.active = idx % 2 == 0;
        ngClazz.passed = this.getTimeColor(s.ArriveTime);
        s["ngClazz"] = ngClazz;
      });
    }
  }
  ngOnInit() {
    this.initColor();
  }
  back() {
    this.modalCtrl.getTop().then((t) => {
      t.dismiss();
    });
  }
  private getTime(date: string) {
    if (date) {
      if (date.includes("-")) {
        date = date.replace(/-/g, "/");
        return AppHelper.getDate(date).getTime();
      }
    }
    return 0;
  }
  private getTimeColor(arrivalTime: string) {
    const now = new Date();
    return Math.floor(Date.now() / 1000) > this.getTime(arrivalTime);
  }
}

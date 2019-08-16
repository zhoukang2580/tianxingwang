import { TrainScheduleEntity } from "../../models/TrainScheduleEntity";
import { Component, OnInit } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-trainschedule",
  templateUrl: "./trainschedule.component.html",
  styleUrls: ["./trainschedule.component.scss"]
})
export class TrainscheduleComponent implements OnInit {
  schedules: TrainScheduleEntity[];
  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}
  back() {
    this.modalCtrl.getTop().then(t => {
      t.dismiss();
    });
  }
}

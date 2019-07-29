import { TrainBookInfo, TrainService } from './../../train.service';
import { CredentialsEntity } from "./../../../tmc/models/CredentialsEntity";
import { ModalController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
@Component({
  selector: "app-selected-passengers",
  templateUrl: "./selected-passengers.component.html",
  styleUrls: ["./selected-passengers.component.scss"]
})
export class SelectedPassengersComponent implements OnInit {
  bookInfos$: Observable<TrainBookInfo[]>;
  constructor(
    private trainService: TrainService,
    private modalCtrl: ModalController
  ) {
    this.bookInfos$ = trainService.getBookInfoSource();
  }
  async remove(info: TrainBookInfo) {
    if (info) {
      this.trainService.removeBookInfo(info);
    }
  }
  ngOnInit() {}
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss().catch(_ => {});
    }
  }
}

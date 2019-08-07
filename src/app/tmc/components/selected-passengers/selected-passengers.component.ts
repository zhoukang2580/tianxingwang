import { ModalController } from "@ionic/angular";
import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { Observable } from "rxjs";
import {} from "events";
import { PassengerBookInfo } from '../../tmc.service';

@Component({
  selector: "app-selected-passengers",
  templateUrl: "./selected-passengers.component.html",
  styleUrls: ["./selected-passengers.component.scss"]
})
export class SelectedPassengersComponent implements OnInit {
  @Input() bookInfos$: Observable<PassengerBookInfo[]>;
  @Output() public removeitem: EventEmitter<PassengerBookInfo>;
  constructor(private modalCtrl: ModalController) {
    this.removeitem = new EventEmitter();
  }
  remove(info: PassengerBookInfo) {
    this.removeitem.emit(info);
  }
  ngOnInit() {}
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss().catch(_ => {});
    }
  }
}

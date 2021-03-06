import { ModalController } from "@ionic/angular";
import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { Observable } from "rxjs";
import {} from "events";
import { PassengerBookInfo } from "../../tmc.service";

@Component({
  selector: "app-selected-passengers",
  templateUrl: "./selected-passengers.component.html",
  styleUrls: ["./selected-passengers.component.scss"]
})
export class SelectedPassengersComponent implements OnInit {
  @Input() bookInfos$: Observable<PassengerBookInfo<any>[]>;
  @Output() public removeitem: EventEmitter<PassengerBookInfo<any>>;
  constructor(private modalCtrl: ModalController) {
    this.removeitem = new EventEmitter();
  }
  remove(info: PassengerBookInfo<any>) {
    this.removeitem.emit(info);
  }
  ngOnInit() {}
  async back(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopImmediatePropagation();
    }
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss().catch(_ => {});
    }
  }
}

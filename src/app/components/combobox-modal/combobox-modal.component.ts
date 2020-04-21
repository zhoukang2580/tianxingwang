import {
  style,
  animate,
  transition,
  trigger,
  query,
  stagger
} from "@angular/animations";
import { Component, OnInit, EventEmitter } from "@angular/core";
import { Observable } from "rxjs";
import { IKeyValue } from "../combobox/combobox.component";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-combobox-modal",
  templateUrl: "./combobox-modal.component.html",
  styleUrls: ["./combobox-modal.component.scss"],
  animations: [
    trigger("flyInOut", [
      transition(":enter", [
        style({ opacity: 0, transform: "translate3d(-100%,0,0)" }),
        animate(
          "200ms ease-in-out",
          style({ opacity: 1, transform: "translate3d(0,0,0)" })
        )
      ]),
      transition(":leave", [
        animate(
          "100ms ease-in-out",
          style({ opacity: 0, transform: "translate3d(100%,0,0)" })
        )
      ])
    ])
  ]
})
export class ComboboxModalComponent implements OnInit {
  private textChange: EventEmitter<string>;
  dataSource: Observable<IKeyValue[]>;
  keyValue: string;
  constructor(private modalCtrl: ModalController) {}
  back() {
    this.onClick({ Text: this.keyValue });
  }
  ngOnInit() {
    setTimeout(() => {
      this.onTextChange();
    }, 100);
  }
  onTextChange(isBack = false) {
    if (this.textChange) {
      this.textChange.emit(this.keyValue);
      if (isBack) {
        this.back();
      }
    }
  }
  onClick(item: IKeyValue) {
    this.modalCtrl.getTop().then(t => {
      t.dismiss(item);
    });
  }
}

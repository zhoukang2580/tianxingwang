import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { PopoverController } from "@ionic/angular";
export interface ISelectData {
  label: string;
  value: any;
}
@Component({
  selector: "app-select",
  templateUrl: "./select.component.html",
  styleUrls: ["./select.component.scss"],
})
export class SelectComponent implements OnInit {
  @Input() data: ISelectData[];
  @Input() label: string;
  @Input() value: any;
  @Output() valueChange: EventEmitter<any>;
  @Output() ionChange: EventEmitter<any>;
  constructor(private popoverCtrl: PopoverController) {
    this.valueChange = new EventEmitter();
    this.ionChange = new EventEmitter();
  }

  ngOnInit() {
   
  }
  onConfirm() {
    this.popoverCtrl.getTop().then((t) => {
      this.onChange();
      t.dismiss(this.value);
    });
  }
  onChange() {
    this.ionChange.emit(this.value);
    this.valueChange.emit(this.value);
  }
  onCancel() {
    this.popoverCtrl.getTop().then((t) => {
      t.dismiss();
    });
  }
}

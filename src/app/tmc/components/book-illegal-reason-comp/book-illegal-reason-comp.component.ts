import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { IllegalReasonEntity } from "../../tmc.service";
import { PopoverController } from "@ionic/angular";
import { SelectComponent } from "src/app/components/select/select.component";

@Component({
  selector: "app-book-illegal-reason-comp",
  templateUrl: "./book-illegal-reason-comp.component.html",
  styleUrls: ["./book-illegal-reason-comp.component.scss"],
})
export class BookIllegalReasonCompComponent implements OnInit {
  @Input() disabled: boolean;
  @Input() isAllowCustomReason: boolean;
  @Input() illegalReasons: IllegalReasonEntity[] = [];
  @Output() ionchange: EventEmitter<any>;
  isOtherIllegalReason: boolean;
  otherIllegalReason: string;
  illegalReason: string;
  constructor(private popoverCtrl: PopoverController) {
    this.ionchange = new EventEmitter();
  }
  async onOpenSelect() {
    if (this.isOtherIllegalReason) {
      return;
    }
    const p = await this.popoverCtrl.create({
      component: SelectComponent,
      cssClass: "vw-70",
      componentProps: {
        label: "超标原因",
        data: (this.illegalReasons || []).map((it) => {
          return {
            label: it.Name,
            value: it.Name,
          };
        }),
      },
    });
    p.present();
    const data = await p.onDidDismiss();
    if (data && data.data) {
      this.illegalReason = data.data;
      this.onValueChange();
    }
  }
  onValueChange() {
    this.ionchange.emit({
      isOtherIllegalReason: this.isOtherIllegalReason,
      otherIllegalReason: this.otherIllegalReason,
      illegalReason: this.illegalReason,
    });
  }
  ngOnInit() {}
}

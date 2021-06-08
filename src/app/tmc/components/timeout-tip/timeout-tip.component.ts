import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-timeout-tip",
  templateUrl: "./timeout-tip.component.html",
  styleUrls: ["./timeout-tip.component.scss"],
})
export class TimeoutTipComponent implements OnInit {
  msg: any;
  private ctrl;
  constructor() {}

  ngOnInit() {}
  onClose() {
    if (this.ctrl && this.ctrl.getTop) {
      this.ctrl.getTop().then((t) => {
        if (t) {
          t.dismiss();
        }
      });
    }
  }
}

import { Component, OnInit } from "@angular/core";
import { AppHelper } from "src/app/appHelper";

@Component({
  selector: "app-show-freebook-tip",
  templateUrl: "./show-freebook-tip.component.html",
  styleUrls: ["./show-freebook-tip.component.scss"],
})
export class ShowFreebookTipComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
  onClose() {
    AppHelper.modalController.getTop().then((t) => {
      if (t) {
        t.dismiss();
      }
    });
  }
}

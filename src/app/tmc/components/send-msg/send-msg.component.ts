import { PopoverController } from "@ionic/angular";
import { Component, OnInit, NgZone } from "@angular/core";

@Component({
  selector: "app-send-msg",
  templateUrl: "./send-msg.component.html",
  styleUrls: ["./send-msg.component.scss"]
})
export class SendMsgComponent implements OnInit {
  defaultMobile: string;
  mobiles: { mobile: string }[] = [];
  constructor(private popoverController: PopoverController) {}

  ngOnInit() {}
  async done() {
    const p = await this.popoverController.getTop();
    if (p) {
      await p.dismiss(
        [{ mobile: this.defaultMobile }, ...this.mobiles].filter(
          el => el.mobile && !!el.mobile && !!el.mobile.trim()
        )
      );
    }
  }
  addMobile() {
    this.mobiles.push({ mobile: "" });
  }
}

import { Component, OnInit } from "@angular/core";
import { TravelUrlInfo } from "src/app/tmc/tmc.service";
import { PopoverController } from "@ionic/angular";

@Component({
  selector: "app-select-travel-number-popover",
  templateUrl: "./select-travel-number-popover.component.html",
  styleUrls: ["./select-travel-number-popover.component.scss"]
})
export class SelectTravelNumberComponent implements OnInit {
  travelInfos: TravelUrlInfo[];
  constructor(private popoverCtrl: PopoverController) {}

  ngOnInit() {}
  async onSelect(item: TravelUrlInfo) {
    if (item) {
      const t = await this.popoverCtrl.getTop();
      if (t) {
        t.dismiss(item).catch(_ => {});
      }
    }
  }
}

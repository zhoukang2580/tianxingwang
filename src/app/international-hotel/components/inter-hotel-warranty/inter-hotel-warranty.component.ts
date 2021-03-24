import { Component, OnInit } from "@angular/core";
import { PopoverController } from "@ionic/angular";

@Component({
  selector: "app-inter-hotel-warranty",
  templateUrl: "./inter-hotel-warranty.component.html",
  styleUrls: ["./inter-hotel-warranty.component.scss"]
})
export class InterHotelWarrantyComponent implements OnInit {
  checked: boolean;
  isshow: boolean;
  title;
  constructor(private popoverCtrl: PopoverController) {}

  ngOnInit() {}
  onHide() {
    this.isshow = false;
  }
  checkbox_click() {
    if (this.checked) {
      this.checked = false;
    } else {
      this.checked = true;
    }
  }
  onanimation() {
    this.isshow = !this.checked;
    if (this.checked) {
      this.popoverCtrl.getTop().then(t => {
        if (t) {
          t.dismiss(this.checked ? "checked" : "unchecked");
        }
      });
    }
  }
}

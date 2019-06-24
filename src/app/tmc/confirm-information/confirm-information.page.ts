import { ActivatedRoute } from "@angular/router";
import { ApiService } from "src/app/services/api/api.service";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-comfirm-info",
  templateUrl: "./confirm-information.page.html",
  styleUrls: ["./confirm-information.page.scss"]
})
export class ComfirmInformationPage implements OnInit {
  info: any;
  constructor(route: ActivatedRoute) {
    route.paramMap.subscribe(p => {
      if (p.get("customerInfo")) {
        this.info = p.get("customerInfo");
      }
    });
  }

  ngOnInit() {}
}

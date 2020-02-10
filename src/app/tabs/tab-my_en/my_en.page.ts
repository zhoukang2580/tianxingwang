import { MyPage } from "../tab-my/my.page";
import { Component } from "@angular/core";

@Component({
  selector: "app-my_en",
  templateUrl: "my_en.page.html",
  styleUrls: ["my_en.page.scss"]
})
export class MyEnPage extends MyPage {
  ngOnInit() {
    super.ngOnInit();
    console.log("我的，英文版页面");
  }
}

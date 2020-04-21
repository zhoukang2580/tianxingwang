import { Component, OnInit } from "@angular/core";
import { NavController } from "@ionic/angular";

@Component({
  selector: "app-account-pay-password",
  templateUrl: "./account-pay-password.page.html",
  styleUrls: ["./account-pay-password.page.scss"]
})
export class AccountPayPasswordPage implements OnInit {
  constructor(private navCtrl: NavController) {}
  back() {
    this.navCtrl.pop();
  }
  ngOnInit() {}
}

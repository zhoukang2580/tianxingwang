import { LoginService } from "./../../services/login/login.service";
import { FormGroup } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";

@Component({
  selector: "app-account-email",
  templateUrl: "./account-email.page.html",
  styleUrls: ["./account-email.page.scss"]
})
export class AccountEmailPage implements OnInit {
  form: FormGroup;
  imgSrc$: Observable<string>;
  phoneErrorCount = 0;
  validImageCodeCount = 0;
  isDisableSendMobileCode = false;
  countDown = 0;
  constructor(private fb: FormBuilder, private loginService: LoginService) {}

  ngOnInit() {
    this.form = this.fb.group({
      Email: [],
      ImageCode: [],
      MobileCode: []
    });
  }
  refreshImageCode() {
    this.imgSrc$ = this.loginService.getImage();
  }

  startCountDonw() {}
}

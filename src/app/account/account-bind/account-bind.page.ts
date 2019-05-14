import { LoginService } from "../../services/login/login.service";
import { FormBuilder } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";

@Component({
  selector: "app-account-bind",
  templateUrl: "./account-bind.page.html",
  styleUrls: ["./account-bind.page.scss"]
})
export class AccountBindPage implements OnInit {
  phoneErrorCount = 0;
  countDown = 0;
  validImageCodeCount = 0;
  isDisableSendMobileCode = false;
  form: FormGroup;
  imgSrc$: Observable<string>;
  constructor(private fb: FormBuilder, private loginService: LoginService) { }
  ngOnInit() {
    this.form = this.fb.group({
      Mobile: [],
      ImageCode: [],
      MobileCode: []
    });
    this.refreshImageCode();
  }
  refreshImageCode() {
    this.imgSrc$ = this.loginService.getImage();
  }
  startCountDonw() { }
  skip() { }
}

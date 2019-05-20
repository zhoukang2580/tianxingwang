import { LoginService } from "../../services/login/login.service";
import { FormBuilder } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: "app-account-bind",
  templateUrl: "./account-bind.page.html",
  styleUrls: ["./account-bind.page.scss"]
})
export class AccountBindPage implements OnInit, OnDestroy {
  phoneErrorCount = 0;
  countDown = 0;
  validImageCodeCount = 0;
  isDisableSendMobileCode = false;
  paramsSubscription = Subscription.EMPTY;
  form: FormGroup;
  imgSrc$: Observable<string>;
  bindMobileInfo: {
    Mobile: string;
    IsActiveMobile: boolean;
  } = {} as any;
  constructor(private fb: FormBuilder, private loginService: LoginService, private route: ActivatedRoute) {

  }
  ngOnInit() {
    
    this.form = this.fb.group({
      Mobile: [],
      ImageCode: [],
      MobileCode: []
    });
    this.paramsSubscription = this.route.paramMap.subscribe(p => {
      if (p) {
        this.bindMobileInfo.IsActiveMobile = p.get("IsActiveMobile") == 'true';
        this.bindMobileInfo.Mobile = p.get("Mobile");
        this.form.patchValue({Mobile:this.bindMobileInfo.Mobile});
      }
    });
    this.refreshImageCode();
  }
  refreshImageCode() {
    this.imgSrc$ = this.loginService.getImage();
  }
  startCountDonw() { }
  skip() { }
  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
  }
}

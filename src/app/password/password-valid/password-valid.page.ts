import { NavController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { switchMap } from "rxjs/operators";
import { Router, ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { AppHelper } from "src/app/appHelper";

@Component({
  selector: "app-password-valid",
  templateUrl: "./password-valid.page.html",
  styleUrls: ["./password-valid.page.scss"],
})
export class PasswordValidPage implements OnInit {
  model: any;
  validateType: string;
  code: string;
  message: string;
  name: string;
  items: {
    Name: string;
    Type: string;
    Value: string;
  }[];
  countDown = 0;
  countDownInterval: any;
  constructor(
    private apiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((p) => {
      this.message = "";
      this.items = p.get("ValidTypes") && JSON.parse(p.get("ValidTypes"));
      this.name = p.get("Name");
      if (this.items && this.items.length) {
        this.model = this.items[0].Type;
      }
    });
  }
  check() {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Home-Action";
    req.Data = JSON.stringify({
      Name: this.name,
      ValidateType: this.model,
      ValidateValue: this.code,
      Action: "Valid",
    });
    const des = this.apiService
      .getResponse<{
        ValidTypes: []; // "";
        AccountId: string; // ;
      }>(req)
      .pipe(
        switchMap((r) => {
          if (!r.Status) {
            this.message = r.Message;
            return of(r.Data);
          }
          if (r.Data) {
            this.router.navigate([AppHelper.getRoutePath("password-reset")], {
              queryParams: { Name: this.name },
            });
          }
          return of(r.Data);
        })
      )
      .subscribe(
        (r) => {},
        (e) => {},
        () => {
          des.unsubscribe();
        }
      );
  }
  private startCountDonw(countdownTime: number) {
    this.countDown = countdownTime;
    if (this.countDownInterval) {
      clearInterval(this.countDownInterval);
    }
    this.countDownInterval = window.setInterval(() => {
      this.countDown = this.countDown <= 0 ? 0 : this.countDown - 1;
      if (this.countDown == 0) {
        clearInterval(this.countDownInterval);
      }
    }, 1000);
  }

  sendMobileCode() {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Home-SendCode";
    req.IsShowLoading = true;
    req.Data = { ValidateType: this.model, Name: this.name };
    var paramters = AppHelper.getQueryParamers();
    if (paramters) {
      for (var p in paramters) {
        req[p] = paramters[p];
      }
    }
    const sub = this.apiService
      .getResponse<{
        SendInterval: number;
        ExpiredInterval: number;
      }>(req)
      .subscribe(
        (res) => {
          if (res.Data) this.startCountDonw(res.Data.SendInterval || 0);
        },
        (e) => {
          AppHelper.alert(e);
        },
        () => {
          setTimeout(() => {
            if (sub) {
              sub.unsubscribe();
            }
          }, 100);
        }
      );
  }
}

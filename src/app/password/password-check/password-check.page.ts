import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { IdentityService } from "src/app/services/identity/identity.service";
import { Router } from "@angular/router";
import { ApiService } from "src/app/services/api/api.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { AppHelper } from "src/app/appHelper";
import { tap, switchMap, takeLast, exhaustMap } from "rxjs/operators";
import { of, Subscription } from "rxjs";
import { NavController } from "@ionic/angular";

@Component({
  selector: "app-password-check",
  templateUrl: "./password-check.page.html",
  styleUrls: ["./password-check.page.scss"]
})
export class PasswordCheckPage implements OnInit, OnDestroy {
  isShowImageCode: boolean;
  message: string;
  name: string;
  identityEntity: IdentityEntity;
  subscription = Subscription.EMPTY;
  constructor(
    private identityService: IdentityService,
    private router: Router,
    private apiService: ApiService,
    private navCtrl: NavController
  ) {}
  back() {
    this.navCtrl.back();
  }
  ngOnInit() {
    this.subscription = this.check().subscribe();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  showImageCode(type: string) {
    this.isShowImageCode = true;
  }
  onSlideEvent(valid: boolean) {
    if (valid) {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      this.subscription = this.check().subscribe(r => {
        this.isShowImageCode = false;
      });
    }
  }

  check() {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Home-Action";
    req.Data = JSON.stringify({
      Name: this.name,
      Action: "Check"
    });
    return this.identityService.getIdentity().pipe(
      exhaustMap(identity => {
        this.identityEntity = identity;
        return this.apiService
          .getResponse<{
            ValidTypes: []; // "";
            AccountId: string; // ;
          }>(req)
          .pipe(
            switchMap(r => {
              if (!r.Status) {
                this.message = r.Message;
                return of(r.Data);
              }
              if (r.Data) {
                this.router.navigate([
                  AppHelper.getRoutePath("password-valid"),
                  {
                    Name: this.name,
                    ValidTypes: JSON.stringify(r.Data.ValidTypes)
                  }
                ]);
              }
              return of(r.Data);
            }),
            tap(rid => {})
          );
      })
    );
  }
}

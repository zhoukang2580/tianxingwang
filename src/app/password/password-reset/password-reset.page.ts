import { Component, OnInit } from "@angular/core";
import { NavController } from "@ionic/angular";
import { ApiService } from "src/app/services/api/api.service";
import { Router, ActivatedRoute } from "@angular/router";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { switchMap } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-password-reset",
  templateUrl: "./password-reset.page.html",
  styleUrls: ["./password-reset.page.scss"]
})
export class PasswordResetPage implements OnInit {
  password: string;
  surePassword: string;
  message: string;
  name: string;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private navController: NavController
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(p => {
      this.name = p.get("Name");
    });
  }
  back() {
    this.navController.back();
  }
  finish() {
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Home-Action";
    req.Data = JSON.stringify({
      Name: this.name,
      Password: this.password,
      SurePassword: this.surePassword,
      Action: "Reset"
    });
    const des = this.apiService
      .getResponse<{}>(req)
      .pipe(
        switchMap(r => {
          debugger;
          if (!r.Status) {
            this.message = r.Message;
            return of(r.Data);
          }
          window.history.go(-3);
          return of(r.Data);
        })
      )
      .subscribe(
        r => {},
        e => {},
        () => {
          des.unsubscribe();
        }
      );
  }
}

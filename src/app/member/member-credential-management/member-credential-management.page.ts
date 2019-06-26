import { Country } from "./../../pages/select-country/select-country.page";
import { LanguageHelper } from "./../../languageHelper";
import { IonRefresher, IonGrid } from "@ionic/angular";
import { Credentials, TmcService } from "./../../tmc/tmc.service";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewChildren,
  QueryList
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AppHelper } from "src/app/appHelper";
import { ValidatorService } from "src/app/services/validator/validator.service";
import { CredentialsType } from "src/app/tmc/pipe/credential.pipe";

@Component({
  selector: "app-member-credential-management",
  templateUrl: "./member-credential-management.page.html",
  styleUrls: ["./member-credential-management.page.scss"]
})
export class MemberCredentialManagementPage implements OnInit, AfterViewInit {
  identityTypes: { key: string; value: string }[];
  credentials: Credentials[];
  newCredentials: Credentials[] = []; // 新增的证件
  loading = false;
  isModify = false;
  requestCode: "issueNationality" | "identityNationality";
  currentModifyItem: Credentials;
  @ViewChild("f") formEle: ElementRef<HTMLFormElement>;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChildren("addForm") addForm: QueryList<IonGrid>;
  constructor(
    private router: Router,
    private validatorService: ValidatorService,
    private tmcService: TmcService,
    private route: ActivatedRoute
  ) {
    route.queryParamMap.subscribe(p => {
      const country: Country = AppHelper.getRouteData();
      if (country && country.Code) {
        console.log(country);
        AppHelper.setRouteData(null);
        if (this.requestCode === "issueNationality") {
          this.currentModifyItem.IssueCountry = country.Code;
        }
        if (this.requestCode === "identityNationality") {
          this.currentModifyItem.Country = country.Code;
        }
      }
    });
  }

  ngOnInit() {
    this.doRefresh();
    this.getIdentityTypes();
  }
  doRefresh() {
    this.getCredentials();
    if (this.refresher) {
      this.refresher.complete();
    }
  }
  getIdentityTypes() {
    this.identityTypes = Object.keys(CredentialsType)
      .filter(k => +k)
      .map(k => {
        // console.dir(CredentialsType[k]);
        // console.log(
        //   `key=${k},value=${
        //     CredentialsType[k]
        //   },typeof k=${typeof k},typeof value=${typeof CredentialsType[k]}`
        // );
        return {
          key: k,
          value: CredentialsType[k]
        };
      });
    console.log(this.identityTypes);
  }
  ngAfterViewInit() {
    console.log(this.formEle);
    this.initializeValidate();
    this.addForm.changes.subscribe(el => {
      console.log(el);
      if (el.last) {
        this.initializeValidateAdd(el.last.el);
      }
    });
  }
  initializeValidate() {
    this.validatorService.initialize(
      "Beeant.Domain.Entities.Member.CredentialsEntity",
      "Modify",
      this.formEle.nativeElement
    );
  }
  async getCredentials() {
    this.loading = true;
    this.credentials = await this.tmcService.getCredentials();
    this.loading = false;
  }
  addCredential() {
    const item: Credentials = {} as any;
    this.newCredentials.push(item);
  }
  initializeValidateAdd(el: HTMLFormElement) {
    this.validatorService.initialize(
      "Beeant.Domain.Entities.Member.CredentialsEntity",
      "Add",
      el
    );
  }
  selectIdentityNationality(item: Credentials) {
    this.currentModifyItem = item;
    this.requestCode = "identityNationality";
    this.router.navigate([AppHelper.getRoutePath("select-country")], {
      queryParams: {
        requestCode: this.requestCode,
        title: LanguageHelper.getSelectCountryTip()
      }
    });
  }
  selectIssueNationality(item: Credentials) {
    this.currentModifyItem = item;
    this.requestCode = "issueNationality";
    this.router.navigate([AppHelper.getRoutePath("select-country")], {
      queryParams: {
        requestCode: this.requestCode,
        title: LanguageHelper.getSelectIssueCountryTip()
      }
    });
  }
  togleModify(item: Credentials) {
    this.currentModifyItem = item;
    this.isModify = !this.isModify;
    this.initializeValidate();
  }
}

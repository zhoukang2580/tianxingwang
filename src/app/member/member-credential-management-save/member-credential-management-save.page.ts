import { QueryList, ViewChildren } from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { ApiService } from "src/app/services/api/api.service";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { LanguageHelper } from "src/app/languageHelper";
import { ValidatorService } from "src/app/services/validator/validator.service";

@Component({
  selector: "app-member-credential-management-save",
  templateUrl: "./member-credential-management-save.page.html",
  styleUrls: ["./member-credential-management-save.page.scss"]
})
export class MemberCredentialManagementSavePage
  implements OnInit, AfterViewInit {
  identityTypes: { name: string; value: string; id: string }[] = [];
  formGroup: FormGroup;
  identityNationality: any;
  issueNationality: any;
  requestCode: "issueNationality" | "identityNationality";
  title = "选择国家";
  @ViewChild("f")
  formEle: ElementRef<HTMLFormElement>;
  @ViewChildren("input")
  inputs: QueryList<HTMLInputElement>;
  constructor(
    private fb: FormBuilder,
    private validatorService: ValidatorService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.identityTypes = [
      {
        id: "1",
        name: "身份证",
        value: "身份证"
      },
      {
        id: "2",
        name: "护照",
        value: "护照"
      },
      {
        id: "3",
        name: "港澳通行证",
        value: "港澳通行证"
      },
      {
        id: "4",
        name: "台湾通行证",
        value: "台湾通行证"
      },
      {
        id: "5",
        name: "台胞证",
        value: "台胞证"
      },
      {
        id: "6",
        name: "回乡证",
        value: "回乡证"
      },
      {
        id: "7",
        name: "入台证",
        value: "入台证"
      },
      {
        id: "8",
        name: "其他",
        value: "其他"
      }
    ];
    this.formGroup = this.fb.group({
      identityType: [null, Validators.required],
      identityNationality: [null, Validators.required],
      issueNationality: [null, Validators.required]
    });
  }
  addCredential() {
    // if (this.formGroup.invalid) {
    //   AppHelper.alert(LanguageHelper.getCompleteInfo());
    //   return;
    // }
    // if (!this.identityNationality) {
    //   AppHelper.alert(LanguageHelper.getIdentityNationality());
    //   return;
    // }
    // if (!this.issueNationality) {
    //   AppHelper.alert(LanguageHelper.getIdentityNationality());
    //   return;
    // }
  }
  ngAfterViewInit() {
    console.log("viewinit");
    this.initializeValidate();
  }
  initializeValidate() {
    this.validatorService.initialize(
      "Beeant.Domain.Entities.Member.CredentialsEntity",
      "Add",
      this.formEle.nativeElement
    );
  }
  selectIdentityNationality() {
    this.requestCode = "identityNationality";
    this.router.navigate([AppHelper.getRoutePath("select-city")]);
  }
  selectIssueNationality() {
    this.requestCode = "issueNationality";
    this.router.navigate([AppHelper.getRoutePath("select-city")]);
  }
}

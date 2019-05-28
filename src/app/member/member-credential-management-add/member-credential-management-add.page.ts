import { AppHelper } from 'src/app/appHelper';
import { ApiService } from 'src/app/services/api/api.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LanguageHelper } from 'src/app/languageHelper';
import { SelectCityService } from 'src/app/pages/select-city/select-city.service';

@Component({
  selector: 'app-member-credential-management-add',
  templateUrl: './member-credential-management-add.page.html',
  styleUrls: ['./member-credential-management-add.page.scss'],
})
export class MemberCredentialManagementAddPage implements OnInit {
  identityTypes: { name: string; value: string; id: string; }[] = [];
  formGroup: FormGroup;
  identityNationality: any;
  issueNationality: any;
  requestCode: "issueNationality" | "identityNationality";
  title = "选择国家";
  constructor(
    private fb: FormBuilder,
    private cityService: SelectCityService,
    private apiService: ApiService, private router: Router) {
    this.cityService.getSelectedItemObservable().subscribe(cityItem => {
      if (this.requestCode === "identityNationality") {
        this.identityNationality = cityItem;
      }
      if (this.requestCode === 'issueNationality') {
        this.issueNationality = cityItem;
      }
    })
  }

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
      },
    ]
    this.formGroup = this.fb.group({
      identityType: [null, Validators.required],
      identityNationality: [null, Validators.required],
      issueNationality: [null, Validators.required],
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

  selectIdentityNationality() {
    this.requestCode = "identityNationality";
    this.cityService.extra = { title: this.title, displayField: "Name", backRoute: this.router.url };
    this.router.navigate([AppHelper.getRoutePath("select-city")]);
  }
  selectIssueNationality() {
    this.cityService.extra = { title: this.title, displayField: "Name",backRoute: this.router.url };
    this.requestCode = "issueNationality";
    this.router.navigate([AppHelper.getRoutePath("select-city")]);
  }

}

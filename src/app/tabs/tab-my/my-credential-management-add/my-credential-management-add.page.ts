import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-my-credential-management-add',
  templateUrl: './my-credential-management-add.page.html',
  styleUrls: ['./my-credential-management-add.page.scss'],
})
export class MyCredentialManagementAddPage implements OnInit {
  identityTypes: { name: string; value: string; id: string; }[] = [];
  formGroup: FormGroup;
  nationalities: {name:string}[];
  constructor(private fb: FormBuilder) { }

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
    if (this.formGroup.invalid) {
      alert("请完善信息");
      return;
    }
  }
  selectIdentityNationality(){
    
  }
  selectIssueNationality(){

  }

}

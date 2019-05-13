import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppHelper } from 'src/app/appHelper';

@Component({
  selector: 'app-my-credential-management',
  templateUrl: './my-credential-management.page.html',
  styleUrls: ['./my-credential-management.page.scss'],
})
export class MyCredentialManagementPage implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }
  addCredential(){
    this.router.navigate([AppHelper.getRoutePath("/tabs/my/my-credential-management-add")]);
  }
}

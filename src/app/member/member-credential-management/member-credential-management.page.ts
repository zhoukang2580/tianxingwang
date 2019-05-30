import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppHelper } from 'src/app/appHelper';

@Component({
  selector: 'app-member-credential-management',
  templateUrl: './member-credential-management.page.html',
  styleUrls: ['./member-credential-management.page.scss'],
})
export class MemberCredentialManagementPage implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }
  addCredential(){
    this.router.navigate([AppHelper.getRoutePath("member-credential-management-save")]);
  }
}

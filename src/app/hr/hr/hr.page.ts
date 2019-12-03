import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hr',
  templateUrl: './hr.page.html',
  styleUrls: ['./hr.page.scss'],
})
export class HrPage implements OnInit {
  companyName:string;
  hrId:string;
  organization:string;
  organizationCode:string;
  costcenter:string;
  costcenterCode:string;
  standard:any;
  constructor(private router:Router) { }
  async onSelectCostCenter(){

  }
  async onSelectOrg(){

  }
  async onSelectStandard(){
    
  }
  ngOnInit() {
  }

}

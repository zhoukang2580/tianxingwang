import { Component, OnInit } from '@angular/core';
import { HrService } from '../hr.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-hr-invitation-list',
  templateUrl: './hr-invitation-list.page.html',
  styleUrls: ['./hr-invitation-list.page.scss'],
})
export class HrInvitationListPage implements OnInit {

  invitationlist:any[] = []

  ifsuccess:''

  constructor(private staffService: HrService
    , private router: Router,) {

  }

  ngOnInit() {
    this.loadList();
  }
  private async loadList() {
    this.invitationlist = await this.staffService.getListAsync().catch((e)=>{
      console.error(e);
      return [];
    });
  }
  acceptclick(i:any){

    this.staffService.handle(i.Id,true).catch((e)=>{
      console.error(e);
    })
    // this.router.navigate(["invitation"],{queryParams:{mmsid:i}});
  }
  failclick(i:any){
    this.staffService.handle(i.Id,false).catch((e)=>{
      console.error(e);
    })
  }
}

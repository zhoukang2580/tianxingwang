import { Component, OnInit } from '@angular/core';
import { StaffService, InvitationItem } from '../staff.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-hr-invitation-list',
  templateUrl: './hr-invitation-list.page.html',
  styleUrls: ['./hr-invitation-list.page.scss'],
})
export class HrInvitationListPage implements OnInit {

  invitationlist:InvitationItem[] = []

  constructor(private staffService: StaffService
    , private router: Router,) {

  }

  ngOnInit() {
    this.loadList();
  }
  private async loadList() {
    this.invitationlist = await this.staffService.getInvitationListAsync().catch((e)=>{
      console.error(e);
      return [];
    });
  }
  acceptclick(i:InvitationItem){
    console.log(i);
    this.staffService.invitation=i;
    this.router.navigate(["invitation"],{queryParams:{mmsid:i}});
  }
}

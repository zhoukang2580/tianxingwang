import { Component, OnInit } from '@angular/core';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { IdentityEntity } from 'src/app/services/identity/identity.entity';
import { Router } from '@angular/router';
import { AppHelper } from 'src/app/appHelper';

@Component({
  selector: 'app-my-detail',
  templateUrl: './my-detail.page.html',
  styleUrls: ['./my-detail.page.scss'],
})
export class MyDetailPage implements OnInit {
identity:IdentityEntity;
  constructor(private identityService:IdentityService,private router:Router) { }

  async ngOnInit() {
    this.identity=await this.identityService.getIdentity();
  }
  
}

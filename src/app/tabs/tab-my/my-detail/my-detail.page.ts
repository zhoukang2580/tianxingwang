import { Component, OnInit } from '@angular/core';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { IdentityEntity } from 'src/app/services/identity/identity.entity';

@Component({
  selector: 'app-my-detail',
  templateUrl: './my-detail.page.html',
  styleUrls: ['./my-detail.page.scss'],
})
export class MyDetailPage implements OnInit {
identity:IdentityEntity;
  constructor(private identityService:IdentityService) { }

  async ngOnInit() {
    this.identity=await this.identityService.getIdentity();
  }

}

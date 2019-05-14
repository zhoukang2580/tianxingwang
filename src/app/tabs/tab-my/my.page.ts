import { AppHelper } from 'src/app/appHelper';
import { Component, OnInit } from '@angular/core';

import { OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { IdentityEntity } from 'src/app/services/identity/identity.entity';
import { BaseRequest } from 'src/app/services/api/BaseRequest';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api/api.service';
import { ConfigService } from 'src/app/services/config/config.service';
type PageModel={
  Name:string;
  RealName:string;
  Mobile:string;
  HeadUrl:string;
}
@Component({
  selector: 'app-my',
  templateUrl: 'my.page.html',
  styleUrls: ['my.page.scss']
})
export class MyPage implements OnDestroy, OnInit {
  identity: IdentityEntity;
  Model:PageModel;
  constructor(
    private router: Router,private identityService: IdentityService,private configService: ConfigService, private apiService: ApiService) {
    
  }
  onSettings() {
    this.router.navigate([AppHelper.getRoutePath("account-setting")]);
  }
  ngOnInit() {
    this.Model={Name:"",
      RealName:"",
      Mobile:"",
      HeadUrl:""};
     
    setTimeout(async () => {
      this.identity = await this.identityService.getIdentity();
    }, 0);
    this.load();
  }
 
  load() {
    const req = new BaseRequest();
    req.Method = "ApiMemberUrl-Home-Get";
    let deviceSubscription = this.apiService.getResponse<PageModel>(req).pipe(map(r => r.Data)).subscribe(r => {
      this.Model = r;
      this.configService.get().then((r)=>{
        if(this.Model && !this.Model.HeadUrl)
        {
          this.Model.HeadUrl=r.DefaultImageUrl;
        }
      });
    },()=>{
      if(deviceSubscription)
      {
        deviceSubscription.unsubscribe();
      }
    });
    
  }
  credentialManagement(){
    this.router.navigate([AppHelper.getRoutePath('/tabs/my/my-credential-management')]);
  }
  ngOnDestroy() {
  }
  goToMyDetail(){
    this.router.navigate([AppHelper.getRoutePath("/tabs/my/my-detail")]);
  }
}

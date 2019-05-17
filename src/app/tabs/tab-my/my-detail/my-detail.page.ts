import { Component, OnInit } from '@angular/core';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { IdentityEntity } from 'src/app/services/identity/identity.entity';
import { Router } from '@angular/router';
import { AppHelper } from 'src/app/appHelper';
import { BaseRequest } from 'src/app/services/api/BaseRequest';
import { ConfigService } from 'src/app/services/config/config.service';
import { ApiService } from 'src/app/services/api/api.service';
import { map } from 'rxjs/operators';
type PageModel = {
  Name: string;
  RealName: string;
  Mobile: string;
  HeadUrl: string;
  StaffNumber: string;
  CostCenterName: string;
  CostCenterCode: string;
  OrganizationName: string;
  BookTypeName: string;
}
@Component({
  selector: 'app-my-detail',
  templateUrl: './my-detail.page.html',
  styleUrls: ['./my-detail.page.scss'],
})
export class MyDetailPage implements OnInit {
  Model: PageModel;
  identity: IdentityEntity;
  constructor(private identityService: IdentityService, private router: Router, private configService: ConfigService, private apiService: ApiService) { }

  async ngOnInit() {
    this.identity = await this.identityService.getIdentity();
    this.Model = {
      HeadUrl: (await this.configService.get()).DefaultImageUrl
    } as any;
    this.load();
  }
  croppImage(){
    const fileEle = document.getElementById("file") as HTMLInputElement;
    if(fileEle){
      fileEle.click();
      fileEle.onchange=(evt)=>{
        const files = (evt.target as HTMLInputElement).files;
        const file = files[0];
        if(file){
          const fr = new FileReader();
          fr.onload=()=>{
            this.router.navigate([AppHelper.getRoutePath('crop-avatar'),{file:fr.result}]);
          }
          fr.readAsDataURL(file);
        }
      }
    }
  }
  load() {
    const req = new BaseRequest();
    req.Method = "ApiMemberUrl-Home-Get";
    let deviceSubscription = this.apiService.getResponse<PageModel>(req).pipe(map(r => r.Data)).subscribe(r => {
      this.Model.Name = r.Name;
      this.Model.RealName = r.RealName;
      this.Model.HeadUrl = r.HeadUrl || this.Model.HeadUrl;
    }, () => {
      if (deviceSubscription) {
        deviceSubscription.unsubscribe();
      }
    });

    const req1 = new BaseRequest();
    req1.Method = "HrApiUrl-Staff-Get";
    let deviceSubscription1 = this.apiService.getResponse<PageModel>(req1).pipe(map(r => r.Data)).subscribe(r => {
      this.Model.StaffNumber = r.StaffNumber;
      this.Model.CostCenterName = r.CostCenterName;
      this.Model.CostCenterCode = r.CostCenterCode;
      this.Model.OrganizationName = r.OrganizationName;
      this.Model.BookTypeName = r.BookTypeName;
    }, () => {
      if (deviceSubscription1) {
        deviceSubscription1.unsubscribe();
      }
    });
  }
}

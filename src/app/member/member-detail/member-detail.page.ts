import { Component, OnInit, OnDestroy } from '@angular/core';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { IdentityEntity } from 'src/app/services/identity/identity.entity';
import { Router } from '@angular/router';
import { AppHelper } from 'src/app/appHelper';
import { RequestEntity } from 'src/app/services/api/Request.entity';
import { ConfigService } from 'src/app/services/config/config.service';
import { ApiService } from 'src/app/services/api/api.service';
import { map } from 'rxjs/operators';
import { CropAvatarPage } from 'src/app/pages/crop-avatar/crop-avatar.page';
import { Subscription } from 'rxjs';
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
  selector: 'app-member-detail',
  templateUrl: './member-detail.page.html',
  styleUrls: ['./member-detail.page.scss'],
})
export class MemberDetailPage implements OnInit, OnDestroy {
  Model: PageModel;
  identity: IdentityEntity;
  defaultAvatar = AppHelper.getDefaultAvatar();
  deviceSubscription = Subscription.EMPTY;
  staffSubscription = Subscription.EMPTY;
  constructor(private identityService: IdentityService, private router: Router, private configService: ConfigService, private apiService: ApiService) { }

  async ngOnInit() {
    this.identity = await this.identityService.getIdentity();
    this.Model = {
      HeadUrl: (await this.configService.get()).DefaultImageUrl
    } as any;
    this.load();
    AppHelper.setCallback((name: string, data: any) => {
      if (name == CropAvatarPage.UploadSuccessEvent && data && data.HeadUrl) {
        this.Model.HeadUrl = data.HeadUrl + "?v=" + Date.now();
      }
    })
  }

  load() {
    const req = new RequestEntity();
    req.Method = "ApiMemberUrl-Home-Get";
    this.deviceSubscription = this.apiService.getResponse<PageModel>(req).pipe(map(r => r.Data)).subscribe(r => {
      if (r) {
        this.Model.Name = r.Name;
        this.Model.RealName = r.RealName;
        this.Model.HeadUrl = r.HeadUrl || this.Model.HeadUrl;
      }
    }, () => {

    });

    const req1 = new RequestEntity();
    req1.Method = "HrApiUrl-Staff-Get";
    this.staffSubscription = this.apiService.getResponse<PageModel>(req1).pipe(map(r => r.Data)).subscribe(r => {
      if (r) {
        this.Model.StaffNumber = r.StaffNumber;
        this.Model.CostCenterName = r.CostCenterName;
        this.Model.CostCenterCode = r.CostCenterCode;
        this.Model.OrganizationName = r.OrganizationName;
        this.Model.BookTypeName = r.BookTypeName;
      }
    }, () => {
    });
  }
  ngOnDestroy() {
    this.deviceSubscription.unsubscribe();
    this.staffSubscription.unsubscribe();
  }
}

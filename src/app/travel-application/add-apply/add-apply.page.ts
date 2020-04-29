import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OrganizationComponent } from 'src/app/tmc/components/organization/organization.component';
import { OrganizationEntity } from 'src/app/hr/staff.service';
import { Subscription } from 'rxjs';
import { TravelFormEntity } from 'src/app/tmc/tmc.service';
import { SearchModel, TravelService } from '../travel.service';

@Component({
  selector: 'app-add-apply',
  templateUrl: './add-apply.page.html',
  styleUrls: ['./add-apply.page.scss'],
})
export class AddApplyPage implements OnInit,OnDestroy{
  organization: string;
  organizationCode: string;
  private subscription=Subscription.EMPTY;
  items: TravelFormEntity[];
  searchModel: SearchModel;
  constructor(private modalCtrl: ModalController, private service: TravelService) { }

  ngOnDestroy(){
    this.subscription.unsubscribe()
  }
  ngOnInit() {
    this.searchModel={} as any;
    this.searchModel.PageIndex=0;
    this.searchModel.PageSize=20;
  }
  async onSelectOrg() {
    const m = await this.modalCtrl.create({ component: OrganizationComponent });
    m.present();
    const data = await m.onDidDismiss();
    const org = data && data.data as OrganizationEntity;
    if (org) {
      this.organization = org.Name;
      this.organizationCode = org.Code;
    }
  }
  onSubmit(){
    this.service.travelSubmit(this.searchModel)
  }
}

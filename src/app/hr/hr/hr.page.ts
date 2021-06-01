import { CostcenterComponent } from './../components/costcenter/search-costcenter.component';
import { OrganizationEntity } from 'src/app/hr/hr.service';
import { OrganizationComponent } from '../components/organization/organization.component';
import { ModalController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hr',
  templateUrl: './hr.page.html',
  styleUrls: ['./hr.page.scss'],
})
export class HrPage implements OnInit {
  companyName: string;
  hrId: string;
  organization: string;
  organizationCode: string;
  costcenter: string;
  costcenterCode: string;
  standard: any;
  constructor(private router: Router, private modalCtrl: ModalController) { }
  async onSelectCostCenter() {
    const m = await this.modalCtrl.create({ component: CostcenterComponent });
    m.present();
    const res = await m.onDidDismiss();
    const data = res && res.data as {
      Text: string;
      Value: string;
    };
    if (data) {
      this.costcenter = data.Text;
      this.costcenterCode = data.Value;
    }
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
  async onSelectStandard() {

  }
  ngOnInit() {
  }

}

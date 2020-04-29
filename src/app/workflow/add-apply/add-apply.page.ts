import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OrganizationComponent } from 'src/app/tmc/components/organization/organization.component';
import { OrganizationEntity } from 'src/app/hr/staff.service';

@Component({
  selector: 'app-add-apply',
  templateUrl: './add-apply.page.html',
  styleUrls: ['./add-apply.page.scss'],
})
export class AddApplyPage implements OnInit {
  organization: string;
  organizationCode: string;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
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
}

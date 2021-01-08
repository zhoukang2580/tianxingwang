import { ModalController } from "@ionic/angular";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from "@angular/core";
import { OrganizationComponent } from "../organization/organization.component";
import { OrganizationEntity } from "src/app/hr/staff.service";

@Component({
  selector: "app-book-organization-comp-df",
  templateUrl: "./book-organization-comp-df.component.html",
  styleUrls: ["./book-organization-comp-df.component.scss"],
})
export class BookOrganizationDfCompComponent implements OnInit {
  @Input() isOtherOrganization: boolean;
  @Input() organization: OrganizationEntity;
  @Input() langOpt = {
    department: "部门",
    other: "其他"
  }
  @Output() ionChange: EventEmitter<any>;
  @Input() otherOrganizationName: string;
  constructor(private modalCtrl: ModalController) {
    this.ionChange = new EventEmitter();
  }
  async searchOrganization() {
    if (this.isOtherOrganization) {
      return;
    }
    const modal = await this.modalCtrl.create({
      component: OrganizationComponent,
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    console.log("organization", result.data);
    if (result && result.data) {
      const res = result.data as OrganizationEntity;
      this.organization = {
        ...this.organization,
        Code: res.Code,
        Name: res.Name,
      };
      this.onValueChange();
    }
  }
  onValueChange() {
    this.ionChange.emit({
      isOtherOrganization: this.isOtherOrganization,
      organization: this.organization,
      otherOrganizationName: this.otherOrganizationName,
    });
  }
  ngOnInit() {}
}

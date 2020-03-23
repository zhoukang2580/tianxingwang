import { Component, OnInit } from "@angular/core";
import { PopoverController, ModalController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { duration } from "moment";
import { UploadFileComponent } from "../upload-file/upload-file.component";
@Component({
  selector: "app-refund-flight-ticket-tip",
  templateUrl: "./refund-flight-ticket-tip.component.html",
  styleUrls: ["./refund-flight-ticket-tip.component.scss"]
})
export class RefundFlightTicketTipComponent implements OnInit {
  private result: {
    IsVoluntary: boolean;
    FileName: string;
    FileValue: string;
  } = {} as any;
  constructor(
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {}
  async onVolunteer(isVolunteer: boolean) {
    this.result.IsVoluntary = isVolunteer;
    if (isVolunteer) {
      this.popoverCtrl.dismiss(this.result);
      AppHelper.toast("退票申请中", 1000, "middle");
    } else {
      const ok = await AppHelper.alert(
        "是否上传证明(仅限JPG,PNG格式图片)？",
        true,
        "是",
        "否"
      );
      if (!ok) {
        this.popoverCtrl.dismiss(this.result);
        // AppHelper.toast("退票申请中", 1000, "middle");
      } else {
        const um = await this.modalCtrl.create({
          component: UploadFileComponent
        });
        um.present();
        const res = await um.onDidDismiss();
        if (res && res.data) {
          this.result.FileName = res.data.FileName;
          this.result.FileValue = res.data.FileValue;
        }
        this.popoverCtrl.dismiss(this.result);
      }
    }
  }
  onCancel() {
    this.popoverCtrl.dismiss();
  }
}

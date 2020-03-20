import { Component, OnInit } from "@angular/core";
import { PopoverController } from "@ionic/angular";
import { AppHelper } from 'src/app/appHelper';
import { duration } from 'moment';
@Component({
  selector: "app-refund-flight-ticket-tip",
  templateUrl: "./refund-flight-ticket-tip.component.html",
  styleUrls: ["./refund-flight-ticket-tip.component.scss"]
})
export class RefundFlightTicketTipComponent implements OnInit {
  constructor(private popoverCtrl: PopoverController) {}

  ngOnInit() {}
  async onVolunteer(isVolunteer: boolean) {
    this.popoverCtrl.dismiss(isVolunteer ? "volunteer" : "nonvolunteer");
    if(isVolunteer==true){
      AppHelper.toast('退票申请中',1000,"middle")
    }else{
      const ok=await  AppHelper.alert("是否上传证明(仅限JPG,PNG格式图片)？",true,"是","否")
      if(ok==false){
        AppHelper.toast('退票申请中',1000,"middle")
      }
    }
  
  }
  onCancel() {
    this.popoverCtrl.dismiss();
  }
}

import { OrderStatusType } from "../../models/OrderEntity";
import { ModalController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { SearchTicketConditionModel } from "src/app/tmc/models/SearchTicketConditionModel";
import { CalendarService } from "src/app/tmc/calendar.service";
import { LangService } from "src/app/services/lang.service";
@Component({
  selector: "app-search-ticket-modal",
  templateUrl: "./search-ticket-modal.component.html",
  styleUrls: ["./search-ticket-modal.component.scss"],
})
export class SearchTicketModalComponent implements OnInit {
  condition: SearchTicketConditionModel;
  type: number;
  title: string;
  orderStatus: { label: string; value: OrderStatusType }[] = [];
  constructor(
    private modalCtrl: ModalController,
    private calendarService: CalendarService,
    private langService: LangService
  ) {}
  async back(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    const m = await this.modalCtrl.getTop();
    if (m) {
      m.dismiss().catch((_) => null);
    }
  }
  search() {
    this.modalCtrl.getTop().then((t) => {
      if (t) {
        this.condition.fromDate =
          (this.condition.vmFromDate &&
            this.calendarService
              .getMoment(0, this.condition.vmFromDate)
              .format("YYYY-MM-DD")) ||
          "";
        this.condition.toDate =
          (this.condition.vmToDate &&
            this.calendarService
              .getMoment(0, this.condition.vmToDate)
              .format("YYYY-MM-DD")) ||
          "";
        console.log(this.condition);
        t.dismiss(this.condition).catch((_) => {});
      }
    });
  }
  ngOnInit() {
    if (!this.condition) {
      this.condition = new SearchTicketConditionModel();
    }
    this.orderStatus = [
      { label:this.langService.isEn?"All": "所有", value: "" as any },
      { label:this.langService.isEn?"Pending approval": "等待审核", value: OrderStatusType.WaitHandle },
      { label:this.langService.isEn?"To be paid": "等待支付", value: OrderStatusType.WaitPay },
      { label:this.langService.isEn?"Complete": "完成", value: OrderStatusType.Finish },
      { label:this.langService.isEn?"Cancel": "取消", value: OrderStatusType.Cancel },
    ];
    // this.condition.vmFromDate = moment()
    //   .startOf("year")
    //   .format("YYYY-MM-DD");
    console.log(this.condition);
  }
}

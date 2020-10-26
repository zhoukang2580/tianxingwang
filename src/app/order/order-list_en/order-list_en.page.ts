import {
  Component,
} from "@angular/core";
import { AppHelper } from 'src/app/appHelper';
import { ProductItem, ProductItemType } from 'src/app/tmc/models/ProductItems';
import { OrderListPage } from '../order-list/order-list.page';

@Component({
  selector: "app-order-list",
  templateUrl: "./order-list_en.page.html",
  styleUrls: ["./order-list_en.page.scss"],
})
export class OrderListEnPage extends OrderListPage {
  activeTab: ProductItem;
  title = "Flight";
  tabs: ProductItem[] = [];
  onTabClick(tab: ProductItem) {
    this.isLoading = true;
    this.loadDataSub.unsubscribe();
    this.activeTab = tab;
    this.dataCount = 0;
    this.myTripsTotalCount = 0;
    this.title = tab.labelEn;
    if (this.activeTab.value == ProductItemType.waitingApprovalTask) {
        this.title = tab.labelEn;
    }
    this.doRefresh();
  }
  async onAbolishOrder(data: {
    orderId: string;
    ticketId: string;
    tag: "flight" | "train";
  }) {
    if (data.tag == "flight") {
      this.orderService
        .abolishFlightOrder({
          OrderId: data.orderId,
          Channel: await this.tmcService.getChannel(),
          TicketId: data.ticketId,
        })
        .then(() => {
          AppHelper.alert("Order cancellation application");
          this.doRefresh();
        })
        .catch((e) => {
          AppHelper.alert(e);
        });
    } else if (data.tag == "train") {
      this.orderService
        .abolishTrainOrder({
          OrderId: data.orderId,
          Channel: await this.tmcService.getChannel(),
          TicketId: data.ticketId,
        })
        .then(() => {
          AppHelper.alert("Order cancellation application");
          this.doRefresh();
        })
        .catch((e) => {
          AppHelper.alert(e);
        });
    }
  }
}

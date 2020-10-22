import {
  Component,
} from "@angular/core";
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
}

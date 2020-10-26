import { Component } from "@angular/core";
import { AppHelper } from 'src/app/appHelper';
import { ProductItem, ProductItemType } from 'src/app/tmc/models/ProductItems';

import { MyPage } from '../tab-my/my.page';
@Component({
  selector: "app-my_en",
  templateUrl: "my_en.page.html",
  styleUrls: ["my_en.page.scss"],
})
export class MyEnPage extends MyPage {
  items: ProductItem[] = [];
  PendingTasks() {
    this.router.navigate([AppHelper.getRoutePath("approval-task_en")]);
  }
  onProductClick(tab: ProductItem) {
    if (tab.value != ProductItemType.more) {
      this.goToProductTabsPageEn(tab);
    } else {
      this.goToProductListPageEn();
    }
  }
  private goToProductTabsPageEn(tab: ProductItem) {
    this.router.navigate([AppHelper.getRoutePath(`order-list_en`)], {
      queryParams: { tabId: tab.value },
    });
  }
  private goToProductListPageEn() {
    this.router.navigate([AppHelper.getRoutePath(`product-list_en`)]);
  }
}

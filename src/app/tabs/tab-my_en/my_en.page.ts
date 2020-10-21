import { Component } from "@angular/core";
import { AppHelper } from 'src/app/appHelper';

import { MyPage } from '../tab-my/my.page';
@Component({
  selector: "app-my_en",
  templateUrl: "my_en.page.html",
  styleUrls: ["my_en.page.scss"],
})
export class MyEnPage extends MyPage {
  PendingTasks() {
    this.router.navigate([AppHelper.getRoutePath("approval-task_en")]);
  }
}

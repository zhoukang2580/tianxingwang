import { environment } from "src/environments/environment";
import { ConfigEntity } from "./../../services/config/config.entity";
import { MessageService } from "./../../message/message.service";
import { AppHelper } from "src/app/appHelper";
import { Component, OnInit } from "@angular/core";

import { OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { ConfigService } from "src/app/services/config/config.service";
import { Subscription, Observable, of, from, combineLatest } from "rxjs";
import { Platform, ActionSheetController } from "@ionic/angular";
import { ProductItem, ProductItemType } from "src/app/tmc/models/ProductItems";
import { StaffService, StaffEntity } from "src/app/hr/staff.service";
import { tap, map } from "rxjs/operators";
import { TmcService } from "src/app/tmc/tmc.service";
import { ORDER_TABS } from "src/app/order/product-list_en/product-list_en.page";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { LangService } from "src/app/tmc/lang.service";
import { MyPage } from '../tab-my/my.page';
interface PageModel {
  Name: string;
  RealName: string;
  Mobile: string;
  HeadUrl: string;
}
@Component({
  selector: "app-my_en",
  templateUrl: "my_en.page.html",
  styleUrls: ["my_en.page.scss"],
})
export class MyEnPage extends MyPage {}

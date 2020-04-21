import { AppHelper } from "./../../appHelper";
import { BackButtonComponent } from "./../../components/back-button/back-button.component";
import { ActionSheetController, NavController } from "@ionic/angular";
import { Subscription } from "rxjs";
import {
  InternationalHotelService,
  IInterHotelSearchCondition
} from "./../international-hotel.service";
import { Component, OnInit, Optional, ViewChild } from "@angular/core";
import { flyInOut } from "src/app/animations/flyInOut";

@Component({
  selector: "app-room-count-children",
  templateUrl: "./room-count-children.page.html",
  styleUrls: ["./room-count-children.page.scss"],
  animations: [flyInOut]
})
export class RoomCountChildrenPage implements OnInit {
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  searchCondition: IInterHotelSearchCondition;
  private subscriptions: Subscription[] = [];
  constructor(
    private hotelService: InternationalHotelService,
    private actionSheetCtrl: ActionSheetController
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.hotelService.getSearchConditionSource().subscribe(c => {
        this.searchCondition = c;
      })
    );
  }
  onRemove(c: any) {
    if (this.searchCondition && this.searchCondition.children) {
      this.searchCondition.children = this.searchCondition.children.filter(
        it => it != c
      );
    }
  }
  onAddChild() {
    if (this.searchCondition) {
      this.searchCondition.children = this.searchCondition.children || [];
      if (this.searchCondition.children.length == 0) {
        AppHelper.toast("左滑删除新增项", 1000, "middle");
      }
      this.searchCondition.children.push({ age: 1 });
    }
  }
  onAdd(n: number) {
    if (this.searchCondition) {
      if (this.searchCondition.adultCount <= 1 && n < 0) {
        return;
      }
      this.searchCondition.adultCount += n;
    }
  }
  onConfirm() {
    this.hotelService.setSearchConditionSource(this.searchCondition);
    if (this.backBtn) {
      this.backBtn.back(null);
    }
  }
  async onModifyChildAge(c: { age: number }) {
    const a = await this.actionSheetCtrl.create({
      header: "儿童年龄",
      cssClass: "child-age",
      buttons: new Array(18).fill(0).map((_, idx) => {
        return {
          text: idx == 0 ? `小于1岁` : `${idx}岁`,
          cssClass: "btn-age",
          handler: () => {
            c.age = idx;
            a.dismiss(idx);
          }
        };
      })
    });
    a.present();
  }
}

import { Component, OnInit, ViewChild } from "@angular/core";
import { IonList } from '@ionic/angular';

@Component({
  selector: "app-account-device",
  templateUrl: "./account-device.page.html",
  styleUrls: ["./account-device.page.scss"]
})
export class AccountDevicePage implements OnInit {
  toggleChecked = false;
  @ViewChild('deviceList') deviceList: IonList;
  constructor() { }

  ngOnInit() { }
  delteDevice() { }
  itemClick() { }
  toggleDeleteButton() {
    this.deviceList.closeSlidingItems();
    setTimeout(() => {
      this.toggleChecked = !this.toggleChecked;
    }, this.toggleChecked ? 300 : 0);
  }
  onSlidingItemDrag(){
    this.toggleChecked=false;
  }
}

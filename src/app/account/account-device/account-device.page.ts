import { Component, OnInit, ViewChild } from "@angular/core";
import { IonList } from '@ionic/angular';
import { ApiService } from 'src/app/services/api/api.service';
import { Observable, merge, of } from 'rxjs';
import { BaseRequest } from 'src/app/services/api/BaseRequest';
import { map } from 'rxjs/operators';
type DeviceItem = {
  deviceId: string;
  deviceName: string;
};
@Component({
  selector: "app-account-device",
  templateUrl: "./account-device.page.html",
  styleUrls: ["./account-device.page.scss"]
})
export class AccountDevicePage implements OnInit {
  toggleChecked = false;
  devices$: Observable<DeviceItem[]>;
  @ViewChild('deviceList') deviceList: IonList;
  constructor(private apiService: ApiService) {

  }

  ngOnInit() {
this.loadDevices();
  }
  loadDevices() {
    const req = new BaseRequest();
    this.devices$ = merge(of([
      {
        deviceId: '1',
        deviceName: "mac"
      },
      {
        deviceId: '2',
        deviceName: "Iphone"
      }
    ]),
      this.apiService.getResponse<DeviceItem[]>(req).pipe(map(r => r.Data)));
  }
  delteDevice() {

  }
  itemClick() {

  }
  toggleDeleteButton() {
    this.deviceList.closeSlidingItems();
    setTimeout(() => {
      this.toggleChecked = !this.toggleChecked;
    }, this.toggleChecked ? 300 : 0);
  }
  onSlidingItemDrag() {
    this.toggleChecked = false;
  }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { DemandTourModel } from '../../demand.service';

@Component({
  selector: 'app-demand-item-meeting',
  templateUrl: './demand-item-meeting.component.html',
  styleUrls: ['./demand-item-meeting.component.scss'],
})
export class DemandItemMeetingComponent implements OnInit {
  @Input() demandTourModel: DemandTourModel;
  @Output() demandTour: EventEmitter<any>;
  constructor() {
    this.demandTour = new EventEmitter();
  }

  ngOnInit() {
    this.onReset();
  }
  onReset() {
    this.demandTourModel = {} as any;
  }
  onSubmit() {
    try {
      if(this.demandTourModel){
        if(!this.demandTourModel.MeetingType){
          AppHelper.alert("请输入会议类型");
          return;
        }
        if(!this.demandTourModel.LiaisonName){
          AppHelper.alert("请输入联系人");
          return;
        }
        if(!this.demandTourModel.LiaisonPhone){
          AppHelper.alert("请输入联系电话");
          return;
        }
        const reg = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (!(reg.test(this.demandTourModel.LiaisonPhone))) {
          AppHelper.alert("电话格式不正确");
          return;
        }

        if(!this.demandTourModel.CompanyName){
          AppHelper.alert("请输入公司名称");
          return;
        }

        if(!this.demandTourModel.CompanyEmail){
          AppHelper.alert("请输入公司邮箱");
          return;
        }
        if(!this.demandTourModel.Remarks){
          AppHelper.alert("请输入备注");
          return;
        }
      }
      this.demandTour.emit({ demandTourModel: this.demandTourModel });
    } catch (e) {
      AppHelper.alert(e);
    }
  }
}

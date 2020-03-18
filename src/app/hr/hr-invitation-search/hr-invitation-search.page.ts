import { Component, OnInit, ViewChild, IterableDiffers } from '@angular/core';
import { StaffService, IOrganization } from '../staff.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
interface IItem extends IOrganization { }
@Component({
  selector: 'app-hr-invitation-search',
  templateUrl: './hr-invitation-search.page.html',
  styleUrls: ['./hr-invitation-search.page.scss'],
})
export class HrInvitationSearchPage implements OnInit {
  private subscription = Subscription.EMPTY;
  private type = '';
  @ViewChild(BackButtonComponent) backbtn: BackButtonComponent;
  keywords = '';
  items: IItem[];
  title = '';
  isShowSearch: boolean;
  deptPaths: IOrganization[] = [{ Name: "部门", Id: "0" }];
  constructor(private staffservice: StaffService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(q => {
      this.type = q.get("type");
      this.onSearch();
    })
  }
  onbackdepartment(item: IOrganization) {
    if(item!=this.deptPaths[this.deptPaths.length-1]){
      this.getOrganization(item.Id)
    }
    const idx = this.deptPaths.findIndex(it => it.Id == item.Id);
    this.deptPaths = this.deptPaths.slice(0, idx+1);
  }
  onSelectNext(item: IOrganization) {
    this.getOrganization(item.Id)
    if (!this.deptPaths.find(it=>{
     return it.Id==item.Id
    })) {

      this.deptPaths.push(item)
    }

  }
  onSearch() {
    this.subscription.unsubscribe();
    if (this.type == "policy") {
      this.isShowSearch = true;
      this.getPolicy()
    } else if (this.type == "costcenter") {
      this.isShowSearch = true;
      this.getCostCenter();
    } else if (this.type == "organization") {
      this.isShowSearch = false;
      this.getOrganization();
    }

  }
  onItemsChange(item: IItem) {
    this.subscription.unsubscribe();
    if (this.type == "policy") {
      this.staffservice.setHrInvitationSource({
        ...this.staffservice.getHrInvitation(),
        policy: item,
      })
    } else if (this.type == "costcenter") {
      this.staffservice.setHrInvitationSource({
        ...this.staffservice.getHrInvitation(),
        constCenter: item,
      })
    } else if (this.type == "organization") {
      this.staffservice.setHrInvitationSource({
        ...this.staffservice.getHrInvitation(),
        organization: item,
      })
    }
    this.back();
  }
  private getOrganization(parentId = '0') {
    this.subscription = this.staffservice.getOrganization({ parentId }).subscribe(res => {
      if (res && res.Data) {
        this.items = res.Data;
      }
    })
  }
  private getCostCenter() {
    this.subscription = this.staffservice.getCostCenter({ name: this.keywords }).subscribe(res => {
      if (res && res.Data) {
        this.items = res.Data;
      }
    })
  }
  private getPolicy() {
    this.subscription = this.staffservice.getPolicy({ name: this.keywords }).subscribe(res => {
      if (res && res.Data) {
        this.items = res.Data;
      }
    })
  }

  private back() {
    this.backbtn.backToPrePage();
  }

}

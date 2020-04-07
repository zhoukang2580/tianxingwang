import { Component, OnInit, ViewChild, IterableDiffers } from '@angular/core';
import { StaffService, IOrganization } from '../staff.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { CountryEntity } from 'src/app/tmc/models/CountryEntity';
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
  contries: CountryEntity[];
  title = '';
  isShowSearch: number;
  deptPaths: IOrganization[] = [{ Name: "部门", Id: "0" }];
  top_title: string;
  constructor(private staffservice: StaffService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(q => {
      this.type = q.get("type");
      this.onSearch();
    })
  }
  onbackdepartment(item: IOrganization) {
    if (item != this.deptPaths[this.deptPaths.length - 1]) {
      this.getOrganization(item.Id)
    }
    const idx = this.deptPaths.findIndex(it => it.Id == item.Id);
    this.deptPaths = this.deptPaths.slice(0, idx + 1);
  }

  onSelectNext(item: IOrganization) {
    this.getOrganization(item.Id)
    if (!this.deptPaths.find(it => {
      return it.Id == item.Id
    })) {

      this.deptPaths.push(item)
    }

  }
  onSearch() {
    this.subscription.unsubscribe();
    if (this.type == "policy") {
      this.isShowSearch = 1;
      this.getPolicy();
      this.top_title = '政策';
    } else if (this.type == "costcenter") {
      this.isShowSearch = 1;
      this.getCostCenter();
      this.top_title = '成本中心';
    } else if (this.type == "organization") {
      this.isShowSearch = 2;
      this.getOrganization();
      this.top_title = '组织架构';
    } else if (this.type == "countries") {
      this.isShowSearch = 3;
      this.getCountries();
      this.top_title = "国家"
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
    } else if (this.type == "countries") {
      this.staffservice.setHrInvitationSource({
        ...this.staffservice.getHrInvitation(),
        country: {
          Id: item.Id,
          Name: item.Name
        } as CountryEntity,
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
  private async getCountries() {
    // console.log(await this.staffservice.getCountriesAsync(),"11111111111");
    const arr=await this.staffservice.getCountriesAsync();
    this.contries= arr.filter(it=>{
      return !this.keywords?true:it.Name.includes(this.keywords)||
      !this.keywords?true:it.Code.toLocaleLowerCase().includes(this.keywords)
    });
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

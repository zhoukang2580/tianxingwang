import { Component, OnInit, ViewChild, IterableDiffers } from "@angular/core";
import { HrService, IOrganization } from "../hr.service";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { CountryEntity } from "src/app/tmc/models/CountryEntity";
interface IItem extends IOrganization {
  Code?: string;
}
@Component({
  selector: "app-hr-invitation-search",
  templateUrl: "./hr-invitation-search.page.html",
  styleUrls: ["./hr-invitation-search.page.scss"],
})
export class HrInvitationSearchPage implements OnInit {
  private subscription = Subscription.EMPTY;
  private hrId: string;
  private type = "";
  @ViewChild(BackButtonComponent) backbtn: BackButtonComponent;
  keywords = "";
  items: IItem[];
  contries: CountryEntity[];
  title = "";
  isShowSearch: number;
  deptPaths: IOrganization[] = [{ Name: "部门", Id: "0" }];
  top_title: string;
  constructor(private hrService: HrService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((q) => {
      this.type = q.get("type");
      this.hrId = q.get("hrId");
      this.onSearch();
    });
  }
  onbackdepartment(item: IOrganization) {
    if (item != this.deptPaths[this.deptPaths.length - 1]) {
      this.getOrganization(item.Id);
    }
    const idx = this.deptPaths.findIndex((it) => it.Id == item.Id);
    this.deptPaths = this.deptPaths.slice(0, idx + 1);
  }

  onSelectNext(item: IOrganization) {
    this.getOrganization(item.Id);
    if (
      !this.deptPaths.find((it) => {
        return it.Id == item.Id;
      })
    ) {
      this.deptPaths.push(item);
    }
  }
  onSearch() {
    this.subscription.unsubscribe();
    if (this.type == "policy") {
      this.isShowSearch = 1;
      this.getPolicy();
      this.top_title = "政策";
    } else if (this.type == "costcenter") {
      this.isShowSearch = 1;
      this.getCostCenter();
      this.top_title = "成本中心";
    } else if (this.type == "organization") {
      this.isShowSearch = 2;
      this.getOrganization();
      this.top_title = "组织架构";
    } else if (this.type == "countries") {
      this.isShowSearch = 3;
      this.getCountries();
      this.top_title = "国家";
    }
  }
  onItemsChange(item: IItem) {
    this.subscription.unsubscribe();
    if (this.type == "policy") {
      // this.staffservice.setHrInvitationSource({
      //   ...this.staffservice.getHrInvitation(),
      //   policy: item,
      // });
    } else if (this.type == "costcenter") {
      this.hrService.hrInvitation = {
        ...this.hrService.hrInvitation,
        costCenter: item,
      };
    } else if (this.type == "organization") {
      this.hrService.hrInvitation = {
        ...this.hrService.hrInvitation,
        organization: item,
      };
    } else if (this.type == "countries") {
      this.hrService.hrInvitation = {
        ...this.hrService.hrInvitation,
        country: {
          Id: item.Id,
          Name: item.Name,
          Code: item.Code,
        } as CountryEntity,
      };
    }
    this.back();
  }
  private getOrganization(parentId = "0") {
    this.hrService
      .getOrganization({ parentId, hrId: this.hrId })
      .then((res) => {
        if (res) {
          this.items = res;
        }
      });
  }
  private async getCountries() {
    // console.log(await this.staffservice.getCountriesAsync(),"11111111111");
    const arr = await this.hrService.getCountriesAsync();
    this.contries = arr.filter((it) => {
      return !this.keywords
        ? true
        : it.Name.includes(this.keywords) || !this.keywords
        ? true
        : it.Code.toLocaleLowerCase().includes(this.keywords);
    });
  }
  private getCostCenter() {
    this.hrService
      .getCostCenter({ name: this.keywords, hrId: this.hrId })
      .then((res) => {
        if (res) {
          this.items = res;
        }
      });
  }
  private getPolicy() {
    this.subscription = this.hrService
      .getPolicy({ name: this.keywords, hrId: this.hrId })
      .subscribe((res) => {
        if (res && res.Data) {
          this.items = res.Data;
        }
      });
  }

  private back() {
    this.backbtn.popToPrePage();
  }
}

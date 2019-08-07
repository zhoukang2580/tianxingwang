import { TmcService } from "src/app/tmc/tmc.service";
import { OrganizationEntity } from "../../../hr/staff.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalController, IonRefresher } from "@ionic/angular";
import {
  NodeItem,
  TreeOptions,
  TreeCallbacks
} from "src/app/components/tree-ngx";

@Component({
  selector: "app-organization",
  templateUrl: "./organization.component.html",
  styleUrls: ["./organization.component.scss"]
})
export class OrganizationComponent implements OnInit {
  nodeItems: NodeItem<OrganizationEntity>[] = [];
  filter = "";
  vmKeyword = "";
  isLoading = true;
  private selectedNode: OrganizationEntity;
  options: TreeOptions;
  callbacks: TreeCallbacks;
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  constructor(
    private modalCtrl: ModalController,
    private tmcService: TmcService
  ) {}
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss(this.selectedNode).catch(_ => {});
    }
  }
  doSearch() {
    this.filter = (this.vmKeyword || "").trim();
  }
  ngOnInit() {
    this.callbacks = {
      nameClick: (item: NodeItem<OrganizationEntity>) => {
        this.selectedNode = item.item;
        this.back();
      },
      select: (item: NodeItem<OrganizationEntity>) => {
        this.selectedNode = item.item;
      },
      unSelect: (item: NodeItem<OrganizationEntity>) => {
        this.selectedNode = null;
      },
      toggle: (item: NodeItem<OrganizationEntity>) => {}
    };
    this.doRefresh();
  }
  async doRefresh() {
    this.isLoading = true;
    this.nodeItems = (await this.tmcService.getOrganizations()).map(item => {
      return {
        id: item.Id,
        item: item,
        name: item.Name,
        parentId: item.Parent && item.Parent.Id,
        parent: item.Parent && {
          id: item.Parent.Id,
          name: item.Parent.Name,
          parent: item.Parent && {
            id: item.Parent.Id,
            name: item.Parent.Name,
            item: item.Parent,
            parentId: item.Parent.Parent && item.Parent.Parent.Id
          }
        }
      };
    });
    this.isLoading = false;
    if (this.ionRefresher) {
      this.ionRefresher.complete();
    }
  }
}

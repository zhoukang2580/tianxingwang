import { TmcService } from "src/app/tmc/tmc.service";
import { OrganizationEntity } from "./../../../hr/staff.service";
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
  nodeItems: NodeItem<OrganizationEntity>[];
  filter = "";
  vmKeyword = "";
  isLoading = true;
  private selectedNode: any;
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
        this.selectedNode=item;
        this.back();
      },
      select: (item: NodeItem<OrganizationEntity>) => {
        this.selectedNode = item;
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
    const data = (await this.tmcService.getOrganizations()).map(item => {
      return {
        ...item,
        ParentId: item.Parent && item.Parent.Id
      };
    });
    this.nodeItems = [];
    const root = this.findRoot(data);
    if (root) {
      const node: NodeItem<OrganizationEntity> = {
        id: root.Id,
        name: root.Name,
        item: root,
        children: [],
        expanded: false,
        selected: false
      };
      this.nodeItems.push(node);
      this.buildTree(root, data, node.children);
      this.nodeItems=this.nodeItems[0].children;
    }
    console.log("nodeitems", this.nodeItems);
    this.isLoading = false;
    if (this.ionRefresher) {
      this.ionRefresher.complete();
    }
  }
  private buildTree(
    parent: OrganizationEntity,
    data: OrganizationEntity[],
    tree: NodeItem<OrganizationEntity>[]
  ) {
    const children = data.filter(item => item.ParentId == parent.Id);
    children.forEach(c => {
      const node = {
        id: c.Id,
        name: c.Name,
        item: c,
        children: [],
        expanded: false,
        selected: false
      };
      tree.push(node);
      this.buildTree(c, data, node.children);
    });
  }
  private findRoot(data: OrganizationEntity[]) {
    const item = data.find(it => !it.ParentId || it.ParentId == "0");
    return item.Parent;
  }
}

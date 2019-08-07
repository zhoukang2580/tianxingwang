import { TmcService } from "src/app/tmc/tmc.service";
import { OrganizationEntity } from "../../../hr/staff.service";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalController, IonRefresher } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import {
  NodeItem,
  TreeOptions,
  TreeCallbacks
} from "src/app/components/tree-ngx";
const ORGANIZATION_PREFERANCE_KEY = "organization_preferance_key";
interface LocalOrganizationEntity {
  data: OrganizationEntity[];
  lastUpdateTime: number;
}
@Component({
  selector: "app-organization",
  templateUrl: "./organization.component.html",
  styleUrls: ["./organization.component.scss"]
})
export class OrganizationComponent implements OnInit {
  nodeItems: NodeItem<OrganizationEntity>[] = [];
  originalNodes: OrganizationEntity[] = [];
  currentSelectedNode: OrganizationEntity;
  currentSelectedNodePaths: OrganizationEntity[];
  currentSelectedNodeChildren: OrganizationEntity[];
  filter = "";
  vmKeyword = "";
  isLoading = true;
  options: TreeOptions;
  callbacks: TreeCallbacks;
  isTreeMode;
  private rootDeptName = "部门";
  private selectedNode: OrganizationEntity;
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  constructor(
    private modalCtrl: ModalController,
    private tmcService: TmcService,
    private storage: Storage
  ) {}
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss(this.selectedNode).catch(_ => {});
    }
  }
  doSearch() {
    this.filter = (this.vmKeyword || "").trim();
    if (!this.isTreeMode) {
      if (this.filter) {
        this.isLoading = true;
        setTimeout(() => {
          this.currentSelectedNodeChildren = this.originalNodes.filter(it =>
            it.Name.includes(this.filter)
          );
        }, 100);
      } else {
        this.initNodes();
      }
      this.isLoading = false;
    }
  }
  onNextHierachy(node: OrganizationEntity) {
    this.currentSelectedNode = node;
    this.currentSelectedNodePaths = this.getParents(node);
    this.currentSelectedNodeChildren = this.getChildren(node);
  }
  private initNodes() {
    const root = this.findRoot();
    // console.log(root);
    if (root) {
      if (!root.Name) {
        root.Name = this.rootDeptName;
      }
      this.onNextHierachy(root);
    }
  }
  private findRoot() {
    if (!this.originalNodes || this.originalNodes.length == 0) {
      return null;
    }
    let n = this.originalNodes[0];
    if (!n.Parent) {
      return n;
    }
    while (n && n.Parent) {
      const temp = n;
      n = this.originalNodes.find(it => it.Id == n.ParentId);
      if (!n || !n.Parent) {
        return n ? n : temp && temp.Parent;
      }
    }
  }
  getChildren(node: OrganizationEntity) {
    if (!node) {
      return [];
    }
    return this.originalNodes.filter(it => it.ParentId == node.Id);
  }
  private getParents(node: OrganizationEntity) {
    const result: OrganizationEntity[] = [];
    if (!node) {
      return result;
    }
    let root = this.findRoot();
    if (node.Id == root.Id) {
      if (!node.Name) {
        node.Name = this.rootDeptName;
      }
      return [node];
    }
    result.push(node);
    let p = node.Parent;
    while (p) {
      console.log(p);
      result.unshift(p);
      p = this.originalNodes.find(it => it.Id == p.Id);
    }
    root = result[0];
    if (root) {
      if (!root.Name) {
        root.Name = this.rootDeptName;
      }
    }
    return result;
  }
  async changeMode() {
    this.isTreeMode = !this.isTreeMode;
    this.doRefresh();
  }
  async ngOnInit() {
    this.isTreeMode = await this.storage.get(ORGANIZATION_PREFERANCE_KEY);
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
    await this.doRefresh();
    this.initNodes();
  }
  onItemSelect(node: OrganizationEntity) {
    this.selectedNode = node;
    this.back();
  }
  async doRefresh(forceFetch = false) {
    this.isLoading = true;
    const local: LocalOrganizationEntity = await this.storage.get(
      ORGANIZATION_PREFERANCE_KEY
    );
    if (
      !forceFetch &&
      local &&
      Date.now() - local.lastUpdateTime < 10 * 60 * 1000 &&
      local.data &&
      local.data.length
    ) {
      this.originalNodes = local.data;
    } else {
      this.originalNodes = [];
    }
    if (this.originalNodes.length == 0) {
      this.originalNodes = (await this.tmcService.getOrganizations()).map(
        it => {
          return { ...it, ParentId: it && it.Parent.Id };
        }
      );
      await this.storage.set(ORGANIZATION_PREFERANCE_KEY, {
        lastUpdateTime: Date.now(),
        data: this.originalNodes
      } as LocalOrganizationEntity);
    }
    this.nodeItems = this.originalNodes.map(item => {
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

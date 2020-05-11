import { Subscription } from "rxjs";
import { RequestEntity } from "../../../services/api/Request.entity";
import { ApiService } from "../../../services/api/api.service";
import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import {
  ModalController,
  IonRefresher,
  IonInfiniteScroll,
} from "@ionic/angular";
import { Storage } from "@ionic/storage";
import {
  NodeItem,
  TreeOptions,
  TreeCallbacks,
} from "src/app/components/tree-ngx";
import { tap, finalize } from "rxjs/operators";
const ORGANIZATION_PREFERANCE_KEY = "organization_preferance_key";
const ORGANIZATION_PREFERANCE_KEY_MODE = "organization_preferance_key_mode";
interface TreeData {
  Id: string;
  Name?: string;
  Parent?: TreeData;
  HasChildren?: boolean;
}
@Component({
  selector: "app-organization",
  templateUrl: "./tree-data.component.html",
  styleUrls: ["./tree-data.component.scss"],
})
export class TreeDataComponent implements OnInit, OnDestroy {
  nodes: TreeData[];
  nodeItems: NodeItem<TreeData>[] = [];
  currentSelectedNode: TreeData;
  currentSelectedNodePaths: TreeData[];
  filter = "";
  vmKeyword = "";
  isLoading = true;
  options: TreeOptions;
  callbacks: TreeCallbacks;
  isTreeMode;
  rootDeptName = "分类";
  private pageIndex = 0;
  private parentId = 0;
  private selectedNode: TreeData;
  private reqMethod: string;
  private subscription = Subscription.EMPTY;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  constructor(
    private modalCtrl: ModalController,
    private storage: Storage,
    private apiService: ApiService
  ) {}
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss(this.selectedNode).catch((_) => {});
    }
  }
  async ngOnInit() {
    this.currentSelectedNodePaths = [{ Name: this.rootDeptName, Id: "0" }];
    this.isTreeMode = await this.storage.get(ORGANIZATION_PREFERANCE_KEY_MODE);
    this.callbacks = {
      nameClick: (item: NodeItem<TreeData>) => {
        this.selectedNode = item.item;
        this.back();
      },
      select: (item: NodeItem<TreeData>) => {
        this.selectedNode = item.item;
      },
      unSelect: (item: NodeItem<TreeData>) => {
        this.selectedNode = null;
      },
      toggle: (item: NodeItem<TreeData>) => {},
    };
    this.doRefresh();
  }
  onItemSelect(node: TreeData) {
    this.selectedNode = node;
    this.back();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  doSearch() {
    this.currentSelectedNodePaths = [];
    this.filter = (this.vmKeyword || "").trim();
    this.nodeItems = [];
    this.nodes = [];
    this.pageIndex = 0;
    this.parentId = 0;
    this.loadMore();
  }
  onNextHierachy(node: TreeData) {
    this.currentSelectedNode = node;
    this.nodeItems = [];
    this.nodes = [];
    this.pageIndex = 0;
    this.parentId = +node.Id;
    if (!this.currentSelectedNodePaths.find((it) => it.Id == node.Id)) {
      this.currentSelectedNodePaths.push(node);
    }
    this.currentSelectedNodePaths = this.currentSelectedNodePaths.slice(
      this.currentSelectedNodePaths.findIndex((it) => it.Id == node.Id)
    );
    this.loadMore();
  }
  async changeMode() {
    this.isTreeMode = !this.isTreeMode;
    await this.storage.set(ORGANIZATION_PREFERANCE_KEY_MODE, this.isTreeMode);
    this.doRefresh();
  }
  doRefresh() {
    this.currentSelectedNodePaths = [];
    this.nodes = [];
    this.nodeItems = [];
    this.isLoading = true;
    this.subscription.unsubscribe();
    this.pageIndex = 0;
    this.parentId = 0;
    this.loadMore();
  }
  loadMore() {
    const req = new RequestEntity();
    req.Method = this.reqMethod;
    req.Data = {
      ParentId: this.parentId,
      PageSize: 20,
      PageIndex: this.pageIndex,
      Name: (this.vmKeyword && this.vmKeyword.trim()) || "",
    };
    req.IsShowLoading = this.pageIndex == 0;
    req.LoadingMsg = "正在获取";
    this.subscription = this.apiService
      .getResponse<TreeData[]>(req)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.isLoading = false;
            if (this.scroller) {
              this.scroller.complete();
            }
            if (this.ionRefresher && this.pageIndex <= 1) {
              this.ionRefresher.complete();
            }
          }, 200);
        })
      )
      .subscribe((r) => {
        const arr = r && r.Data;
        if (this.scroller) {
          this.scroller.disabled = arr.length < 20;
        }
        if (arr.length) {
          this.nodes = this.nodes.concat(arr);
          this.nodeItems = this.nodeItems.concat(
            arr.map((item) => {
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
                    parentId: item.Parent.Parent && item.Parent.Parent.Id,
                  },
                },
              };
            })
          );
          this.pageIndex++;
        }
      });
  }
}

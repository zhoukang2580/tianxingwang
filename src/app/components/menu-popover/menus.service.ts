import { IdentityService } from "src/app/services/identity/identity.service";
import { Injectable } from "@angular/core";
const KEY_SYSTEMS_MENUS = "key_systems_menus_";
import { Storage } from "@ionic/storage";
import { Subject, BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";
export const WMS_SYSTEM_MENUS: SystemsMenus[] = [
  {
    feature: "wms",
    id: "wms-inventories",
    isShowInFeatureTabHome: true,
    isCanRemove: true,
    name: `库存清单`,
    bgColor: "var(--ion-color-light)",
    imageUrl: `assets/svgs/inventories.svg`,
    icon: `inventories`,
    iconColor: "var(--ion-color-secondary)",
    route: `wms-inventory-list`,
    appAuthority:
      "PresentationWmsWebsiteUrl.Inventory.Index.App_WmsInventoryQuery",
  },
  {
    feature: "wms",
    id: "wms-warehouse-initialize",
    isShowInFeatureTabHome: true,
    isCanRemove: true,
    name: `库存初始化`,
    imageUrl: `assets/svgs/warehouse-initialize.svg`,
    icon: `warehouse-initialize`,
    iconColor: "var(--ion-color-success)",
    bgColor: "var(--ion-color-light)",
    route: `wms-inventory-list`,
    queryParams: {
      canEdit: true,
    },
    appAuthority:
      "PresentationWmsWebsiteUrl.Inventory.Index.App_WmsInventoryOp",
  },
  {
    feature: "wms",
    id: "wms-product-maintain",
    isShowInFeatureTabHome: true,
    isCanRemove: true,
    name: `产品维护`,
    imageUrl: `assets/svgs/wms-product-maintain.svg`,
    icon: `wms-product-maintain`,
    iconColor: "var(--ion-color-secondary)",
    bgColor: "var(--ion-color-light)",
    route: `wms-product`,
    appAuthority: "PresentationWmsWebsiteUrl.Product.Index.App_WmsProduct",
  },
  {
    feature: "wms",
    id: "wms-day-report",
    isShowInFeatureTabHome: true,
    isCanRemove: true,
    name: `日报表`,
    imageUrl: `assets/svgs/day-report.svg`,
    icon: `day-report`,
    bgColor: "var(--ion-color-light)",
    iconColor: "var(--ion-color-secondary)",
    route: `wms-inventory-day-report`,
    appAuthority:
      "PresentationWmsReportUrl.InventoryDay.Index.App_WmsReportInventoryDay",
  },
  {
    feature: "wms",
    id: "wms-month-report",
    isShowInFeatureTabHome: true,
    isCanRemove: true,
    name: `月报表`,
    bgColor: "var(--ion-color-light)",
    imageUrl: `assets/svgs/month-report.svg`,
    iconColor: "var(--ion-color-secondary)",
    icon: `month-report`,
    route: `wms-inventory-month-report`,
    appAuthority:
      "PresentationWmsReportUrl.InventoryMonth.Index.App_WmsReportInventoryMonth",
  },
  {
    feature: "wms",
    id: "wms-warehouse",
    isShowInFeatureTabHome: true,
    isCanRemove: true,
    name: `仓库报表`,
    bgColor: "var(--ion-color-light)",
    imageUrl: `assets/svgs/warehouse.svg`,
    iconColor: "var(--ion-color-danger)",
    icon: `warehouse`,
    route: `wms-inventory-warehouse-report`,
    appAuthority:
      "PresentationWmsReportUrl.WarehourseProduct.Index.App_WmsReportWarehourseProduct",
  },
  {
    feature: "wms",
    id: "wms-stockwarning-report",
    isShowInFeatureTabHome: true,
    isCanRemove: true,
    name: `预警报表`,
    bgColor: "var(--ion-color-light)",
    imageUrl: `assets/svgs/stockwarning.svg`,
    iconColor: "var(--ion-color-danger)",
    icon: `stockwarning`,
    route: `wms-stockwarning-report`,
    appAuthority:
      "PresentationWmsReportUrl.StockWarning.Index.App_WmsReportStockWarning",
  },
  {
    feature: "wms",
    id: "wms-warehouse-management",
    isShowInFeatureTabHome: true,
    isCanRemove: true,
    name: `仓库管理`,
    imageUrl: `assets/svgs/warehouse-management.svg`,
    icon: `warehouse-management`,
    iconColor: "var(--ion-color-warning)",
    bgColor: "var(--ion-color-light)",
    route: `wms-warehouse`,
    appAuthority: "PresentationWmsReportUrl.Warehouse.Index.App_WmsWarehouse",
  },
  {
    feature: "wms",
    id: "wms-product-inout-report",
    isShowInFeatureTabHome: true,
    isCanRemove: true,
    name: `滞销品`,
    imageUrl: `assets/svgs/unsale.svg`,
    icon: `unsale`,
    iconColor: "var(--ion-color-danger)",
    bgColor: "var(--ion-color-light)",
    route: `wms-product-inout-report`,
    appAuthority:
      "PresentationWmsReportUrl.ProductInout.Index.App_WmsReportProductInout",
  },
  {
    feature: "wms",
    id: "wms-update-basedata",
    isShowInFeatureTabHome: true,
    isCanRemove: true,
    name: `更新基础数据`,
    imageUrl: `assets/svgs/update-basedata.svg`,
    icon: `update-basedata`,
    iconColor: "var(--ion-color-secondary)",
    bgColor: "var(--ion-color-light)",
    route: ``,
    action: "onUpdate",
  },
];
export const SYSTEMS_MENUS: SystemsMenus[] = [
  // {
  //   name: `电子扫码系统`,
  //   imageUrl: `assets/svgs/ess.svg`,
  //   route: `ess-home`,
  //   authId: "EssId",
  // },
  {
    isShowInFeatureTabHome: false,
    isShowInHome: true,
    icon: "icon-mms",
    id: "mms-admin-home",
    name: `营销系统`,
    imageUrl: `assets/svgs/mms.svg`,
    route: `mms-admin-home`,
    authId: "MmsId",
    bgColor: "var(--ion-color-tertiary)",
    iconColor: "var(--ion-color-light)",
    feature: "mms",
  },
  {
    isShowInFeatureTabHome: false,
    isShowInHome: true,
    id: "wms-home",
    name: `仓储系统`,
    imageUrl: `assets/svgs/wms.svg`,
    icon: `wms`,
    route: `wms-home`,
    authId: "WmsId",
    feature: "wms",
    iconColor: "var(--ion-color-light)",
    bgColor: "var(--ion-color-secondary)",
  },
  {
    isShowInFeatureTabHome: false,
    isShowInHome: true,
    name: `客户管理`,
    id: "crm-home",
    imageUrl: `assets/svgs/customers.svg`,
    icon: `customers`,
    route: `crm-home`,
    authId: "CrmId",
    iconColor: "var(--ion-color-light)",
    bgColor: "var(--ion-color-danger)",
    feature: "crm",
  },
  {
    isShowInFeatureTabHome: false,
    isShowInHome: true,
    name: `日常办公`,
    imageUrl: `assets/svgs/dairywork.svg`,
    icon: `dairywork`,
    route: `bpm-home`,
    id: `bpm-dairy-work`,
    authId: "BpmId",
    iconColor: "var(--ion-color-light)",
    bgColor: "var(--ion-color-warning)",
    feature: "bpm",
  },
  {
    isShowInFeatureTabHome: true,
    feature: "bpm",
    id: "bpm-product-management",
    imageUrl: "assets/svgs/bpm-product-management.svg",
    icon: "bpm-product-management",
    iconColor: "var(--ion-color-secondary)",
    bgColor: "var(--ion-color-light)",
    route: "bpm-products",
    name: "产品维护",
    appAuthority:
      "PresentationBpmWebsiteAdminUrl.Product.Index.App_BpmProductOp",
    isCanRemove: true,
    isShowInHome: false,
  },
  ...WMS_SYSTEM_MENUS,
].map((it: SystemsMenus) => {
  if (it.icon) {
    if (!it.icon.startsWith("icon-")) {
      it.icon = `icon-${it.icon}`;
    }
  }
  return it as SystemsMenus;
});
@Injectable({
  providedIn: "root",
})
export class MenusService {
  private menusSource: Subject<SystemsMenus[]>;
  private menus: SystemsMenus[];
  constructor(
    private storage: Storage,
    private identityService: IdentityService
  ) {
    this.menusSource = new BehaviorSubject(null);
    if (
      Array.from(new Set(SYSTEMS_MENUS.map((it) => it.id))).length !=
      SYSTEMS_MENUS.length
    ) {
      throw new Error("键不能重复");
    }
    this.initSystemMenus();
    this.identityService.getIdentitySource().subscribe((it) => {
      if (it && it.Ticket && it.Id) {
        this.initSystemMenus();
      }
    });
  }
  private initSystemMenus() {
    try {
      this.menus = SYSTEMS_MENUS.map((m) => {
        if (!m.refresh) {
          m.refresh = () => {
            console.log("更新", m, this.menus);
            if (this.menus) {
              const menu = this.menus.find((it) => it.id == m.id);
              if (menu) {
                const one = {
                  ...menu,
                  refresh: menu.refresh,
                };
                one.isCanRemove = m.isCanRemove;
                one.bgColor = m.bgColor;
                one.isShowInHome = m.isShowInHome;
                if (one.isShowInHome) {
                  one.bgColor = "var(--ion-color-secondary)";
                  one.iconColor = "var(--ion-color-light)";
                }
              }
              this.getCacheKey()
                .then((k) => {
                  if (k) {
                    this.storage.set(
                      k,
                      this.menus.map((it) => {
                        return {
                          ...it,
                          refresh: null,
                        };
                      })
                    );
                  }
                })
                .finally(() => {
                  this.setMenusSource(this.menus);
                });
            }
          };
        }
        return m;
      });
      this.getCacheKey()
        .then((k) => {
          if (k) {
            return this.storage.get(k).then((local: SystemsMenus[]) => {
              if (local) {
                local.forEach((m) => {
                  const oneM = this.menus.find((it) => it.name == m.name);
                  if (oneM) {
                    oneM.isShowInHome = m.isShowInHome;
                    oneM.isCanRemove = m.isCanRemove;
                    oneM.bgColor = m.bgColor;
                    oneM.iconColor = m.iconColor;
                  }
                });
              } else {
                this.menus = this.menus.map((it) => {
                  if (it.isCanRemove) {
                    it.isShowInHome = false;
                  }
                  return it;
                });
              }
            });
          }
        })
        .finally(() => {
          this.setMenusSource(this.menus);
        });
    } catch (error) {
      console.error(error);
    }
  }
  private async getCacheKey() {
    let k = "";
    try {
      const identity = await this.identityService.getIdentityAsync();
      if (identity && identity.Id) {
        k = `${KEY_SYSTEMS_MENUS}${identity.Id}`;
      }
    } catch (e) {
      console.error(e);
    }
    console.log("menus cache key", k);
    return k;
  }
  getMenusSource() {
    return this.menusSource.asObservable().pipe(filter((it) => !!it));
  }
  setMenusSource(menus: SystemsMenus[]) {
    if (menus) {
      menus = menus.map((it) => {
        if (it.name) {
          it.name =
            it.feature == "wms" &&
            it.isShowInHome &&
            it.isCanRemove &&
            it.name == "产品维护" &&
            !it.name.includes("仓库")
              ? `仓库${it.name}`
              : it.name;
        }
        return it;
      });
    }
    this.menus = menus;
    this.menusSource.next(menus);
  }
}
export interface SystemsMenus {
  /** 颜色，css 样式或者主题色 */
  bgColor?:
    | "var(--ion-color-primary)"
    | "var(--ion-color-secondary)"
    | "var(--ion-color-warning)"
    | "var(--ion-color-danger)"
    | "var(--ion-color-tertiary)"
    | string;
  name: string;
  nameColor?: string;
  id: string;
  /** 功能，比如,mms,wms */
  feature: string;
  isShowInFeatureTabHome: boolean;
  isCanRemove?: boolean; // 是否可以从首页移除
  isShowInHome?: boolean; // 当前是否显示在首页
  imageUrl?: string;
  icon?: string;
  iconColor?: string;
  route?: string;
  queryParams?: any;
  authId?: string;
  appAuthority?: string;
  action?: string;
  refresh?: () => any;
}

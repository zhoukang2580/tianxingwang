import { IdentityService } from "src/app/services/identity/identity.service";
import { Injectable } from "@angular/core";
const KEY_SYSTEMS_MENUS = "key_systems_menus_";
import { Subject, BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";
import { ApiService } from "src/app/services/api/api.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { AuthorizeService } from "src/app/services/authorize/authorize.service";
import { StorageService } from "src/app/services/storage-service.service";
export const WMS_REPORTS_SYSTEM_MENUS: SystemsMenus[] = [
  {
    feature: "wms",
    id: "wms-day-report",
    isShowInFeatureTabHome: true,
    isCanRemove: true,
    name: `日报表`,
    // imageUrl: `assets/svgs/day-report.svg`,
    icon: `day-report`,
    bgColor: "var(--ion-color-secondary)",
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
    bgColor: "var(--ion-color-secondary)",
    // imageUrl: `assets/svgs/month-report.svg`,
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
    bgColor: "var(--ion-color-secondary)",
    // imageUrl: `assets/svgs/warehouse.svg`,
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
    bgColor: "var(--ion-color-secondary)",
    // imageUrl: `assets/svgs/stockwarning.svg`,
    iconColor: "var(--ion-color-danger)",
    icon: `stockwarning`,
    route: `wms-stockwarning-report`,
    appAuthority:
      "PresentationWmsReportUrl.StockWarning.Index.App_WmsReportStockWarning",
  },
].map((it: SystemsMenus) => {
  if (!it.authId) {
    it.authId = "PresentationWmsReportUrl";
  }
  return it;
});
export const WMS_SYSTEM_MENUS: SystemsMenus[] = [
  {
    feature: "wms",
    id: "wms-inventories",
    isShowInFeatureTabHome: true,
    isCanRemove: true,
    name: `库存清单`,
    bgColor: "var(--ion-color-light)",
    // imageUrl: `assets/svgs/inventories.svg`,
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
    // imageUrl: `assets/svgs/warehouse-initialize.svg`,
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
    // imageUrl: `assets/svgs/wms-product-maintain.svg`,
    icon: `wms-product-maintain`,
    iconColor: "var(--ion-color-secondary)",
    bgColor: "var(--ion-color-light)",
    route: `wms-product`,
    appAuthority: "PresentationWmsWebsiteUrl.Product.Index.App_WmsProduct",
  },
  ...WMS_REPORTS_SYSTEM_MENUS,
  {
    feature: "wms",
    id: "wms-warehouse-management",
    isShowInFeatureTabHome: true,
    isCanRemove: true,
    name: `仓库管理`,
    // imageUrl: `assets/svgs/warehouse-management.svg`,
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
    // imageUrl: `assets/svgs/unsale.svg`,
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
    // imageUrl: `assets/svgs/update-basedata.svg`,
    icon: `update-basedata`,
    iconColor: "var(--ion-color-secondary)",
    bgColor: "var(--ion-color-light)",
    route: ``,
    action: "onUpdate",
  },
  {
    isShowInFeatureTabHome: false,
    isShowInHome: true,
    id: "wms-home",
    name: `仓储系统`,
    imageUrl: `assets/svgs/wms.svg`,
    icon: `wms`,
    route: `wms-home`,
    authId: "",
    feature: "wms",
    iconColor: "var(--ion-color-light)",
    bgColor: "var(--ion-color-secondary)",
  },
].map((it) => {
  if (!it.authId) {
    it.authId = "PresentationWmsWebsiteUrl";
  }
  return it;
});
const MMS_SYSTEMS: SystemsMenus[] = [
  {
    isShowInFeatureTabHome: false,
    isShowInHome: true,
    icon: "icon-mms",
    id: "mms-admin-home",
    name: `营销系统`,
    imageUrl: `assets/svgs/mms.svg`,
    route: `mms-admin-home`,
    authId: "",
    bgColor: "var(--ion-color-tertiary)",
    iconColor: "var(--ion-color-light)",
    feature: "mms",
  },
  {
    isShowInFeatureTabHome: true,
    isShowInHome: false,
    // icon: "mms-goods-tag",
    id: "mms-tag",
    name: `商品标签`,
    imageUrl: `assets/svgs/mms-goods-tag.svg`,
    route: `mms-tag`,
    authId: "",
    bgColor: "var(--ion-color-tertiary)",
    iconColor: "var(--ion-color-secondary)",
    feature: "mms",
    appAuthority: "PresentationMmsWebsiteAdminUrl.Tag.Index.App_MmsTagOp",
  },
  {
    isShowInFeatureTabHome: true,
    isShowInHome: false,
    // icon: "icon-mms",
    id: "mms-banner",
    name: `横幅维护`,
    imageUrl: `assets/svgs/mms-banner.svg`,
    route: `mms-banner`,
    // authId: "MmsId",
    bgColor: "var(--ion-color-tertiary)",
    iconColor: "var(--ion-color-secondary)",
    feature: "mms",
    appAuthority: "PresentationMmsWebsiteAdminUrl.Banner.Index.App_MmsBannerOp",
  },
  {
    isShowInFeatureTabHome: true,
    isShowInHome: false,
    // icon: "icon-mms",
    id: "mms-freight",
    name: `运费模板`,
    imageUrl: `assets/svgs/mms-freight.svg`,
    route: `mms-freight`,
    // authId: "MmsId",
    bgColor: "var(--ion-color-tertiary)",
    iconColor: "var(--ion-color-secondary)",
    feature: "mms",
    appAuthority: "PresentationMmsWebsiteAdminUrl.Freight.Index.App_MmsFreight",
  },
  {
    isShowInFeatureTabHome: true,
    isShowInHome: false,
    // icon: "icon-mms",
    id: "mms-category",
    name: `商品分类`,
    imageUrl: `assets/svgs/mms-goods-category.svg`,
    route: `mms-category`,
    authId: "",
    bgColor: "var(--ion-color-tertiary)",
    iconColor: "var(--ion-color-secondary)",
    feature: "mms",
    appAuthority:
      "PresentationMmsWebsiteAdminUrl.Category.Index.App_MmsCategoryOp",
  },
  {
    isShowInFeatureTabHome: true,
    isShowInHome: false,
    // icon: "icon-mms",
    id: "mms-goods",
    name: `销售商品`,
    imageUrl: `assets/svgs/mms-goods.svg`,
    route: `mms-admin-home/mms-goods`,
    authId: "",
    bgColor: "var(--ion-color-tertiary)",
    iconColor: "var(--ion-color-secondary)",
    feature: "mms",
    appAuthority: "PresentationMmsWebsiteAdminUrl.Goods.Index.App_MmsGoodsOp",
  },
  {
    isShowInFeatureTabHome: true,
    isShowInHome: false,
    // icon: "icon-mms",
    id: "mms-certificate",
    name: `证书维护`,
    imageUrl: `assets/svgs/mms-certificate.svg`,
    route: `mms-certificate`,
    authId: "",
    bgColor: "var(--ion-color-tertiary)",
    iconColor: "var(--ion-color-secondary)",
    appAuthority:
      "PresentationMmsWebsiteAdminUrl.Certificate.Index.App_MmsCertificateOp",
    feature: "mms",
  },
  {
    isShowInFeatureTabHome: true,
    isShowInHome: false,
    // icon: "icon-mms",
    id: "mms-company-managament",
    name: `公司维护`,
    imageUrl: `assets/svgs/mms-company.svg`,
    route: `mms-company-managament`,
    authId: "",
    bgColor: "var(--ion-color-tertiary)",
    iconColor: "var(--ion-color-secondary)",
    appAuthority:
      "PresentationMmsWebsiteAdminUrl.Company.Index.App_MmsCompanyOp",
    feature: "mms",
  },
  {
    isShowInFeatureTabHome: true,
    isShowInHome: false,
    // icon: "icon-mms",
    id: "mms-partner",
    name: `我的供应商`,
    imageUrl: `assets/svgs/mms-partner.svg`,
    route: `mms-partner`,
    authId: "",
    bgColor: "var(--ion-color-tertiary)",
    iconColor: "var(--ion-color-secondary)",
    feature: "mms",
    appAuthority:
      "PresentationMmsWebsiteAdminUrl.Partner.Index.App_MmsPartnerOp",
  },
  {
    isShowInFeatureTabHome: true,
    isShowInHome: false,
    // icon: "icon-mms",
    id: "mms-partnerlinker",
    name: `我的渠道商`,
    imageUrl: `assets/svgs/mms-partnerlinker.svg`,
    route: `mms-partnerlinker`,
    authId: "",
    bgColor: "var(--ion-color-tertiary)",
    iconColor: "var(--ion-color-secondary)",
    feature: "mms",
    appAuthority:
      "PresentationMmsWebsiteAdminUrl.PartnerLinker.Index.App_MmsPartnerLinkerOp",
  },
  {
    appAuthority: "PresentationMmsWebsiteAdminUrl.Coupon.Index.App_MmsCouponOp",
    isShowInFeatureTabHome: true,
    isShowInHome: false,
    icon: "icon-mms",
    id: "mms-coupon",
    name: `优惠券`,
    imageUrl: `assets/svgs/mms-coupon.svg`,
    route: `mms-coupon`,
    authId: "",
    bgColor: "var(--ion-color-tertiary)",
    iconColor: "var(--ion-color-secondary)",
    feature: "mms",
  },
  {
    appAuthority:
      "PresentationMmsWebsiteAdminUrl.OrderCoupon.Index.App_MmsOrderCouponOp",
    isShowInFeatureTabHome: true,
    isShowInHome: true,
    icon: "icon-mms",
    id: "mms-order-coupon",
    name: `优惠券验证`,
    imageUrl: `assets/svgs/mms-order-coupon.svg`,
    route: `mms-order-coupon`,
    authId: "",
    bgColor: "var(--ion-color-tertiary)",
    iconColor: "var(--ion-color-secondary)",
    feature: "mms",
  },
  {
    appAuthority:
      "PresentationMmsWebsiteAdminUrl.Note.Index.App_MmsNoteOp",
    isShowInFeatureTabHome: true,
    isShowInHome: false,
    icon: "icon-mms",
    id: "mms-notes",
    name: `日志查询`,
    imageUrl: `assets/svgs/mms-order-coupon.svg`,
    route: `mms-notes`,
    authId: "",
    bgColor: "var(--ion-color-tertiary)",
    iconColor: "var(--ion-color-secondary)",
    feature: "mms",
  },
].map((it) => {
  if (!it.authId) {
    it.authId = "PresentationMmsWebsiteAdminUrl";
  }
  return it;
});
console.log("MMS_SYSTEMS ", MMS_SYSTEMS);
export const BPM_SYSTEMS: SystemsMenus[] = [
  {
    isShowInFeatureTabHome: false,
    isShowInHome: true,
    name: `日常办公`,
    imageUrl: `assets/svgs/dairywork.svg`,
    icon: `dairywork`,
    route: `bpm-home`,
    id: `bpm-dairy-work`,
    authId: "",
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
].map((it) => {
  if (!it.authId) {
    it.authId = "PresentationBpmWebsiteAdminUrl";
  }
  return it;
});
export const CRM_SYSTEMS: SystemsMenus[] = [
  {
    appAuthority:
      "PresentationBpmWebsiteAdminUrl.Customer.Index.App_CrmCustomer",
    isShowInFeatureTabHome: false,
    isShowInHome: true,
    name: `客户管理`,
    id: "crm-home",
    imageUrl: `assets/svgs/customers.svg`,
    icon: `customers`,
    route: `crm-home`,
    authId: "",
    iconColor: "var(--ion-color-light)",
    bgColor: "var(--ion-color-danger)",
    feature: "crm",
  },
].map((it) => {
  if (!it.authId) {
    it.authId = "PresentationCrmWebsiteAdminUrl";
  }
  return it;
});
export const SYSTEMS_MENUS: SystemsMenus[] = [
  ...MMS_SYSTEMS,
  ...BPM_SYSTEMS,
  ...WMS_SYSTEM_MENUS,
  ...CRM_SYSTEMS,
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
    private storage: StorageService,
    private identityService: IdentityService,
    private authService: AuthorizeService
  ) {
    this.menusSource = new BehaviorSubject(null);
    if (
      Array.from(new Set(SYSTEMS_MENUS.map((it) => it.id))).length !=
      SYSTEMS_MENUS.length
    ) {
      throw new Error("键不能重复");
    }
    // this.initSystemMenus();
    this.identityService.getIdentitySource().subscribe(async (it) => {
      let systems = [];
      if (it && it.Ticket && it.Id) {
        systems = await this.loadSubSystems();
      }
      this.initSystemMenus(systems);
    });
  }
  async initSystems() {
    const systems = await this.loadSubSystems();
    if (systems) {
      await this.initSystemMenus(systems);
    }
    return this.menus;
  }
  private async loadSubSystems() {
    try {
      return this.authService.loadSubsystems();
    } catch (e) { }
    return [];
  }
  private async initSystemMenus(systems: string[]) {
    try {
      this.menus = SYSTEMS_MENUS.filter((it) =>
        systems.some((s) => s.toLowerCase() == (it.authId || "").toLowerCase())
      ).map((m) => {
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
      // console.log("all menus", this.menus);
      const k = await this.getCacheKey();
      if (k) {
        const local: SystemsMenus[] = await this.storage.get(k);
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
      }
      // console.log("before setMenusSource menus ", this.menus);
      this.setMenusSource(this.menus);
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
    // console.log("menus cache key", k);
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

import { InternationalFlightService } from "../international-flight/international-flight.service";
import { Injectable } from "@angular/core";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { Router } from "@angular/router";
@Injectable({
  providedIn: "root",
})
export class FlightCityService {
  private cityPages = {};
  isShowingPage = false;
  private pageClassName: string;
  constructor() {}
  get cityPage() {
    if (this.pageClassName) {
      return this.cityPages[this.pageClassName];
    }
    return null;
  }
  private async initPage(d: {
    hideCityCodes?: string[];
    extraHotAirports?: string[];
    domesticAirports?: TrafficlineEntity[];
    internationalAirports?: TrafficlineEntity[];
  }) {
    if (!this.cityPage) {
      const dCities = d.domesticAirports;
      const iCities = d.internationalAirports;
      if (d.hideCityCodes && d.hideCityCodes.length) {
        d.hideCityCodes.forEach((hc) => {
          iCities
            .concat(dCities)
            .filter((it) => it.Code == hc)
            .forEach((c) => {
              c.isHide = (c.Tag || "").toLowerCase() == "airportcity";
            });
        });
      }
      if (d.extraHotAirports && d.extraHotAirports.length) {
        iCities.concat(dCities).forEach((c) => {
          const one = d.extraHotAirports.find(
            (it) => it == c.Code && (c.Tag || "").toLowerCase() == "airport"
          );
          if (one) {
            c.IsHot = true;
            c.isExtraHot = true;
          }
        });
      }
      this.cityPages[this.pageClassName] = new CityPage(
        dCities,
        iCities,
        this.pageClassName
      );
    }
  }
  private onSearbarClick(isFrom) {
    this.cityPage.onSearbarClick = () => {
      this.cityPage.openPage(false);
      // this.router.navigate(["select-flight-city"], {
      //   queryParams: { requestCode: isFrom ? "select_from_city" : "to_city" },
      // });
    };
  }
  private onHideCityName(isCityName = true) {}
  async onSelectCity({
    isShowSegs,
    isDomestic,
    isShowPage,
    isShowAirports,
    isFrom,
    isShowHotCity,
    isFlyDynamic,
    hideCityCodes,
    extraHotAirports,
    pageClassName,
    domesticAirports,
    internationalAirports,
  }: {
    isShowPage: boolean;
    isFrom: boolean;
    isShowAirports?: boolean;
    isDomestic?: boolean;
    pageClassName?: string;
    isShowSegs?: boolean;
    isShowHotCity?: boolean;
    isFlyDynamic?: boolean;
    hideCityCodes?: string[];
    extraHotAirports?: string[];
    domesticAirports: TrafficlineEntity[];
    internationalAirports: TrafficlineEntity[];
  }) {
    this.pageClassName = pageClassName;
    if (!this.cityPage) {
      await this.initPage({
        hideCityCodes,
        extraHotAirports,
        domesticAirports,
        internationalAirports,
      });
    }
    if (!this.cityPage) {
      return null;
    }
    if (isDomestic == undefined) {
      isDomestic = true;
    }
    if (isShowSegs == undefined) {
      isShowSegs = true;
    }
    if (isShowAirports == undefined) {
      isShowAirports = false;
    }
    if (isShowHotCity == undefined) {
      isShowHotCity = true;
    }
    if (isFlyDynamic == undefined) {
      isFlyDynamic = true;
    }
    this.cityPage.isDomestic = isDomestic;
    this.isShowingPage = isShowPage;
    this.cityPage.isShowAirports = isShowAirports;
    this.cityPage.isShowHotCity = isShowHotCity;
    this.cityPage.isShowSegs = isShowSegs;
    this.onSearbarClick(isFrom);
    this.cityPage.openPage(isShowPage);
    // this.onHideSegments(!isShowSegs, !isShowHotCity);
    this.onHideCityName(!isFlyDynamic);
    if (!isShowPage) {
      return null;
    }
    this.cityPage.onToggleSegmentsPage(isDomestic);
    return new Promise<{ isDomestic: boolean; city: TrafficlineEntity }>(
      (rsv) => {
        this.cityPage.onSelectCallback = (obj) => {
          this.isShowingPage = false;
          this.cityPage.openPage(false);
          rsv(obj);
        };
      }
    );
  }
}
function CityPage(domesticCities, interCities, pageClassName, lang = "cn") {
  const tabObj = {
    推荐: "isHot",
    港澳台: 11,
    东亚: 2,
    东南亚: 3,
    西亚: 4,
    中亚: 5,
    大洋洲: 6,
    北美洲: 7,
    南美洲: 8,
    欧洲: 9,
    非洲: 10,
  };
  let allItems = [];
  this.textSearchResults = [];
  this.lang = lang;
  let page;
  this.histories = getCachedSelectedCities();
  let allInterItems = [];
  const that = this;
  this.infinite;
  this.interSidebarsTabs;
  this.pageSize = 40;
  this.isDomestic = true;
  this.isShowSegs = true;
  this.textSearchResults = [];
  this.openPage = openPage;
  this.onToggleSegmentsPage = onToggleSegmentsPage;
  this.cities = initData(domesticCities);
  this.internationalCities = initData(interCities);
  this.pageClassName = pageClassName;
  const cities = this.cities;
  const internationalCities = this.internationalCities;
  function initData(cities) {
    try {
      const keys =
        `Code,Name,Nickname,CityName,Pinyin,AirportCityCode,Initial,FirstLetter,EnglishName`.split(
          ","
        );
      cities.sort((c1, c2) => c1.Sequence - c2.Sequence);
      cities = cities
        .filter((it) => it.IsHot)
        .concat(cities.filter((it) => !it.IsHot))
        .map((it) => {
          if (!it.FirstLetter) {
            if (it.Pinyin) {
              it.FirstLetter = it.Pinyin.substr(0, 1).toUpperCase();
            }
          }
          it.matchStr = keys
            .map((k) => it[k])
            .filter((i) => i && i.length > 0)
            .join(",")
            .toLowerCase();
          return it;
        });
    } catch (e) {
      console.error(e);
    }
    return cities;
  }
  function getHeaderHtml() {
    const header = document.createElement("div");
    header.innerHTML = `
          <div class='header'>
              <ion-icon name='chevron-back-outline' slot='start'></ion-icon>
              <form action='javascript:void(0)' class='searchbar'>
                  <ion-searchbar debounce='300' mode='ios' ></ion-searchbar>    
              </form>
              <ion-button color='secondary' fill='clear' size='small' class='cancel' >
                  <ion-label >取消<ion-label>    
              </ion-button>
          </div>
      `;
    const searchbar = header.querySelector("ion-searchbar");
    const backIcon = header.querySelector("ion-icon");
    const cancelBtn = header.querySelector("ion-button");
    cancelBtn.onclick = () => {
      hidePages();
    };
    backIcon.onclick = () => {
      hidePages();
    };
    searchbar.addEventListener("ionFocus", function () {
      showSearchListPage(true);
    });
    searchbar.addEventListener("ionChange", function () {
      onSearch();
    });
    return header;
  }
  function hidePages() {
    if (that.searchListPage) {
      if (that.searchListPage.classList.contains("show")) {
        that.openPage(false);
        showSearchListPage(false);
      } else {
        that.openPage(false);
      }
    } else {
      that.openPage(false);
    }
  }
  function getSegmentHtml() {
    // that.isShowSegs
    const seg = document.createElement("div");
    seg.innerHTML = `
          <div class='segments ${that.isShowSegs ? "" : "hidden"}'>
              <div class='segment d active'>
                  <label>国内</label>    
              </div>    
              <div class='segment i'>
                  <label>国际/港澳台</label>    
              </div>    
          </div>
      `;
    const d = seg.querySelector(".d") as HTMLElement;
    const i = seg.querySelector(".i") as HTMLElement;
    d.onclick = () => {
      i.classList.remove("active");
      d.classList.add("active");
      onToggleSegmentsPage(true);
    };
    i.onclick = () => {
      d.classList.remove("active");
      i.classList.add("active");
      onToggleSegmentsPage(false);
    };
    return seg;
  }
  function onToggleSegmentsPage(isDomestic) {
    const dw = getDomesticPageWrapper();
    const iw = getInternationalWrapper();
    const dEl = that.page.querySelector(".segment.d");
    const iEl = that.page.querySelector(".segment.i");
    that.isDomestic = isDomestic;
    if (isDomestic) {
      dw.classList.add("show");
      iw.classList.remove("show");
      dEl.classList.add("active");
      iEl.classList.remove("active");
    } else {
      dEl.classList.remove("active");
      iEl.classList.add("active");
      iw.classList.add("show");
      const mainEl = iw.querySelector(".main");
      if (mainEl) {
        if (!mainEl.firstChild) {
          if (that.interSidebarsTabs) {
            onInterSidebarTabActive(that.interSidebarsTabs[0]);
          }
        }
      }
      dw.classList.remove("show");
    }
  }
  function openPage(open) {
    page = document.body.querySelector(`.${that.pageClassName}`);
    if (!page) {
      page = getHtml();
      const fabbtn = document.body.querySelector(
        `.fab-btn.${that.pageClassName}`
      );
      page.onscroll = () => {
        if (fabbtn) {
          if (page.scrollTop > 0.6 * window.innerHeight) {
            fabbtn.classList.add("show");
          } else {
            fabbtn.classList.remove("show");
          }
        }
      };
    }
    if (page) {
      if (that.isShowAirports) {
        page.classList.add("airports-page");
      } else {
        page.classList.remove("airports-page");
      }
      if (open) {
        page.classList.add("show");
        if (that.searchListPage) {
          if (!that.searchListPage.classList.contains("show")) {
            clearSearchPageListItems();
          }
        }
      } else {
        page.classList.remove("show");
      }
      const segs=page.querySelector(".segments");
      if(segs){
        segs.classList.toggle("hidden",!that.isShowSegs);
      }
    }
  }
  function getHistoryHtml(cities) {
    const wrapper = document.createElement("div");
    try {
      wrapper.classList.add("hot-cities-wrapper");
      wrapper.classList.add("history-cities-wrapper");
      if (!cities || !cities.length) {
        return wrapper;
      }
      const header = document.createElement("div");
      header.classList.add("header");
      const label = document.createElement("label");
      label.textContent = "历史记录";
      header.append(label);
      const rmicon = document.createElement("ion-icon");
      rmicon.classList.add("icon");
      rmicon.setAttribute("name", "trash-outline");
      rmicon.onclick = () => {
        onClearHistories();
      };
      header.append(rmicon);
      wrapper.append(header);
      const list = document.createElement("div");
      const listWrapper = document.createElement("div");
      listWrapper.classList.add("list-wrapper");
      listWrapper.append(list);
      list.classList.add("list");
      wrapper.append(listWrapper);
      const rowLen = 3;
      const len = 12;
      const enLen = 16;
      const rows = getListRows(cities, rowLen, enLen, len, that.lang);
      rows.forEach((r) => {
        const div = document.createElement("div");
        div.classList.add("row");
        div.classList.add("full-w");
        r.forEach((c) => {
          const item = getHistoryOrHotItem(c);
          item.classList.add(`col-${r.length}`);
          div.append(item);
        });
        if (r.every((it) => it.isHide)) {
          div.classList.add("hide");
        }
        list.append(div);
      });
    } catch (e) {
      console.error(e);
    }
    return wrapper;
  }
  function getHistoryOrHotItem(c, isHistory = false, lang = "cn") {
    const item = document.createElement("div");
    item.classList.add("city-item");
    item.setAttribute("Code", c.Code);
    if (c.isHide) {
      item.classList.add("hide-item");
    }
    item.classList.add("airport-item");
    const label = document.createElement("label");
    label.innerHTML = `<label class='display-city-name'>${
      (lang == "en" ? c.EnglishName : c.IsHot ? c.CityName : c.Nickname) || ""
    }</label>`;
    const label2 = document.createElement("label");
    label2.innerHTML = `<label class='display-air-name'>${
      c.Name || ""
    }</label>`;
    item.append(label);
    item.append(label2);
    if (c.isExtraHot) {
      item.classList.add("extra-hot-item");
    }
    if (!item.textContent) {
      item.classList.add("empty");
    }
    item.onclick = () => {
      onSelectCity(c);
    };
    item.onclick = () => {
      if (!isHistory) {
        onSelectCity(c);
      }
    };
    return item;
  }
  function getScrollToTopFab() {
    const fab = document.createElement("div");
    fab.classList.add("fab-btn");
    fab.classList.add(`${that.pageClassName}`);
    const icon = document.createElement("ion-icon");
    icon.setAttribute("name", "chevron-up-outline");
    fab.append(icon);
    fab.onclick = () => {
      page.scrollTop = 0;
    };
    return fab;
  }
  function getHotHtml(cities) {
    const wrapper = document.createElement("div");
    try {
      wrapper.classList.add("hot-cities-wrapper");
      const h = document.createElement("div");
      h.classList.add("header");
      h.classList.add("hot-cities-wrapper1");
      const lb = document.createElement("label");
      lb.textContent = that.isShowAirports ? "热门机场" : "热门城市";
      h.append(lb);
      wrapper.append(h);
      const list = document.createElement("div");
      const listWrapper = document.createElement("div");
      listWrapper.classList.add("list-wrapper");
      listWrapper.append(list);
      list.classList.add("list");
      wrapper.append(listWrapper);
      const rowLen = 3;
      const len = 12;
      const enLen = 16;
      const rows = getListRows(cities, rowLen, enLen, len, that.lang);
      rows.forEach((r) => {
        const div = document.createElement("div");
        div.classList.add("row");
        div.classList.add("full-w");
        r.forEach((c) => {
          const item = getHistoryOrHotItem(c);
          item.classList.add(`col-${r.length}`);
          div.append(item);
        });
        if (r.every((it) => it.isHide)) {
          div.classList.add("hide");
        }
        list.append(div);
      });
    } catch (e) {
      console.error(e);
    }
    return wrapper;
  }
  function getListRows(cities, rowLen, enLen, len, lang) {
    const rows = [];
    for (let i = 0; i < cities.length; i++) {
      const c = cities[i];
      const name = (lang == "en" ? c.EnglishName : c.Name) || "";
      if (name) {
        const obj = {
          ...c,
          isFlag: name.length >= enLen || name.length >= len,
        };
        const cols = rows[rows.length - 1];
        if (cols) {
          if (cols.some((it) => it.isFlag)) {
            if (cols.length < rowLen - 1) {
              cols.push(obj);
            } else {
              rows.push([obj]);
            }
          } else {
            if (obj.isFlag) {
              if (cols.length >= rowLen - 1) {
                rows.push([obj]);
              } else {
                cols.push(obj);
              }
            } else {
              if (cols.length < rowLen) {
                cols.push(obj);
              } else {
                rows.push([obj]);
              }
            }
          }
        } else {
          rows.push([obj]);
        }
      }
    }
    if (rows.length) {
      const last = rows[rows.length - 1];
      if (last) {
        if (last.length < rowLen) {
          const lastlen = last.length;
          if (!last.some((it) => it.isFlag)) {
            for (let i = 0; i < rowLen - lastlen; i++) {
              last.push({});
            }
          }
        }
      }
    }
    return rows;
  }
  function getPageEle() {
    return document.querySelector(`.${that.pageClassName}`);
  }
  function onShowInHistory(c) {
    try {
      const page = getDomesticContainerPage();
      if (page) {
        let wrapper = getHistoryWrapperEl();
        if (!wrapper) {
          wrapper = getHistoryHtml(cities);
          const p = page.querySelector(".hot-cities-wrapper");
          p.parentElement.insertBefore(wrapper, p);
        }
        const items = wrapper.querySelectorAll(".b-item");
        const list = wrapper.querySelector(".list");
        let histories = that.histories;
        if (!histories || !histories.length) {
          histories = [c];
          that.histories = histories;
        }
        if (histories.length >= 12) {
          const hc = histories.find((it) => it.Code == c.Code);
          if (!hc) {
            histories.unshift(c);
            histories.pop();
          } else {
            histories.splice(histories.indexOf(hc), 1);
            histories.unshift(c);
          }
        } else if (!histories.find((it) => it.Code == c.Code)) {
          histories.unshift(c);
        }
        const item = getHistoryOrHotItem(c);
        item.setAttribute("history", "isHistory");
        if (wrapper) {
          if (items.length) {
            for (let i = 0; i < items.length; i++) {
              const one = items.item(i);
              if (one.getAttribute("Code") == c.Code) {
                list.insertBefore(one, list.firstChild);
                return;
              }
            }
            if (items && items.length >= 12) {
              if (list) {
                list.removeChild(items.item(items.length - 1));
              }
            }
            list.insertBefore(item, list.firstChild);
          } else {
            page.removeChild(wrapper);
            wrapper = getHistoryHtml(histories);
            page.insertBefore(
              wrapper,
              page.querySelector(".hot-cities-wrapper")
            );
          }
        }
        cacheSelectedCities(histories);
      }
    } catch (e) {
      console.error(e);
    }
  }
  function getHistoryWrapperEl() {
    const page = getPageEle();
    return page && page.querySelector(".history-cities-wrapper");
  }
  function onSelectCity(c) {
    hidePages();
    onShowInHistory(c);
    if (that.onSelectCallback) {
      that.onSelectCallback({ isDomestic: that.isDomestic, city: c });
    }
    console.log(c);
  }
  function onClearHistories() {
    clearCachedHistories();
    const page = getDomesticContainerPage();
    if (page) {
      const history = getHistoryWrapperEl();
      that.histories = [];
      if (history) {
        if (history.firstChild) {
          history.removeChild(history.firstChild);
        }
        page.removeChild(history);
      }
    }
  }
  function getHtml() {
    const page = document.createElement("div");
    page.classList.add(`${that.pageClassName}`);
    const header = getHeaderHtml();
    page.append(header);
    const segs = getSegmentHtml();
    page.append(segs);
    const container = document.createElement("div");
    container.classList.add("container");
    page.append(container);
    const domesticHtml = getDomesticHtml(cities);
    const domesticC = document.createElement("div");
    domesticC.classList.add("wrapper");
    domesticC.classList.add("show");
    domesticC.classList.add("domestic");
    domesticC.append(domesticHtml);
    container.append(domesticC);
    const interPageHtml = getInternationalHtml();
    const international = document.createElement("div");
    international.classList.add("wrapper");
    international.classList.add("international");
    international.append(interPageHtml);
    container.append(international);
    document.body.append(page);
    document.body.append(getScrollToTopFab());
    that.searchListPage = getSearchListPage();
    document.body.append(that.searchListPage);
    that.page = page;
    return page;
  }
  function getInternationalHtml() {
    const div = document.createElement("div");
    div.classList.add("international-page-container");
    const sidebar = getInterSidebars();
    const cnt = document.createElement("div");
    cnt.classList.add("main");
    div.append(sidebar);
    div.append(cnt);
    return div;
  }
  function getInternationalPageMainContainer() {
    return getInternationalContainerPage().querySelector(".main");
  }
  function initRightSideMainHtml(recommendCities) {
    const main = getInternationalPageMainContainer();
    if (main.firstChild) {
      main.firstChild.remove();
    }
    const html = getHtml();
    main.append(html);
    setTimeout(() => {
      main.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }, 200);
    function getHtml() {
      const c = document.createElement("div");
      const h = document.createElement("header");
      h.classList.add("label-header");
      const lb = document.createElement("label");
      lb.textContent = "海外热门推荐";
      c.append(h);
      const hotArr = recommendCities.filter((it) => it.IsHot);
      if (hotArr.length) {
        h.append(lb);
      }
      if (recommendCities) {
        const len = 12;
        const enLen = 10;
        const rowLen = 3;
        const rows = getListRows(
          recommendCities,
          rowLen,
          enLen,
          len,
          that.lang
        );
        const list = document.createElement("div");
        list.classList.add("list");
        allInterItems = [];
        rows.forEach((r) => {
          const div = document.createElement("div");
          div.classList.add("row");
          r.forEach((c) => {
            const el = getInterCityItemHtml(c, lang);
            if (el.textContent.length >= enLen || el.textContent.length > len) {
              el.setAttribute("isflag", "true");
            }
            allInterItems.push(el);
            el.classList.add(`col-${r.length}`);
            div.append(el);
          });
          list.append(div);
        });
        c.append(list);
      }
      return c;
    }
  }
  function onSelectInterCity(city) {
    if (allInterItems) {
      allInterItems.forEach((el) => {
        if (el.getAttribute("Code") == city.Code) {
          el.classList.add("active");
        } else {
          el.classList.remove("active");
        }
      });
    }
    hidePages();
    if (that.onSelectCallback) {
      that.onSelectCallback({ isDomestic: false, city });
    }
    console.log("city", city);
  }
  function getInterCityItemHtml(city, lang) {
    if (city) {
      const div = document.createElement("div");
      div.textContent = (lang == "en" ? city.EnglishName : city.Name) || "";
      div.classList.add("city-item");
      if (div.textContent.length >= 15) {
        div.classList.add("f-8");
      } else if (div.textContent.length >= 10) {
        div.classList.add("f-10");
      } else if (div.textContent.length >= 5) {
        div.classList.add("f-12");
      }

      if (!div.textContent) {
        div.classList.add("empty");
      }
      div.setAttribute("Code", city.Code);
      div.onclick = () => {
        onSelectInterCity(city);
        // onSelectCity(city);
      };
      return div;
    }
    return null;
  }
  function onInterSidebarTabActive(tab) {
    try {
      const name = tab.getAttribute("name");
      clearTabActive();
      tab.classList.add("active");
      let arr =
        name == "isHot"
          ? internationalCities.filter((it) => it.IsHot)
          : internationalCities.filter((it) => it.DestinationAreaType == name);
      const h = arr.filter((it) => it.IsHot);
      const notH = arr
        .filter((it) => !it.IsHot)
        .sort((a, b) => a.Sequence - b.Sequence);
      arr = h.concat(notH);
      initRightSideMainHtml(arr);
    } catch (e) {
      console.error(e);
    }
  }
  function getInterSidebars() {
    const sidebar = document.createElement("div");
    sidebar.classList.add("sidebar");
    const tabs = [];
    Object.keys(tabObj).forEach((n) => {
      const t = getTab(n, tabObj[n]);
      tabs.push(t);
      sidebar.append(t);
    });
    that.interSidebarsTabs = tabs;
    function getTab(name, attrvalue) {
      const tab = document.createElement("div");
      tab.classList.add("tab");
      const lb = document.createElement("label");
      lb.textContent = name;
      tab.setAttribute("name", attrvalue);
      tab.append(lb);
      tab.onclick = (evt) => {
        onInterSidebarTabActive(tab);
      };
      return tab;
    }
    return sidebar;
  }
  function clearTabActive() {
    if (that.interSidebarsTabs) {
      that.interSidebarsTabs.forEach((t) => {
        t.classList.remove("active");
      });
    }
  }
  function getDomesticPageWrapper() {
    return getPageEle().querySelector(".domestic.wrapper");
  }
  function getDomesticContainerPage() {
    return getPageEle().querySelector(
      ".domestic.wrapper .domestic-page-container"
    );
  }
  function getInternationalContainerPage() {
    return getPageEle().querySelector(
      ".international.wrapper .international-page-container"
    );
  }
  function getInternationalWrapper() {
    return getPageEle().querySelector(".international.wrapper");
  }
  function getContainerEle() {
    return getPageEle().querySelector(".container");
  }
  function cacheSelectedCities(histories) {
    window.localStorage.setItem(
      "flight_cached_histories_cities_key",
      JSON.stringify(histories)
    );
  }
  function getCachedSelectedCities() {
    try {
      const l = window.localStorage.getItem(
        "flight_cached_histories_cities_key"
      );
      if (l) {
        return JSON.parse(l);
      }
    } catch (e) {}
    return [];
  }
  function clearCachedHistories() {
    window.localStorage.removeItem("flight_cached_histories_cities_key");
  }
  function getDomesticHtml(cities) {
    const div = document.createElement("div");
    div.classList.add("domestic-page-container");
    div.classList.add("show");
    const cmap = getLeter2Cities(cities);
    const hotCities = cities.filter((it) => it.IsHot);
    const hotHtml = getHotHtml(
      hotCities
        .filter((it) => !it.isExtraHot)
        .concat(hotCities.filter((it) => it.isExtraHot))
    );
    const historyHtml = getHistoryHtml(that.histories);
    div.append(historyHtml);
    div.append(hotHtml);
    const letterNavs = getLetterNavs(cmap);
    div.append(letterNavs);
    const list = getList(cmap);
    div.append(list);
    return div;
  }
  function getLetterNavs(cmap) {
    const letters = Object.keys(cmap);
    letters.sort();
    const letterDiv = document.createElement("div");
    const divwrapper = document.createElement("div");
    divwrapper.classList.add("letters-wrapper");
    letterDiv.classList.add("letter-navs");
    divwrapper.append(letterDiv);
    letters.forEach((l) => {
      const li = document.createElement("div");
      li.classList.add("nav-letter");
      li.textContent = l;
      letterDiv.append(li);
      li.onclick = (evt) => {
        if (evt) {
          evt.stopPropagation();
        }
        try {
          const p = page.querySelector(".container");
          const el = p.querySelector(`[letter='${l}']`);
          const rect = el.getBoundingClientRect();
          let headerEle = 97;
          const h = page.querySelector(".header");
          const segs = page.querySelector(".segments");
          headerEle = h.clientHeight + segs.clientHeight || 97;
          let y = 0;
          y = rect.top - headerEle - (h.offsetTop || 0);
          const ul = getContainerEle();
          ul.scrollBy(0, y);
        } catch (e) {
          console.error(e);
        }
      };
    });
    return divwrapper;
  }
  function getItem(c, lang) {
    const item = document.createElement("li");
    item.classList.add("item");
    if (that.isShowAirports) {
      item.classList.add("airport-item");
    }
    if (c.isHide) {
      item.classList.add("hide-item");
    }
    item.onclick = (evt) => {
      onSelectCity(c);
      if (allItems) {
        for (let i = 0; i < allItems.length; i++) {
          const it = allItems[i];
          it.setAttribute("selected", "false");
          it.classList.remove("selected");
        }
      }
      const selected = item.getAttribute("selected") == "true";
      if (selected) {
        item.setAttribute("selected", "false");
        item.classList.remove("selected");
      } else {
        item.setAttribute("selected", "true");
        item.classList.add("selected");
      }
    };
    const label = document.createElement("label");
    const label2 = document.createElement("label");
    label.textContent =
      lang == "en" ? c.EnglishName : c.IsHot ? c.CityName : c.Nickname;
    label.classList.add("display-city-name");
    label2.classList.add("display-air-name");
    label2.innerHTML = `
      <span class='name notranslate'>${c.Name}</span>
      <span class='city-name notranslate'>(${c.CityName})</span> 
    `;
    label.classList.add("notranslate");
    if (c.CityName) {
      const sp = document.createElement("span");
      sp.textContent = `(${c.CityName})`;
      sp.classList.add("city-name");
      sp.classList.add("notranslate");
      label.append(sp);
    }
    item.append(label);
    item.append(label2);
    if (!allItems.find((it) => it == item)) {
      allItems.push(item);
    }
    return item;
  }
  function getLeter2Cities(cities) {
    const cmap = {};
    if (cities) {
      cities.forEach((c) => {
        if (!c.FirstLetter) {
          c.FirstLetter = (c.Pinyin || "").substr(0, 1).toUpperCase();
        }
        const arr = cmap[c.FirstLetter];
        if (arr) {
          if (!arr.find((it) => it.Code == c.Code)) {
            arr.push(c);
          }
        } else {
          cmap[c.FirstLetter] = [c];
        }
      });
    }
    return cmap;
  }
  function getLetterHeader(l) {
    const li = document.createElement("li");
    li.classList.add("letter-header");
    li.setAttribute("letter", l);
    const label = document.createElement("label");
    label.textContent = l;
    li.append(label);
    return li;
  }
  function getList(cmap) {
    const list = document.createElement("ul");
    list.classList.add("list");
    if (cmap) {
      const letters = Object.keys(cmap);
      letters.sort();
      if (letters && letters.length) {
        letters.forEach((l) => {
          const letterHeader = getLetterHeader(l);
          list.append(letterHeader);
          const arr = cmap[l];
          if (arr) {
            arr.forEach((c) => {
              const item = getItem(c, that.lang);
              list.append(item);
            });
          }
        });
      }
    }
    return list;
  }
  function onSearch() {
    that.textSearchResults = [];
    clearSearchPageListItems();
    loadMoreItems();
  }
  function showSearchListPage(isShow) {
    if (!that.searchListPage) {
      that.searchListPage = getSearchListPage();
    }
    const sp = that.searchListPage;
    if (sp) {
      if (isShow) {
        if (!that.searchListPage.classList.contains("show")) {
          clearSearchPageListItems();
        }
        sp.classList.add("show");
      } else {
        clearSearchBarText();
        sp.classList.remove("show");
        setTimeout(() => {
          clearSearchPageListItems();
        }, 200);
      }
    }
  }

  function getSearchPageListItem(city, lang) {
    const item = document.createElement("div");
    item.classList.add("item");
    if (that.isShowAirports) {
      item.classList.add("airport-item");
      if (city.isHide) {
        item.classList.add("hide-item");
      }
    }
    const lb = document.createElement("label");
    let lbtextContent = lang == "en" ? city.EnglishName : city.Name;
    const n = document.createElement("label");
    n.classList.add("name");
    n.textContent = `${lbtextContent}`;
    item.append(n);
    if (city.Code) {
      const code = document.createElement("label");
      code.classList.add("code");
      code.textContent = city.Code;
      item.append(code);
    }
    if (city.CityName) {
      const cn = document.createElement("label");
      cn.classList.add("city-name");
      cn.textContent = `(${city.CityName})`;
      item.append(cn);
    }
    item.onclick = () => {
      onSelectCity(city);
    };
    return item;
  }
  function loadMoreItems(infinite = null) {
    const kw = getSearchBarText();
    let arr = that.isDomestic ? that.cities : that.internationalCities;
    let temp = [];
    if (kw) {
      let tmpArr;
      if (kw.length == 3 && kw.match(/[a-z]/gi)) {
        tmpArr = arr.filter(
          (it) => (it.Code || "").toLowerCase() == kw.toLowerCase()
        );
      }
      arr = arr.filter((it) => {
        if (tmpArr) {
          return tmpArr.some((one) =>
            it.matchStr.toLowerCase().includes(one.CityName.toLowerCase())
          );
        }
        return it.matchStr.toLowerCase().includes(kw.toLowerCase());
      });
      temp = arr.slice(
        that.textSearchResults.length,
        that.textSearchResults.length + that.pageSize
      );
      if (temp.length) {
        that.textSearchResults = that.textSearchResults.concat(temp);
      }
    } else {
      temp = arr.slice(
        that.textSearchResults.length,
        that.textSearchResults.length + that.pageSize
      );
      if (temp.length) {
        that.textSearchResults = that.textSearchResults.concat(temp);
      }
    }
    if (infinite) {
      infinite.disabled = temp.length < that.pageSize;
    }
    if (temp && temp.length) {
      appMoreItems(temp);
    } else {
      const l = that.searchListPage.querySelector(".search-list-page__list");
      renderNoMoreData(l);
    }
    if (infinite) {
      infinite.complete();
    }
    // console.log("arr", arr);
  }
  function clearSearchPageListItems() {
    if (that.searchListPage) {
      const l = that.searchListPage.querySelector(".search-list-page__list");
      while (l.firstChild) {
        l.removeChild(l.firstChild);
      }
    }
  }
  function renderNoMoreData(container) {
    if (container) {
      const lb = document.createElement("label");
      lb.classList.add("no-more-data");
      lb.textContent = "暂无数据";
      container.append(lb);
    }
  }
  function getSearchBarText() {
    const searchbar = that.page.querySelector("ion-searchbar");
    return (searchbar && searchbar.value) || "";
  }
  function clearSearchBarText() {
    const searchbar = that.page.querySelector("ion-searchbar");
    searchbar.value = "";
  }
  function appMoreItems(arr) {
    try {
      const list = that.searchListPage.querySelector(".search-list-page__list");
      const df = document.createDocumentFragment();
      arr.forEach((c) => {
        const item = getSearchPageListItem(c, that.lang);
        df.append(item);
      });
      list.append(df);
    } catch (e) {
      console.error(e);
    }
  }
  function getSearchListPage() {
    let sp = document.body.querySelector(".search-list-page");
    if (sp) {
      if (that.isShowAirports) {
        sp.classList.add("airports-page");
      } else {
        sp.classList.remove("airports-page");
      }
      // const l = sp.querySelector("ion-list");
      // if (l) {
      //     while (l.firstChild) {
      //         l.removeChild(l.firstChild);
      //     }
      // }
      return sp;
    }
    sp = document.createElement("div");
    sp.classList.add("search-list-page");
    if (that.isShowAirports) {
      sp.classList.add("airports-page");
    } else {
      sp.classList.remove("airports-page");
    }
    const content = document.createElement("ion-content");
    const list = document.createElement("ion-list");
    const infinite = document.createElement("ion-infinite-scroll");
    that.infinite = infinite;
    content.classList.add("content");
    list.classList.add("search-list-page__list");
    infinite.classList.add("ion-infinite-scroll");
    content.append(list);
    const ific = document.createElement("ion-infinite-scroll-content");
    ific.setAttribute("loading-spinner", "bubbles");
    ific.setAttribute("loading-text", "加载更多");
    infinite.append(ific);
    content.append(infinite);
    sp.append(content);
    infinite.addEventListener("ionInfinite", function (event) {
      console.log("ionInfinite");
      const arr = loadMoreItems(infinite);
    });
    that.searchListPage = sp;
    return sp;
  }
}

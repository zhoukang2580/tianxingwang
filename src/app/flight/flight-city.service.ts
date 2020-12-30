import { InternationalFlightService } from "./../flight-international/international-flight.service";
import { EventEmitter, Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { BehaviorSubject } from "rxjs";
import { finalize } from "rxjs/operators";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { FlightService } from "./flight.service";
import { Router } from "@angular/router";
@Injectable({
  providedIn: "root",
})
export class FlightCityService {
  private cityPage;
  isShowingPage = false;
  constructor(
    private flightService: FlightService,
    private interFlightService: InternationalFlightService,
    private router: Router
  ) {}
  private async initPage() {
    if (!this.cityPage) {
      const dCities = await this.flightService.getDomesticAirports();
      const iCities = await this.interFlightService.getInternationalAirports();
      this.cityPage = new CityPage(dCities, iCities);
    }
  }
  private onSearbarClick(isFrom) {
    this.cityPage.onSearbarClick = () => {
      this.cityPage.openPage(false);
      this.router.navigate(["select-flight-city"], {
        queryParams: { requestCode: isFrom ? "select_from_city" : "to_city" },
      });
    };
  }
  async onSelectCity(isShow, isFrom) {
    if (!this.cityPage) {
      await this.initPage();
      if (this.cityPage) {
        setTimeout(() => {
          this.cityPage.openPage(isShow, isFrom);
        }, 2000);
      }
    }
    if (!this.cityPage) {
      return null;
    }
    this.isShowingPage = isShow;
    this.onSearbarClick(isFrom);
    this.cityPage.openPage(isShow);
    if (!isShow) {
      return null;
    }
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
function CityPage(domesticCities, interCities) {
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
  const lang = "en";
  let page;
  let histories = [];
  let allInterItems = [];
  const that = this;
  this.pageSize = 40;
  this.isDomestic = true;
  this.textSearchResults = [];
  this.openPage = openPage;
  this.onToggleSegmentsPage = onToggleSegmentsPage;
  this.cities = initData(domesticCities);
  this.internationalCities = initData(interCities);
  const cities = this.cities;
  const internationalCities = this.internationalCities;
  function initData(cities) {
    try {
      const keys = `Code,Name,Nickname,CityName,Pinyin,AirportCityCode,Initial,FirstLetter,EnglishName`.split(
        ","
      );
      cities.sort((c1, c2) => c1.Sequence - c2.Sequence);
      cities = cities
        .filter((it) => it.IsHot)
        .concat(cities.filter((it) => !it.IsHot))
        .map((it) => {
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
    header.classList.add("header");
    const backIcon = document.createElement("ion-icon");
    backIcon.setAttribute("name", "chevron-back-outline");
    backIcon.setAttribute("slot", "start");
    const cancelBtn = document.createElement("ion-button");
    cancelBtn.setAttribute("color", "secondary");
    cancelBtn.setAttribute("fill", "clear");
    cancelBtn.setAttribute("size", "small");
    cancelBtn.classList.add("cancel");
    const label = document.createElement("ion-label");
    label.textContent = "取消";
    cancelBtn.append(label);
    cancelBtn.onclick = () => {
      that.openPage(false);
    };
    backIcon.onclick = () => {
      that.openPage(false);
      showSearchListPage(false);
    };
    const bform = document.createElement("form");
    bform.setAttribute("action", "javascript:void(0)");
    bform.classList.add("searchbar");
    const searchbar = document.createElement("ion-searchbar");
    bform.append(searchbar);
    bform.onsubmit = function () {
      onSearch();
    };
    searchbar.setAttribute("debounce", "300");
    searchbar.addEventListener("ionFocus", function () {
      showSearchListPage(true);
    });
    // searchbar.addEventListener("ionBlur", function () {
    //     showSearchListPage(false);
    // })
    searchbar.addEventListener("ionChange", function () {
      onSearch();
    });
    header.append(backIcon);
    header.append(bform);
    header.append(cancelBtn);
    return header;
  }
  function getSegmentHtml() {
    const seg = document.createElement("div");
    seg.classList.add("segments");
    const d = document.createElement("div");
    const label = document.createElement("label");
    label.textContent = "国内";
    d.append(label);
    d.classList.add("segment");
    const i = document.createElement("div");
    i.classList.add("segment");
    d.classList.add("active");
    const lb = document.createElement("label");
    lb.textContent = "国际/港澳台";
    i.append(lb);
    seg.append(d);
    seg.append(i);
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
    const d = getDomesticPageWrapper();
    const i = getInternationalWrapper();
    that.isDomestic = isDomestic;
    if (isDomestic) {
      d.classList.add("show");
      i.classList.remove("show");
    } else {
      i.classList.add("show");
      d.classList.remove("show");
    }
  }
  function openPage(open) {
    page = document.body.querySelector(".flight-city-page-container");
    if (!page) {
      page = getHtml();
      const fabbtn = document.body.querySelector(
        ".fab-btn.flight-city-page-container"
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
      if (open) {
        page.classList.add("show");
      } else {
        page.classList.remove("show");
      }
    }
  }
  function getHistoryHtml(cities) {
    const rowNums = 3;
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
      cities.slice(0, 20).forEach((c) => {
        const item = getHistoryOrHotItem(c, true);
        const label = document.createElement("label");
        label.textContent = c.Name;
        item.onclick = () => {
          onSelectCity(c);
        };
        list.append(item);
      });
      if (cities.length % rowNums != 0) {
        const len = cities.length % rowNums;
        const item = document.createElement("div");
        item.classList.add("empty-item");
        item.classList.add("b-item");
        item.style.visibility = "collapse";
        for (let i = 0; i < len; i++) {
          list.append(item);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return wrapper;
  }
  function getHistoryOrHotItem(c, isHistory = false, lang = "cn") {
    const item = document.createElement("div");
    item.classList.add("b-item");
    item.textContent = lang == "en" ? c.EnglishName : c.Name;
    item.setAttribute("Code", c.Code);
    const label = document.createElement("label");
    label.textContent = c.Name;
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
    fab.classList.add("flight-city-page-container");
    const icon = document.createElement("ion-icon");
    icon.setAttribute("name", "chevron-up-outline");
    fab.append(icon);
    fab.onclick = () => {
      page.scrollTop = 0;
    };
    return fab;
  }
  function getHotHtml(cities) {
    const rowNums = 3;
    const wrapper = document.createElement("div");
    try {
      wrapper.classList.add("hot-cities-wrapper");
      const header = document.createElement("div");
      header.classList.add("header");
      const label = document.createElement("label");
      label.textContent = "热门城市";
      header.append(label);
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
      allInterItems = [];
      rows.forEach((r) => {
        r.forEach((c) => {
          const item = getHistoryOrHotItem(c);
          item.classList.add(`col-${r.length}`);
          list.append(item);
        });
      });
    } catch (e) {
      console.error(e);
    }
    return wrapper;
  }
  function getPageEle() {
    return document.querySelector(".flight-city-page-container");
  }
  function onShowInHistory(c) {
    try {
      const page = getDomesticContainerPage();
      if (page) {
        let wrapper = getHistoryWrapperEl();
        if (!wrapper) {
          wrapper = getHistoryHtml(cities);
          page.insertBefore(wrapper, page.querySelector(".hot-cities-wrapper"));
        }
        const items = wrapper.querySelectorAll(".b-item");
        const list = wrapper.querySelector(".list");
        if (!histories || !histories.length) {
          histories = [c];
        }
        if (histories.length >= 12) {
          histories.pop();
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
    openPage(false);
    showSearchListPage(false);
    onShowInHistory(c);
    if (that.onSelectCallback) {
      that.onSelectCallback({ isDomestic: that.isDomestic, city: c });
    }
    console.log(c);
  }
  function onClearHistories() {
    const page = getDomesticContainerPage();
    if (page) {
      const history = getHistoryWrapperEl();
      histories = [];
      if (history) {
        if (history.firstChild) {
          history.removeChild(history.firstChild);
        }
        page.removeChild(history);
      }
    }
  }
  function getHtml() {
    const cmap = getLeter2Cities(cities);
    const page = document.createElement("div");
    page.classList.add("flight-city-page-container");
    const header = getHeaderHtml();
    page.append(header);
    const segs = getSegmentHtml();
    page.append(segs);
    const container = document.createElement("div");
    container.classList.add("container");
    page.append(container);
    const domesticHtml = getDomesticHtml(cmap);
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
    page.append(that.searchListPage);
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
      const rowLen = 3;
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
        const enLen = 16;
        const rows = [];
        for (let i = 0; i < recommendCities.length; i++) {
          const c = recommendCities[i];
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
      };
      return div;
    }
    return null;
  }
  function onInterSidebarTabActive(tab) {
    try {
      const name = tab.getAttribute("name");
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
    function getTab(name, attrvalue) {
      const tab = document.createElement("div");
      tab.classList.add("tab");
      const lb = document.createElement("label");
      lb.textContent = name;
      tab.setAttribute("name", attrvalue);
      tab.append(lb);
      tab.onclick = (evt) => {
        clearTabActive();
        tab.classList.add("active");
        onInterSidebarTabActive(tab);
      };
      return tab;
    }
    function clearTabActive() {
      tabs.forEach((t) => {
        t.classList.remove("active");
      });
    }
    return sidebar;
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
  function getDomesticHtml(cmap) {
    const div = document.createElement("div");
    div.classList.add("domestic-page-container");
    div.classList.add("show");
    const hotHtml = getHotHtml(cities.filter((it) => it.IsHot));
    const historyHtml = getHistoryHtml(cities);
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
          const el = page.querySelector(`[letter='${l}']`);
          const rect = el.getBoundingClientRect();
          const headerEle = 97;
          let y = 0;
          y = rect.top - headerEle;
          const ul = getContainerEle();
          ul.scrollBy(0, y);
        } catch (e) {
          console.error(e);
        }
      };
    });
    return divwrapper;
  }
  function getItem(c) {
    const item = document.createElement("li");
    item.classList.add("item");
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
    label.textContent = c.Name;
    item.append(label);
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
          c.FirstLetter = (c.Initial || "").substr(0, 1).toUpperCase();
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
              const item = getItem(c);
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
        sp.classList.remove("show");
      }
    }
  }
  function getSearchPageListItem(city, lang) {
    const item = document.createElement("div");
    item.classList.add("item");
    const lb = document.createElement("label");
    let lbtextContent = lang == "en" ? city.EnglishName : city.Name;
    const n = document.createElement("label");
    n.classList.add("name");
    n.textContent = `${lbtextContent}`;
    item.append(n);
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
      arr = arr.filter((it) =>
        it.matchStr.toLowerCase().includes(kw.toLowerCase())
      );
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
    if (temp) {
      appMoreItems(temp);
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
  function getSearchBarText() {
    const searchbar = that.page.querySelector("ion-searchbar");
    return (searchbar && searchbar.value) || "";
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
    let sp = getPageEle().querySelector(".search-list-page");
    if (sp) {
      const l = sp.querySelector(".list");
      if (l) {
        while (l.firstChild) {
          l.removeChild(l.firstChild);
        }
      }
      return sp;
    }
    sp = document.createElement("div");
    sp.classList.add("search-list-page");
    const content = document.createElement("ion-content");
    const list = document.createElement("ion-list");
    const infinite = document.createElement("ion-infinite-scroll");
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

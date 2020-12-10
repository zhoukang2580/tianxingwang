import { EventEmitter, Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";
import { BehaviorSubject } from "rxjs";
import { finalize } from "rxjs/operators";
import { TrafficlineEntity } from "../tmc/models/TrafficlineEntity";
import { HotelService } from "./hotel.service";
@Injectable({
  providedIn: "root",
})
export class HotelCityService {
  private page: HTMLElement;
  private histories: TrafficlineEntity[];
  private allCityListEleItems: any[] = [];
  private citySource = new EventEmitter<TrafficlineEntity>();
  constructor(private hotelService: HotelService, private storage: Storage) {
    hotelService = this.hotelService;
  }
  private async openPage(isOpen = false) {
    this.page = document.body.querySelector(".hotel-city-page-container");
    if (!this.page) {
      const cities = await this.hotelService.getHotelCityAsync();
      this.page = this.getHtml(cities);
    }
    if (isOpen) {
      this.page.classList.add("show");
    } else {
      this.page.classList.remove("show");
    }
  }
  async onSelectCity(isOpen = false) {
    await this.openPage(isOpen);
    if (!isOpen) {
      return null;
    }
    return new Promise<TrafficlineEntity>((rsv) => {
      const sub = this.citySource
        .pipe(
          finalize(() => {
            setTimeout(() => {
              console.log("sjkdlfjsdl");
            }, 200);
          })
        )
        .subscribe(
          (city) => {
            if (city) {
              rsv(city);
              setTimeout(() => {
                sub.unsubscribe();
                this.openPage(false);
              }, 200);
            }
          },
          (e) => {
            console.error(e);
            rsv();
          }
        );
    });
  }
  private getHistoryHtml(cities = []) {
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
        this.onClearHistories();
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
        const item = this.getHistoryOrHotItem(c, true);
        const label = document.createElement("label");
        label.textContent = c.Name;
        item.onclick = () => {
          this.cityClick(c);
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
  private getHistoryOrHotItem(c, isHistory = false) {
    const item = document.createElement("div");
    item.classList.add("b-item");
    item.textContent = c.Name;
    item.setAttribute("CityCode", c.CityCode);
    item.onclick = () => {
      if (!isHistory) {
        this.cityClick(c);
      }
    };
    return item;
  }
  private getHotHtml(cities) {
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
      cities.forEach((c) => {
        const item = this.getHistoryOrHotItem(c);
        const label = document.createElement("label");
        label.textContent = c.Name;
        item.onclick = () => {
          this.cityClick(c);
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
  private onShowInHistory(c) {
    try {
      if (this.page) {
        let wrapper = this.getHistoryWrapperEl();
        if (!wrapper) {
          wrapper = this.getHistoryHtml();
          this.page.insertBefore(
            wrapper,
            this.page.querySelector(".hot-cities-wrapper")
          );
        }
        const items = wrapper.querySelectorAll(".b-item");
        const list = wrapper.querySelector(".list");
        if (!this.histories || !this.histories.length) {
          this.histories = [c];
        }
        if (this.histories.length >= 12) {
          this.histories.pop();
        } else if (!this.histories.find((it) => it.Code == c.Code)) {
          this.histories.unshift(c);
        }
        const item = this.getHistoryOrHotItem(c);
        item.setAttribute("history", "isHistory");
        if (wrapper) {
          if (items.length) {
            for (let i = 0; i < items.length; i++) {
              const one = items.item(i);
              if (one.getAttribute("CityCode") == c.CityCode) {
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
            this.page.removeChild(wrapper);
            wrapper = this.getHistoryHtml(this.histories);
            this.page.insertBefore(
              wrapper,
              this.page.querySelector(".hot-cities-wrapper")
            );
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
  private getHistoryWrapperEl() {
    return this.page && this.page.querySelector(".history-cities-wrapper");
  }
  private cityClick(c: TrafficlineEntity) {
    this.onShowInHistory(c);
    this.citySource.emit(c);
  }
  private onClearHistories() {
    if (this.page) {
      const history = this.getHistoryWrapperEl();
      this.histories = [];
      if (history) {
        if (history.firstChild) {
          history.removeChild(history.firstChild);
        }
        this.page.removeChild(history);
      }
    }
  }
  private getHeaderHtml() {
    const header = document.createElement("div");
    header.classList.add("header");
    const backIcon = document.createElement("ion-icon");
    backIcon.setAttribute("name", "chevron-back-outline");
    backIcon.setAttribute("slot", "start");
    const cancelBtn = document.createElement("ion-button");
    cancelBtn.setAttribute("color", "secondary");
    cancelBtn.setAttribute("fill", "clear");
    cancelBtn.setAttribute("size", "small");
    cancelBtn.classList.add("cancel")
    const label = document.createElement("ion-label");
    label.textContent = '取消';
    cancelBtn.append(label);
    cancelBtn.onclick = () => {
        this.openPage(false);
    };
    backIcon.onclick = () => {
        this.openPage(false);
    };
    const searchbar = document.createElement("ion-searchbar");
    searchbar.setAttribute("disabled", "true");
    header.append(backIcon);
    header.append(searchbar);
    header.append(cancelBtn);
    return header;
}
  private getHtml(cities: TrafficlineEntity[]) {
    const cmap = this.getLeter2Cities(cities);
    const page = document.createElement("div");
    page.classList.add("hotel-city-page-container");
    const header = this.getHeaderHtml();
    page.append(header);
    const hotHtml = this.getHotHtml(cities.filter((it) => it.IsHot));
    const historyHtml = this.getHistoryHtml();
    page.append(historyHtml);
    page.append(hotHtml);
    const letterNavs = this.getLetterNavs(cmap);
    page.append(letterNavs);
    const list = this.getList(cmap);
    page.append(list);
    document.body.append(page);
    return page;
  }
  private getLetterNavs(cmap) {
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
          const el = this.page.querySelector(`[letter='${l}']`);
          const rect = el.getBoundingClientRect();
          const headerEle = 0;
          let y = 0;
          y = rect.top - headerEle;
          const ul = this.page;
          ul.scrollBy(0, y);
        } catch (e) {
          console.error(e);
        }
      };
    });
    return divwrapper;
  }
  private getItem(c) {
    const item = document.createElement("li");
    item.classList.add("item");
    item.onclick = (evt) => {
      this.cityClick(c);
      if (this.allCityListEleItems) {
        for (let i = 0; i < this.allCityListEleItems.length; i++) {
          const it = this.allCityListEleItems[i];
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
    if (!this.allCityListEleItems.find((it) => it == item)) {
      this.allCityListEleItems.push(item);
    }
    return item;
  }
  private getLeter2Cities(cities) {
    const cmap = {};
    if (cities) {
      cities.forEach((c) => {
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
  private getLetterHeader(l) {
    const li = document.createElement("li");
    li.classList.add("letter-header");
    li.setAttribute("letter", l);
    const label = document.createElement("label");
    label.textContent = l;
    li.append(label);
    return li;
  }
  private getList(cmap) {
    const list = document.createElement("ul");
    list.classList.add("list");
    if (cmap) {
      const letters = Object.keys(cmap);
      letters.sort();
      if (letters && letters.length) {
        letters.forEach((l) => {
          const letterHeader = this.getLetterHeader(l);
          list.append(letterHeader);
          const arr = cmap[l];
          if (arr) {
            arr.forEach((c) => {
              const item = this.getItem(c);
              this.allCityListEleItems.push(item);
              list.append(item);
            });
          }
        });
      }
    }
    return list;
  }
}

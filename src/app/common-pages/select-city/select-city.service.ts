import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
export type CityItem = ({ Name: string; Id: string; } & any);
@Injectable({ providedIn: "root" })
export class SelectCityService {
    extra: any = {};
    private cities: CityItem[];
    private _selectedItemSubject: Subject<CityItem>;
    setSelectedItem(item: CityItem) {
        this._selectedItemSubject.next(item);
    }
    getSelectedItemObservable() {
        return this._selectedItemSubject.asObservable();
    }
    getCities() {
        return this.cities;
    }
    constructor() {
        this.cities = [
            {
                Name: "中国(CN)",
                Id: "CN"
            },
            {
                Name: "美国(US)",
                Id: "US"
            },
            {
                Name: "德国(DE)",
                Id: "DE"
            },
            {
                Name: "日本(JP)",
                Id: "JP"
            },
            {
                Name: "韩国(KP)",
                Id: "KP"
            },
        ];
        this._selectedItemSubject = new BehaviorSubject(null);
    }
}
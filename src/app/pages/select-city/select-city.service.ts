import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApiService } from 'src/app/services/api/api.service';
import { BaseRequest } from 'src/app/services/api/BaseRequest';
import { map } from 'rxjs/operators';
export type CityItem = ({ Name: string; Id: string; } & any);
@Injectable({ providedIn: "root" })
export class SelectCityService {
    extra: any = {};
    private cities: CityItem[];
    private _selectedItemSubject: Subject<CityItem>;
    
    constructor(private apiService:ApiService) {
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
    setSelectedItem(item: CityItem) {
        this._selectedItemSubject.next(item);
    }
    getSelectedItemObservable() {
        return this._selectedItemSubject.asObservable();
    }
    getCities() {
        const req = new BaseRequest();
        req.Method='';
        this.apiService.getResponse<any>(req).pipe(map(r=>r.Data));
        return this.cities;
    }
}
import { Injectable } from "@angular/core";
import { ApiService } from "src/app/services/api/api.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { map, tap } from "rxjs/operators";
import { of, throwError } from "rxjs";
import { ThemeService } from "src/app/services/theme/theme.service";
interface IGallery {
  [lastId: string]: {
    LastId?: string;
    Datas?: {
      ImageUrl: string;
      InsertTime: string;
    }[];
  };
}

@Injectable({
  providedIn: "root",
})
export class PhotoGallaryService {
  private galleryMap: IGallery;
  private lastId: string;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService
  ) {
    identityService.getIdentitySource().subscribe(() => {
      this.galleryMap = {};
      this.lastId = "";
    });
  }
  getGalleryList(pageIndex: number) {
    const req = new RequestEntity();
    req.Data = {
      LastId: this.lastId,
    };
    req.Method = "BfsApiUrl-Home-Images";
    if (this.lastId) {
      if (this.galleryMap[pageIndex]) {
        return of(this.galleryMap[pageIndex].Datas);
      }
    }
    return this.apiService
      .getResponse<{
        LastId: string;
        Datas: {
          ImageUrl: string;
          InsertTime: string;
        }[];
      }>(req)
      .pipe(
        tap((r) => {
          if (r && r.Data) {
            this.lastId = r.Data.LastId;
            this.galleryMap[pageIndex] = r.Data;
            return this.galleryMap[pageIndex].Datas;
          }
        }),
        map((r) => r && r.Data.Datas)
      );
  }
  uploadFile(file: { name: string; fileValue: string }) {
    const req = new RequestEntity();
    req["FileName"] = file.name;
    req["FileValue"] = file.fileValue.split(",")[1];
    req.IsShowLoading = true;
    req.LoadingMsg = "请稍后";
    req.Data = {
      FolderId: 0,
    };
    req.Method = "BfsApiUrl-Home-UploadImage";
    return this.apiService.getPromiseData<{
      ImageUrl: string;
      Id: string;
    }>(req);
  }
}

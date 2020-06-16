import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { ApiService } from "../api/api.service";
import { of, throwError } from "rxjs";
import { finalize } from "rxjs/operators";
import { WordEntity } from "../analyzer/word.entity";
@Injectable({
  providedIn: "root"
})
export class AnalyzerService {
  public words: {
    Key: number;
    Names: string[];
  }[];
  public minLength: number;
  public maxLength: number;
  constructor() {}
  public load(words: string[]) {
    if (!words) {
      return;
    }
    this.words = [];
    this.minLength = 1000;
    this.maxLength = 0;
    words.forEach(it => {
      if (this.minLength > it.length) {
        this.minLength = it.length;
      }
      if (this.maxLength < it.length) {
        this.maxLength = it.length;
      }
      let one = this.words.find(s => s.Key == it.length);
      if (!one) {
        one = {
          Key: it.length,
          Names: []
        };
        this.words.push(one);
      }
      one.Names.push(it);
    });
  }
  public resolve(key: string): WordEntity[] {

    let result=[];
    let index = 0;
    while (index < key.length) {
      var length =
        index + this.maxLength > key.length
          ? key.length - index
          : this.maxLength;
      if (length < this.minLength) {
        break;
      }
      var name = key.substr(index, length);
      let i = name.length;
      for (; i > 0; i--) {
        if (i < this.minLength) {
          i = 0;
          break;
        }
        let word = name.substr(0, i);
        if (this.IsMainWord(word)) {
          let term = new WordEntity();
          term.Index = index;
          term.Name = word;
          result.push(term);
          break;
        }
      }
      index += i == 0 ? 1 : i;
    }
    return result;
  }
  private IsMainWord(name: string): boolean {
    let result = false;
    this.words.forEach(it => {
      if (it.Key != name.length) {
        return;
      }
      let low = 0;
      let high = it.Names.length - 1;
      while (low <= high) {
        let mid = low + Math.floor((high - low) / 2);
        if (it.Names[mid] == name) {
          // 找到该词
          result = true;
          return;
        }
        if (it.Names[mid] > name) {
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }
    });
    return result;
  }
}

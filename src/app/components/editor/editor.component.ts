import {
  Component,
  OnInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
  ViewChild,
  ElementRef,
  Input,
  Renderer2,
  SimpleChanges,
  Output,
  EventEmitter,
} from "@angular/core";
import Quill from "quill";
import { PhotoGallaryService } from "../photo-gallary/photo-gallery.service";
import { ImagesMangerComponent } from "../images-manager/images-manager.component";
import { finalize } from "rxjs/operators";
import { AppHelper } from "src/app/appHelper";
import { ImgControlComponent } from "../img-control/img-control.component";
@Component({
  selector: "app-editor",
  templateUrl: "./editor.component.html",
  styleUrls: ["./editor.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent implements OnInit, AfterViewInit, OnChanges {
  private editor: any;
  @ViewChild(ImgControlComponent, { static: true })
  imgCtrlele: ImgControlComponent;
  @ViewChild("editor", { static: true }) editorEle: ElementRef<HTMLElement>;
  @ViewChild("toolbar", { static: true }) toolbarEle: ElementRef<HTMLElement>;
  @Input() content: string;
  @Output() contentChange: EventEmitter<any>;
  constructor(
    private cdref: ChangeDetectorRef,
    private render: Renderer2,
    private photoGallaryService: PhotoGallaryService,
    private el: ElementRef<HTMLElement>
  ) {
    this.contentChange = new EventEmitter();
  }

  ngOnInit() {
    this.initEditor();
  }
  private initEditor() {
    if (this.editor) {
      return;
    }
    this.editor = new Quill(this.editorEle.nativeElement, {
      modules: {
        toolbar: this.toolbarEle.nativeElement,
        history: {
          delay: 2000,
          maxStack: 500,
          userOnly: true,
        },
      },
      theme: "snow",
    });
    console.log(this.editor);
  }
  onDone() {
    this.getHtml();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.render.setStyle(
        this.editorEle.nativeElement,
        "top",
        `${this.toolbarEle.nativeElement.clientHeight}px`
      );
      if (
        this.el.nativeElement.parentElement &&
        this.el.nativeElement.parentElement.clientHeight
      ) {
        this.render.setStyle(
          this.el.nativeElement,
          "height",
          `${this.el.nativeElement.parentElement.clientHeight}px`
        );
      }
    }, 200);
  }
  private getHtml() {
    const root = this.editor.root as HTMLElement;
    const el = root.cloneNode(true) as any;
    // console.log(this.convertCssToStyle(el).innerHTML);
    this.contentChange.emit(this.convertCssToStyle(el).innerHTML);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.content) {
      if (this.content) {
        if (!this.editor) {
          this.initEditor();
        }
        if (this.editor && this.editor.clipboard) {
          this.editor.clipboard.dangerouslyPasteHTML(0, this.content);
        }
      }
    }
  }
  onRedo() {
    this.editor.history.redo();
  }
  onUndo() {
    this.editor.history.undo();
  }
  cssTextToJSON(cssText) {
    const arr = cssText.split(";");
    arr.splice(arr.length - 1, 1);
    const obj = {};
    arr.forEach((item) => {
      const attrName = item.split(":")[0];
      obj[attrName.replace(/ /g, "")] = item
        .split(":")
        .map((i, index) => {
          return index ? i : "";
        })
        .join("");
    });
    return obj;
  }
  onUploadImage() {
    if (this.editor) {
      if (this.imgCtrlele) {
        this.imgCtrlele.onSelectFile();
      }
    }
  }
  async onImageChange(f: any) {
    try {
      if (f.fileValue) {
        const res = await this.photoGallaryService.uploadFile({
          name: f.name || f.fileName,
          fileValue: f.fileValue,
        });
        if (res && res.ImageUrl) {
          this.addImage(res.ImageUrl);
        }
      } else {
        this.addImage(f.fileName);
      }
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  private addImage(url: string) {
    if (url) {
      const range = this.editor.getSelection() || {};
      console.log("range", range);
      this.editor.insertEmbed(range.index || 0, "image", url);
    } else {
      AppHelper.alert("请选择图片");
    }
  }
  private convertCssToStyle(dom: HTMLElement) {
    // 将样式表的样式装换成行内样式
    const sheets = document.styleSheets;
    const sheetsArry = Array.from(sheets);
    const $dom: HTMLElement = (dom.parentNode || dom) as any;
    sheetsArry.forEach((sheetContent) => {
      const { rules, cssRules } = sheetContent as any ;
      // cssRules兼容火狐
      const rulesArry = Array.from(rules || cssRules).filter((it: any) =>
        (it.cssText || "").includes("ql")
      );
      rulesArry.forEach((rule) => {
        const { selectorText, style }: any = rule;
        if (selectorText && selectorText.includes("ql")) {
          try {
            const select = $dom.querySelectorAll(selectorText);
            select.forEach((ele: HTMLElement) => {
              // console.log("selectortext", ele);
              const eleStyle = getComputedStyle(ele);
              if (eleStyle.cssText) {
                const oldCssText = this.cssTextToJSON(eleStyle.cssText);
                const newCssText = this.cssTextToJSON(style.cssText);
                // tslint:disable-next-line: forin
                for (const i in newCssText) {
                  oldCssText[i] = newCssText[i];
                }
                // tslint:disable-next-line: forin
                for (const j in oldCssText) {
                  ele.style[j] = oldCssText[j];
                }
              } else {
                ele.style.cssText = getComputedStyle(ele).cssText;
              }
              (ele as HTMLElement).className = "";
            });
          } catch (e) {
            console.log("转换成行内样式失败", e);
          }
        }
      });
    });
    return $dom;
  }
}

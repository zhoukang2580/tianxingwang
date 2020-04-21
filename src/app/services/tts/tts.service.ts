import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';

@Injectable({
  providedIn: 'root'
})
export class TTSService implements ITTS {
  private tts: ITTS;
  private showTip = false;
  private options: ITTSOptions = { locale: "zh-CN", rate: 1 } as ITTSOptions;
  isForbiden = false;
  constructor(private plt: Platform) { }
  async speak(opt: ITTSOptions | string): Promise<void> {
    if (this.isForbiden) {
      return;
    }
    await this.plt.ready();
    this.tts = window['TTS'];
    if (this.tts) {
      let options = this.options;
      if (typeof opt === 'string') {
        options.text = opt;
      } else {
        options = {
          ...this.options,
          ...opt
        };
      }
      return this.tts.speak(options)
      // .catch((e) => {
      //   alert(JSON.stringify(e))
      //   if (this.showTip) {
      //     AppHelper.alert('请安装科大讯飞语音引擎，然后到设置->语言->语言和输入法中设置（高级）->文字转语音（TTS）输出，设置为科大讯飞（如果安装的不是科大讯飞，则选择别的语音引擎）');
      //   }
      //   AppHelper.alert("不再显示该消息？", true, "是", "否").then(ok => {
      //     this.showTip = !ok;
      //   })
      // });
    }
  };
  setTTSOptions(options: ITTSOptions) {
    this.options = {
      ...this.options,
      ...options
    };
  }
  async stop(): Promise<void> {
    await this.plt.ready();
    this.tts = window['TTS'];
    if (this.tts) {
      return this.tts.stop();
    }
  }
  async checkLanguage(): Promise<string> {
    await this.plt.ready();
    this.tts = window['TTS'];
    if (this.tts) {
      return this.tts.checkLanguage();
    }
  }
  async openInstallTts(): Promise<void> {
    await this.plt.ready();
    this.tts = window['TTS'];
    if (this.tts) {
      return this.tts.openInstallTts();
    }
  }
}
export interface ITTS {
  speak(options: ITTSOptions | string): Promise<void>;
  stop(): Promise<void>;
  checkLanguage(): Promise<string>;
  openInstallTts(): Promise<void>;
}
interface ITTSOptions {
  /** text to speak */
  text: string;
  /** a string like 'en-US', 'zh-CN', etc */
  locale?: "zh-CN" | "en-US";
  /** speed rate, 0 ~ 1 */
  rate?: number;
  /** ambient(iOS) */
  category?: string;
}
export class LanguageHelper {
  static get isEn() {
    return LanguageHelper.lang == "en";
  }
  static get lang() {
    const lang =
      window.localStorage.getItem("language") ||
      window.localStorage.getItem("style") ||
      "";
    return lang.replace(/"/g, "") || "cn";
  }
  static Train = {
    getDontAllowBookTip: () => {
      return "当前座位违反差标，不能预订";
    },
    getCannotBookMorePassengerTip: () => {
      return "不能添加更多旅客";
    },
    getCanSwipeIdCardTip(): any {
      if (LanguageHelper.lang == "en") {
        return "Can Swipe ID Card To Enter Station";
      }
      return "可刷身份证进站";
    },
  };
  static Order = {
    getStatusCancelTypeTip: () => {
      return "取消";
    },
    getDonotSelectPayWayTip: () => {
      return "尚未选择支付方式?";
    },
    getStatusFinishTypeTip: () => {
      return "完成";
    },
    getStatusWaitDeliveryTypeTip: () => {
      return "待发货";
    },
    getStatusWaitHandleTypeTip: () => {
      return "待处理";
    },
    getStatusWaitPayTypeTip: () => {
      return "待支付";
    },
    getStatusWaitSignTypeTip: () => {
      return "待签收";
    },
    getBookTicketWaitingTip: (isPay) => {
      return `您的订单正在预订${isPay ? "，请稍后到“我的订单”中支付" : ""}`;
    },
    getBookTicketWaitingApprovToPayTip: () => {
      return "下单成功！您的订单需要审批，请于审批完成后到订单列表进行支付";
    },
  };
  static CurrencySymbols = {
    Yuan: () => {
      return "￥";
    },
    USD: () => {
      return "$";
    },
  };
  static FlightMealType = {
    /// <summary>
    /// 不特定餐食
    /// </summary>
    // M = 1,
    getMTip: () => {
      return "不特定餐食";
    },
    /// <summary>
    /// 早餐
    /// </summary>
    // B = 2,
    getBTip: () => {
      return "早餐";
    },
    /// <summary>
    /// 午餐
    /// </summary>
    // L = 3,
    getLTip: () => {
      return "午餐";
    },
    /// <summary>
    /// 免费酒精饮料
    /// </summary>
    // C = 4,
    getCTip: () => {
      return "免费酒精饮料";
    },
    /// <summary>
    /// 大陆式早餐
    /// </summary>
    // K = 5,
    getKTip: () => {
      return "大陆式早餐";
    },

    /// <summary>
    /// 晚餐
    /// </summary>
    // D = 6,
    getDTip: () => {
      return "晚餐";
    },
    /// <summary>
    /// 点心或早午餐
    /// </summary>
    // S = 7,
    getSTip: () => {
      return "点心或早午餐";
    },
    /// <summary>
    /// 冷食
    /// </summary>
    // O = 8,
    getOTip: () => {
      return "冷食";
    },
    /// <summary>
    /// 热食
    /// </summary>
    // H = 9,
    getHTip: () => {
      return "热食";
    },
    /// <summary>
    /// 茶点或小吃
    /// </summary>
    // R = 10
    getRTip: () => {
      return "茶点或小吃";
    },
  };
  static Hotel = {
    getCannotBookMoreHotelPassengerTip: () => {
      return `您已添加旅客`;
    },
  };
  static Flight = {
    getMustAddOnePassengerTip: () => {
      return "请添加择旅客";
    },
    getSaveBookOrderOkTip: () => {
      return "您的预订已完成";
    },
    getApproverTip: () => {
      return "审批人";
    },
    getCreditPayTip: () => {
      return "信用付";
    },
    getCompanyPayTip: () => {
      return "公付";
    },
    getPersonPayTip: () => {
      return "个付";
    },
    getBalancePayTip: () => {
      return "余额付";
    },
    getPlsSelectGoFlightTip: () => {
      return `请先选择去程`;
    },
    getAddMorePassengersTip: () => {
      return `完成添加旅客`;
    },
    getMustSelectPassengerTypeTip: () => {
      return `请选择旅客类型`;
    },
    getMustSelectOneCredentialTip: () => {
      return `请选择一个证件`;
    },
    getPassengerTypeEmployeeTip: () => {
      return `员工`;
    },
    getPassengerTypeSupplierTip: () => {
      return `供应商`;
    },
    getPassengerTypeCustomerTip: () => {
      return `客户`;
    },
    getPassengerTypeOtherTip: () => {
      return `其它旅客类别`;
    },
    getNotWhitelistingTip: () => {
      return `非白名单`;
    },
    getBackDateCannotBeforeGoDateTip: () => {
      return `回程日期必须在去程之后`;
    },
    getSelectedFlightInvalideTip: () => {
      return `无效的航班信息`;
    },
    getSelectReturnTripTip: () => {
      return `已选去程，是否选择返程？`;
    },
    getTripTypeTip: () => {
      return `请选择去程或者返程`;
    },
    getIsReselectReturnTripTip: () => {
      return `是否更新 [回程]？`;
    },
    getIsReSelectDepartureTip: () => {
      return `是否更新 [去程]？`;
    },

    getCannotBookMorePassengerTip: () => {
      return `不能添加更多旅客`;
    },
    getCannotBookMoreFlightSegmentTip: () => {
      return `不能预订更多航班`;
    },
    getConfirmRemoveFlightSegmentTip: () => {
      return `确定删除该航班？`;
    },
    getTheLowestSegmentNotFoundTip: () => {
      return `更低价航班未找到`;
    },
    getTheLowestCabinNotFoundTip: () => {
      return `航班舱位未找到`;
    },
    getHasLowerSegmentTip: () => {
      return `您指定的航班前后60分钟内有更低价航班`;
    },
    getSelectTheSegmentTip: () => {
      return `选择该航班`;
    },
    getMustSelectOneSegmentTip: () => {
      return `请选选择航班`;
    },
    getReselectFlightSegmentTip() {
      return "重新选择航班?";
    },
    getCheckFirstNameTip() {
      return "登机名";
    },
    getCheckLastNameTip() {
      return "登机姓";
    },
    getMobileTip() {
      return "手机号";
    },
    getIllegalReasonTip() {
      return "超标原因";
    },
    getTravelTypeTip() {
      return "出差类型";
    },
    getrOderTravelPayTypeTip() {
      return "支付方式";
    },
  };
  static PayWays = {
    getAliPayTip: () => {
      if (LanguageHelper.lang == "en") {
        return "Alipay payment";
      }
      return "支付宝支付";
    },
    getWechatPayTip: () => {
      if (LanguageHelper.lang == "en") {
        return "WeChat payment";
      }
      return "微信支付";
    },
  };
  static getDiscountTip() {
    return "折";
  }
  static getFullPriceTip() {
    return "全价";
  }
  static getCredentialNumberEmptyTip() {
    return "该人员证件号为空，不可添加";
  }
  static getSelectPassengersTip() {
    return "请添加旅客";
  }
  static getRoundTripTotalDaysTip(num: number) {
    if (LanguageHelper.isEn) {
      return `Total ${num} days`;
    }
    return `共${num}天`;
  }
  static getCheckInOutTotalDaysTip(num: number) {
    if (LanguageHelper.isEn) {
      return `Total ${num} nights`;
    }
    return `共${num}晚`;
  }
  static getSelectFlyBackDate() {
    if (LanguageHelper.isEn) {
      return "Select return date";
    }
    return "请选择返程日期";
  }
  static getSelectCheckInDate() {
    if (LanguageHelper.isEn) {
      return "Please select check in date";
    }
    return "请选择入住日期";
  }
  static getSelectCheckOutDate() {
    if (LanguageHelper.isEn) {
      return "Please select departure date";
    }
    return "请选择离店日期";
  }
  static getSelectOtherFlyDayTip() {
    if (LanguageHelper.isEn) {
      return "Please select other date";
    }
    return "请选择其他日期";
  }
  static getModifyUnSavedTip() {
    return "修改尚未保存，是否确定离开？";
  }
  static getValidateRulesEmptyTip(): string {
    return "验证规则不存在";
  }
  static getSelectCountryTip(): string {
    return "选择国籍";
  }
  static getSelectIssueCountryTip(): string {
    return "选择发证国籍";
  }
  static getInfoModifySuccessTip(): string {
    return "信息修改成功";
  }
  static getComfirmInfoModifyPasswordSuccessTip(): string {
    return "确认密码成功";
  }
  static getComfirmInfoModifyCredentialsSuccessTip(): string {
    return "确认证件成功";
  }
  static getComfirmInfoModifyCredentialsFailureTip(): string {
    return "确认证件失败";
  }
  static getComfirmInfoModifyPasswordFailureTip(): string {
    return "密码确认失败";
  }
  static getIdCardTip(): string {
    return "身份证";
  }
  static getPassportTip(): string {
    return "护照";
  }
  static getHmPassTip(): string {
    return "港澳通行证";
  }
  static getTwPassTip(): string {
    return "台湾通行证";
  }
  static getTaiwanTip(): string {
    return "台胞证";
  }
  static getHvPassTip(): string {
    return "回乡证";
  }
  static getOtherTip(): string {
    return "其他证件";
  }
  static getCredentialTypeTip(): string {
    return "证件类型";
  }
  static getCredentialNumberTip(): string {
    return "证件号";
  }
  static getTaiwanEpTip(): string {
    return "入台证";
  }

  static getResidencePermit(): string {
    return "港澳台居民身份证";
  }

  static getAlienPermanentResidenceIdCard(): string {
    return "外国人永久居留身份证";
  }
  static getCloseTip(): string {
    return "X";
  }
  static getHistoryCitiesTip(): string {
    return "历史";
  }
  static getHotCitiesTip(): string {
    return "热门";
  }
  static getDayTip() {
    return "天";
  }
  static getYearTip() {
    return "年";
  }
  static getMonthTip() {
    return "月";
  }
  static getDepartureTip(): string {
    return "去程";
  }
  static getReturnTripTip() {
    return "返程";
  }
  static getCheckOutTip(): string {
    return "离店";
  }
  static getCheckInOutTip(): string {
    return "入住离店";
  }
  static getCheckInTip() {
    return "入住";
  }
  static getRoundTripTip() {
    return "往返";
  }
  static getBackDateTip() {
    return "请选择返程日期";
  }
  static getSundayTip(isAbbreviation = true) {
    if (LanguageHelper.lang == "en") {
      if (isAbbreviation) return "Sun.";
      return "Sunday";
    }
    return "周日";
  }
  static getMondayTip(isAbbreviation = true) {
    if (LanguageHelper.lang == "en") {
      if (isAbbreviation) return "Mon.";
      return "Monday";
    }
    return "周一";
  }
  static getTuesdayTip(isAbbreviation = true) {
    if (LanguageHelper.lang == "en") {
      if (isAbbreviation) return "Tues.";
      return "Tuesday";
    }
    return "周二";
  }
  static getWednesdayTip(isAbbreviation = true) {
    if (LanguageHelper.lang == "en") {
      if (isAbbreviation) return "Wed.";
      return "Wednesday";
    }
    return "周三";
  }
  static getThursdayTip(isAbbreviation = true) {
    if (LanguageHelper.lang == "en") {
      if (isAbbreviation) return "Thur.";
      return "Thursday";
    }
    return "周四";
  }
  static getFridayTip(isAbbreviation = true) {
    if (LanguageHelper.lang == "en") {
      if (isAbbreviation) return "Fri.";
      return "Friday";
    }
    return "周五";
  }
  static getSaturdayTip(isAbbreviation = true) {
    if (LanguageHelper.lang == "en") {
      if (isAbbreviation) return "Sat.";
      return "Saturday";
    }
    return "周六";
  }
  static getTodayTip(isAbbreviation = false) {
    if (LanguageHelper.lang == "en") {
      return "Today";
    }
    return "今天";
  }
  static getTomorrowTip() {
    return "明天";
  }
  static getTheDayAfterTomorrowTip() {
    return "后天";
  }
  static getApkReadyToBeInstalledTip(): string {
    return "App 下载完毕，立即安装更新？";
  }
  static getApkUpdateMessageTip(): string {
    return "应用有升级更新，是否立即升级更新？";
  }
  static getApkDownloadedTip() {
    return "应用初始化完成...";
  }
  static getApkDownloadingTip() {
    return "正在初始化应用...";
  }
  static getHcpFetchServerVersionTip(): string {
    return "正在初始化应用...";
  }
  static getHcpUpdateErrorTip() {
    return "更新失败";
  }
  static getUpdateTip() {
    return "更新";
  }
  static getIgnoreTip() {
    return "忽略";
  }
  static getYesTip() {
    return "是";
  }
  static getNegativeTip() {
    return "否";
  }
  static gethcpUpdateBaseDataTip() {
    return "是否立即更新重要基础数据？";
  }
  static getJSSDKScanTextTip() {
    return "扫一扫";
  }
  static getJSSDKScanErrorTip() {
    return "扫码功能出错";
  }
  static getJSSDKNotExistsTip() {
    return "JSSDK加载失败";
  }
  static getHcpReloadToEffectTip() {
    return "数据加载完成，重新打开以生效？";
  }
  static getHcpValidatingFileTip() {
    return "正在校验文件完整性";
  }
  static getHcpDownloadingTip() {
    return "正在更新数据...";
  }
  static getFileDownloadingTip() {
    return "正在下载...";
  }
  static getWritingFileTip() {
    return "正在写入文件...";
  }
  static getHcpUnZipTip() {
    return "正在解压文件...";
  }
  static getHcpUnZipCompleteTip() {
    return "完成文件解压...";
  }
  static getHcpCreateVersionFileTip() {
    return "成功标记热更版本";
  }
  static getLoginImageCodeTip() {
    // if(AppHelper.getLanguage())
    return "请输入验证码";
  }
  static getSlidvalidateInnerTip() {
    if (LanguageHelper.lang == "en") {
      return "Slide right to fill puzzle";
    }
    return "向右滑动填充拼图";
  }
  static getLoginNameTip() {
    if (LanguageHelper.lang == "en") {
      return "Please enter user name";
    }
    return "请输入登入名";
  }
  static getLoginPasswordTip() {
    if (LanguageHelper.lang == "en") {
      return "Please enter Password";
    }
    return "请输入登入密码";
  }
  static getLoginMobileTip() {
    if (LanguageHelper.lang == "en") {
      return "Please enter your mobile phone";
    }
    return "请输入手机号码";
  }
  static getMobileCodeTip() {
    return "请输入手机收到的验证码";
  }
  static getEnterPasswordTip() {
    return "请输入密码";
  }
  static getApiExceptionTip() {
    // if(AppHelper.getLanguage())
    if (LanguageHelper.lang == "en") {
      return "Network error";
    }
    return "接口调用异常";
  }
  static getApiMobileAppError() {
    return "应用内部错误";
  }
  static getApiTimeoutTip() {
    if (LanguageHelper.lang == "en") {
      return "Network error";
    }
    return "请求超时";
  }
  static getMaintainCredentialsTip() {
    return "请先维护证件信息";
  }
  static getNetworkErrorTip() {
    if (LanguageHelper.lang == "en") {
      return "Network error";
    }
    return "网络错误";
  }
  static getMsgTip() {
    return "提示";
  }
  static getBindMobileSuccess() {
    if (LanguageHelper.lang == "en") {
      return "Binded";
    }
    return "完成手机绑定";
  }
  static getBindEmailSuccess() {
    if (LanguageHelper.lang == "en") {
      return "Binded";
    }
    return "邮箱绑定成功";
  }
  static getCancelTip() {
    if (LanguageHelper.lang == "en") {
      return "Cancel";
    }
    return "取消";
  }

  static getConfirmTip() {
    if (LanguageHelper.lang == "en") {
      return "Ok";
    }
    return "确定";
  }
  static getConfirmDeleteTip() {
    return "确定删除";
  }
  static getHintTip(): string {
    if (LanguageHelper.lang == "en") {
      return "Tip";
    }
    return "提示";
  }
  static getAppDoubleClickExit() {
    if (LanguageHelper.lang == "en") {
      return "Press again to exit";
    }
    return "再按一次退出应用";
  }
  static slideValidateUseTime() {
    return "验证成功";
  }
  static OldPasswordNullTip() {
    if (LanguageHelper.lang == "en") {
      return "The original password cannot be empty";
    }
    return "原密码不能为空";
  }
  static NewPasswordNullTip() {
    if (LanguageHelper.lang == "en") {
      return "Please enter a new password";
    }
    return "请输入新密码";
  }
  static TwicePasswordNotEqualTip() {
    if (LanguageHelper.lang == "en") {
      return "passwords are not the same";
    }
    return "两次输入的密码不一致";
  }
  static getNotifyLanguageTip(): string {
    return "通知语言";
  }
}

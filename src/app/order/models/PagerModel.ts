export class PagerModel {
    ClientId: string;//  = $"pager{Guid.NewGuid().ToString("N")}";
    /// <summary>
    /// 首页地址
    /// </summary>
    FirstUrl: string;// 
    /// <summary>
    /// 上一页地址
    /// </summary>
    PreviousUrl: string;// 
    /// <summary>
    /// 数字连接地址
    /// </summary>
    Links: { [key: number]: string };// 
    /// <summary>
    /// 下一页地址
    /// </summary>
    NextUrl: string;// 
    /// <summary>
    /// 最后一页地址
    /// </summary>
    LastUrl: string;// 
    /// <summary>
    /// 最后一页地址
    /// </summary>
    PageSizeUrl: string;// 
    /// <summary>
    /// 当前页
    /// </summary>
    PageIndex: number;// 
    /// <summary>
    /// 最后一页地址
    /// </summary>
    PageSizeName: string;// 
    /// <summary>
    /// 当前页
    /// </summary>
    PageIndexName: string;// 
    /// <summary>
    /// 是否Ajax
    /// </summary>
    IsAjax: boolean;// 
    /// <summary>
    /// 请求路径
    /// </summary>
    AjaxFunction: string;// 
    /// <summary>
    /// 页大小
    /// </summary>

    /// <summary>
    /// 页大小
    /// </summary>
    PageCount: number;

    /// <summary>
    /// 分页大小
    /// </summary>
    PageSize: number;
    /// <summary>
    /// 数据
    /// </summary>
    DataCount: number;// 
}
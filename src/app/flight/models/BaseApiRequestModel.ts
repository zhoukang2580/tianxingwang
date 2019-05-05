// 公共请求参数 除了data 和 method必须传递，其他的可以在拦截器内部全部生成
export class BaseApiRequestModel {
  Ticket?: string; // Yes api调用凭证
  Token?: string; // Yes 访问凭证
  Method: string; // Yes
  Timestamp?: number; // Yes Unix 时间戳
  Sign?: string; // Yes 签名
  TraceId?: string; // No
  Version?: string; // Yes 1.0
  Data?: string; // Yes 业务参数 (json)
}

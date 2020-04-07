export enum TaskStatusType{
    
        /// <summary>
        /// 创建
        /// </summary>
        Created = 1,
        /// <summary>
        /// 等待审核
        /// </summary>
        Waiting = 2,
        /// <summary>
        /// 通过
        /// </summary>
        Passed = 3,
        /// <summary>
        /// 拒绝
        /// </summary>
        Rejected = 4,
        /// <summary>
        /// 已关闭
        /// </summary>
        Closed = 5
}
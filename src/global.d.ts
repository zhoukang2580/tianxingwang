declare function  alert(msg: any, userOp?: boolean): Promise<boolean>;
declare function  toast(msg: any, duration?: number, position?: "middle" | "top" | "bottom"):void;
// declare interface extWindow extends Window{
//   alert(msg: any, userOp?: boolean):Promise<boolean>;
//   toast(msg: any, duration?: number, position?: "middle" | "top" | "bottom"):void;
// }
// declare  global{
//     interface Window{
//         alert(msg: any, userOp?: boolean):Promise<boolean>;
//         toast(msg: any, duration?: number, position?: "middle" | "top" | "bottom"):void;
//     }
// }
// declare global {
//     interface Window {
//         alert(msg: any, userOp?: boolean): Promise<boolean>;
//         toast(msg: any, duration?: number, position?: "middle" | "top" | "bottom"): void;
//     }
// }
declare function alert(msg:string,userOp:boolean):Promise<any>;
declare function  toast(msg:string,duration?:number):void;
declare interface window{
    alert:(msg:string,userOp?:boolean)=>Promise<any>;
    toast:(msg:string,duration?:number,position?:"top"|"middle"|"bottom")=>void;
}
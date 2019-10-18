import { BaseEntity } from './BaseEntity';

export class BaseVariablesEntity extends BaseEntity {
  Variables: string;
  VariablesJsonObj: any;
  public GetVariable<T>(key: string) {
    this.VariablesJsonObj = this.VariablesJsonObj || JSON.parse(this.Variables);
    return this.VariablesJsonObj[key] as T
  }
}

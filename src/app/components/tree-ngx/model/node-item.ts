export interface NodeItem<T> {
  name: string;
  item?: T;
  id?: string;
  children?: NodeItem<T>[];
  selected?: boolean;
  expanded?: boolean;
  parentId?: string;
  parent?: NodeItem<T>;
}

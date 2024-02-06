export interface ChannelNode {
  name: string;
  img:string;
  id:string;
  ids:any;
  type:string;
  children?: ChannelNode[];
}

export interface MessageNode{
  fullName:string;
  photoURL:string;
  id:string,
  uid:string;
  type:string;
  isOnline:boolean;
  children?: MessageNode[];
}

export interface ExampleFlatNode {
  expandable: boolean;
  name: string;
  img:string;
  id:string;
  level: number;
  type:string;
  isOnline:boolean;
}
export interface Room {
  name: string;
  id: number;
  is_new: boolean;
}

export interface Message {
  writer: string;
  msg: string;
  time: string;
}
export interface Notice {
  writer: string;
  notice: string;
  time: string;
}

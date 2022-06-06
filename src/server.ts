export interface Server {
  id: string;
  path: string;
  name: string;
  extraHeaders: kvpairs[];
}

export interface kvpairs {
  key: string;
  value: string;
}

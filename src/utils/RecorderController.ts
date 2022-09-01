import { Recorder } from './api';
import { EMBEDDED_BUILD, STORAGE_KEY_SERVERS } from '../const';

export interface BasicAuth {
  type: 'basic';
  username: string;
  password: string;
}
export interface NoneAuth {
  type: 'none';
}

export interface Server {
  id: string;
  path: string;
  name: string;
  extraHeaders?: kvpairs[];
  auth?: BasicAuth | NoneAuth;
  iconPath?: string;
}

export interface kvpairs {
  key: string;
  value: string;
}

function generateRandomId() {
  return Math.random().toString(36).substring(2, 8);
}

export function verifyServer(server:Server):boolean {
  if (typeof server.path !== 'string') {
    throw new Error('path is not a string');
  }
  if (typeof server.name !== 'string') {
    throw new Error('name is not a string');
  }
  if (typeof server.extraHeaders != 'undefined' ) {
    if (Array.isArray(server.extraHeaders)) {
      server.extraHeaders.forEach((h) => {
        if (typeof h.key !== 'string') {
          throw new Error('extraHeaders.key is not a string');
        }
        if (typeof h.value !== 'string') {
          throw new Error('extraHeaders.value is not a string');
        }
      });
      if (server.extraHeaders.length === 0) {
        delete server.extraHeaders;
      }
    } else {
      throw new Error('extraHeaders is not an array');
    }
  }
  if (typeof server.auth !== 'undefined') {
    if (server.auth.type === 'basic') {
      if (typeof server.auth.username !== 'string') {
        throw new Error('auth.username is not a string');
      }
      if (typeof server.auth.password !== 'string') {
        throw new Error('auth.password is not a string');
      }
    } else if (server.auth.type === 'none') {
      // noop
    } else {
      throw new Error('auth.type is not basic or none');
    }
  }
  if (typeof server.iconPath !== 'undefined' && typeof server.iconPath !== 'string') {
    throw new Error('iconPath should be string or none');
  }
  return true;
}

class RecorderApi extends EventTarget {
  public recorder:Recorder<Server> | null = null;
  private _supportLocalStorage: boolean = !!window.localStorage;
  private servers: Server[] = [];

  constructor() {
    super();
    if (EMBEDDED_BUILD) {
      const localRecorder = new URL('../', document.baseURI).toString();
      this.recorder = new Recorder<Server>(localRecorder, {}, { id: 'local', path: localRecorder, name: 'Local' });
    } else {
      this.loadServers();
    }
  }
  public changeHost(id:string, force:boolean = false) {
    if (id == this.recorder?.meta.id && !force) {
      return;
    }
    const server = this.servers.find((ss) => ss.id == id);
    if (!server) {
      throw new Error('server not found');
    }

    const headers: any = {};
    server.extraHeaders?.forEach((h) => {
      headers[h.key] = h.value;
    });
    server.auth?.type === 'basic' ? headers.Authorization = `Basic ${btoa(`${server.auth.username}:${server.auth.password}`)}` : null;
    this.recorder = new Recorder(
      server.path,
      headers,
      server,
    );
    this.dispatchEvent(new CustomEvent('recorder-change'));
  }
  public resetRecorder() {
    this.recorder = null;
    this.dispatchEvent(new CustomEvent('recorder-change'));
  }

  private loadServers() {
    if (window.localStorage) {
      const data = window.localStorage.getItem(STORAGE_KEY_SERVERS);
      if (data) {
        this.servers = [];
        let parsed:Server[] = [];
        try {
          parsed = JSON.parse(data) as Server[];
        } catch (error) {
          console.error(error);
        }
        parsed.forEach((s) => {
          try {
            // verify id
            if (typeof s.id === 'undefined') {
              s.id = generateRandomId();
            }
            if (this.servers.find((ss) => ss.id === s.id)) {
              s.id = generateRandomId();
            }
            verifyServer(s);
            this.servers.push(s);
          } catch (error) {
            console.error(error);
          }
          this.saveServers();
        });
      }
    }
    this.dispatchEvent(new CustomEvent('recorders-list-update'));
  }
  public listServers():Server[] {
    // return a deep copy of the array
    return JSON.parse(JSON.stringify(this.servers));
  }
  public saveServers() {
    if (this._supportLocalStorage) {
      window.localStorage.setItem(STORAGE_KEY_SERVERS, JSON.stringify(this.servers));
    }
  }
  public addServer(server: Server) {
    server = JSON.parse(JSON.stringify(server));
    if (typeof server.id === 'undefined') {
      server.id = generateRandomId();
    }
    if (this.servers.find((ss) => ss.id === server.id)) {
      server.id = generateRandomId();
    }
    verifyServer(server);
    if (!server.path.endsWith('/')) {
      server.path = server.path + '/';
    }
    this.servers.push(server);
    this.dispatchEvent(new CustomEvent('recorders-list-update' ));
    this.saveServers();
  }
  public removeServer(id: string) {
    const index = this.servers.findIndex((ss) => ss.id === id);
    if (index === -1) {
      return;
    }
    this.servers.splice(index, 1);
    this.saveServers();
    if (this.recorder?.meta.id === id) {
      this.resetRecorder();
    }
    this.dispatchEvent(new CustomEvent('recorders-list-update'));
  }
  public updateServer(id:string, newServer:Server) {
    const index = this.servers.findIndex((ss) => ss.id === id);
    if (index === -1) {
      throw new Error('server not found');
    }
    this.servers[index] = JSON.parse(JSON.stringify(newServer));
    this.dispatchEvent(new CustomEvent('recorders-list-update'));
    if (this.recorder?.meta.id === id) {
      this.changeHost(id, true);
    }
  }

  public exportJSON() {
    return JSON.stringify(this.servers, null, 2);
  }
}

export const recorderController = new RecorderApi();

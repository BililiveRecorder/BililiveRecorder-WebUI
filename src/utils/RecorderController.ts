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
}

export interface kvpairs {
  key: string;
  value: string;
}

function generateRandomId() {
  return Math.random().toString(36).substring(2, 8);
}

class RecorderApi extends EventTarget {
  public recorder:Recorder<Server> | null = null;
  private _supportLocalStorage: boolean = !!window.localStorage;
  private servers: Server[] = [];

  constructor() {
    super();
    if (EMBEDDED_BUILD) {
      this.recorder = new Recorder<Server>(window.origin, {}, { id: 'local', path: window.origin, name: 'Local' });
      return;
    }
    this.loadServers();
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
        const parsed = JSON.parse(data) as Server[];
        parsed.forEach((s) => {
          try {
            if (typeof s.id === 'undefined') {
              s.id = generateRandomId();
            }
            if (this.servers.find((ss) => ss.id === s.id)) {
              s.id = generateRandomId();
            }
            if (typeof s.path !== 'string') {
              throw new Error('path is not a string');
            }
            if (typeof s.name !== 'string') {
              throw new Error('name is not a string');
            }
            if (typeof s.extraHeaders !='undefined' ) {
              if (Array.isArray(s.extraHeaders)) {
                s.extraHeaders.forEach((h) => {
                  if (typeof h.key !== 'string') {
                    throw new Error('extraHeaders.key is not a string');
                  }
                  if (typeof h.value !== 'string') {
                    throw new Error('extraHeaders.value is not a string');
                  }
                });
                if (s.extraHeaders.length === 0) {
                  delete s.extraHeaders;
                }
              } else {
                throw new Error('extraHeaders is not an array');
              }
            }
            if (typeof s.auth !== 'undefined') {
              if (s.auth.type === 'basic') {
                if (typeof s.auth.username !== 'string') {
                  throw new Error('auth.username is not a string');
                }
                if (typeof s.auth.password !== 'string') {
                  throw new Error('auth.password is not a string');
                }
              } else if (s.auth.type === 'none') {
                // noop
              } else {
                throw new Error('auth.type is not basic or none');
              }
            }
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
    if (typeof server.path !== 'string') {
      throw new Error('path is not a string');
    }
    if (typeof server.name !== 'string') {
      throw new Error('name is not a string');
    }
    if (Array.isArray(server.extraHeaders)) {
      server.extraHeaders.forEach((h) => {
        if (typeof h.key =='number') {
          h.key = h.key + '';
        }
        if (typeof h.key !== 'string') {
          throw new Error('extraHeaders.name is not a string');
        }
        if (typeof h.value =='number') {
          h.value = h.value + '';
        }
        if (typeof h.value !== 'string') {
          throw new Error('extraHeaders.value is not a string');
        }
      });
      if (server.extraHeaders.length === 0) {
        server.extraHeaders;
      }
    } else if (typeof server.extraHeaders !== 'undefined') {
      throw new Error('extraHeaders is not an array');
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
}

export const recorderController = new RecorderApi();

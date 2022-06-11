import { Recorder } from './api';
import { EMBEDED_BUILD } from '../const';
import { Server } from '../server';

const STORAGE_KEY_SERVERS = 'brec.servers';

function generateRandomId() {
  return Math.random().toString(36).substring(2, 8);
}

class RecorderApi extends EventTarget {
  public recorder:Recorder | null = null;
  private _supportLocalStorage: boolean = !!window.localStorage;
  private servers: Server[] = [];

  constructor() {
    super();
    if (EMBEDED_BUILD) {
      this.recorder = new Recorder(new URL('/', window.location.href).toString(), {}, { id: 'local' });
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
    server.extraHeaders.forEach((h) => {
      headers[h.key] = h.value;
    });
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
            if (!Array.isArray(s.extraHeaders)) {
              throw new Error('extraHeaders is not an array');
            }
            s.extraHeaders.forEach((h) => {
              if (typeof h.key !== 'string') {
                throw new Error('extraHeaders.key is not a string');
              }
              if (typeof h.value !== 'string') {
                debugger;
                throw new Error('extraHeaders.value is not a string');
              }
            });
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
    if (!Array.isArray(server.extraHeaders)) {
      throw new Error('extraHeaders is not an array');
    }
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

export const recorderController= new RecorderApi();
console.log(recorderController);

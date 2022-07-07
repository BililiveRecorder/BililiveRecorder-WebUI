import { STORAGE_LATEST_VERSION } from '../const';


interface VersionInfo {
  version: string;
  url: string;
  body: string;
}

interface VersionCache {
  webui: VersionInfo;
  recorder: VersionInfo;
  lastCheck: number;
}

interface GithubRelease {
  tag_name: string;
  published_at: string;
  body: string;
  html_url: string;
}

let cache: VersionCache = {
  webui: {
    version: '0.0.0',
    url: 'https://github.com/BililiveRecorder/BililiveRecorder-WebUI/releases/latest',
    body: '',
  },
  recorder: {
    version: '0.0.0',
    url: 'https://github.com/BililiveRecorder/BililiveRecorder/releases/latest',
    body: '',
  },
  lastCheck: 0,
};

let loadCached = false;
let pending: Promise<VersionCache> | null = null;

export async function getRecorderLatestVersion(ignoreCache: boolean = false): Promise<VersionCache> {
  if (loadCached) {
    if (Date.now() - cache.lastCheck < (ignoreCache ? 60000 : 86400000)) {
      return cache;
    }
  } else {
    try {
      const item: VersionCache = JSON.parse(localStorage.getItem(STORAGE_LATEST_VERSION) || JSON.stringify(cache));
      if (typeof item.webui == 'object' && typeof item.recorder == 'object' && typeof item.lastCheck == 'number') {
        cache = item;
        loadCached = true;
        if (Date.now() - cache.lastCheck < (ignoreCache ? 60000 : 86400000)) {
          return cache;
        }
      } else {
        throw new Error('no valid version info cache');
      }
    } catch (error) {
      console.error(error);
    }
  }

  try {
    if (!pending) {
      pending = (async () => {
        const recorderInfo: GithubRelease = await (await fetch('https://api.github.com/repos/BililiveRecorder/BililiveRecorder/releases/latest')).json();
        const webuiInfo: GithubRelease = await (await fetch('https://api.github.com/repos/BililiveRecorder/BililiveRecorder-WebUI/releases/latest')).json();
        const version = {
          recorder: {
            version: recorderInfo.tag_name,
            url: recorderInfo.html_url,
            body: recorderInfo.body,
          },
          webui: {
            version: webuiInfo.tag_name,
            url: webuiInfo.html_url,
            body: webuiInfo.body,
          },
          lastCheck: Date.now(),
        };
        localStorage.setItem(STORAGE_LATEST_VERSION, JSON.stringify(version));
        cache = version;
        pending = null;
        return version;
      })();
    }
    return await pending;
  } catch (error) {
    return cache;
  }
}

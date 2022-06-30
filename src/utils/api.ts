/* eslint-disable no-unused-vars */

export interface Optional<T = any> {
  hasValue: boolean;
  value?: T | null;
}
export type BooleanOptional = Optional<boolean>;
export type StringOptional = Optional<string>;
export type UInt32Optional = Optional<number>;

export interface CreateRoomDto {
  roomId: number;
  autoRecord: boolean;
}

enum CuttingMode {
  // 禁用
  Disabled = 0,
  // 根据时间切割
  ByTime = 1,
  // 根据文件大小切割
  BySize = 2,
}

enum RecordMode {
  Standard = 0,
  RawData = 1,
}

export type CuttingModeOptional = Optional<CuttingMode>;
export type RecordModeOptional = Optional<RecordMode>;


export interface DefaultConfig {
  recordMode: RecordMode;
  cuttingMode: CuttingMode;
  cuttingNumber: number;
  recordDanmaku: boolean;
  recordDanmakuRaw: boolean;
  recordDanmakuSuperChat: boolean;
  recordDanmakuGift: boolean;
  recordDanmakuGuard: boolean;
  recordingQuality: string;
  fileNameRecordTemplate: string;
  webHookUrls: string;
  webHookUrlsV2: string;
  wpfShowTitleAndArea: boolean;
  cookie: string;
  liveApiHost: string;
  timingCheckInterval: number;
  timingStreamRetry: number;
  timingStreamRetryNoQn: number;
  timingStreamConnect: number;
  timingDanmakuRetry: number;
  timingWatchdogTimeout: number;
  recordDanmakuFlushInterval: number;
  networkTransportUseSystemProxy: boolean;
  networkTransportAllowedAddressFamily: number;
  userScript: string;
}

export interface GlobalConfigDto {
  optionalRecordMode: RecordModeOptional;
  optionalCuttingMode: CuttingModeOptional;
  optionalCuttingNumber: UInt32Optional;
  optionalRecordDanmaku: BooleanOptional;
  optionalRecordDanmakuRaw: BooleanOptional;
  optionalRecordDanmakuSuperChat: BooleanOptional;
  optionalRecordDanmakuGift: BooleanOptional;
  optionalRecordDanmakuGuard: BooleanOptional;
  optionalRecordingQuality: StringOptional;
  optionalFileNameRecordTemplate: StringOptional;
  optionalWebHookUrls: StringOptional;
  optionalWebHookUrlsV2: StringOptional;
  optionalWpfShowTitleAndArea: BooleanOptional;
  optionalCookie: StringOptional;
  optionalLiveApiHost: StringOptional;
  optionalTimingCheckInterval: UInt32Optional;
  optionalTimingStreamRetry: UInt32Optional;
  optionalTimingStreamRetryNoQn: UInt32Optional;
  optionalTimingStreamConnect: UInt32Optional;
  optionalTimingDanmakuRetry: UInt32Optional;
  optionalTimingWatchdogTimeout: UInt32Optional;
  optionalRecordDanmakuFlushInterval: UInt32Optional;
  optionalNetworkTransportUseSystemProxy: BooleanOptional;
  optionalNetworkTransportAllowedAddressFamily: UInt32Optional;
  optionalUserScript: StringOptional;
}

export interface RecorderVersion {
  major: string;
  minor: string;
  patch: string;
  preReleaseTag: string;
  preReleaseTagWithDash: string;
  preReleaseLabel: string;
  preReleaseLabelWithDash: string;
  preReleaseNumber: string;
  weightedPreReleaseNumber: string;
  buildMetaData: string;
  buildMetaDataPadded: string;
  fullBuildMetaData: string;
  majorMinorPatch: string;
  semVer: string;
  legacySemVer: string;
  legacySemVerPadded: string;
  assemblySemVer: string;
  assemblySemFileVer: string;
  fullSemVer: string;
  informationalVersion: string;
  branchName: string;
  escapedBranchName: string;
  sha: string;
  shortSha: string;
  nuGetVersionV2: string;
  nuGetVersion: string;
  nuGetPreReleaseTagV2: string;
  nuGetPreReleaseTag: string;
  versionSourceSha: string;
  commitsSinceVersionSource: string;
  commitsSinceVersionSourcePadded: string;
  uncommittedChanges: string;
  commitDate: string;
}

export interface RestApiError {
  code: RestApiErrorCode;
  message: string;
}

enum RestApiErrorCode {
  // 错误
  Unknown = -1,
  // 房间号不在允许的范围内
  RoomidOutOfRange = -2,
  // 房间已存在
  RoomExist = -3,
  // 房间不存在
  RoomNotFound = -4,
}

export interface RestApiError {
  code: RestApiErrorCode;
  message: string;
}

export interface RoomConfigDto {
  autoRecord: boolean;
  optionalRecordMode: RecordModeOptional;
  optionalCuttingMode: CuttingModeOptional;
  optionalCuttingNumber: UInt32Optional;
  optionalRecordDanmaku: BooleanOptional;
  optionalRecordDanmakuRaw: BooleanOptional;
  optionalRecordDanmakuSuperChat: BooleanOptional;
  optionalRecordDanmakuGift: BooleanOptional;
  optionalRecordDanmakuGuard: BooleanOptional;
  optionalRecordingQuality: StringOptional;
}

export interface RoomDto {
  objectId: string;
  roomId: number;
  autoRecord: boolean;
  shortId: number;
  name: string;
  title: string;
  areaNameParent: string;
  areaNameChild: string;
  recording: boolean;
  streaming: boolean;
  danmakuConnected: boolean;
  autoRecordForThisSession: boolean;
  recordingStats: RoomRecordingStatsDto;
  ioStats: RoomIOStatsDto;
}

export interface FileApiResult {
  exist: boolean;
  path: string;
  files: Array<FileDto|FolderDto>;
}

export interface FileDto {
  isFolder: false;
  name: string;
  lastModified: string;
  size: number;
  url: string;
}

export interface FileLikeDto {
  isFolder: boolean;
  name: string;
  lastModified: string;
}

export interface FileNameTemplateContextDto{
  roomId: number;
  shortId: number;
  name: string;
  title: string;
  areaParent: string;
  areaChild: string;
  qn: number;
  json: string;
}

export interface FolderDto {
  isFolder: true;
  name: string;
  lastModified: string;
}

export interface GenerateFileNameInput {
  template: string;
  context: FileNameTemplateContextDto;
}

export interface RoomIOStatsDto{
  streamHost: string;
  startTime: string;
  endTime: string;
  duration: number; // 当前统计区间的时长，毫秒
  networkBytesDownloaded: number;
  networkMbps: number;
  diskWriteDuration: number; // 统计区间内的磁盘写入耗时，毫秒
  diskBytesWritten: number;
  diskMBps: number;
}

export interface RoomRecordingStatsDto {
  sessionDuration: number;
  totalInputBytes: number;
  totalOutputBytes: number;
  currentFileSize: number; // 当前文件的大小
  sessionMaxTimestamp: number; // 本次直播流收到的最大时间戳（已修复过，相当于总时长，毫秒）
  fileMaxTimestamp: number; // 当前文件的最大时间戳（相当于总时长，毫秒）
  addedDuration: number; // 当前这一个统计区间的直播数据时长，毫秒
  passedTime: number; // 当前这一个统计区间所经过的时间长度，毫秒
  durationRatio: number;
  inputVideoBytes: number;
  inputAudioBytes: number;
  outputVideoFrames: number;
  outputAudioFrames: number;
  outputVideoBytes: number;
  outputAudioBytes: number;
  totalInputVideoBytes: number;
  totalInputAudioBytes: number;
  totalOutputVideoFrames: number;
  totalOutputAudioFrames: number;
  totalOutputVideoBytes: number;
  totalOutputAudioBytes: number;
}

export interface SetGlobalConfig {
  optionalRecordMode?: RecordModeOptional;
  optionalCuttingMode?: CuttingModeOptional;
  optionalCuttingNumber?: UInt32Optional;
  optionalRecordDanmaku?: BooleanOptional;
  optionalRecordDanmakuRaw?: BooleanOptional;
  optionalRecordDanmakuSuperChat?: BooleanOptional;
  optionalRecordDanmakuGift?: BooleanOptional;
  optionalRecordDanmakuGuard?: BooleanOptional;
  optionalRecordingQuality?: StringOptional;
  optionalRecordFilenameFormat?: StringOptional;
  optionalWebHookUrls?: StringOptional;
  optionalWebHookUrlsV2?: StringOptional;
  optionalWpfShowTitleAndArea?: BooleanOptional;
  optionalCookie?: StringOptional;
  optionalLiveApiHost?: StringOptional;
  optionalTimingCheckInterval?: UInt32Optional;
  optionalTimingStreamRetry?: UInt32Optional;
  optionalTimingStreamRetryNoQn?: UInt32Optional;
  optionalTimingStreamConnect?: UInt32Optional;
  optionalTimingDanmakuRetry?: UInt32Optional;
  optionalTimingWatchdogTimeout?: UInt32Optional;
  optionalRecordDanmakuFlushInterval?: UInt32Optional;
}

export interface SetRoomConfig {
  autoRecord?: boolean;
  optionalRecordMode?: RecordModeOptional;
  optionalCuttingMode?: CuttingModeOptional;
  optionalCuttingNumber?: UInt32Optional;
  optionalRecordDanmaku?: BooleanOptional;
  optionalRecordDanmakuRaw?: BooleanOptional;
  optionalRecordDanmakuSuperChat?: BooleanOptional;
  optionalRecordDanmakuGift?: BooleanOptional;
  optionalRecordDanmakuGuard?: BooleanOptional;
  optionalRecordingQuality?: StringOptional;
}
/* eslint-enable no-unused-vars */
export class Recorder {
  public readonly host: string;
  private headers: { [key: string]: string; } | undefined;
  public meta: any;
  constructor(host: string, headers?: { [key: string]: string }, meta?: any) {
    this.host = host;
    this.headers = headers || {};
    this.meta = meta;
  }
  private async request<T>(method: string, path: string, body?: any, rawText:boolean = false): Promise<T> {
    const url = new URL(path, this.host);
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (response.status !== 200) {
      let error;
      try {
        error = await response.json() as RestApiError;
      } finally {
        // do nothing
      }
      throw error ? error : new Error(`${response.status} ${response.statusText}`);
    }
    return rawText ? await response.text() : response.json();
  }


  async getVersion(): Promise<RecorderVersion> {
    return await this.request<RecorderVersion>('GET', 'api/version');
  }

  async getDefaultConfig(): Promise<DefaultConfig> {
    return await this.request<DefaultConfig>('GET', 'api/config/default');
  }

  async getGlobalConfig(): Promise<GlobalConfigDto> {
    return await this.request<GlobalConfigDto>('GET', 'api/config/global');
  }

  async setGlobalConfig(config: SetGlobalConfig): Promise<GlobalConfigDto> {
    return await this.request<GlobalConfigDto>('POST', 'api/config/global', config);
  }

  async getFileList(path: string): Promise<FileApiResult> {
    return await this.request<FileApiResult>('GET', `api/file?${new URLSearchParams({ path }).toString()}`);
  }

  async generateFileName(template:string, context:FileNameTemplateContextDto): Promise<string> {
    return await this.request('POST', 'api/misc/generatefilename', { template, context } as GenerateFileNameInput, true);
  }

  async getRoomList(): Promise<RoomDto[]> {
    return await this.request<RoomDto[]>('GET', 'api/room');
  }

  async addRoom(roomId: number, autoRecord: boolean = true): Promise<RoomDto> {
    return await this.request<RoomDto>('POST', `api/room/`, { roomId, autoRecord });
  }

  async removeRoom(roomId: number): Promise<void> {
    await this.request<void>('DELETE', `api/room/${roomId}`);
  }

  async removeRoomByObjectId(objectId: string): Promise<void> {
    await this.request<void>('DELETE', `api/room/${objectId}`);
  }

  async getRoom(roomId: number): Promise<RoomDto> {
    return await this.request<RoomDto>('GET', `api/room/${roomId}`);
  }

  async getRoomByObjectId(objectId: string): Promise<RoomDto> {
    return await this.request<RoomDto>('GET', `api/room/${objectId}`);
  }

  async getRoomStats(roomId: number): Promise<RoomRecordingStatsDto> {
    return await this.request<RoomRecordingStatsDto>('GET', `api/room/${roomId}/stats`);
  }

  async getRoomConfig(roomId: number): Promise<RoomConfigDto> {
    return await this.request<RoomConfigDto>('GET', `api/room/${roomId}/config`);
  }

  async setRoomConfig(roomId: number, config: SetRoomConfig): Promise<RoomConfigDto> {
    return await this.request<RoomConfigDto>('POST', `api/room/${roomId}/config`, config);
  }

  async getRoomStatsByObjectId(objectId: string): Promise<RoomRecordingStatsDto> {
    return await this.request<RoomRecordingStatsDto>('GET', `api/room/${objectId}/stats`);
  }

  async getRoomConfigByObjectId(objectId: string): Promise<RoomConfigDto> {
    return await this.request<RoomConfigDto>('GET', `api/room/${objectId}/config`);
  }

  async setRoomConfigByObjectId(objectId: string, config: SetRoomConfig): Promise<RoomConfigDto> {
    return await this.request<RoomConfigDto>('POST', `api/room/${objectId}/config`, config);
  }

  async startRecord(roomId: number): Promise<RoomDto> {
    return await this.request<RoomDto>('POST', `api/room/${roomId}/start`, {});
  }

  async startRecordByObjectId(objectId: string): Promise<RoomDto> {
    return await this.request<RoomDto>('POST', `api/room/${objectId}/start`, {});
  }

  async stopRecord(roomId: number): Promise<RoomDto> {
    return await this.request<RoomDto>('POST', `api/room/${roomId}/stop`, {});
  }

  async stopRecordByObjectId(objectId: string): Promise<RoomDto> {
    return await this.request<RoomDto>('POST', `api/room/${objectId}/stop`, {});
  }

  async splitRecord(roomId: number): Promise<RoomDto> {
    return await this.request<RoomDto>('POST', `api/room/${roomId}/split`, {});
  }

  async splitRecordByObjectId(objectId: string): Promise<RoomDto> {
    return await this.request<RoomDto>('POST', `api/room/${objectId}/split`, {});
  }

  async refreshRoomInfo(roomId: number): Promise<RoomDto> {
    return await this.request<RoomDto>('POST', `api/room/${roomId}/refresh`, {});
  }

  async refreshRoomInfoByObjectId(objectId: string): Promise<RoomDto> {
    return await this.request<RoomDto>('POST', `api/room/${objectId}/refresh`, {});
  }

  async graphql<T>(queryName:string, query:string, variables:any|null): Promise<T> {
    const res= await this.request<any>('POST', `graphql`, { queryName, query, variables });
    if (res.error) {
      throw res.error;
    } else {
      return res.data;
    }
  }

  static getMockDefaultConfig(): DefaultConfig {
    return {
      'recordMode': 0,
      'cuttingMode': 0,
      'cuttingNumber': 100,
      'recordDanmaku': false,
      'recordDanmakuRaw': false,
      'recordDanmakuSuperChat': true,
      'recordDanmakuGift': false,
      'recordDanmakuGuard': true,
      'recordingQuality': '10000',
      'fileNameRecordTemplate': '{{ roomId }}-{{ name }}/录制-{{ roomId }}-{{ \"now\" | time_zone: \"Asia/Shanghai\" | format_date: \"yyyyMMdd-HHmmss-fff\" }}-{{ title }}.flv',
      'webHookUrls': '',
      'webHookUrlsV2': '',
      'wpfShowTitleAndArea': true,
      'cookie': '',
      'liveApiHost': 'https://api.live.bilibili.com',
      'timingCheckInterval': 600,
      'timingStreamRetry': 6000,
      'timingStreamRetryNoQn': 90,
      'timingStreamConnect': 5000,
      'timingDanmakuRetry': 9000,
      'timingWatchdogTimeout': 10000,
      'recordDanmakuFlushInterval': 20,
      'networkTransportUseSystemProxy': false,
      'networkTransportAllowedAddressFamily': 0,
      'userScript': '',
    };
  }
  static getMockGlobalConfig(): GlobalConfigDto {
    return {
      'optionalRecordMode': {
        'hasValue': true,
        'value': 0,
      },
      'optionalCuttingMode': {
        'hasValue': true,
        'value': 0,
      },
      'optionalCuttingNumber': {
        'hasValue': false,
        'value': 0,
      },
      'optionalRecordDanmaku': {
        'hasValue': false,
        'value': false,
      },
      'optionalRecordDanmakuRaw': {
        'hasValue': false,
        'value': false,
      },
      'optionalRecordDanmakuSuperChat': {
        'hasValue': false,
        'value': false,
      },
      'optionalRecordDanmakuGift': {
        'hasValue': false,
        'value': false,
      },
      'optionalRecordDanmakuGuard': {
        'hasValue': false,
        'value': false,
      },
      'optionalRecordingQuality': {
        'hasValue': false,
        'value': null,
      },
      'optionalFileNameRecordTemplate': {
        'hasValue': false,
        'value': null,
      },
      'optionalWebHookUrls': {
        'hasValue': false,
        'value': null,
      },
      'optionalWebHookUrlsV2': {
        'hasValue': false,
        'value': null,
      },
      'optionalWpfShowTitleAndArea': {
        'hasValue': false,
        'value': false,
      },
      'optionalCookie': {
        'hasValue': false,
        'value': null,
      },
      'optionalLiveApiHost': {
        'hasValue': false,
        'value': null,
      },
      'optionalTimingCheckInterval': {
        'hasValue': false,
        'value': 0,
      },
      'optionalTimingStreamRetry': {
        'hasValue': false,
        'value': 0,
      },
      'optionalTimingStreamRetryNoQn': {
        'hasValue': false,
        'value': 0,
      },
      'optionalTimingStreamConnect': {
        'hasValue': false,
        'value': 0,
      },
      'optionalTimingDanmakuRetry': {
        'hasValue': false,
        'value': 0,
      },
      'optionalTimingWatchdogTimeout': {
        'hasValue': false,
        'value': 0,
      },
      'optionalRecordDanmakuFlushInterval': {
        'hasValue': false,
        'value': 0,
      },
      'optionalNetworkTransportUseSystemProxy': {
        'hasValue': false,
        'value': false,
      },
      'optionalNetworkTransportAllowedAddressFamily': {
        'hasValue': false,
        'value': 0,
      },
      'optionalUserScript': {
        'hasValue': false,
        'value': '',
      },
    };
  }
}

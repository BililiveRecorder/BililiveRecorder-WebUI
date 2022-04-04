export function createConfig(defaultConfig, config) {
  return new Proxy({}, {
    get: (target, key) => {
      if (key == '__default') return defaultConfig;
      if (key == '__config') return config;
      if (key.startsWith('set')) {
        const keyName = key.slice(3);
        return (value) => {
          config[keyName] = value;
          return value;
        };
      }

      return undefined;
    },
  });
}

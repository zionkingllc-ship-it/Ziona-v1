const noop = (..._args: any[]) => {};

export const logger = {
  log: __DEV__ ? console.log : noop,
  warn: console.warn,
  error: console.error,
  info: __DEV__ ? console.info : noop,
  debug: __DEV__ ? console.debug : noop,
};

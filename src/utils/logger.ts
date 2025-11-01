import log from 'electron-log';

// Configure electron-log
log.transports.file.level = 'debug';
log.transports.console.level = 'debug';

export const logger = {
  info: (message: string, ...args: any[]) => log.info(message, ...args),
  error: (message: string, ...args: any[]) => log.error(message, ...args),
  warn: (message: string, ...args: any[]) => log.warn(message, ...args),
  debug: (message: string, ...args: any[]) => log.debug(message, ...args),
};

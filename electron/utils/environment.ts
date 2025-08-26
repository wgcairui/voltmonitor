export const isDev = (): boolean => {
  return process.env.NODE_ENV === 'development' || !app.isPackaged;
};

export const getAppDataPath = (): string => {
  const { app } = require('electron');
  return app.getPath('userData');
};

export const getResourcesPath = (): string => {
  const { app } = require('electron');
  return app.getAppPath();
};
import { Menu, MenuItem, BrowserWindow, app, shell } from 'electron';

export function createAppMenu(mainWindow: BrowserWindow | null): Menu {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'VoltMonitor',
      submenu: [
        {
          label: 'About VoltMonitor',
          click: () => {
            // TODO: Show about dialog
          },
        },
        {
          label: 'Preferences...',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow?.webContents.send('menu:preferences');
          },
        },
        { type: 'separator' },
        {
          label: 'Services',
          role: 'services',
        },
        { type: 'separator' },
        {
          label: 'Hide VoltMonitor',
          accelerator: 'Command+H',
          role: 'hide',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideOthers',
        },
        {
          label: 'Show All',
          role: 'unhide',
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Session',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow?.webContents.send('menu:new-session');
          },
        },
        {
          label: 'Open Data File...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow?.webContents.send('menu:open-file');
          },
        },
        { type: 'separator' },
        {
          label: 'Export Data...',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow?.webContents.send('menu:export-data');
          },
        },
        {
          label: 'Export Report...',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => {
            mainWindow?.webContents.send('menu:export-report');
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo',
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo',
        },
        { type: 'separator' },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut',
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy',
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste',
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll',
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow?.webContents.send('menu:navigate', 'dashboard');
          },
        },
        {
          label: 'Volt Monitor',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            mainWindow?.webContents.send('menu:navigate', 'volt');
          },
        },
        {
          label: 'Standard OBD',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            mainWindow?.webContents.send('menu:navigate', 'standard');
          },
        },
        {
          label: 'PID Browser',
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            mainWindow?.webContents.send('menu:navigate', 'browser');
          },
        },
        { type: 'separator' },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow?.webContents.reload();
          },
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow?.webContents.reloadIgnoringCache();
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            mainWindow?.webContents.toggleDevTools();
          },
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          role: 'resetZoom',
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          role: 'zoomIn',
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          role: 'zoomOut',
        },
        { type: 'separator' },
        {
          label: 'Toggle Fullscreen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            const focused = BrowserWindow.getFocusedWindow();
            if (focused) {
              focused.setFullScreen(!focused.isFullScreen());
            }
          },
        },
      ],
    },
    {
      label: 'Connection',
      submenu: [
        {
          label: 'Scan Devices',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow?.webContents.send('menu:scan-devices');
          },
        },
        {
          label: 'Connect',
          accelerator: 'CmdOrCtrl+Shift+C',
          click: () => {
            mainWindow?.webContents.send('menu:connect');
          },
        },
        {
          label: 'Disconnect',
          accelerator: 'CmdOrCtrl+Shift+D',
          click: () => {
            mainWindow?.webContents.send('menu:disconnect');
          },
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize',
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close',
        },
        { type: 'separator' },
        {
          label: 'Bring All to Front',
          role: 'front',
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'User Guide',
          click: () => {
            shell.openExternal('https://github.com/voltmonitor/docs');
          },
        },
        {
          label: 'Keyboard Shortcuts',
          click: () => {
            mainWindow?.webContents.send('menu:show-shortcuts');
          },
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/voltmonitor/issues');
          },
        },
        {
          label: 'Check for Updates...',
          click: () => {
            mainWindow?.webContents.send('menu:check-updates');
          },
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
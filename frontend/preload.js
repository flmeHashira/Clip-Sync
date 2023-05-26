const { contextBridge, ipcRenderer} = require('electron');
console.log('From preload!');

contextBridge.exposeInMainWorld('electron', {
    ipc :   {
        on: (event, ...args) => {
            ipcRenderer.on(event, ...args)
        },
        send: (event, ...args) => {
            ipcRenderer.send(event, ...args)
          },
        
    },
});

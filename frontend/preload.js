const { contextBridge, ipcRenderer, clipboard } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipc :   {
        on: (event, ...args) => {
            ipcRenderer.on(event, ...args)
        },
        send: (event, ...args) => {
            ipcRenderer.send(event, ...args)
          },
        
    },
    clipboard: {
        readText: () => clipboard.readText(),
        readImage: () => clipboard.readImage()
    }
});
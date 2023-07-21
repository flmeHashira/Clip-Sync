const menu = [
    [
        {
            label: 'log In',
            click: () => loginWindowCreate()
        },
        {
            label: 'Exit application',
            click: () => callclose()
        }
    ],
    [
        {
            label: 'Open Cliboard',
            click: () => clip()

        },
        {
            label: 'Clear History',
            click: () => {
                workerWindow.webContents.send('clear-history')
            }

        },
        {
            label: 'Pause',
            click: () => {
                workerWindow.webContents.send('pause-history')
            }

        },
        {
            label: 'Resume Sync',
            click: () => {
                workerWindow.webContents.send('resume-history')
            }

        },
        {
            label: 'Log out',
            click: () => callclose()
        },
        {
            label: 'Exit application',
            click: () => callclose()
        }
    ]
]

module.exports = menu
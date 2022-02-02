const { app, BrowserWindow, ipcMain } = require("electron");
const { getServers, putServer, removeServer, changeServer } = require("./db/index.js");
const { connect, disconnect, list, pwd, cd, cdup } = require("./ftp.js");

const path = require("path");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("dist/index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});


// Database events
ipcMain.on("put-server", (event, args) => {
	putServer(args);
});

ipcMain.on("remove-server", (event, args) => {
	removeServer(args);
});

ipcMain.on("change-server", (event, args) => {
	changeServer(args);
});

ipcMain.on("get-servers", (event, args) => {
	const servers = getServers();
	win.webContents.send("give-servers", servers);
});


// FTP events
ipcMain.on("connect", async (event, args) => {
	const err = await connect(args);
	if (!err) {
		const path = await pwd();
		const files = await list();
		win.webContents.send("connected", { pwd: path, list: files });
	} else {
		const message = err.message.replace(err.name, '');
		console.log(err.name);
		win.webContents.send("server-error", message);
	}
	
});

ipcMain.on("disconnect", async (event, args) => {
	disconnect();
	win.webContents.send("disconnected");
});

ipcMain.on("get-list", async (event, args) => {
	const files = await list();
	win.webContents.send("give-list", files);
});

ipcMain.on("cd", async (event, args) => {
	await cd(args);
	event.reply('dir-changed');
});



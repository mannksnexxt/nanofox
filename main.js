const { app, BrowserWindow, ipcMain } = require("electron");
const { getServers, putServer, removeServer, changeServer } = require("./db/index.js");

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
	win.webContents.send("give_servers", servers);
});



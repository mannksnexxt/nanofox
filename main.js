const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { getServers, putServer, removeServer, changeServer } = require("./db/index.js");
const {
	client,
	connect,
	disconnect,
	list,
	pwd,
	cd,
	cdup,
	uploadFrom,
	uploadFromDir,
	removeFile,
	removeDir,
} = require("./ftp.js");

const path = require("path");
const fs = require("fs").promises;
const fssync = require("fs");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
		titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
			enableRemoteModule: true
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

ipcMain.on("call-dialog", async (event, args) => {
	const ftp_path = args;
	let paths = await dialog.showOpenDialog(win, {
		properties: ['openDirectory', 'openFile', 'multiSelections']
	});

	if (paths.filePaths && paths.filePaths.length) {
		client.trackProgress(info => {
			win.webContents.send("uploading-progress", info);
		})

		let total_bytes = 0;
		const converted_paths = await Promise.all(paths.filePaths.map(async path => {
			const stat = await fs.lstat(path);
			const is_file = stat.isFile();
			if (!is_file && !stat.isSymbolicLink()) {
				total_bytes += getTotalSize(path);
			} else {
				total_bytes += stat.size;
			}
			return { path, type: is_file ? 'file' : 'dir' };
		}));

		win.webContents.send("uploading", total_bytes);

		const uploaded_files = [];

		for (let file of converted_paths) {
			const split_path = file.path.split('/').filter(Boolean);
			const filename = split_path[split_path.length - 1];
			const resolved_path = path.resolve(ftp_path, filename);
			if (file.type === 'file') {
				await uploadFrom(file.path, resolved_path);
			} else if (file.type === 'dir') {
				await uploadFromDir(file.path, resolved_path);
			}
			uploaded_files.push({
				name: filename,
				type: file.type === 'file' ? 1 : 'dir' ? 2 : 0
			});
		}
		
		win.webContents.send("uploaded", uploaded_files);
		client.trackProgress();
	}
});

ipcMain.on("remove-files", async (event, args) => {
	const removed_files = [];
	for (let file of args) {
		if (file.type === 'dir') {
			await removeDir(file.name);
		} else if (file.type === 'file') {
			await removeFile(file.name);
		}
		const splited_name = file.name.split('/');
		const name = splited_name[splited_name.length - 1];
		removed_files.push(name);
	}
	event.reply('removed', removed_files);
});




const getAllFiles = function(dirPath, arrayFiles) {
	let files = fssync.readdirSync(dirPath);

	let arrayOfFiles = arrayFiles || [];

	files.forEach(function(file) {
		if (fssync.statSync(dirPath + "/" + file).isDirectory()) {
			arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
		} else {
			arrayOfFiles.push(path.resolve(__dirname, dirPath, file));
		}
	})

	return arrayOfFiles;
}


const getTotalSize = function(directoryPath) {
  const arrayOfFiles = getAllFiles(directoryPath);

  let totalSize = 0;

  arrayOfFiles.forEach(function(filePath) {
		totalSize += fssync.statSync(filePath).size;
  })

  return totalSize;
}
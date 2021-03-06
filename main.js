const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const {
	getServers,
	getTheme,
	setTheme,
	putServer,
	removeServer,
	changeServer } = require("./db/index.js");
const {
	client,
	connect,
	disconnect,
	list,
	pwd,
	cd,
	uploadFrom,
	uploadFromDir,
	downloadTo,
	downloadToDir,
	rename,
	removeFile,
	removeDir,
} = require("./ftp.js");

const path = require("path");
const fs = require("fs").promises;
const fssync = require("fs");

let CONFIRMS = new Map();

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
		title: 'Nanofox',
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

ipcMain.on("get-theme", (event, args) => {
	const theme = getTheme();
	win.webContents.send("give-theme", theme);
});

ipcMain.on("change-theme", (event, args) => {
	setTheme(args);
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
	const ftp_path = args.path;
	const files = args.files;

	let paths = await dialog.showOpenDialog(win, {
		properties: ['openDirectory', 'openFile', 'multiSelections']
	});

	if (paths.filePaths && paths.filePaths.length) {
		const filenames = paths.filePaths.map(file => {
			const splited_filename = file.split('/');
			return splited_filename[splited_filename.length - 1];
		})

		if (filenames.some(file => files.includes(file.trim()) )) {
			CONFIRMS.set('rewrite', {
				async resolve(val) {
					if (val === true) {
						await uploadFiles(paths.filePaths, ftp_path);
					} else {
						return;
					}
				}
			});

			event.reply('confirm-rewrite');
		} else {
			await uploadFiles(paths.filePaths, ftp_path);
		}
	}
});


ipcMain.on("call-download-dialog", async (event, args) => {
	const files = args;
	const filenames = files.map(file => {
		const splited_filename = file.path.split('/');
		return splited_filename[splited_filename.length - 1];
	})

	let path_to_download = await dialog.showOpenDialog(win, {
		properties: ['openDirectory']
	});

	if (path_to_download.filePaths && path_to_download.filePaths.length) {
		const local_list = fssync.readdirSync(path_to_download.filePaths[0]);

		if (local_list.some(file => filenames.includes(file))) {
			CONFIRMS.set('rewrite', {
				async resolve(val) {
					if (val === true) {
						await downloadFiles(files, path_to_download.filePaths[0]);
					} else {
						return;
					}
				}
			});

			event.reply('confirm-rewrite');
		} else {
			await downloadFiles(files, path_to_download.filePaths[0]);
		}
	}
});

ipcMain.on("rename-file", async (event, args) => {
	const name = args.name;
	const new_name = args.new_name;

	await rename(name, new_name);
});

ipcMain.on("resolve-rewrite", async (event, args) => {
	await CONFIRMS.get('rewrite').resolve(args);
	CONFIRMS.delete('rewrite');
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



async function uploadFiles(paths, ftp_path) {
	client.trackProgress(info => {
		win.webContents.send("uploading-progress", info);
	})

	let total_bytes = 0;
	const converted_paths = await Promise.all(paths.map(async path => {
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

async function downloadFiles(remote_paths, local_path) {
	let downloaded_files = 0;
	win.webContents.send("downloading", remote_paths.length);

	for (let file of remote_paths) {
		const split_path = file.path.split('/').filter(Boolean);
		const filename = split_path[split_path.length - 1];
		const resolved_path = path.resolve(local_path, filename);
		if (file.type === 'file') {
			await downloadTo(resolved_path, file.path);
		} else if (file.type === 'dir') {
			await downloadToDir(resolved_path, file.path);
		}

		downloaded_files += 1;
		win.webContents.send("downloading-progress", downloaded_files);
	}

	win.webContents.send("downloaded");
}


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
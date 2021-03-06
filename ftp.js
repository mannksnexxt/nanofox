const FTP = require('basic-ftp');

let CLIENT = new FTP.Client();

exports.client = CLIENT;

exports.connect = async (options) => {
	try {
		if (!CLIENT.closed) CLIENT.close();

		await CLIENT.access({
			host: options.host,
			user: options.user,
			password: options.password,
			secure: options.secure
		})
		
		console.log('Success connection');
	} catch(e) {
		console.error(e, 'Connection error');
		return e;
	}
}
exports.disconnect = () => CLIENT.close();

exports.pwd = async () => await CLIENT.pwd();
exports.list = async () => await CLIENT.list();
exports.cd = async (path) => await CLIENT.cd(path);
exports.cdup = async () => await CLIENT.cdup();

exports.uploadFrom = async (local_path, remote_path) => {
	try {
		await CLIENT.uploadFrom(local_path, remote_path);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
};

exports.downloadTo = async (local_path, remote_path) => {
	try {
		await CLIENT.downloadTo(local_path, remote_path);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
};

exports.downloadToDir = async (local_path, remote_path) => {
	try {
		await CLIENT.downloadToDir(local_path, remote_path);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
};

exports.rename = async (path, new_path) => {
	try {
		await CLIENT.rename(path, new_path);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
};

exports.uploadFromDir = async (local_path, remote_path) => {
	try {
		await CLIENT.uploadFromDir(local_path, remote_path);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
};

exports.removeFile = async (remote_path) => {
	try {
		await CLIENT.remove(remote_path);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
};

exports.removeDir = async (remote_path) => {
	try {
		await CLIENT.removeDir(remote_path);
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
};
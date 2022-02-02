const FTP = require('basic-ftp');

let CLIENT = new FTP.Client();
CLIENT.ftp.verbose;

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
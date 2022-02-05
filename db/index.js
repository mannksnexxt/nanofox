const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig.js');

const DB_PATH = "./db/database.json";

const DB = new JsonDB(new Config(DB_PATH, true, true, '/'));

exports.getServers = () => {
	return DB.getData(`/servers`);
};

exports.getTheme = () => {
	let night = DB.getData(`/night`);
	return night;
};

exports.setTheme = (night) => {
	DB.push(`/night`, night);
};

exports.putServer = (server) => {
	try {
		DB.push(`/servers[]`, server);
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
};

exports.removeServer = (id) => {
	const idx = DB.getIndex('/servers', id);
	return DB.delete(`/servers[${idx}]`);
};

exports.changeServer = (server) => {
	const idx = DB.getIndex('/servers', server.id);
	try {
		Object.entries(server).forEach(([key, value]) => {
			DB.push(`/servers[${idx}]/${key}`, value);
		})
		return true;
	} catch (e) {
		console.error(e);
		return false;
	}
};
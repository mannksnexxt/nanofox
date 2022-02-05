<template>
	<div class="main" :class="{'night-theme': night_theme}">
		<WindowHeader 
			:tabs="computed_tabs"
			:current_tab="current_tab"
			:path="ftp.path"
			:selected="ftp.selected_files.length"
			:night_theme="night_theme"
			@change-theme="setTheme"
			@change-tab="changeTab($event)"
			@add-server="popup.show = true"
			@search="header_search = $event"
			@call-dialog="callDialog"
			@remove-files="removeFiles"
		/>

		<div class="main__body">
			<WindowServers
				v-if="current_tab === 'servers'"
				:servers="servers"
				:current_server="connected_server"
				:search="header_search"
				@connect="connectTo($event)"
				@disconnect="disconnect"
				@remove-server="removeServer($event)"
				@edit-server="startEditingServer($event)"
			/>

			<WindowFiles
				v-else-if="current_tab === 'files' && this.connected_server"
				ref="files"
				:path="ftp.path"
				:files="files_source"
				:night_theme="night_theme"
				@cd="cd($event)"
				@cdup="cdup"
				@deeper="goDeeper($event)"
				@call-dialog="callDialog"
				@select="ftp.selected_files = $event"
				@remove-files="removeFiles"
			/>
		</div>

		<transition name="fade">
			<WindowPopup
				v-if="popup.show"
				:edit="popup.edit"
				:editing_server="popup.editing_server"
				:night_theme="night_theme"
				@connect="newConnection($event)"
				@edit-server="editServer($event)"
				@close="closePopup"
			/>
		</transition>

		<transition name="fade">
			<WindowProgress
				v-if="current_transfering"
				:transfer_data="current_transfering"
			/>
		</transition>

		<WindowNote ref="note" />
		<WindowLoading v-if="loading" />

	</div>
</template>

<script>
import WindowHeader from './components/WindowHeader.vue';
import WindowServers from './components/WindowServers.vue';
import WindowFiles from './components/WindowFiles.vue';

import WindowPopup from './components/WindowPopup.vue';
import WindowNote from './components/WindowNote.vue';
import WindowLoading from './components/WindowLoading.vue';
import WindowProgress from './components/WindowProgress.vue';

import { deepSearch } from './constants.js';

export default {
	name: 'app',
	components: {
		WindowHeader,
		WindowServers,
		WindowPopup,
		WindowFiles,
		WindowNote,
		WindowLoading,
		WindowProgress
	},
	data() {
		return {
			night_theme: false,
			header_search: '',
			current_tab: 'servers',
			tabs: ['servers', 'files'],
			loading: false,
			servers: [
				{
					id: 'kjfkljglkjl',
					name: 'www.myserver.com',
					host: '123.232.23.223',
					user: 'www.myserver.com',
					password: '1214212',
					secure: false
				}
			],
			connected_server: undefined,
			popup: {
				show: false,
				edit: false,
				editing_server: undefined
			},
			ftp: {
				connecting_to: undefined,
				resolve_promise: undefined,
				selected_files: [],
				upload: {
					in_process: false,
					total: 0,
					transfered: 0
				},
				list: [
					{name: 'temp', type: 2},
					{name: 'www', type: 2},
					{name: 'serv', type: 2},
					{name: 'home', type: 2},
					{name: 'admin', type: 2},
					{name: 'index.html', type: 1},
					{name: 'style.css', type: 1},
					{name: 'temp.txt', type: 1},
					{name: 'script.js', type: 1},
					{name: 'uncnown.un', type: 1},
					{name: 'image.png', type: 1},
				],
				path: ''
			}
		}
	},
	created() {
		window.api?.send('get-servers');
		window.api?.send('get-theme');
		window.api?.receive('give-servers', this.setServers);
		window.api?.receive('give-theme', this.setTheme);
		window.api?.receive('connected', this.onConnected);
		window.api?.receive('give-list', this.setList);
		window.api?.receive('server-error', this.errorNote);
		window.api?.receive('dir-changed', this.resolvePromise);
		window.api?.receive('uploading', this.upload);
		window.api?.receive('confirm-rewrite', this.confirmRewrite);
		window.api?.receive('uploading-progress', this.uploadingProgress);
		window.api?.receive('uploaded', this.uploaded);
		window.api?.receive('removed', this.filesRemoved);
	},
	methods: {
		setTheme(is_night) {
			if (is_night !== undefined) {
				this.night_theme = is_night;
			} else {
				this.night_theme = !this.night_theme;
				window.api?.send('change-theme', this.night_theme);
			}
		},
		setServers(servers) {
			this.servers = servers;
		},
		connectTo(server) {
			if (this.connected_server) this.disconnect();
			
			window.api?.send('connect', {
				host: server.host,
				user: server.user,
				password: server.password,
				secure: server.secure
			});
			this.loading = true;
			this.ftp.connecting_to = {...server};
			
			this.connected_server = {...server}; ///////
			this.ftp.path = '/'; ///////
			this.loading = false; ///////
		},
		onConnected(data) {
			this.ftp.path = data.pwd;
			this.ftp.list = data.list;
			this.connected_server = {...this.ftp.connecting_to};
			this.ftp.connecting_to = undefined;
			this.loading = false;
			this.changeTab('files');
		},
		changeTab(alias) {
			this.header_search = '';
			this.current_tab = alias;
		},
		disconnect() {
			window.api?.send('disconnect');
			this.connected_server = undefined;
			this.ftp.path = '';
			this.ftp.list = [];
		},
		setList(files) {
			let temp_source = [...this.ftp.list];
			this.splited_path.forEach((dir) => {
				const temp_item = temp_source.find(f => f.name === dir);
				if (temp_item) {
					if (typeof (temp_item.nested_files) !== 'object') {
						temp_item.nested_files = files;
					} else {
						temp_source = temp_item.nested_files;
					}
				}
			})
			this.loading = false;
		},
		appendToList(files) {
			let temp_source = [...this.ftp.list];
			this.splited_path.forEach((dir, index, arr) => {
				if (index === arr.length - 1 && dir === '/') {
					this.ftp.list = [...this.ftp.list, ...files];
				} else {
					const temp_item = temp_source.find(f => f.name === dir);
					if (temp_item) {
						if (index === arr.length - 1 && temp_item.nested_files) {
							temp_item.nested_files = [...temp_item.nested_files, ...files];
						} else {
							temp_source = temp_item.nested_files;
						}
					}
				}
			})
			this.loading = false;
		},
		cd(path) {
			window.api?.send('cd', path);
			this.ftp.path = path;
		},
		cdup() {
			let splited_path = [...this.splited_path];
			if (splited_path.length === 1) {
				window.api?.send('cd', '/');
				this.ftp.path = '/';
			} else {
				splited_path.pop();
				const path = '/' + splited_path.join('/');
				window.api?.send('cd', path);
				this.ftp.path = path;
			}		
		},
		resolvePromise() {
			if (this.ftp.resolve_promise) this.ftp.resolve_promise();
		},
		goDeeper(path) {
			new Promise((resolve, reject) => {
				window.api?.send('cd', path);
				this.ftp.resolve_promise = resolve;
			}).then(() => {
				this.ftp.path = path;
				this.loading = true;
				if (this.current_path_list === 'unseen') {
					window.api?.send('get-list');

					// this.setList([{type: 2, name: 'nested'}, {type: 1, name: 'index.html'}]); //////
				} else {
					this.loading = false;
				}
			})
		},
		newConnection(payload) {
			if (payload.save) {
				window.api?.send('put-server', payload.server);
				this.servers.push(payload.server);
			}
			this.connectTo(payload.server);
		},
		errorNote(message) {
			this.loading = false;
			this.$refs.note.call({ title: message, error: true });
		},
		closePopup() {
			this.popup.show = false;
			this.popup.edit = false;
			this.popup.editing_server = undefined;
		},
		startEditingServer(server) {
			this.popup.editing_server = server;
			this.popup.edit = true;
			this.popup.show = true;
		},
		editServer(payload) {
			const server = this.servers.find(srv => srv.id == payload.server_id);

			Object.entries(payload.data).forEach(([key, value]) => server[key] = value)
			
			window.api?.send('change-server', {
				id: payload.server_id,
				...payload.data
			});
		},
		callDialog() {
			const current_files = this.current_path_list.map(f => f.name);
			window.api?.send('call-dialog', {
				files: current_files,
				path: this.ftp.path
			});
		},
		async confirmRewrite() {
			const confirm = await this.$modal({
				title: 'Перезапиать имеющиеся файлы?',
				confirm_text: 'ПЕРЕЗАПИСАТЬ'
			});

			if (confirm) {
				window.api?.send('resolve-rewrite', true);
			} else {
				window.api?.send('resolve-rewrite', false);
			}
		},
		upload(total) {
			this.ftp.upload.in_process = true;
			this.ftp.upload.total = total;
		},
		uploadingProgress(info) {
			this.ftp.upload.transfered += info.bytes;
		},
		uploaded(files) {
			const filtered_files = files.filter(f => {
				const current_files = this.current_path_list.map(f => f.name);
				return !current_files.includes(f.name);
			})

			this.appendToList(filtered_files);
			this.ftp.upload.in_process = false;
			this.ftp.upload.total = 0;
			this.ftp.upload.transfered = 0;
		},
		async removeFiles() {
			const confirm = await this.$modal({
				title: 'Удалить выбранные файлы?',
				confirm_text: 'УДАЛИТЬ'
			});

			if (confirm) {
				const files = this.ftp.selected_files.map(f => ({name: f.name, type: f.type}));
				window.api?.send('remove-files', files);
				this.loading = true;
			}
		},
		filesRemoved(files) {
			this.$refs.files?.unselect();
			let temp_source = [...this.ftp.list];
			this.splited_path.forEach((dir, index, arr) => {
				if (index === arr.length - 1 && dir === '/') {
					this.ftp.list = this.ftp.list.filter(f => !files.includes(f.name));
				} else {
					const temp_item = temp_source.find(f => f.name === dir);
					if (temp_item) {
						if (index === arr.length - 1 && temp_item.nested_files) {
							temp_item.nested_files = temp_item.nested_files.filter(f => !files.includes(f.name));;
						} else {
							temp_source = temp_item.nested_files;
						}
					}
				}
			})
			this.loading = false;
		},
		async removeServer(server) {
			const confirm = await this.$modal({
				title: 'Удалить данные по этому серверу?',
				confirm_text: 'УДАЛИТЬ'
			});

			if (confirm) {
				window.api?.send('remove-server', server.id);
				this.servers = this.servers.filter(serv => serv.id !== server.id);
			}
		}
	},
	computed: {
		current_transfering() {
			if (this.ftp.upload.in_process) {
				return {
					type: 'upload',
					transfered: this.ftp.upload.transfered,
					total: this.ftp.upload.total
				};
			}
		},
		computed_tabs() {
			let tabs = ['servers'];
			if (this.connected_server) {
				tabs.push('files');
			}
			return tabs;
		},
		files_source() {
			if (typeof (this.current_path_list) == 'object') {
				return this.current_path_list;
			} else {
				return [];
			}
		},
		splited_path() {
			if (this.ftp.path) {
				if (this.ftp.path === '/') return ['/'];
				const splited_path = this.ftp.path.slice(1).split('/');
				return splited_path.filter(Boolean);
			}
		},
		current_path_list() {
			if (this.splited_path) {
				let source = [...this.ftp.list];
				this.splited_path.forEach(dir => {
					if (source == 'unseen') {
						return 'unseen';
					} else if (source) {
						if (dir !== '/') {
							source = deepSearch(source, dir);
						}
					}
				})
				return source;
			}
		}
	}
}

</script>



<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #3b3b3b;
	height: 100%;
}
.main {
	height: 100%;
	display: grid;
  grid-template: auto 1fr/1fr;
	transition: .2s ease-out;
	&__body {
		background: #fdfdfd;
		overflow: hidden;
	}
}
</style>

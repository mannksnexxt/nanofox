<template>
	<div class="main">
		<WindowHeader 
			:tabs="tabs"
			:current_tab="current_tab"
			@change-tab="current_tab = $event"
			@add-server="popup.show = true"
			@search="header_search = $event"
		/>

		<div class="main__body">
			<WindowServers
				:servers="servers"
				:current_server="connected_server"
				:search="header_search"
				@connect="connectTo($event)"
				@disconnect="disconnect"
				@remove-server="removeServer($event)"
				@edit-server="startEditingServer($event)"
			/>
		</div>
		
		<transition name="fade">
			<WindowPopup
				v-if="popup.show"
				:edit="popup.edit"
				:editing_server="popup.editing_server"
				@connect="newConnection($event)"
				@edit-server="editServer($event)"
				@close="closePopup"
			/>
		</transition>

	</div>
</template>

<script>
import WindowHeader from './components/WindowHeader.vue';
import WindowServers from './components/WindowServers.vue';

import WindowPopup from './components/WindowPopup.vue';

export default {
	name: 'app',
	components: { WindowHeader, WindowServers, WindowPopup },
	data() {
		return {
			header_search: '',
			current_tab: 'servers',
			tabs: ['servers', 'files'],
			servers: [
				{
					id: 'kjfkljglkjl',
					name: 'www.myserver.com',
					ip: '123.232.23.223',
					login: 'www.myserver.com',
					password: '1214212',
					secure: false
				},
				{
					id: 'kjfsdddssdd',
					name: 'www.myserver1.com',
					ip: '200.132.23.223',
					login: 'www.myserver1.com',
					password: '321021',
					secure: false
				},
				{
					id: 'wklkwewkwel',
					name: 'www.myserver2.com',
					ip: '101.132.223.223',
					login: 'www.myserver2.com',
					password: '4212222',
					secure: true
				},
			],
			connected_server: undefined,
			popup: {
				show: false,
				edit: false,
				editing_server: undefined
			}
		}
	},
	created() {
		window.api?.send('get-servers');
		window.api?.receive('give_servers', this.setServers);
	},
	methods: {
		setServers(servers) {
			this.servers = servers;
		},
		connectTo(server) {
			this.connected_server = {...server};
		},
		disconnect() {
			this.connected_server = undefined;
		},
		newConnection(payload) {
			if (payload.save) {
				window.api?.send('put-server', payload.server);
				this.servers.push(payload.server);
			}
			this.connectTo(payload.server);
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
	&__body {
		background: #fdfdfd;
	}
}
</style>

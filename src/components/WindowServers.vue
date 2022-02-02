<template>
	<section class="servers">
		<div class="servers__list">
			<div class="servers__server server"
				v-for="server in searched_servers"
				:key="server.id"
				:class="{'server--active': current_server.id === server.id}"
				@dblclick="$emit('connect', server)">
				<i class="icon server__icon icon-server"></i>
				<div class="server__info">
					<div class="server__info-names">
						<h3 class="server__info-name">{{ server.name }}</h3>
						<p class="server__info-ip">{{ server.host }}</p>
					</div>
					
					<div class="server__info-controls" v-if="current_server.id !== server.id">
						<button
							class="button server__info-button button--icon"
							@click="$emit('edit-server', server)">
							<i class="icon icon-edit"></i>
						</button>
						<button
							class="button server__info-button button--icon"
							@click="$emit('remove-server', server)"
							@keyup.enter.stop>
							<i class="icon icon-remove"></i>
						</button>
					</div>

					<div class="server__info-status">
						<button
							class="button server__info-button server__info-button--link button--icon"
							
							@click="$emit('disconnect', server)"
							v-if="current_server.id === server.id">
							<i class="icon icon-link"></i>
						</button>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>

export default {
	name: 'window-servers',
	props: {
		search: String,
		servers: Array,
		current_server: {
			type: Object,
			default: {}
		},
		selected_server: Object
	},
	data() {
		return {
			
		}
	},
	computed: {
		searched_servers() {
			return this.servers.filter(server => {
				return server.name.includes(this.search) || server.host.includes(this.search);
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.servers {
	padding: 15px 25px;
	&__list {
		display: grid;
		grid-auto-flow: row;
		row-gap: 5px;
	}
}
.server {
	display: grid;
	grid-template-columns: auto 1fr;
	align-items: center;
  column-gap: 14px;
	padding: 6px;
	border-radius: 4px;
	cursor: pointer;
	&__icon {
		width: 30px;
		height: 30px;
		text-align: center;
		&:before {
			color: #a5b9d8;
			font-size: 25px;
		}
	}
	&__info {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		&-names {
			display: grid;
			grid-auto-flow: row;
			row-gap: 2px;
		}
		&-name {
			font-size: 16px;
			user-select: none;
		}
		&-ip {
			font-size: 12px;
			user-select: none;
		}
		&-controls {
			display: grid;
			grid-auto-flow: column;
			column-gap: 5px;
			opacity: 0;
		}
		&-button {
			background: transparent;
			&--link {
				color: #4b93ff;
				&:hover {
					.icon:before {
							content: "\e90c";
							color: #e74c3c;
					}
				}
			}
		}
	}

	&--active {
		background: #f7f7f7;
	}
	&:hover:not(&--active) {
		background: #fafafa;
		.server__info-controls {
			opacity: 1;
		}
	}
}

</style>
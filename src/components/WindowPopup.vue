<template>
	<div class="popup__wrapper" @click.stop="close">
		<div class="popup" @click.stop>
			<div class="popup__tumbler tumbler">
				<button
					class="tumbler__button"
					:class="{'tumbler__button--active': !server_data.secure}"
					@click="server_data.secure = false">
					FTP
				</button>
				<button class="tumbler__button"
					:class="{'tumbler__button--active': server_data.secure}"
					@click="server_data.secure = true">
					SFTP
				</button>
			</div>

			<div class="popup__fields">
				<div class="input__field">
					<i class="icon icon-label"></i>
					<input type="text" placeholder="Псевдоним" v-model="server_data.name">
				</div>
				<div class="input__field">
					<i class="icon icon-web"></i>
					<input type="text" placeholder="IP" v-model="server_data.host">
				</div>
				<div class="input__field">
					<i class="icon icon-user"></i>
					<input type="text" placeholder="Логин" v-model="server_data.user">
				</div>
				<div class="input__field input__field--with-button">
					<i class="icon icon-key"></i>
					<input
						:type="password_visible ? 'text' : 'password'"
						placeholder="Пароль"
						v-model="server_data.password">
					<button
						class="button button--icon popup__button"
						:class="{'button--active': password_visible}"
						title="Показать пароль"
						@click="password_visible = !password_visible">
						<i :class="`icon icon-${password_visible ? 'hide' : 'show'}`"></i>
					</button>
				</div>
			</div>

			<div class="popup__additional" v-if="!edit">
				<button
					class="button button--icon popup__button"
					:class="{'button--active': save_server}"
					title="Сохранить после подключения"
					@click="save_server = !save_server">
					<i class="icon icon-disk"></i>
				</button>

				<ShortInput
					v-model="fast_input"
					:icon="'magic'"
					:placeholder="'Быстрый ввод'"
				/>
			</div>

			<div class="popup__buttons">
				<button class="button button--common" @click="close">
					ОТМЕНА
				</button>
				<button
					class="button button--common button--accent"
					@click="apply"
					:disabled="!can_apply">
					OK
				</button>
			</div>
		</div>
	</div>
	
</template>

<script>
import ShortInput from "./controls/ShortInput.vue";

export default {
	name: 'window-popup',
	props: {
		edit: Boolean,
		editing_server: Object
	},
	components: { ShortInput },
	data() {
		return {
			server_data: {
				secure: false,
				name: '',
				host: '',
				user: '',
				password: ''
			},
			password_visible: false,
			fast_input: '',
			save_server: true
		}
	},
	created() {
		if (this.edit) {
			this.server_data.secure = this.editing_server.secure;
			this.server_data.name = this.editing_server.name;
			this.server_data.host = this.editing_server.host;
			this.server_data.user = this.editing_server.user;
			this.server_data.password = this.editing_server.password;
		}
	},
	methods: {
		close() {
			this.$emit('close')
		},
		apply() {
			if (this.can_apply) {
				if (!this.edit) {
					const id = (Math.random() + 1).toString(36).substring(2);

					this.$emit('connect', {
						save: this.save_server,
						server: {
							id,
							...this.server_data
						} 
					})
					this.$emit('close');
				} else {
					this.$emit('edit-server', {
						server_id: this.editing_server.id,
						data: { ...this.server_data }
					})
					this.$emit('close');
				}
			}
		}
	},
	computed: {
		can_apply() {
			if (
				this.server_data.name.trim() &&
				this.server_data.host.trim() &&
				this.server_data.user.trim() &&
				this.server_data.password.trim()
			) return true;
			return false;
		}
	},
	watch: {
		fast_input(val) {
			// ftp://cm07522_avremos:YS3hNsX8@188.225.17.123
			const trimmed_val = val.replace(' ', '');
			const pattern = /^(sftp|ftp|ssh):\/\/.*:.*@.*/;

			if (pattern.test(trimmed_val)) {
				const protocol = trimmed_val.split('://')[0].trim();
				const details = trimmed_val.split('://')[1].trim();

				const secure = ['sftp', 'ssh'].includes(protocol);
				const pass_ip = details.split(':')[1].trim();
				const user = details.split(':')[0].trim();
				const password = pass_ip.split('@')[0].trim();
				const ip = pass_ip.split('@')[1].trim();

				this.server_data.secure = secure;
				this.server_data.user = user;
				this.server_data.password = password;
				this.server_data.host = ip;
				this.server_data.name = this.server_data.name.trim() ? this.server_data.name : user;
			}
		},
	}
}
</script>

<style lang="scss" scoped>
.popup {
	padding: 25px 30px;
	background: #fefefe;
	border-radius: 5px;
	box-shadow: 0px 1px 4px  rgb(0 0 0 / 11%);
	display: grid;
	grid-auto-flow: row;
	row-gap: 20px;
	justify-items: center;
	width: 350px;
	&__wrapper {
		position: fixed;
		height: 100vh;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(255,255,255,.6);
    backdrop-filter: blur(1px);
		transition: .2s ease;
	}
	&__fields {
		display: grid;
		grid-auto-flow: row;
		row-gap: 10px;
		justify-self: stretch;
	}
	&__additional {
		display: grid;
		grid-auto-flow: column;
		column-gap: 10px;
		justify-self: start;
		width: 100%;
    justify-content: start;
		grid-template-columns: auto 25px 1fr;
		.short-input--opened {
			grid-column: 2/4;
		}
	}
	&__buttons {
		display: grid;
		grid-auto-flow: column;
		column-gap: 10px;
		justify-self: end;
		margin-top: 15px;
	}
	&__button {
		&:hover:not(.button--active) {
			color: inherit;
		}
	}
}

</style>
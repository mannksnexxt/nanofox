<template>
	<header class="header">
		<div class="header__drag"></div>
		<div class="header__menu">
			<div class="header__buttons">
				<button class="button button--icon"
					v-for="tab in tabs"
					:key="tab"
					:class="{'button--active': tab === current_tab}"
					@click="$emit('change-tab', tab)">
					<i :class="`icon icon-${tab}`"></i>
				</button>
			</div>

			<div class="header__options">
				<ShortInput v-model="search_value" :icon="'search'" v-if="current_tab === 'servers'"/>

				<button class="button button--icon"
					v-for="control in controls_source"
					@keypress.enter.prevent
					:key="control.event"
					@click="$emit(control.event)">
					<i :class="`icon icon-${control.icon}`"></i>
				</button>
						
			</div>
		</div>
	</header>
</template>

<script>
import ShortInput from "./controls/ShortInput.vue";

export default {
	name: 'window-header',
	components: { ShortInput },
	props: {
		path: String,
		tabs: Array,
		current_tab: String,
		selected: Number,
		night_theme: Boolean
	},
	data() {
		return {
			search_value: '',
			files: []
		}
	},
	computed: {
		controls_source() {
			return this.current_tab === 'servers' ? this.server_tab_controls : this.files_tab_controls;
		},
		server_tab_controls() {
			return [
				{ event: 'add-server', icon: 'add' },
				{ event: 'change-theme', icon: this.night_theme ? 'moon-fill' : 'moon'},
			]
		},
		files_tab_controls() {
			const controls = [
				{ event: 'call-dialog', icon: 'upload' }
			];

			if (this.selected === 1) {
				controls.push({ event: 'rename', icon: 'edit' });
			}
			if (this.selected) {
				controls.push({ event: 'download-files', icon: 'download' });
				controls.push({ event: 'remove-files', icon: 'remove' });
			}

			return controls;
		},
	},
	methods: {
		
	},
	watch: {
		search_value(val) {
			this.$emit('search', val);
		}
	}
}
</script>

<style lang="scss" scoped>
.header {
	padding: 0px 8px 10px 8px;
	border-bottom: 1px solid #e8e8e8;
	background: #fff;
	&__drag {
		padding: 14px 0;
		-webkit-app-region: drag;
	}
	&__menu {
		display: grid;
		grid-auto-flow: column;
		justify-content: space-between;
	}
	&__buttons, &__options {
		display: grid;
		grid-auto-flow: column;
		column-gap: 10px;
	}
}

</style>
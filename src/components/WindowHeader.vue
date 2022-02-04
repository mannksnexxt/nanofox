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
		current_tab: String
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
				{
					event: 'add-server',
					icon: 'add'
				}
			]
		},
		files_tab_controls() {
			return [
				{
					event: 'call-dialog',
					icon: 'upload'
				}
			]
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
	// padding: 10px 15px;
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
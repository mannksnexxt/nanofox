<template>
	<div class="breadcrumb">
		<button
			class="breadcrumb__button"
			v-for="(dir, index) in parsed_path"
			:key="dir + index"
			:class="{
				'breadcrumb__button--active': index === parsed_path.length - 1,
				'night': night_theme
			}"
			:disabled="index === parsed_path.length - 1"
			@click="select(dir, index)">
			{{ dir }}
		</button>
	</div>
</template>

<script>
export default {
	name: 'breadcrumb',
	props: {
		path: String,
		night_theme: Boolean
	},
	data() {
		return {
			
		}
	},
	computed: {
		parsed_path() {
			if (!this.path.length) return [];

			let default_path = ['/'];

			if (this.path === '/') return default_path;
			return [...default_path, ...this.path.split('/')].filter(Boolean);	
		},
		current_dir() {
			return this.parsed_path[this.parsed_path.length - 1];
		}
	},
	methods: {
		select(dir, index) {
			if (index === 0) {
				this.$emit('cd', '/');
			} else {
				const path = '/' + this.parsed_path.slice(1, index+1).join('/');
				this.$emit('cd', path);
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.breadcrumb {
	display: grid;
	grid-auto-flow: column;
	align-items: center;
	justify-content: start;
	column-gap: 1px;
	overflow: scroll;
	&__button {
		padding: 2px 8px;
		border: none;
		color: #b0b0b0;
    background: #f6f6f6;
		cursor: pointer;
		white-space: nowrap;
		user-select: none;
		&--active {
			color: #fff;
			background: #4f95ff;
			cursor: default;
			&.night {
				filter: invert(1) hue-rotate(180deg) !important;
			}
		}
		&:hover:not(&--active) {
			color: #757575;
		}
		&:first-child {
			border-radius: 4px 0 0 4px;
		}
		&:last-child {
			border-radius: 4px;
		}
	}
	&::-webkit-scrollbar {
		display: none;
	}
}
</style>
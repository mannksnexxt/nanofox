<template>
	<li class="file">
		<i
			class=""
			:class="`icon icon-${file_icon}`">
		</i>
		<span class="file__name">{{ file.name }}</span>
	</li>
</template>

<script>
import { FILE_ICONS } from '../constants.js';

export default {
	name: 'window-file',
	props: {
		file: Object
	},
	data() {
		return {
			icons: FILE_ICONS
		}
	},
	computed: {
		file_icon() {
			if (this.file.type === 2) return 'folder';
			const splited_name = this.file.name.split('.');
			const ext = splited_name[splited_name.length - 1];
			let icon = 'file';

			Object.entries(this.icons).forEach(([icon_name, exts]) => {
				if (exts.includes(ext)) icon = icon_name;
			})
			return icon;
		}
	}
}
</script>

<style lang="scss" scoped>
.file {
	display: grid;
	grid-template-columns: auto 1fr;
	align-items: center;
	column-gap: 5px;
	user-select: none;
	padding: 1px 7px;
	// &:nth-child(even) {
	// 	background: #f8f8f8;
	// }
	&__name {
		color: #2f2f2f;
    font-size: 14px;
	}
	&--selected {
		background: #cce3ff !important;
	}
	.icon {
		color: #808080;
		&-folder {
			color: #3a89ff;
		}
	}
}
</style>
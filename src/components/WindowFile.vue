<template>
	<li class="file">
		<i class="" :class="`icon icon-${file_icon}`"></i>

		<span v-if="editing_file && editing_file.name !== file.name"
			class="file__name">{{ file.name }}
		</span>

		<input
			type="text"
			class="transparent"
			v-else
			:value="editing_file.new_name"
			@keypress.enter="$emit('apply-rename')"
			@input="$emit('update:modelValue', $event.target.value)">

	</li>
</template>

<script>
import { FILE_ICONS } from '../constants.js';

export default {
	name: 'window-file',
	events: ['update:modelValue'],
	props: {
		file: Object,
		modelValue: String,
		editing_file: Object
	},
	data() {
		return {
			icons: FILE_ICONS,
			rename_value: ''
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
	},
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
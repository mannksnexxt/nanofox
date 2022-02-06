<template>
	<section class="files" @click.self.stop="unselect">
		<div class="files__header">
			<button class="button button--icon button--rounded"
				:disabled="path === '/'"
				@click="$emit('cdup')">
				<i class="icon icon-left"></i>
			</button>
			<Breadcrumb
				:path="path"
				:night_theme="night_theme"
				@cd="cd($event)"
			/>
		</div>
		<ul class="files__filelist" @click.self.stop="unselect">
			<WindowFile 
				v-for="(file, index) in files"
				:key="file.name + index"
				:class="{'file--selected': grouped_selection.includes(file.name)}"
				:file="file"
				:editing_file="editing_file"
				v-model="editing_file.new_name"
				@apply-rename="applyRename"
				@dblclick="handleDblclick(file)"
				@click.exact="selectOne(file.name, index)"
				@click.meta="select(file.name, index)"
			/>
		</ul>
	</section>
</template>

<script>
import WindowFile from "./WindowFile.vue"
import Breadcrumb from "./controls/Breadcrumb.vue"


export default {
	name: 'window-files',
	components: { Breadcrumb, WindowFile },
	props: {
		path: String,
		files: Array,
		night_theme: Boolean
	},
	data() {
		return {
			selected_files: [],
			editing_file: {
				name: '',
				new_name: ''
			},
			selected_range: {
				from: null,
				to: null
			}
		}
	},
	mounted() {
		window.addEventListener('keydown', this.onkeydown);
	},
	beforeUnmount() {
		window.removeEventListener('keydown', this.onkeydown);
	},
	computed: {
		files_from_range() {
			let from_range = [];
			if (
				Number.isInteger(this.selected_range.to) &&
				Number.isInteger(this.selected_range.from)
			) {
				const range = [this.selected_range.from, this.selected_range.to].sort((a, b) => a - b);
				from_range = this.files.slice(range[0], range[1] + 1).map(f => f.name);
			}

			return from_range;
		},
		grouped_selection() {
			const filtered_range = this.files_from_range.filter(file => {
				return !this.selected_files.includes(file);
			})
			const filtered_list = this.selected_files.filter(file => {
				return !this.files_from_range.includes(file);
			});

			return [...filtered_range, ...filtered_list];
		},
		selected_typed_files() {
			if (this.grouped_selection) {
				return this.files
					.filter(file => this.grouped_selection.includes(file.name))
					.map(file => {
						const full_path = this.path === '/' ? this.path + file.name : `${this.path}/${file.name}`
						const type = file.type === 2 ? 'dir' : file.type === 1 ? 'file' : 'link';
						return { name: full_path, type };
					})
			}		
		}
	},
	methods: {
		applyRename() {
			if (!this.editing_file.new_name.includes('/') && this.editing_file.new_name !== this.editing_file.name) {
				this.$emit('rename-file', {
					name: this.editing_file.name,
					new_name: this.editing_file.new_name
				});

				const file = this.files.find(f => f.name == this.editing_file.name);
				file.name = this.editing_file.new_name;

				this.editing_file.name = this.editing_file.new_name = '';
			}
		},
		cd(path) {
			this.$emit('cd', path);
			this.unselect();
		},
		unselect() {
			this.selected_files = [];
			this.selected_range.from = null
			this.selected_range.to = null;
			this.editing_file.name = '';
			this.editing_file.new_name = '';
		},
		rename() {
			this.editing_file.name = this.grouped_selection[0];
			this.editing_file.new_name = this.grouped_selection[0];
		},
		selectOne(filename, index) {
			this.selected_files = [];
			this.selected_range.from = index;
			this.selected_range.to = index;
		},
		select(filename) {
			if (this.selected_files.includes(filename)) {
				this.selected_files = this.selected_files.filter(f => f !== filename);
			} else {
				this.selected_files.push(filename);
			}
		},
		handleDblclick(file) {
			if (file.type === 2) {
				if (this.path === '/') {
					this.$emit('deeper', `/${file.name}`);
				} else {
					this.$emit('deeper', `${this.path}/${file.name}`);
				}
				this.unselect();
			}
		},
		onkeydown(ev) {
			let key, is_shift, is_alt, is_meta;

			if (window.event) {
				key = window.event.keyCode;
				is_shift = !!window.event.shiftKey;
				is_alt = !!window.event.altKey;
				is_meta = !!window.event.metaKey;
			} else {
				key = ev.which;
				is_shift = !!ev.shiftKey;
				is_alt = !!ev.altKey;
				is_meta = !!ev.metaKey;
			}
			if (is_alt && key === 38) {
				this.$emit('call-dialog');
				return;
			} else if (is_alt && key === 40 && this.selected_typed_files) {
				this.$emit('download-files');
				return;
			} else if (is_meta && key === 8 && this.selected_typed_files) {
				this.$emit('remove-files');
				return;
			} else if ( is_shift ) {
				switch (key) {
					case 16:
						break;
					default:
						if (this.files.length) {
							if (key == 38) {
								if (
									!Number.isInteger(this.selected_range.from) &&
									!Number.isInteger(this.selected_range.to)
								) {
									this.selected_range.from = this.files.length - 1;
									this.selected_range.to = this.files.length - 1;
								} else {
									if (this.selected_range.to > 0) {
										this.selected_range.to = this.selected_range.to - 1;
									} 
								}
							} else if (key == 40) {
								if (
									!Number.isInteger(this.selected_range.from) &&
									!Number.isInteger(this.selected_range.to)
								) {
									this.selected_range.from = 0;
									this.selected_range.to = 0;
								} else {
									if (this.selected_range.to < this.files.length - 1) {
										this.selected_range.to = this.selected_range.to + 1;
									} 
								}
							}
						}
				}
			} else {
				switch (key) {
					case 38:
						this.selected_files = [];
						if (
							!Number.isInteger(this.selected_range.from) &&
							!Number.isInteger(this.selected_range.to)
						) {
							this.selected_range.from = this.files.length - 1;
							this.selected_range.to = this.files.length - 1;
						} else {
							if (this.selected_range.to > 0) {
								this.selected_range.to = this.selected_range.to - 1;
								this.selected_range.from = this.selected_range.to;
							} 
						}
						break;
					case 40:
						this.selected_files = [];
						if (
							!Number.isInteger(this.selected_range.from) &&
							!Number.isInteger(this.selected_range.to)
						) {
							this.selected_range.from = 0;
							this.selected_range.to = 0;
						} else {
							if (this.selected_range.to < this.files.length - 1) {
								this.selected_range.to = this.selected_range.to + 1;
								this.selected_range.from = this.selected_range.to;
							} 
						}
						break;
				}
			}
		}
	},
	watch: {
		selected_typed_files(val) {
			this.$emit('select', val);
		}
	}
}
</script>

<style lang="scss" scoped>
.files {
	display: grid;
	grid-template: auto 1fr/1fr;
	height: 100%;
	overflow: hidden;
	&__header {
		padding: 5px 8px;
    background: #fff;
		display: grid;
		grid-template-columns: auto 1fr;
		column-gap: 10px;
		align-items: center;
		border-bottom: 1px solid #00000013;
	}
	&__filelist {
		background: #fff;
		background: url(../assets/bg/files.svg);
    border: none;
    width: 100%;
		overflow: scroll;
	}
}

.icon-left {
	color: #a2a2a2;
	&::before {
		font-size: 12px;
	}
}


</style>
<template>
	<section class="files" @click.self.stop="unselect">
		<div class="files__header">
			<Breadcrumb
				:path="path"
				@cd="cd($event)"
			/>
		</div>
		<ul class="files__filelist" @click.self.stop="unselect">
			<WindowFile 
				v-for="(file, index) in files"
				:key="file.name + index"
				:class="{'file--selected': grouped_selection.includes(file.name)}"
				:file="file"
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
		files: Array
	},
	data() {
		return {
			selected_files: [],
			cursor: '',
			last_key: null,
			selected_range: {
				from: null,
				to: null
			}
		}
	},
	mounted() {
		window.addEventListener('keydown', this.onkeydown);
	},
	computed: {
		files_from_range() {
			let from_range = [];
			if (
				Number.isInteger(this.selected_range.to) &&
				Number.isInteger(this.selected_range.from)
			) {
				const range = [this.selected_range.from, this.selected_range.to].sort();
				from_range = this.files.slice(range[0], range[1] + 1).map(f => f.name);
			}

			return from_range;
		},
		grouped_selection() {
			// ...new Set([...this.selected_files, ...this.files_from_range])
			const filtered_range = this.files_from_range.filter(file => {
				return !this.selected_files.includes(file);
			})
			const filtered_list = this.selected_files.filter(file => {
				return !this.files_from_range.includes(file);
			});

			return [...filtered_range, ...filtered_list];
		}
	},
	methods: {
		cd(path) {
			this.$emit('cd', path);
			this.unselect();
		},
		unselect() {
			this.selected_files = [];
			this.selected_range.from = null
			this.selected_range.to = null;
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
			let key;
			let is_shift;
			if (window.event) {
				key = window.event.keyCode;
				is_shift = !!window.event.shiftKey;
			} else {
				key = ev.which;
				is_shift = !!ev.shiftKey;
			}
			if ( is_shift ) {
				switch (key) {
					case 16: // ignore shift key
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
	}
}
</script>

<style lang="scss" scoped>
.files {
	display: grid;
	grid-template: auto 1fr/1fr;
	height: 100%;
	&__header {
		padding: 6px 6px;
    background: #fff;
	}
	&__filelist {
		background: #fff;
    border: none;
    width: 100%;
	}
}



</style>
<template>
	<div class="short-input" @click="open" :class="{'short-input--opened': opened}">
		<i :class="`icon icon-${icon}`"></i>
		<input
			type="text"
			ref="input"
			:class="{hidden: !opened}" 
			:placeholder="placeholder"
			@blur="unfocused"
			@input="$emit('update:modelValue', $event.target.value)">
	</div>
</template>

<script>
export default {
	name: 'short-input',
	emits: ['update:modelValue'],
	props: {
		modelValue: String,
		icon: String,
		placeholder: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			opened: false
		}
	},
	methods: {
		open() {
			this.opened = true;
			this.$refs.input.focus();
		},
		unfocused() {
			if (!this.modelValue.trim()) {
				this.opened = false;
			}
		}
	}
}
</script>

<style lang="scss" scoped>
.short-input {
	display: grid;
	grid-template-columns: auto 1fr;
	align-items: center;
	column-gap: 5px;
	border-radius: 3px;
	padding: 0 1px 0 6px;
	cursor: pointer;
	input {
		border: none;
		padding: 4px;
		outline: none;
		transition: .2s ease-in-out;
		&.hidden {
			width: 0;
			padding: 4px 0 !important;
		}
	}
	&:hover, &--opened {
		background: #f6f6f6;
	}
}
</style>
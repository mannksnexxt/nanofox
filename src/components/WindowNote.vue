<template>
	<transition name="slide-right">
		<div
			v-if="is_open"
			class="notification"
			@mouseenter="clearTimer"
			@mouseleave="setTimer"
			:class="{'notification--error': is_error}">
			<div class="notification__body">
				<h3 class="notification__title">{{ title }}</h3>
				<span v-if="description" class="notification__description">{{ description }}</span>
			</div>
		</div>
	</transition>
</template>


<script>
export default {
	name: 'notification',
	data() {
		return {
			is_open: false,
			title: '',
			description: '',
			is_error: false,
			timer: null
		}
	},
	methods: {
		call({ title, description = '', error = false, }) {
			this.title = title;
			this.description = description;
			this.is_error = error;
			this.is_open = true;
			this.setTimer();
		},
		setTimer() {
			if (this.is_open) {
				this.timer = setTimeout(this.close, 3000);
			}
		},
		clearTimer() {
			clearTimeout(this.timer);
		},
		close() {
			this.title = this.description = '';
			this.is_error = false;
			this.timer = null;
			this.is_open = false;
		}
	}
}
</script>

<style lang="scss">
$borderColor: #64768F;
$errorBorderColor: #ff5757;
$textColor: #5C728C;
$errorTextColor:#e74b4b;
$BGColor: #fdfdfd;


.notification {
	padding: 0 0 0 15px;
	cursor: default;
	background: $BGColor;
	min-width: 274px;
	width: fit-content;
	width: -moz-fit-content;
	height: 50px;
	border-left: 3px solid $borderColor;
	box-sizing: border-box;
	position: fixed;
	right: 10px;
	bottom: 56px;
	border-radius: 4px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	&--error &__title, &--error &__description {
		color: $errorTextColor;
	}
	&--error {
		border-color: $errorBorderColor;
	}
	&__header {
		width: 100%;
		position: relative;
	}
	&__body {
		display: grid;
		grid-template-columns: 1fr;
		row-gap: 3px;
		height: 100%;
		align-items: center;
		align-content: center;
		padding-right: 20px;
	}
	&__title {
		color: $textColor;
		white-space: nowrap;
		font-size: 14px;
		margin: 0;
	}
	&__description {
		color: $textColor;
		font-size: 12px;
	}
}
</style>
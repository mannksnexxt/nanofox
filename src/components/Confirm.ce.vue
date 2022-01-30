<template>
	<transition name="fade">
		<div class="confirm__wrapper"
			v-show="is_open"
			@click.stop="close">
			<div class="confirm" @click.stop>
				<h3 class="confirm__title">{{ title }}</h3>
				<div class="confirm__buttons">
					<button class="button button--common" @click="close">
						отмена
					</button>
					<button
						class="button button--common button--accent"
						@click="confirm"
						ref="confirm"
						@keyup.enter="confirm">
						{{ confirm_text }}
					</button>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>

export default {
	CONFIRM_PROMISE_STATUS: null,
	name: 'modal-confirm',
	props: {
		callback: {
			type: Function,
			required: true
		}
	},
	data() {
		return {
			is_open: false,
			confirm_text: '',
			title: ''
		}
	},
	mounted() {
		this.$nextTick(() => this.callback());
		
		const escapeHandler = (e) => {
			if (e.key === 'Escape') {
				this.close();
			}
		}

		document.addEventListener('keydown', escapeHandler)
	},
	methods: {
		open({title, confirm_text}) {
			let resolve, reject;
			const promise = new Promise((res, rej) => {
				resolve = res;
				reject = rej;
			});
			
			this.$options.CONFIRM_PROMISE_STATUS = {resolve, reject};
			this.confirm_text = confirm_text ? confirm_text : 'подтвердить';
			this.title = title ? title : 'Подтвердите действие';
			this.is_open = true;

			this.$refs.confirm.focus();

			return promise;
		},
		confirm() {
			this.$options.CONFIRM_PROMISE_STATUS.resolve(true);
			this.is_open = false;
		},
		close() {
			this.$options.CONFIRM_PROMISE_STATUS.resolve(false);
			this.is_open = false;
		},
	}
}
</script>

<style lang="scss">
@import "../assets/styles/style.scss";

.confirm {
	padding: 25px 30px;
	background: #fefefe;
	border-radius: 5px;
	box-shadow: 0px 1px 4px  rgb(0 0 0 / 11%);
	display: grid;
	grid-auto-flow: row;
	row-gap: 25px;
	justify-items: center;
	&__wrapper {
		position: fixed;
		top: -46px;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(255,255,255,.6);
		backdrop-filter: blur(1px);
		transition: .2s ease;
	}
	&__buttons {
		display: grid;
		grid-template-columns: auto auto;
		column-gap: 10px;
		justify-self: end;
	}
	&__title {
		font-family: Avenir, sans-serif;
		text-align: center;
		width: 100%;
		font-size: 15px;
		font-weight: 500;
		margin: 0;
		color: #525252;
	}
}
</style>
<template>
	<div class="progress__wrapper">
		<div class="progress">
			<h3 class="progress__title">{{ title }}</h3>

			<div class="progress__bar">
				<div class="progress__indicator" :style="indicator_width"></div>
			</div>
			
		</div>
	</div>
</template>

<script>

export default {
	name: 'transfer-progress',
	props: {
		transfer_data: Object
	},
	data() {
		return {
			
		}
	},
	computed: {
		title() {
			switch (this.transfer_data.type) {
				case 'upload':
					return 'Загрузка файлов';
			}
		},
		indicator_width() {
			const width = this.transfer_data.transfered / this.transfer_data.total * 100;
			return { width: width + '%' };
		}
	}
}
</script>


<style lang="scss">

.progress {
	padding: 25px 30px;
	background: #fefefe;
	border-radius: 5px;
	box-shadow: 0px 1px 4px  rgb(0 0 0 / 11%);
	display: grid;
	grid-auto-flow: row;
	row-gap: 16px;
	justify-items: center;
	width: 350px;
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
		transition: .1s ease;
	}
	&__title {
		font-family: Avenir, sans-serif;
		text-align: center;
		width: 100%;
		font-size: 16px;
		font-weight: 400;
		margin: 0;
		color: #525252;
	}
	&__bar {
		width: 100%;
		height: 20px;
		border-radius: 20px;
		background: #f3f3f3;
		box-shadow: inset 0px -1px 3px #00000010;
		overflow: hidden;
	}
	&__indicator {
		height: 100%;
		border-radius: 20px;
		background: #4f95ff;
		transition: .1s ease-in-out;
	}
}
</style>
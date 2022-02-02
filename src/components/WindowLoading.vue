<template>
	<div class="loading__wrapper">
		<div class="loading">
			<i class="loading__icon icon-time"></i>
		</div>
	</div>
</template>

<script>
export default {
	name: 'window-loading'
}
</script>

<style lang="scss" scoped>
.loading {
	display: grid;
	align-items: center;
	transform: rotateZ(180deg);
	margin-bottom: 50px;
	&__icon {
		font-size: 60px;
		color: #4f95ff;
		transition: .2s;
		animation: load 2.5s ease-in-out infinite;
	}
	&__wrapper {
		position: fixed;
		height: 100vh;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(255,255,255,.6);
    backdrop-filter: blur(3px);
		transition: .1s ease;
	}
}
</style>
import { defineCustomElement } from 'vue';
import Confirm from '../components/Confirm.ce.vue';

export default {
	install: (app, options) => {
		app.config.compilerOptions.isCustomElement = tag => tag.startsWith('modal-');

		const ModalConfirm = defineCustomElement(Confirm);
		customElements.define('modal-confirm', ModalConfirm);
		
		let modal = false;

		app.config.globalProperties.$modal = (options) => {
			let promise = new Promise(async (res, rej) => {
				let response;
				
				if (!modal) {
					const el = new ModalConfirm({
						async callback() {
							response = await this.open(options);
							modal = this
							res(response);
						}
					});

					document.body.appendChild(el);
				} else {
					response = await modal.open(options);
					res(response)
				}
			})

			return promise;
    }
	}
}
import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import { isServer } from '@vue-storefront/core/helpers'
import { coreHooks } from '@vue-storefront/core/hooks';
import { module } from './store'
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import i18n from '@vue-storefront/i18n';
import QpayproDropin from './components/Dropin.vue'
import Vue from 'vue';

export const PaymentQpayproModule : StorefrontModule = function ({ app, store }) {
  // store.registerModule('qpaypro', module);

  // coreHooks.afterAppInit(() => {
  // const CURRENT_METHOD_CODE = 'qpaypro'
  let correctPaymentMethod = false
  const VSF_PAYMENT_CODE = 'qpaypro'
  const placeOrder = () => {
    if (correctPaymentMethod) {
      EventBus.$emit('checkout-do-placeOrder', {})
    }
  }

  // Update the methods
  let paymentMethodConfig = {
    // 'title': i18n.t('Pay by Card (VISANET)'),
    'title': 'Tarjeta',
    'code': VSF_PAYMENT_CODE,
    'cost': 0,
    'costInclTax': 0,
    'default': false,
    'offline': false,
    'is_server_method': false
  }
  store.dispatch('checkout/addPaymentMethod', paymentMethodConfig)


  if (!isServer) {
    EventBus.$on('checkout-before-placeOrder', placeOrder)

    // Mount the info component when required.
    EventBus.$on('checkout-payment-method-changed', (paymentMethodCode) => {
      console.log('paymentMethodCode', paymentMethodCode)
      if (paymentMethodCode === 'qpaypro') {
        correctPaymentMethod = true
      }
      /*
      let methods = store.state['payment-backend-methods'].methods

      console.log('methods', methods)
      if (methods) {
        let method = methods.find(item => (item.code === paymentMethodCode))
        if (paymentMethodCode === 'qpaypro' && ((typeof method !== 'undefined' && !method.is_server_method) || typeof method === 'undefined')) {
          correctPaymentMethod = true
        } else {
          correctPaymentMethod = false
        }
      }*/
    })
  }
}

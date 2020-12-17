
import { StorefrontModule } from '@vue-storefront/core/lib/modules';
import { isServer } from '@vue-storefront/core/helpers'
import { coreHooks } from '@vue-storefront/core/hooks'
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { module } from './store'

export const PaymentQpayproModule: StorefrontModule = function ({ store }) {
  store.registerModule('qpaypro', module);

  let correctPaymentMethod = false

  const CURRENT_METHOD_CODE = 'qpaypro'

  const placeOrder = () => {
    if (correctPaymentMethod) {
      EventBus.$emit('checkout-do-placeOrder', {})
    }
  }

  // Update the methods
  let paymentMethodConfig = {
    'title': 'Tarjeta',
    'code': CURRENT_METHOD_CODE,
    'cost': 0,
    'costInclTax': 0,
    'default': true,
    'offline': true,
    'is_server_method': false
  }

  store.dispatch('checkout/addPaymentMethod', paymentMethodConfig)


  if (!isServer) {
    // Update the methods
    let paymentMethodConfig = {
      'title': 'Tarjeta',
      'code': CURRENT_METHOD_CODE,
      'cost': 0,
      'cost_incl_tax': 0,
      'default': true,
      'offline': true,
      'is_server_method': false
    }
    store.dispatch('checkout/addPaymentMethod', paymentMethodConfig)

    EventBus.$on('checkout-before-placeOrder', placeOrder)

    // Mount the info component when required.
    EventBus.$on('checkout-payment-method-changed', (paymentMethodCode) => {
      let methods = store.state['payment-backend-methods'].methods
      if (methods) {
        let method = methods.find(item => (item.code === paymentMethodCode))
        if (paymentMethodCode === 'qpaypro' && ((typeof method !== 'undefined' && !method.is_server_method) || typeof method === 'undefined') /* otherwise it could be a `payment-backend-methods` module */) {
          correctPaymentMethod = true

          // Dynamically inject a component into the order review section (optional)
          // const Component = Vue.extend(InfoComponent)
          // const componentInstance = (new Component())
          // componentInstance.$mount('#checkout-order-review-additional')
        } else {
          correctPaymentMethod = false
        }
      }
    })
  }


}

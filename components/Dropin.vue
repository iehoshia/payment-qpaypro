<template>
  <inline-credit-card-field v-model="card" :activity="showActivity"></inline-credit-card-field>
</template>



<script>
import { mapState, mapGetters } from 'vuex'

//import { CreditCardField, InlineCreditCardField } from 'vue-credit-card-field'
import * as modulesVCCF from 'vue-credit-card-field'
import config from 'config'
import store from '@vue-storefront/core/store'
import i18n from '@vue-storefront/i18n'
import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import Vue from 'vue'

export default {
  name: 'QpayproDropin',
  data() {
    return {
      card: {
        number:'',
        expiration:'',
        cvc:''
      },
      showActivity: false,
      lastChangeEvent: null,
      lastValidEvent: null,
      lastInvalidEvent: null,
      lastCompleteEvent: null
    }
  },
  computed: {
    ...mapState({
      qpayproConfig: state => config.qpaypro
    }),
    grandTotal () {
      let cartTotals = this.$store.getters['cart/getTotals']
      return cartTotals.find(seg => seg.code === 'grand_total').value
    }
  },
  components: {
    CreditCardField: modulesVCCF.default.CreditCardField,
    inlineCreditCardField: modulesVCCF.default.InlineCreditCardField
  },
  beforeMount () {
    EventBus.$on('order-after-placed', this.onAfterPlaceOrder)
    // Ready to place order, handle anything we need to, generating, validating stripe requests & tokens ect.
    EventBus.$on('checkout-before-placeOrder', this.onBeforePlaceOrder)
  },
  beforeDestroy () {
    EventBus.$off('order-after-placed', this.onAfterPlaceOrder)
    EventBus.$off('checkout-before-placeOrder', this.onBeforePlaceOrder)
  },
  mounted () {
    // Load the stripe.js elements script.
    // As it's callback, Configure stripe to run.
    // this.loadStripeDependencies(this.configureStripe)
    // Ready to place order, handle anything we need to, generating, validating stripe requests & tokens ect.
    EventBus.$on('checkout-payment-method-changed', (paymentMethodCode) => {
      if (paymentMethodCode !== 'qpaypro') {
        // unregister the extension placeorder handler
        EventBus.$off('checkout-before-placeOrder', this.onBeforePlaceOrder)
      }
    })
  },
  methods: {
    onAfterPlaceOrder () {
      // Stop display loader
      EventBus.$emit('notification-progress-stop')
    },
    onBeforePlaceOrder () {
      this.processForm()
    },
    onApprove (data, actions) {
      EventBus.$emit('notification-progress-start', [i18n.t('Placing Order'), '...'].join(''))

      this.$store.dispatch('qpaypro/doPayment', this.getData())
      .then(res => {
          if (res.code !== 200) {
            console.log('payment return not 200')
          } else {
            EventBus.$emit('checkout-do-placeOrder', {})
          }
          EventBus.$emit('notification-progress-stop')
        })
      .catch(err => {
        EventBus.$emit('notification-progress-stop')
      })
    },
    getData () {
      return { total: this.grandTotal, currency: this.currency,
        card: this.card }
    },
    processForm () {
      let self = this
      // Start display loader
      EventBus.$emit('notification-progress-start', [i18n.t('Placing Order'), '...'].join(''))
      // Create payment method with Stripe
      this.$store.dispatch('qpaypro/doPayment', this.getData())
      .then(res => {
          if (res.code !== 200) {
            console.log('payment return not 200')
          } else {
            console.log('payment success', res)
            EventBus.$emit('checkout-do-placeOrder', {})
          }
          EventBus.$emit('notification-progress-stop')
        })
      .catch(err => {
        console.log('payment error', err)
        EventBus.$emit('notification-progress-stop')
      })
    },
    placeOrderWithPayload (payload) {
      EventBus.$emit('checkout-do-placeOrder', payload)
    },
    formatTokenPayload (token) {
      let platform = this.stripeConfig.hasOwnProperty('backendPlatform') ? this.stripeConfig.backendPlatform : 'default'
      if (platform === 'magento2') {
        return {
          cc_save: false,
          cc_stripejs_token: `${token.id}:${token.card.brand}:${token.card.last4}`
        }
      } else {
        return token
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@storefront-ui/shared/styles/helpers/breakpoints";
  @import url("https://fonts.googleapis.com/css?family=Source+Code+Pro:400,500,600,700|Source+Sans+Pro:400,600,700&display=swap");


  .qpaypro-container {
    width: 100%;
    height: 100px;
    border: 1px solid #000;
    label {
      font-weight: 500;
      font-size: 14px;
      display: block;
      margin-bottom: 8px;
      color: #818992;
    }
    .QpayproElement {
      background-color: white;
      padding: 10px 12px;
      border-radius: 4px;
      border: 1px solid transparent;
      box-shadow: 0 1px 3px 0 #e6ebf1;
      -webkit-transition: box-shadow 150ms ease;
      transition: box-shadow 150ms ease;
    }
    .QpayproElement--focus {
      box-shadow: 0 1px 3px 0 #cfd7df;
    }
    .QpayproElement--invalid {
      border-color: #fa755a;
    }
    .QpayproElement--webkit-autofill {
      background-color: #fefde5 !important;
    }
  }
  .qpaypro-container::after{
    content: "\a";
    white-space: pre;
  }
  #vsf-qpaypro-card-errors {
    margin: 8px auto 0;
    color: #fa755a;
  }
  * {
  box-sizing: border-box;
  &:focus {
    outline: none;
  }
}
.wrapper {
  min-height: 100vh;
  display: flex;
  padding: 50px 15px;
  @media screen and (max-width: 700px), (max-height: 500px) {
    flex-wrap: wrap;
    flex-direction: column;
  }
}
.credit-card-field-wrapper {
  width: 350px;
  height: 45px;
  @include for-desktop {
    width: 450px;
    height: 45px;
    // border: 1px solid #000;
  }
}

.credit-card-field-wrapper {
  .form-control.credit-card-field {
    .credit-card-field-fields {
      width: calc(100% - 3.5em);
      left: 3.5em;
    }
  }
}
</style>
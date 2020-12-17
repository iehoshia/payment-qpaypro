import { Logger } from '@vue-storefront/core/lib/logger'
import { QpayproState } from '../types/QpayproState'
import { ActionTree } from 'vuex';
import Vue from 'vue';
import * as types from './mutation-types'
import config from 'config'
import { processURLAddress } from '@vue-storefront/core/helpers'
import { adjustMultistoreApiUrl } from '@vue-storefront/core/lib/multistore'
import getApiEndpointUrl from '@vue-storefront/core/helpers/getApiEndpointUrl';


// it's a good practice for all actions to return Promises with effect of their execution
export const actions: ActionTree<QpayproState, any> = {
  generateToken () {
    let url = config.qpaypro.endpoint + '/get-token'
    console.log(url)
    return fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    }).then(resp => { return resp.json() })
      .then((resp) => {
        console.debug(resp.result.token)
        return resp.result.token
      })
  },
  doPayment (context, data) {
    let url = config.qpaypro.endpoint + '/do-payment'
    console.log(url)
    console.log(context)
    console.log(data)
    return fetch(url,
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data
        })
      }
    ).then(res => {
      console.log('payment aprroved', res.clone().json())
      return res.clone().json()
    })
    .catch(error => {
      throw new Error('FetchError in request to API: ' + error.toString())
    })
  },
  set (context, { code, value, description }) {
    const qpayproCollection = Vue.prototype.$db.qpayproCollection
    qpayproCollection.setItem(code, {
      code: code,
      created_at: new Date(),
      value: value,
      description: description
    }).catch((reason) => {
      Logger.error(reason) // it doesn't work on SSR
    })
  },
  // if you are using cache in your module it's a good practice to allow developers to choose either to use it or not
  execute (params) {
    let url = config.paypal.endpoint.execute
    url = config.storeViews.multistore ? adjustMultistoreApiUrl(url) : url
    return fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    }).then(resp => { return resp.json() })
  }
}
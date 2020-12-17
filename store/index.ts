import { Module } from 'vuex'
import { QpayproState } from '../types/QpayproState'
import { mutations } from './mutations'
import { getters } from './getters'
import { actions } from './actions'
import { plugin } from './plugin'

export const module: Module<QpayproState, any> = {
  namespaced: true,
  state: {
    trans: null
  },
  mutations,
  actions,
  getters
}
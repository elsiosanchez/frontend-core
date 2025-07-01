/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import Vue from 'vue'
import lang from '@/lang'

// API Request Methods
import {
  createPayment,
  // updatePayment,
  deletePayment,
  listPayments,
  processOrder,
  // Online Payment
  infoOnlinePayment,
  cancelOnlinePayment,
  processOnlinePayment
} from '@/api/ADempiere/form/VPOS'
import {
  getConversionRateRequest
} from '@/api/ADempiere/system-core'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification'

const collection = {
  payments: [],
  listRate: [],
  currentRate: {},
  onlineEmpty: {
    time: 3000,
    status: 'W',
    error: false,
    message: lang.t('form.pos.collect.onlinePayment.title')
  },
  online: {},
  currentPaymentOnline: {},
  showCollection: false,
  paymentVerification: {
    isProcessing: true,
    isShowCancele: false
  },
  isLoadingPayment: false,
  isLoadingAddPayment: false
}

export default {
  state: collection,
  mutations: {
    setShowCollection(state, show) {
      state.showCollection = show
    },
    setListPayments(state, list) {
      state.payments = list
    },
    setRate(state, {
      date,
      rate
    }) {
      Vue.set(state.currentRate, date, rate)
    },
    setPaymentLoading(state, loading) {
      state.isLoadingPayment = loading
    },
    setLoadingAddPayment(state, loading) {
      state.isLoadingAddPayment = loading
    },
    setAttributePaymentVerification(state, {
      attribute,
      value
    }) {
      if (isEmptyValue(attribute)) return
      state.paymentVerification[attribute] = value
    },
    setOnline(state, online) {
      state.online = online
    },
    setCurrentPayment(state, {
      paymentId,
      infoPayment = state.onlineEmpty
    }) {
      Vue.set(state.online, paymentId, infoPayment)
    },
    setPaymentOnline(state, paymentOnline) {
      state.currentPaymentOnline = paymentOnline
    }
  },
  /**
   * Collection
   */
  actions: {
    addPayment({
      commit,
      getters,
      dispatch
    }, {
      invoice_id,
      bank_id,
      reference_no,
      description,
      amount,
      payment_date,
      tender_type_code,
      currency_id,
      payment_method_id,
      payment_account_date,
      is_refund,
      charge_id,
      collecting_agent_id,
      reference_bank_account_id,
      customer_bank_account_id,
      invoice_reference_id,
      allocate_payment_id
    }) {
      return new Promise(resolve => {
        const currentPos = getters.getVPOS
        const currentOrder = getters.getCurrentOrder
        if (
          isEmptyValue(currentPos.id) ||
          isEmptyValue(currentOrder.id)
        ) resolve({})
        createPayment({
          posId: currentPos.id,
          order_id: currentOrder.id,
          invoice_id,
          bank_id,
          reference_no,
          description,
          amount,
          payment_date,
          tender_type_code,
          currency_id,
          payment_method_id,
          payment_account_date,
          is_refund,
          charge_id,
          collecting_agent_id,
          reference_bank_account_id,
          customer_bank_account_id,
          invoice_reference_id,
          allocate_payment_id
        })
          .then(response => {
            dispatch('verifyPaymentOnline', {
              payment: {
                ...response,
                allocate_payment_id
              }
            })
            dispatch('getListPayments')
            dispatch('overloadOrder', { order: currentOrder })
              .then(() => {
                resolve(response)
                showMessage({
                  type: 'success',
                  message: lang.t('pointOfSales.collection.addPayment'),
                  showClose: true
                })
              })
          })
          .catch(error => {
            console.warn(`Add Payment: ${error.message}. Code: ${error.code}.`)
            let message = error.message
            if (!isEmptyValue(error.response) && !isEmptyValue(error.response.data.message)) {
              message = error.response.data.message
            }

            showMessage({
              type: 'error',
              message,
              showClose: true
            })
            resolve({})
          })
      })
    },
    getListPayments({
      commit,
      getters,
      dispatch
    }, orderId) {
      return new Promise(resolve => {
        const currentPos = getters.getVPOS
        const currentOrder = getters.getCurrentOrder
        commit('setPaymentLoading', true)
        if (
          isEmptyValue(currentPos.id) ||
          isEmptyValue(currentOrder.id)
        ) resolve({})
        if (isEmptyValue(orderId)) {
          orderId = currentOrder.id
        }
        dispatch('listRefunds')
        listPayments({
          posId: currentPos.id,
          orderId
        })
          .then(response => {
            const { payments } = response
            const list = payments.map(list => {
              return {
                ...list,
                amount: Number(list.amount),
                converted_amount: Number(list.converted_amount)
              }
            })
            commit('setPaymentLoading', false)
            commit('setListPayments', list)
            resolve(response)
          })
          .catch(error => {
            commit('setPaymentLoading', false)
            console.warn(`List Payment: ${error.message}. Code: ${error.code}.`)
            let message = error.message
            if (!isEmptyValue(error.response) && !isEmptyValue(error.response.data.message)) {
              message = error.response.data.message
            }

            showMessage({
              type: 'error',
              message,
              showClose: true
            })
            resolve({})
          })
      })
    },
    removePayment({
      getters,
      dispatch
    }, {
      payment_id
    }) {
      return new Promise(resolve => {
        const currentPos = getters.getVPOS
        const currentOrder = getters.getCurrentOrder
        if (
          isEmptyValue(currentPos.id) ||
          isEmptyValue(payment_id) ||
          isEmptyValue(currentOrder.id)
        ) resolve({})
        deletePayment({
          posId: currentPos.id,
          payment_id
        })
          .then(response => {
            dispatch('getListPayments')
            dispatch('overloadOrder', {
              order: currentOrder
            })

            showMessage({
              type: 'success',
              message: 'OK',
              showClose: true
            })
            resolve(response)
          })
          .catch(error => {
            console.warn(`Add Payment: ${error.message}. Code: ${error.code}.`)
            let message = error.message
            if (!isEmptyValue(error.response) && !isEmptyValue(error.response.data.message)) {
              message = error.response.data.message
            }

            showMessage({
              type: 'error',
              message,
              showClose: true
            })
            resolve({})
          })
      })
    },
    findRate({
      commit,
      getters
    }, {
      currencyToId,
      currencyFromId
    }) {
      return new Promise(resolve => {
        const {
          price_list,
          date_ordered
        } = getters.getCurrentOrder
        const {
          conversion_type_id
        } = getters.getVPOS
        if (
          isEmptyValue(conversion_type_id) ||
          isEmptyValue(price_list.currency) ||
          isEmptyValue(currencyToId) ||
          isEmptyValue(date_ordered)
        ) resolve([])
        if (isEmptyValue(currencyFromId)) {
          currencyFromId = price_list.currency.id
        }
        getConversionRateRequest({
          conversionTypeId: conversion_type_id,
          currencyFromId,
          currencyToId,
          conversionDate: date_ordered
        })
          .then(response => {
            commit('setRate', {
              rate: response,
              date: date_ordered
            })
            resolve(response)
          })
          .catch(error => {
            let message = error.message
            if (!isEmptyValue(error.response) && !isEmptyValue(error.response.data.message)) {
              message = error.response.data.message
            }

            showMessage({
              type: 'error',
              message,
              showClose: true
            })
            resolve([])
            console.warn(`Error Getting List Stocks: ${error.message}. Code: ${error.code}.`)
          })
      })
    },
    process({
      commit,
      getters,
      dispatch
    }, {
      isOpenRefund
    }) {
      return new Promise(resolve => {
        const currentPos = getters.getVPOS
        const currentOrder = getters.getCurrentOrder
        const payments = getters.getListPayments
        if (
          isEmptyValue(currentPos.id) ||
          isEmptyValue(currentOrder.id)
        ) resolve({})
        showMessage({
          type: 'info',
          message: lang.t('notifications.processing'),
          showClose: true
        })
        processOrder({
          posId: currentPos.id,
          orderId: currentOrder.id,
          createPayments: !isEmptyValue(payments),
          isOpenRefund,
          payments: payments.map(pay => {
            return {
              ...pay,
              amount: pay.amount.toString()
            }
          })
        })
          .then(response => {
            dispatch('overloadOrder', { order: currentOrder })
            dispatch('printTicketVPOS', {
              orderId: currentOrder.id
            })
            commit('setShowCollection', false)
            dispatch('setModalDialogVPOS', {
              title: `Orden ${currentOrder.document_no} Procesada`,
              type: 'success',
              doneMethod: () => {
                commit('setListOrderLines', [])
                dispatch('newOrder')
              },
              labelCancelMethod: () => {
                return lang.t('form.pos.dialog.viewOrderInformation')
              },
              isTypeButton: () => {
                return 'success'
              },
              isOptionsCancel: () => {
                return true
              },
              cancelMethod: () => {
                commit('setShowedModalDialogVPOS', {
                  isShowed: false
                })
              },
              componentPath: () => import('@/components/ADempiere/Form/VPOS2/DialogInfo/infoOrder.vue'),
              isShowed: true
            })
            resolve(response)
          })
          .catch(error => {
            console.warn(`Process Orders: ${error.message}. Code: ${error.code}.`)
            let message = error.message
            if (!isEmptyValue(error.response) && !isEmptyValue(error.response.data.message)) {
              message = error.response.data.message
            }

            dispatch('setModalDialogVPOS', {
              title: message,
              type: 'error',
              doneMethod: () => {
                dispatch('process', {})
              },
              // TODO: Change to string and import dynamic in component
              componentPath: () => import('@/components/ADempiere/Form/VPOS2/DialogInfo/infoOrder.vue'),
              isShowed: true
            })

            showMessage({
              type: 'error',
              message,
              showClose: true
            })
            resolve({})
          })
      })
    },
    verifyPaymentOnline({
      commit,
      getters,
      dispatch
    }, {
      payment
    }) {
      return new Promise(resolve => {
        if (!isEmptyValue(payment) && payment.is_online) {
          commit('setPaymentOnline', payment)
          dispatch('processOnline', {
            payment
          })
          commit('setAttributePaymentVerification', {
            attribute: 'isShowCancele',
            value: false
          })
          dispatch('setModalDialogVPOS', {
            title: lang.t('form.pos.collect.onlinePayment.info'),
            doneMethod: () => {
              commit('setShowedModalDialogVPOS', {
                isShowed: false
              })
              commit('setAttributePaymentVerification', {
                attribute: 'isShowCancele',
                value: false
              })
            },
            isLoadingDone: () => {
              const paymentOnline = getters.getCurrentPayment({ paymentId: payment.id })
              return paymentOnline.status === 'W'
            },
            isDisabledDone: () => {
              const paymentOnline = getters.getCurrentPayment({ paymentId: payment.id })
              return paymentOnline.status === 'W'
            },
            cancelMethod: (isCanceleAction) => {
              const paymentOnline = getters.getCurrentPayment({ paymentId: payment.id })
              if (paymentOnline.status === 'W') {
                commit('setAttributePaymentVerification', {
                  attribute: 'isShowCancele',
                  value: true
                })
              } else if (isCanceleAction) {
                return commit('setAttributePaymentVerification', {
                  attribute: 'isShowCancele',
                  value: true
                })
              } else {
                commit('setShowedModalDialogVPOS', {
                  isShowed: false
                })
              }
            },
            labelCancelMethod: () => {
              const paymentOnline = getters.getCurrentPayment({ paymentId: payment.id })
              let labelMessage
              switch (paymentOnline.status) {
                case 'A':
                  labelMessage = lang.t('form.pos.collect.onlinePayment.cancelPayment.voidTransaction')
                  break
                case 'w':
                  labelMessage = lang.t('form.pos.collect.onlinePayment.cancelPayment.title')
                  break
                case 'E':
                case 'R':
                  labelMessage = lang.t('form.pos.collect.onlinePayment.cancelPayment.deletePayment')
                  break
                default:
                  labelMessage = lang.t('form.pos.collect.onlinePayment.cancelPayment.title')
                  break
              }
              return labelMessage
            },
            isTypeButton: () => {
              const paymentOnline = getters.getCurrentPayment({ paymentId: payment.id })
              let typeButton
              switch (paymentOnline.status) {
                case 'w':
                  typeButton = 'warning'
                  break
                case 'A':
                case 'E':
                case 'R':
                  typeButton = 'danger'
                  break
                default:
                  typeButton = 'warning'
                  break
              }
              return typeButton
            },
            isSvgButton: () => {
              const paymentOnline = getters.getCurrentPayment({ paymentId: payment.id })
              let svg
              switch (paymentOnline.status) {
                case 'w':
                  svg = 'warning'
                  break
                case 'A':
                  svg = 'return-send'
                  break
                case 'E':
                case 'R':
                  svg = 'delete'
                  break
                default:
                  svg = 'warning'
                  break
              }
              return svg
            },
            isOptionsCancel: () => {
              return true
            },
            componentPath: () => import('@/components/ADempiere/Form/VPOS2/DialogInfo/verifyPaymentOnline.vue'),
            isShowed: true
          })
        }
        resolve()
      })
    },
    verifyPaymentDiscount({
      getters,
      dispatch
    }, {
      payment
    }) {
      return new Promise(resolve => {
        const listPaymentMethods = getters.getListPaymentMethods
        const currentMethods = listPaymentMethods.find(list => list.id === payment.allocate_payment_id)
        if (currentMethods.is_allows_apply_discount) {
          dispatch('updateCurrentOrder', {
            discount_rate: currentMethods.maximum_discount_allowed,
            isListLine: true
          })
        }
        resolve()
      })
    },
    infoOnlinePayment({
      commit,
      getters
    }, {
      posId,
      paymentId
    }) {
      return new Promise(resolve => {
        const currentPos = getters.getVPOS
        if (isEmptyValue(posId) && !isEmptyValue(currentPos)) posId = currentPos.id
        const existPaymetOnline = getters.getListPayments.find(payment => payment.id === paymentId)
        if (isEmptyValue(existPaymetOnline)) {
          resolve()
          return
        }
        infoOnlinePayment({
          posId: currentPos.id,
          paymentId
        })
          .then(response => {
            const { is_error, message, next_request_time, status } = response
            commit('setCurrentPayment', {
              paymentId,
              infoPayment: {
                status,
                message,
                error: is_error,
                time: next_request_time
              }
            })
            if (status === 'A') {
              if (existPaymetOnline) {
                const updatePayment = getters.getListPayments.map(payments => {
                  if (paymentId === payments.id) {
                    return {
                      ...payments,
                      response_status: status,
                      response_message: 'APROBADA'
                    }
                  }
                  return payments
                })
                commit('setListPayments', updatePayment)
              }
              commit('setShowedModalDialogVPOS', {
                isShowed: false
              })
            }
            resolve(response)
          })
          .catch(error => {
            console.warn(`Info Online Payment: ${error.message}. Code: ${error.code}.`)
            commit('setCurrentPayment', {
              paymentId,
              infoPayment: {
                time: 3000,
                status: 'W',
                error: false,
                message: lang.t('form.pos.collect.onlinePayment.title')
              }
            })
            let message = error.message
            if (!isEmptyValue(error.response) && !isEmptyValue(error.response.data.message)) {
              message = error.response.data.message
            }

            showMessage({
              type: 'error',
              message,
              showClose: true
            })
            resolve({})
          })
      })
    },
    processOnline({
      commit,
      getters
    }, {
      posId,
      payment
    }) {
      return new Promise(resolve => {
        const currentPos = getters.getVPOS
        if (isEmptyValue(posId) && !isEmptyValue(currentPos)) posId = currentPos.id
        processOnlinePayment({
          posId: currentPos.id,
          paymentId: payment.id
        })
          .then(response => {
            const { is_error, message, next_request_time, status } = response
            // commit('setOnline', {
            //   status,
            //   message,
            //   error: is_error,
            //   time: next_request_time
            // })
            commit('setCurrentPayment', {
              paymentId: payment.id,
              infoPayment: {
                status,
                message,
                error: is_error,
                time: next_request_time
              }
            })
            resolve(response)
          })
          .catch(error => {
            console.warn(`Process Online Payment: ${error.message}. Code: ${error.code}.`)
            let message = error.message
            if (!isEmptyValue(error.response) && !isEmptyValue(error.response.data.message)) {
              message = error.response.data.message
            }

            showMessage({
              type: 'error',
              message,
              showClose: true
            })
            resolve({})
          })
      })
    },
    cancelOnline({
      commit,
      getters,
      dispatch
    }, {
      posId,
      payment
    }) {
      return new Promise(resolve => {
        const currentPos = getters.getVPOS
        if (isEmptyValue(posId) && !isEmptyValue(currentPos)) posId = currentPos.id
        cancelOnlinePayment({
          posId: currentPos.id,
          paymentId: payment.id
        })
          .then(response => {
            if (response.is_error) {
              showMessage({
                type: 'error',
                message: `${response.message}. Status: ${response.status}.`,
                showClose: true
              })
            }
            resolve(response)
          })
          .catch(error => {
            console.warn(`Process Online Payment: ${error.message}. Code: ${error.code}.`)
            let message = error.message
            if (!isEmptyValue(error.response) && !isEmptyValue(error.response.data.message)) {
              message = error.response.data.message
            }

            showMessage({
              type: 'error',
              message,
              showClose: true
            })
            resolve({})
          })
      })
    }
  },
  getters: {
    getOpenCollection: (state) => {
      return state.showCollection
    },
    getListPayments: (state) => {
      return state.payments
    },
    getLoadingAddPayment: (state) => {
      return state.isLoadingAddPayment
    },
    getRate: (state) => ({ date }) => {
      return state.currentRate[date] || {}
    },
    getAttributePaymentVerification: (state) => ({
      attribute
    }) => {
      return state.paymentVerification[attribute] || undefined
    },
    getOnline: (state) => {
      return state.online
    },
    getCurrentPayment: (state) => ({ paymentId }) => {
      return state.online[paymentId] || state.onlineEmpty
    },
    getPaymentOnline: (state) => {
      return state.currentPaymentOnline
    }
  }
}

<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A.
  Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-card
    shadow="never"
    :body-style="{ padding: '5px' }"
  >
    <el-form
      :inline="true"
      label-position="top"
      class="form-base"
      @submit.native.prevent="notSubmitForm"
    >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item
            :label="$t('pointOfSales.collection.field.fullPayment')"
            class="form-item-criteria"
            style="margin: 0px;width: 100%;"
            required
          >
            <amount-field
              :value-amount="refundAmount"
              :value-display="refundAmountDisplay"
              :handle-change="updateAmount"
            />
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <payment-methods-field
            :handle-change="changePaymentMethods"
          />
        </el-col>

        <el-col :span="8">
          <currencies-field
            :handle-change="changeCurrency"
          />
        </el-col>

        <!-- Payment Methods (Fields Display Logic) -->
        <el-col v-if="isDisplayFieldPayment('banksAccounts')" :span="8">
          <banks-accounts-field />
        </el-col>

        <!-- <el-col v-if="isDisplayFieldPayment('creditMemo', currentPaymentMethod)" :span="8">
          <credit-memo />
        </el-col> -->

        <!-- <el-col v-if="isDisplayFieldPayment('recipientBank', currentPaymentMethod)" :span="8">
          <recipient-bank />
        </el-col>

        <el-col v-if="isDisplayFieldPayment('issuingBank', currentPaymentMethod)" :span="8">
          <issuing-bank />
        </el-col> -->

        <el-col v-if="isDisplayFieldPayment('Bank')" :span="8">
          <bank />
        </el-col>

        <el-col v-if="isDisplayFieldPayment('BankAccountType', currentPaymentMethod)" :span="8">
          <bankAccount-type />
        </el-col>

        <el-col v-if="isDisplayFieldPayment('Value', currentPaymentMethod)" :span="8">
          <value />
        </el-col>

        <el-col v-if="isDisplayFieldPayment('Description', currentPaymentMethod)" :span="8">
          <description />
        </el-col>

        <el-col v-if="isDisplayFieldPayment('Date', currentPaymentMethod)" :span="8">
          <date />
        </el-col>

        <el-col v-if="isDisplayFieldPayment('Phone', currentPaymentMethod)" :span="8">
          <phone />
        </el-col>

        <el-col
          v-if="isDisplayFieldPayment('AccountNo', currentPaymentMethod)"
          :span="8"
        >
          <account-no />
        </el-col>
      </el-row>
    </el-form>

    <el-row style="text-align: end;padding: 5px 0px;">
      <span class="dialog-footer">
        <el-button
          type="success"
          icon="el-icon-plus"
          class="button-base-icon"
          :disabled="refundAmount <= 0 || isLoadingPay"
          :loading="isLoadingPay"
          @click="addPayment"
        />
      </span>
    </el-row>
  </el-card>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'
// import router from '@/router'

// Component and Mixins
import AmountField from '@/components/ADempiere/Form/VPOS2/MainOrder/OptionLine/editLine/fieldAmount.vue'
import BanksAccountsField from '@/components/ADempiere/FormDefinition/VPOS/Collection/PayRefund/banksAccountsField.vue'
import CurrenciesField from '@/components/ADempiere/Form/VPOS2/Collection/Refund/Field/currencies'
import PaymentMethodsField from '@/components/ADempiere/FormDefinition/VPOS/Collection/PayRefund/paymentMethodsField'
import recipientBank from '@/components/ADempiere/Form/VPOS2/Collection/Refund/Field/recipientBank.vue'
import creditMemo from '@/components/ADempiere/Form/VPOS2/Collection/Refund/Field/creditMemo.vue'
import issuingBank from '@/components/ADempiere/Form/VPOS2/Collection/Refund/Field/issuingBank.vue'
import bankAccountType from '@/components/ADempiere/Form/VPOS2/Collection/Refund/Field/bankAccountType.vue'
import bank from '@/components/ADempiere/Form/VPOS2/Collection/Refund/Field/bank.vue'
import Value from '@/components/ADempiere/Form/VPOS2/Collection/Refund/Field/value'
import description from '@/components/ADempiere/Form/VPOS2/Collection/Refund/Field/description'
import date from '@/components/ADempiere/Form/VPOS2/Collection/Refund/Field/date'
import phone from '@/components/ADempiere/Form/VPOS2/Collection/Refund/Field/phone'
import accountNo from '@/components/ADempiere/Form/VPOS2/Collection/Refund/Field/accountNo'

// Constants
import {
  TENDERTYPE_MobilePaymentInterbank
} from '@/utils/ADempiere/dictionary/form/VPOS/tenderType'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { showMessage } from '@/utils/ADempiere/notification'
import { formatPrice, convertToNumber } from '@/utils/ADempiere/formatValue/numberFormat'
import {
  clearFieldsCollections,
  getCurrencyPayment,
  isDisplayFieldPayment
} from '@/utils/ADempiere/dictionary/form/VPOS'

export default defineComponent({
  name: 'PayRefund',

  components: {
    AmountField,
    bank,
    BanksAccountsField,
    CurrenciesField,
    PaymentMethodsField,
    recipientBank,
    creditMemo,
    issuingBank,
    bankAccountType,
    description,
    accountNo,
    date,
    phone,
    Value
  },

  props: {
    isRefund: {
      type: Boolean,
      default: false
    }
  },

  setup() {
    const isLoadingPay = ref(false)

    const currentPaymentMethod = computed(() => {
      return store.getters.getRefundAttributeField({
        attribute: 'paymentMethod'
      })
    })

    const currentOrder = computed(() => {
      return store.getters.getCurrentOrder
    })

    const currentAccount = computed(() => {
      return store.getters.getRefundAttributeField({
        attribute: 'currentAccount'
      })
    })

    const customerCredits = computed(() => {
      return store.getters.getRefundAttributeField({
        attribute: 'currentCustomerCredist'
      })
    })

    const typeOptions = computed(() => {
      return store.getters.getRefundAttributeField({
        attribute: 'typeOptions'
      })
    })

    const code = computed({
      get() {
        return store.getters.getRefundAttributeField({
          attribute: 'value'
        })
      },
      // setter
      set(value) {
        store.commit('setRefundAttributeField', {
          attribute: 'value',
          value
        })
      }
    })

    const description = computed({
      get() {
        return store.getters.getRefundAttributeField({
          attribute: 'description'
        })
      },
      // setter
      set(value) {
        store.commit('setRefundAttributeField', {
          attribute: 'description',
          value
        })
      }
    })

    const date = computed({
      get() {
        return store.getters.getRefundAttributeField({
          attribute: 'date'
        })
      },
      // setter
      set(value) {
        store.commit('setRefundAttributeField', {
          attribute: 'date',
          value
        })
      }
    })

    const phone = computed({
      get() {
        return store.getters.getRefundAttributeField({
          attribute: 'phone'
        })
      },
      // setter
      set(value) {
        store.commit('setRefundAttributeField', {
          attribute: 'phone',
          value
        })
      }
    })

    const referenceNo = computed({
      get() {
        return store.getters.getRefundAttributeField({
          attribute: 'referenceNo'
        })
      },
      // setter
      set(value) {
        store.commit('setRefundAttributeField', {
          attribute: 'referenceNo',
          value
        })
      }
    })

    date.value = new Date()

    const currentCurrency = computed(() => {
      return store.getters.getRefundAttributeField({
        attribute: 'currencie'
      })
    })

    const currentAmount = computed(() => {
      return Number(store.getters.getRefundAttributeField({
        attribute: 'amount'
      }))
    })

    if (!isEmptyValue(currentOrder.value.open_amount)) {
      store.commit('setRefundAttributeField', {
        attribute: 'amount',
        value: Number(currentOrder.value.refund_amount.value)
      })
      // store.commit('setPayAmount', currentOrder.value.refund_amount.value)
    }

    /**
     * Hangle Change Payment Methods
     * @param {Object} paymentMethods
     */
    function changePaymentMethods(paymentMethods) {
      if (isEmptyValue(paymentMethods)) {
        return
      }
      const currentPaymentMethod = store.getters.getListPaymentMethods.find(list => list.id === paymentMethods)
      const currency = getCurrencyPayment({
        paymentMethods: currentPaymentMethod,
        isRefund: true
      })
      store.commit('setRefundAttributeField', {
        attribute: 'currencie',
        value: currency
      })
      store.commit('setRefundAttributeField', {
        attribute: 'amount',
        value: convertToNumber(currentOrder.value.refund_amount)
      })
      // store.commit('setAvailableCurrencies', currency)
      clearFieldsCollections()
    }

    const refundAmount = computed(() => {
      const {
        refund_amount
      } = currentOrder.value
      if (isEmptyValue(refund_amount)) {
        return 0.00
      }
      const refundValue = store.getters.getRefundAttributeField({
        attribute: 'amount'
      })
      return convertToNumber(refundValue)
    })

    const refundAmountDisplay = computed(() => {
      const {
        price_list
      } = currentOrder.value
      let currencyPayment = price_list.currency
      if (!isEmptyValue(currentCurrency.value)) {
        currencyPayment = currentCurrency.value
      }
      return formatPrice({
        value: refundAmount.value,
        currency: currencyPayment.iso_code
      })
    })

    const currentPos = computed(() => {
      return store.getters.getVPOS
    })

    function updateAmount(amount) {
      // store.commit('setPayAmount', amount)
      store.commit('setRefundAttributeField', {
        attribute: 'amount',
        value: amount
      })
    }

    function validatePaye() {
      const currency = store.getters.getRefundAttributeField({
        attribute: 'currencie'
      })
      store.dispatch('setModalPin', {
        title: lang.t('form.pos.pinMessage.pin') + lang.t('form.pos.collect.overdrawnInvoice.amountLimitOrder'),
        doneMethod: () => {
          isLoadingPay.value = true
          store.dispatch('addPayment', {
            tender_type_code: currentPaymentMethod.value.payment_method.tender_type,
            payment_method_id: currentPaymentMethod.value.payment_method.id,
            allocate_payment_id: currentPaymentMethod.value.id,
            payment_account_date: date.value,
            reference_no: referenceNo.value,
            description: description.value,
            currency_id: currency.id,
            amount: refundAmount.value,
            is_refund: true
          })
            .then(() => {
              isLoadingPay.value = false
            })
        },
        requestedAccess: 'IsAllowsWriteOffAmount',
        requestedAmount: refundAmount.value,
        isShowed: true
      })
    }

    function addPayment() {
      const currency = store.getters.getRefundAttributeField({
        attribute: 'currencie'
      })
      if (isEmptyValue(currency) || currency.id <= 0) {
        showMessage({
          message: lang.t('form.pointOfSales.collection.currencyMandatory'),
          type: 'warning'
        })
        return
      }
      if (isEmptyValue(currentPaymentMethod.value)) {
        showMessage({
          message: lang.t('form.pointOfSales.collection.paymentMethodMandatory'),
          type: 'warning'
        })
        return
      }
      isLoadingPay.value = true
      if (isEmptyValue(currentAccount.value) && typeOptions.value === '2') {
        if (
          !isEmptyValue(currentPaymentMethod.value.payment_method) &&
          isEmptyValue(currentAccount.value) &&
          currentPaymentMethod.value.payment_method.tender_type === TENDERTYPE_MobilePaymentInterbank
        ) {
          const bankId = store.getters.getRefundAttributeField({
            attribute: 'bank'
          })
          let accountNo = store.getters.getRefundAttributeField({
            attribute: 'accountNo'
          })
          const bankAccountType = store.getters.getRefundAttributeField({
            attribute: 'bankAccountType'
          })
          if (isEmptyValue(accountNo)) {
            accountNo = phone.value
          }
          const driverLicense = store.getters.getRefundAttributeField({
            attribute: 'value'
          })
          store.dispatch('newCustomerBankAccount', {
            accountNo,
            driverLicense,
            bankId: bankId.id,
            bankAccountType
          })
            .then((responseCustomer) => {
              store.dispatch('listCustomerBankAccounts', {})
              // const { id, bank_id, customer_id } = responseCustomer
            })
        }
      }
      if (
        !isEmptyValue(currentPos.value.maximum_refund_allowed.value) &&
        Number(currentPos.value.maximum_refund_allowed.value) > 0 &&
        (Number(currentPos.value.maximum_refund_allowed.value) > refundAmount.value && currentPos.value.refund_reference_currency.id === currency.id)
      ) {
        validatePaye()
      }
      if (currentPaymentMethod.value.is_payment_reference) {
        store.dispatch('refundReference', {
          reference_no: referenceNo.value,
          description: description.value,
          amount: String(refundAmount.value),
          source_amount: String(refundAmount.value),
          tender_type_code: currentPaymentMethod.value.payment_method.tender_type,
          currency_id: currency.id,
          customer_id: currentOrder.value.customer.id,
          sales_representative_id: currentOrder.value.sales_representative.id,
          allocate_payment_id: currentPaymentMethod.value.id,
          payment_method_id: currentPaymentMethod.value.payment_method.id,
          payment_account_date: date.value,
          is_refund: true
        })
          .then(() => {
            if (currency.id === store.getters.getVPOS.price_list.currency.id) {
              store.commit('setRefundAttributeField', {
                attribute: 'amount',
                value: currentOrder.value.refund_amount
              })
            } else {
              store.dispatch('findRate', {
                currencyToId: currency.id,
                currencyFromId: store.getters.getVPOS.price_list.currency.id
              })
                .then(response => {
                  const {
                    multiply_rate,
                    divide_rate
                  } = response
                  if (
                    !isEmptyValue(multiply_rate) &&
                    !isEmptyValue(divide_rate)
                  ) {
                    const amountRate = (convertToNumber(multiply_rate) > convertToNumber(divide_rate)) ? multiply_rate : divide_rate
                    const amountConvert = convertToNumber(currentOrder.value.refund_amount) / convertToNumber(amountRate)
                    store.commit('setRefundAttributeField', {
                      attribute: 'amount',
                      value: amountConvert
                    })
                  }
                })
            }
            isLoadingPay.value = false
          })
        return
      }
      store.dispatch('addPayment', {
        reference_no: referenceNo.value,
        description: description.value,
        amount: refundAmount.value,
        tender_type_code: currentPaymentMethod.value.payment_method.tender_type,
        currency_id: currency.id,
        allocate_payment_id: currentPaymentMethod.value.id,
        payment_method_id: currentPaymentMethod.value.payment_method.id,
        payment_account_date: date.value,
        is_refund: true
      })
        .then(() => {
          if (currency.id === store.getters.getVPOS.price_list.currency.id) {
            store.commit('setRefundAttributeField', {
              attribute: 'amount',
              value: currentOrder.value.refund_amount
            })
          } else {
            store.dispatch('findRate', {
              currencyToId: currency.id,
              currencyFromId: store.getters.getVPOS.price_list.currency.id
            })
              .then(response => {
                const {
                  multiply_rate,
                  divide_rate
                } = response
                if (
                  !isEmptyValue(multiply_rate) &&
                  !isEmptyValue(divide_rate)
                ) {
                  const amountRate = (Number(multiply_rate) > Number(divide_rate)) ? multiply_rate : divide_rate
                  const amountConvert = Number(currentOrder.value.refund_amount) / Number(amountRate)
                  store.commit('setRefundAttributeField', {
                    attribute: 'amount',
                    value: amountConvert
                  })
                }
              })
          }
          isLoadingPay.value = false
        })
    }

    function setAmount() {
      const currency = store.getters.getRefundAttributeField({
        attribute: 'currencie'
      })
      if (
        currency.id === store.getters.getVPOS.price_list.currency.id ||
        isEmptyValue(currency)
      ) {
        store.commit('setRefundAttributeField', {
          attribute: 'amount',
          value: currentOrder.value.refund_amount
        })
      } else {
        store.dispatch('findRate', {
          currencyToId: currency.id,
          currencyFromId: store.getters.getVPOS.price_list.currency.id
        })
          .then(response => {
            const {
              multiply_rate,
              divide_rate
            } = response
            if (
              !isEmptyValue(multiply_rate) &&
              !isEmptyValue(divide_rate)
            ) {
              const amountRate = (Number(multiply_rate) > Number(divide_rate)) ? multiply_rate : divide_rate
              const amountConvert = Number(currentOrder.value.refund_amount) / Number(amountRate)
              store.commit('setRefundAttributeField', {
                attribute: 'amount',
                value: amountConvert
              })
            }
          })
      }
    }

    function changeCurrency(currencyId) {
      if (currencyId === currentOrder.value.price_list.currency.id) {
        store.commit('setPayAmount', Number(currentOrder.value.refund_amount))
        updateAmount(Number(currentOrder.value.refund_amount))
        return
      }
      store.dispatch('findRate', {
        currencyToId: currencyId
      })
        .then(response => {
          const {
            multiply_rate,
            divide_rate
          } = response
          if (
            !isEmptyValue(multiply_rate) &&
            !isEmptyValue(divide_rate)
          ) {
            const amountRate = (multiply_rate > divide_rate) ? multiply_rate : divide_rate
            const amountConvert = Number(currentOrder.value.refund_amount) / Number(amountRate)
            store.commit('setPayAmount', amountConvert)
            updateAmount(amountConvert)
          }
        })
    }

    setAmount()

    return {
      currentPos,
      isLoadingPay,
      currentOrder,
      refundAmount,
      refundAmountDisplay,
      code,
      date,
      phone,
      currentAmount,
      typeOptions,
      description,
      referenceNo,
      currentAccount,
      customerCredits,
      currentPaymentMethod,
      addPayment,
      formatPrice,
      updateAmount,
      changeCurrency,
      changePaymentMethods,
      // TODO: Change with computeds into individual computeds
      isDisplayFieldPayment
    }
  }
})
</script>

<style lang="scss" scoped></style>

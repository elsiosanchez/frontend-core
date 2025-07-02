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
  <el-row>
    <span class="table-reverse">
      <el-table
        id="table-reverse"
        ref="table-reverse"
        :data="lines"
        :border="true"
        height="25vh"
        fit
        highlight-current-row
        style="font-size: 12px !important;"
      >
        <template v-for="(valueOrder, key) in orderLineDefinition">
          <el-table-column
            v-if="displayLabel({ row: valueOrder })"
            :key="key"
            :column-key="valueOrder.columnName"
            :label="valueOrder.label"
            :min-width="sizeTableColumn(valueOrder.columnName)"
            :align="valueOrder.isNumeric ? 'right' : 'left'"
          >
            <template slot-scope="scope">
              <span>
                <p style="margin: 0px !important;">
                  {{ displayValue({ row: scope.row, columnName: valueOrder.columnName}) }}
                </p>
              </span>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </span>
    <el-col
      :span="24"
      style="margin-top: 0px;"
      class="border-info"
    >
      <p class="line-info">
        <b
          style="float: left"
        >
          {{ $t('form.pos.collect.orderTotal') }} {{ '(' + currentOrder.document_no + ')' }}:
        </b>
        <b style="float: right">
          {{ displayAmount(currentOrder.grand_total) }}
        </b>
      </p>
      <p class="line-info">
        <b
          style="float: left"
        >
          {{ $t('form.pos.collect.convertedAmount') }}:
        </b>
        <b style="float: right">
          {{ formatPrice({ value: currentOrder.grand_total_converted, currency: displayCurrency.iso_code}) }}
        </b>
      </p>
    </el-col>
    <el-row :gutter="10">
      <el-col
        v-for="(payment, key) in listPayments"
        :key="key"
        :span="12"
        style="margin: 10px 0px;"
      >
        <card-payments
          :payment="payment"
          :readonly="true"
          :is-reverse="payment.is_online"
          :actions-reverse="reversePayment"
        />
      </el-col>
    </el-row>
    <el-dialog
      width="30%"
      :visible.sync="isShowCancele"
      append-to-body
    >
      <verify-payment-online
        :is-reverse="true"
      />
      <span slot="footer" class="dialog-footer">
        <el-button
          type="danger"
          icon="el-icon-close"
          class="button-base-icon"
          @click="cancelActionMethod(false)"
        />
        <el-button
          type="primary"
          icon="el-icon-check"
          class="button-base-icon"
          :loading="isEmptyValue(isPaymentOnlineComplete)"
          :disabled="isEmptyValue(isPaymentOnlineComplete)"
          @click="cancelActionMethod(false)"
        />
      </span>
    </el-dialog>
  </el-row>
</template>

<script>
import {
  defineComponent,
  computed,
  // watch,
  ref
} from '@vue/composition-api'
import lang from '@/lang'
import store from '@/store'
// Components and Mixins
import MainOrder from '@/components/ADempiere/Form/VPOS2/MainOrder'
import verifyPaymentOnline from '@/components/ADempiere/Form/VPOS2/DialogInfo/verifyPaymentOnline.vue'

// Utils and Helper Methods
import { formatPrice } from '@/utils/ADempiere/formatValue/numberFormat'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import CardPayments from '@/components/ADempiere/Form/VPOS2/Collection/Payments/CardPayments.vue'
import {
  displayLabel,
  displayValue,
  sizeTableColumn
} from '@/utils/ADempiere/dictionary/form/VPOS'

export default defineComponent({
  name: 'cancelSaleTransaction',
  components: {
    verifyPaymentOnline,
    CardPayments,
    MainOrder
  },
  setup() {
    const isLoading = ref(false)
    const isLoadingCancele = ref(false)
    const infoPayment = ref({
      is_error: false,
      next_request_time: 0,
      message: '',
      status: ''
    })
    const isShowCancele = ref(false)

    const lines = computed(() => {
      return store.getters.getListOrderLines
    })
    const isPaymentOnlineComplete = computed(() => {
      if (isEmptyValue(listPayments.value)) return []
      return listPayments.value.filter(list => list.is_online && list.response_status !== 'W')
    })
    const orderLineDefinition = computed(() => {
      return {
        lineDescription: {
          columnName: 'LineDescription',
          label: lang.t('form.pos.tableProduct.product'),
          isNumeric: false,
          size: 'auto'
        },
        currentPrice: {
          columnName: 'CurrentPrice',
          label: lang.t('form.productInfo.price'),
          isNumeric: true,
          size: '150px'
        },
        quantityOrdered: {
          columnName: 'QtyEntered',
          label: lang.t('form.pos.tableProduct.quantity'),
          isNumeric: true,
          size: '125px'
        },
        uom: {
          columnName: 'UOM',
          label: lang.t('form.pos.tableProduct.uom'),
          isNumeric: false,
          size: '75px'
        },
        discount: {
          columnName: 'Discount',
          label: lang.t('form.pos.order.discount'),
          isNumeric: true,
          size: '100px'
        },
        discountTotal: {
          columnName: 'DiscountTotal',
          label: lang.t('form.pos.tableProduct.displayDiscountAmount'),
          isNumeric: true,
          size: '125px'
        },
        discounDisplayTaxIndicator: {
          columnName: 'taxIndicator',
          label: lang.t('form.pos.tableProduct.taxRate'),
          isNumeric: true,
          size: '80px'
        },
        discounDisplayTaxAmounttTotal: {
          columnName: 'DisplayTaxAmount',
          label: lang.t('form.pos.tableProduct.taxAmount'),
          isNumeric: true,
          size: '150px'
        },
        grandTotal: {
          columnName: 'GrandTotal',
          label: 'Total',
          isNumeric: true,
          isVisible: true,
          size: '150px'
        },
        convertedAmount: {
          columnName: 'ConvertedAmount',
          label: lang.t('form.pos.collect.convertedAmount'),
          isNumeric: true,
          size: '150px'
        }
      }
    })
    const currentOrder = computed(() => {
      return store.getters.getCurrentOrder
    })

    const listPayments = computed(() => {
      return store.getters.getListPayments
    })

    const displayCurrency = computed(() => {
      const currency = store.getters.getVPOS.display_currency
      if (currency) return currency
      return {
        iso_code: ''
      }
    })

    const dayRate = computed(() => {
      const rate = store.getters.getRate({ date: currentOrder.value.date_ordered })
      if (isEmptyValue(rate.multiply_rate)) return displayAmount(0.00)
      const {
        multiply_rate,
        divide_rate,
        currency_to
      } = rate
      if (multiply_rate.value > divide_rate.value) return formatPrice({ value: multiply_rate, currency: currency_to.iso_code })
      return formatPrice({ value: divide_rate, currency: currency_to.iso_code })
    })

    function displayAmount(amount) {
      const { price_list } = currentOrder.value
      if (isEmptyValue(price_list)) return amount
      return formatPrice({ value: amount, currency: price_list.currency.iso_code })
    }

    function verifyPaymentOnline(payment) {
      store.commit('setPaymentOnline', payment)
      store.dispatch('processOnline', { payment })
    }

    function reversePayment(payment) {
      isShowCancele.value = true
      // infoOnlinePayment(payment)
      verifyPaymentOnline(payment)
      // isShowCancele.value = !isShowCancele.value
    }

    function cancelActionMethod(show) {
      isShowCancele.value = show
    }
    setTimeout(() => {
      const isExistpaymentOnline = listPayments.value.find(list => list.is_online)
      if (isExistpaymentOnline) {
        isShowCancele.value = true
        // infoOnlinePayment(isExistpaymentOnline)
        verifyPaymentOnline(isExistpaymentOnline)
      }
    }, 500)

    return {
      // Reg
      isLoading,
      isLoadingCancele,
      infoPayment,
      isShowCancele,
      // Computed
      lines,
      dayRate,
      currentOrder,
      listPayments,
      displayCurrency,
      orderLineDefinition,
      isPaymentOnlineComplete,
      formatPrice,
      displayLabel,
      displayValue,
      displayAmount,
      reversePayment,
      sizeTableColumn,
      cancelActionMethod
    }
  }
})
</script>

<style lang="scss" scoped>
.border-info {
  border: 1px solid rgb(54, 163, 247);
  border-radius: 5px;
  margin: 0px;
  padding: 0px 5px;
}
.line-info {
  width: 100%;
  display: flow-root;
  margin: 10px 0px;
}
.table-reverse {
  overflow: auto;
  .el-table {
    overflow: hidden !important;
  }
  .el-table .el-table__cell {
    padding: 0px !important;
    line-height: 1.5 !important;
  }
  .el-table .success-row {
    background: #e8f4ff;
  }
  .el-table .cell {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    line-height: 1.5 !important;
  }
  .el-table .cell:hover {
    border: 1px solid blue;
    overflow: hidden;
  }
  .el-table th.el-table__cell > .cell{
    padding-left: 5px !important;
    padding-right: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
}
</style>

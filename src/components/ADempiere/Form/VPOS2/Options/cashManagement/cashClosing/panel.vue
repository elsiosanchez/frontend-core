<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
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
  <span class="table-pos-dialogo">
    <p
      v-if="!isDetails"
      style="text-align: right"
    >
      <el-checkbox
        v-model="isSeeDetailsPaymentType"
        :label="$t('form.pos.optionsPoinSales.cashManagement.seeDetailsPaymentType')"
        :border="true"
        @change="change"
      />
    </p>
    <el-table
      v-loading="isLoadingTable"
      :data="listCashSummary"
      style="width: 100%"
      height="250"
      border
    >
      <el-table-column
        v-if="isDetails"
        prop="document_no"
        :label="$t('form.expressMovement.field.documentNo')"
      />
      <el-table-column
        v-if="isDetails"
        prop="invoice_document_no"
        :label="$t('form.pos.collect.invoceNr')"
      />
      <el-table-column
        v-if="isDetails"
        prop="order_document_no"
        :label="$t('form.pos.collect.orderNr')"
      />
      <el-table-column
        v-if="isDetails"
        prop="customer.name"
        :label="$t('form.pos.collect.customer')"
      />
      <el-table-column
        v-if="isDetails"
        prop="charge.name"
        width="150"
        :label="$t('pointOfSales.collection.chargeAmount')"
      />
      <el-table-column
        v-if="isDetails"
        prop="collecting_agent.name"
        :label="$t('form.pos.collect.seller')"
      />
      <el-table-column
        :prop="isDetails ? 'payment_method.name' : 'payment_method_name'"
        width="150"
        :label="$t('form.pos.collect.paymentMethod')"
      />
      <el-table-column
        v-if="isDetails || (!isDetails && isSeeDetailsPaymentType)"
        prop="is_refund"
        width="180"
        :label="$t('form.VBankStatementMatch.automaticMatch.table.tenderType')"
      >
        <template slot-scope="scope">
          <b v-if="scope.row.is_refund" style="color: #ff4949">
            {{ $t('form.pos.optionsPoinSales.cashManagement.moneyEgress') }}
          </b>
          <b v-else style="color: #13ce66">
            {{ $t('form.pos.optionsPoinSales.cashManagement.moneyIncome') }}
          </b>
        </template>
      </el-table-column>
      <el-table-column
        prop="currency.iso_code"
        :label="$t('form.pos.collect.Currency')"
      />
      <el-table-column
        label="Monto"
        align="right"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': convertToNumber(scope.row.amount) < 0 }">
            {{ formatPrice({ value: scope.row.amount, currency: scope.row.currency.iso_code}) }}
          </span>
        </template>
      </el-table-column>
    </el-table>
    <p
      v-if="!isEmptyValue(totalMovements) && !isDetails"
    >
      <span>
        <p>
          <b>
            {{ $t('form.pos.optionsPoinSales.cashManagement.totals') }}
          </b>
        </p>
      </span>
      <span
        v-for="(list, key) in totalMovements"
        :key="key"
      >
        <b :class="{ '': true, 'amoutn-negative': convertToNumber(list.total_amount) < 0 }">
          {{ formatPrice({ value: list.total_amount, currency: list.currency.iso_code}) }}
        </b>
        <el-divider v-if="isDisplayBar(key, totalMovements.length)" direction="vertical" />
      </span>
    </p>
  </span>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'
import { formatPrice, convertToNumber } from '@/utils/ADempiere/formatValue/numberFormat'
import store from '@/store'

export default defineComponent({
  name: 'cashClosingPanel',
  setup() {
    const isRefund = ref(false)
    const isLoadingTable = ref(false)
    const isSeeDetailsPaymentType = ref(false)
    const listCashSummary = computed(() => {
      return store.getters.getAttributeCashClosings({
        attribute: 'listSummary'
      })
    })

    const totalMovements = computed(() => {
      return store.getters.getAttributeCashClosings({
        attribute: 'totalMovements'
      })
    })

    const isLoading = computed(() => {
      return store.getters.getAttributeCashClosings({
        attribute: 'isLoading'
      })
    })

    const isDetails = computed(() => {
      return store.getters.getAttributeCashClosings({
        attribute: 'isDetails'
      })
    })

    function change(value) {
      store.dispatch('listCashMovements', {
        isDetailmovementType: value
      })
      isLoadingTable.value = true
      setTimeout(() => {
        isLoadingTable.value = false
      }, 100)
    }

    function isDisplayBar(key, length) {
      return key < (length - 1)
    }

    return {
      isRefund,
      isLoading,
      isDetails,
      isLoadingTable,
      totalMovements,
      listCashSummary,
      isSeeDetailsPaymentType,
      // Methods
      change,
      formatPrice,
      isDisplayBar,
      convertToNumber
    }
  }
})
</script>

<style lang="scss" scoped>
.card-options-buttons {
  cursor: pointer;
  text-align: center !important;
  color: black;
  min-height: 50px;
}
.custom-card-options {
  margin: 1px;
  cursor: pointer;
}
.custom-card-options:hover {
  background-color: #eaf5fe;
  border: 1px solid #36a3f7;
}
.amoutn-negative {
  color: red
}
</style>

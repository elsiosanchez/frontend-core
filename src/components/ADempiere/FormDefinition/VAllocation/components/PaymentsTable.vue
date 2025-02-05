<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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
  <el-table
    id="listPaymentsTable"
    ref="listPaymentsTable"
    v-loading="isLoadingPayments"
    :data="listPayments"
    size="mini"
    height="22vh"
    border
    style="width: 100%;height: 85%;"
    :element-loading-text="$t('notifications.loading')"
    element-loading-background="rgba(255, 255, 255, 0.8)"
    @select="selectionsPayments"
    @select-all="selectionsPaymentsAll"
  >
    <el-table-column
      type="selection"
      :width="35"
    />

    <el-table-column
      align="left"
      :min-width="60"
      :label="$t('form.VAllocation.payment.table.date')"
    >
      <template slot-scope="scope">
        {{ formatDate({ value: scope.row.transaction_date }) }}
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="85"
      :label="$t('form.VAllocation.payment.table.apAr')"
    >
      <template slot-scope="scope">
        {{ scope.row.transaction_type.name }}
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="185"
      :label="$t('form.VAllocation.payment.table.documentType')"
    >
      <template slot-scope="scope">
        {{ scope.row.document_type.name }}
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="130"
      :label="$t('form.VAllocation.payment.table.organization')"
    >
      <template slot-scope="scope">
        {{ scope.row.organization.name }}
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="130"
      :label="$t('form.VAllocation.payment.table.documentNo')"
    >
      <template slot-scope="scope">
        {{ scope.row.document_no }}
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="150"
      :label="$t('form.VAllocation.payment.table.description')"
    >
      <template slot-scope="scope">
        <p
          style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 10px;font-size: 12px;;margin: 0px;"
        >
          <el-popover
            placement="top-start"
            trigger="hover"
            width="300"
          >
            {{ scope.row.description }}
            <p
              slot="reference"
              type="text"
              style="color: #606266;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 10px;font-size: 12px;margin: 0px;"
            >
              {{ scope.row.description }}
            </p>
          </el-popover>
        </p>
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="130"
      :label="$t('form.VAllocation.payment.table.converted')"
    >
      <template slot-scope="scope">
        <span class="cell-align-right">
          {{ formatPrice({ value: scope.row.payment_amount, currency: scope.row.currency.iso_code }) }}
        </span>
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="130"
      :label="$t('form.VAllocation.payment.table.open')"
    >
      <template slot-scope="scope">
        <span class="cell-align-right">
          {{ formatPrice({ value: scope.row.open_amount, currency: scope.row.currency.iso_code }) }}
        </span>
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="250"
      :label="$t('form.VAllocation.payment.table.applied')"
    >
      <template slot-scope="scope">
        <el-input-number
          v-model="scope.row.applied"
          controls-position="right"
          size="mini"
          style="width: 100% !important"
        />
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { defineComponent, ref, computed, watch } from '@vue/composition-api'

import store from '@/store'
// import router from '@/router'

// Utils and Helper Methods
import { isEmptyValue, getTypeOfValue } from '@/utils/ADempiere/valueUtils'
import { formatPrice } from '@/utils/ADempiere/formatValue/numberFormat'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'PaymentsTable',

  setup() {
    const diference = ref(0)
    const sumApplied = computed(() => {
      const sum = selectListAll.value.map(list => list.applied)
      const initialValue = 0
      return sum.reduce((accumulator, currentValue) => accumulator + currentValue, initialValue)
    })

    /**
     * Refs
     */
    const listPaymentsTable = ref(null)

    /**
     * computed
     */
    const isLoadingPayments = computed(() => {
      return store.getters.getIsLoadingPayments
    })
    const listPayments = computed(() => {
      return store.getters.getListVAllocation.payments
    })

    const selectListAll = computed(() => {
      return store.getters.getListSelectInvoceandPayment
    })

    const sumAppliedInvoce = computed(() => {
      const sumInvoce = selectListAll.value.filter(list => {
        return list.type === 'isInvoce'
      }).map(list => {
        const { transaction_type } = list
        if (list.type === 'isInvoce') {
          if (transaction_type.value === 'R') {
            return -(list.amountApplied)
          }
          return list.amountApplied
        }
        return list.applied
      })
      const sumPayment = selectListAll.value.filter(list => {
        return list.type !== 'isInvoce'
      }).map(list => list.applied)
      const initialValue = 0
      const initialValuePayment = 0
      const initialValueAll = 0
      const sumAllInvoce = sumInvoce.reduce((accumulator, currentValue) => accumulator + currentValue, initialValue)
      const sumAllPayments = sumPayment.reduce((accumulator, currentValue) => accumulator + currentValue, initialValuePayment)
      const result = [sumAllPayments, sumAllInvoce].reduce((accumulator, currentValue) => accumulator + currentValue, initialValueAll)
      if (isEmptyValue(sumAllPayments) && !isEmptyValue(sumAllInvoce)) {
        return sumAllInvoce
      } else if (!isEmptyValue(sumPayment) && isEmptyValue(sumAllInvoce)) {
        return sumAllPayments
      }
      return result
    })

    /**
     * Methods
     */
    function selectionsPayments(selection, row) {
      const { isSelect } = row
      if (isSelect) {
        row.applied = 0
        row.isSelect = !isSelect
        removeRowSelect(row)
        return
      }
      row.isSelect = !isSelect
      row.applied = applied(row)
      addRowSelect(row)
    }

    function selectionsPaymentsAll(selection) {
      if (!isEmptyValue(selection)) {
        selection.forEach(row => {
          if (selection.length === listPayments.value.length) {
            row.isSelect = true
            row.applied = applied(row)
            addRowSelect(row)
          }
        })
        return
      }
      listPayments.value.forEach(row => {
        row.isSelect = false
        row.applied = 0
        removeRowSelect(row)
      })
    }

    function setToggleSelection() {
      const isSelectPayments = listPayments.value.filter(list => list.isSelect)
      setTimeout(() => {
        if (!isEmptyValue(listPayments.value) && !isEmptyValue(isSelectPayments)) {
          toggleSelection(isSelectPayments)
        }
      }, 500)
    }

    function toggleSelection(list) {
      if (list) {
        list.forEach(row => {
          listPaymentsTable.value.toggleRowSelection(row)
        })
      } else {
        listPaymentsTable.value.clearSelection()
      }
    }

    function addRowSelect(row) {
      const list = isEmptyValue(selectListAll.value) ? [] : selectListAll.value
      list.push(row)
      store.commit('setListSelectInvoceandPayment', list)
    }

    function removeRowSelect(row) {
      const index = selectListAll.value.findIndex(list => list.id === row.id)
      const list = selectListAll.value
      const listRemove = list.splice(index, 1)
      console.log({ listRemove })
    }

    function applied(row) {
      if (isEmptyValue(selectListAll.value)) {
        return row.open_amount
      }
      if (num(sumAppliedInvoce.value) > 0) {
        if (num(sumAppliedInvoce.value) > num(row.open_amount)) {
          return row.open_amount
        }
        if (Math.sign(sumAppliedInvoce.value) === Math.sign(row.open_amount)) {
          return row.open_amount
        }
        if (row.transaction_type.value === 'P') {
          return -(sumAppliedInvoce.value)
        }
        return sumAppliedInvoce.value
      }
      return row.open_amount
    }

    function num(amount) {
      if (getTypeOfValue(amount) === 'OBJECT') {
        amount = Number(amount.value)
      }
      const math = Math.sign(amount)
      if (math > 0) {
        return amount
      }
      return -(amount)
    }

    /**
     * Watch
     */

    watch(selectListAll, (newValue) => {
      if (newValue) {
        const index = newValue.length
        if (index > 0) {
          diference.value = newValue[index - 1].applied
        } else {
          diference.value = 0
        }
      }
    })

    setToggleSelection()

    return {
      // Let
      diference,
      // Import
      // Refs
      listPaymentsTable,
      // Computed
      sumApplied,
      listPayments,
      selectListAll,
      sumAppliedInvoce,
      isLoadingPayments,
      // Methods
      formatDate,
      formatPrice,
      selectionsPayments,
      selectionsPaymentsAll
    }
  }
})
</script>

<style lang="scss">
.from-wf-panel {
  padding-top: 10px;
  padding-left: 20px;
  padding-right: 20px;
}
.el-input-number {
  .el-input--medium .el-input__inner {
  text-align: end;
  }
}
.panel-top-search-criteria {
  display: flex;
  .el-card__body {
  display: contents;
  padding-top: 0px !important;
  padding-right: 0px !important;
  padding-bottom: 2px !important;
  padding-left: 0px !important;
  height: 100%!important;
  }
}
.el-table .cell {
  word-break: break-all;
  padding-left: 10px;
  padding-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.el-table .cell p {
  line-height: 12px !important
}
.el-table .cell span {
  line-height: 15px !important
}
</style>
<style>
.el-table--scrollable-x .el-table__body-wrapper {
  height: 90%;
  overflow: auto;
}
/* .el-card__header {
padding-top: 5px;
padding-bottom: 0px;
} */
</style>

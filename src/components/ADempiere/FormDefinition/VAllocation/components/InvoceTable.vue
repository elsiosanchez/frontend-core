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
    id="listInvocesTable"
    ref="listInvocesTable"
    v-loading="isLoadingInvoices"
    :data="listInvoces"
    size="mini"
    height="22vh"
    style="width: 100%;height: 85%;"
    border
    :element-loading-text="$t('notifications.loading')"
    element-loading-background="rgba(255, 255, 255, 0.8)"
    @select="selectionInvoces"
    @select-all="selectionInvocesAll"
  >
    <el-table-column
      type="selection"
      fixed="left"
      :width="35"
    />

    <el-table-column
      align="left"
      :min-width="85"
      :label="$t('form.VAllocation.invoice.table.date')"
    >
      <template slot-scope="scope">
        {{ formatDate({ value: scope.row.date_invoiced }) }}
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="85"
      :label="$t('form.VAllocation.invoice.table.apAr')"
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
            {{ scope.row.transaction_type.name }}
            <p
              slot="reference"
              type="text"
              style="color: #606266;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 10px;font-size: 12px;margin: 0px;"
            >
              {{ scope.row.transaction_type.name }}
            </p>
          </el-popover>
        </p>
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="185"
      :label="$t('form.VAllocation.invoice.table.targetDocumentType')"
    >
      <template slot-scope="scope">
        {{ scope.row.target_document_type.name }}
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="130"
      :label="$t('form.VAllocation.invoice.table.organization')"
    >
      <template slot-scope="scope">
        {{ scope.row.organization.name }}
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="130"
      :label="$t('form.VAllocation.invoice.table.documentNo')"
    >
      <template slot-scope="scope">
        {{ scope.row.document_no }}
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="150"
      :label="$t('form.VAllocation.invoice.table.description')"
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
      v-if="isMultiCurrency"
      align="left"
      :min-width="100"
      :label="$t('form.VAllocation.invoice.table.transaction')"
    >
      <template slot-scope="scope">
        <span class="cell-align-right">
          {{ scope.row.currency.iso_code }}
        </span>
      </template>
    </el-table-column>

    <el-table-column
      v-if="isMultiCurrency"
      align="left"
      :min-width="130"
      :label="$t('form.VAllocation.invoice.table.quantity')"
    >
      <template slot-scope="scope">
        <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.original_amount < 0 }">
          {{ formatPrice({ value: scope.row.original_amount, currency: scope.row.currency.iso_code }) }}
        </span>
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="150"
      :label="$t('form.VAllocation.invoice.table.converted')"
    >
      <template slot-scope="scope">
        <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.converted_amount < 0 }">
          {{ formatPrice({ value: scope.row.converted_amount, currency }) }}
        </span>
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="150"
      :label="$t('form.VAllocation.invoice.table.open')"
    >
      <template slot-scope="scope">
        <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.open_amount < 0 }">
          {{ formatPrice({ value: scope.row.open_amount, currency }) }}
        </span>
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="150"
      :label="$t('form.VAllocation.invoice.table.tradeDiscount')"
    >
      <template slot-scope="scope">
        <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.discount_amount < 0 }">
          {{ formatPrice({ value: scope.row.discount_amount, currency }) }}
        </span>
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="150"
      :label="$t('form.VAllocation.invoice.table.writeOff')"
    >
      <template slot-scope="scope">
        <!-- TODO: Service Currency -->
        <el-input-number
          v-model="scope.row.writeOff"
          :precision="2"
          controls-position="right"
          size="mini"
          :class="{ 'custom-field-number': true, 'number-negative': scope.row.writeOff < 0 }"
          style="width: 100% !important;"
        />
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="150"
      :label="$t('form.VAllocation.invoice.table.applied')"
    >
      <template slot-scope="scope">
        <!-- TODO: Service Currency -->
        <el-input-number
          v-model="scope.row.amountApplied"
          controls-position="right"
          :precision="2"
          size="mini"
          :class="{ 'custom-field-number': true, 'number-negative': scope.row.applied < 0 }"
          style="width: 100% !important;"
        />
      </template>
    </el-table-column>

    <el-table-column
      align="left"
      :min-width="180"
      :label="$t('form.VAllocation.invoice.table.overUnderPay')"
    >
      <template slot-scope="scope">
        <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.overUnderPay < 0 }">
          {{ formatPrice({ value: calculateOverUnderPayment(scope.row), currency }) }}
        </span>
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
import { formatPrice, isPositive } from '@/utils/ADempiere/formatValue/numberFormat'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'InvocesTable',

  props: {
    difference: {
      type: [String, Number],
      default: undefined
    }
  },

  setup(props) {
    /**
     * Refs
     */
    const diference = ref(0)
    const listInvocesTable = ref(null)
    const panelInvoce = ref(300)

    /**
     * computed
     */
    const isLoadingInvoices = computed(() => {
      return store.getters.getIsLoadingInvoices
    })
    const selectListAll = computed(() => {
      return store.getters.getListSelectInvoceandPayment
    })
    const listInvoces = computed(() => {
      return store.getters.getListVAllocation.invoce
    })

    const isMultiCurrency = computed(() => {
      return store.getters.getSearchFilter.isMultiCurrency
    })

    // TODO: Change with Currency definition service
    const currency = computed(() => {
      const { listCurrency, currencyId } = store.getters.getSearchFilter
      const currentCurrency = listCurrency.find(list => list.id === currencyId)
      return currentCurrency.label
    })

    const sumApplied = computed(() => {
      const sumInvoce = selectListAll.value.map(list => {
        if (list.type === 'isInvoce') {
          return list.amountApplied
        }
        return list.applied
      })
      const initialValue = 0
      return sumInvoce.reduce((accumulator, currentValue) => accumulator + currentValue, initialValue)
    })

    /**
     * Methods
     */
    function isCellInput(cell) {
      const { columnName } = cell
      let isInput = false
      switch (columnName) {
        case 'writeOff':
          isInput = true
          break
        case 'applied':
          isInput = true
          break
      }
      return isInput
    }

    function selectionInvoces(selection, row) {
      const { isSelect } = row
      if (isSelect) {
        row.applied = 0
        row.isSelect = !isSelect
        row.amountApplied = 0
        removeRowSelect(row)
        return
      }
      row.isSelect = !isSelect
      row.applied = appliedPay(row)
      row.amountApplied = calculateAmountApplied(row)
      addRowSelect(row)
    }

    function calculateAmountApplied(row) {
      if (props.difference === 0) return row.open_amount
      if (
        isPositive(row.open_amount) &&
        !isPositive(props.difference)
      ) {
        return props.difference
      } else if (
        isPositive(row.open_amount) &&
        isPositive(props.difference)
      ) {
        if (row.open_amount > props.difference) {
          return props.difference
        }
      }
      return row.open_amount
    }

    function selectionInvocesAll(selection) {
      if (!isEmptyValue(selection)) {
        selection.forEach(row => {
          if (selection.length === listInvoces.value.length) {
            row.isSelect = true
            row.applied = appliedPay(row)
            row.amountApplied = num(appliedPay(row))
            addRowSelect(row)
          }
        })
        return
      }
      listInvoces.value.forEach(row => {
        row.isSelect = false
        row.applied = 0
        row.amountApplied = 0
        removeRowSelect(row)
      })
    }

    function appliedPay(currentInvoce) {
      const sumPayment = selectListAll.value.filter(list => {
        return list.type !== 'isInvoce'
      })
      if (isEmptyValue(sumPayment)) return currentInvoce.open_amount
      const { open_amount, discount_amount } = currentInvoce
      if (selectListAll.value.length < 1) {
        return open_amount - discount_amount
      }
      if (num(sumApplied.value) <= num(open_amount - discount_amount)) {
        if (num(sumApplied.value) === 0) {
          if (Math.sign(sumApplied.value) < 0) {
            return open_amount - discount_amount
          }
        }
        return sumApplied.value
      }
      return open_amount - discount_amount
    }

    function setToggleSelection() {
      const isSelectInvoces = listInvoces.value.filter(list => list.isSelect)
      setTimeout(() => {
        if (!isEmptyValue(listInvoces.value) && !isEmptyValue(isSelectInvoces)) {
          toggleSelection(isSelectInvoces)
        }
      }, 500)
    }

    function toggleSelection(list) {
      if (list) {
        list.forEach(row => {
          listInvocesTable.value.toggleRowSelection(row)
        })
      } else {
        listInvocesTable.value.clearSelection()
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
      console.log({ listRemove, list })
    }

    function num(amount) {
      if (getTypeOfValue(amount) === 'OBJECT') {
        amount = Number(amount.value)
      }
      const math = Math.sign(amount)
      if (math >= 0) {
        return amount
      }
      return -(amount)
    }

    function calculateOverUnderPayment(row) {
      const { amountApplied, open_amount } = row
      return amountApplied - open_amount
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
      // Refs
      diference,
      sumApplied,
      panelInvoce,
      listInvocesTable,
      // Computed
      currency,
      listInvoces,
      selectListAll,
      isMultiCurrency,
      isLoadingInvoices,
      // Methods
      formatDate,
      isCellInput,
      formatPrice,
      selectionInvoces,
      selectionInvocesAll,
      calculateOverUnderPayment
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
      text-align: right;
    }
  }
  .el-input--mini .el-input__inner {
    text-align: right;
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
    padding-bottom: 5px;
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
  .epale .el-input-number .el-input-number--mini .is-controls-right {
    text-align: right;
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

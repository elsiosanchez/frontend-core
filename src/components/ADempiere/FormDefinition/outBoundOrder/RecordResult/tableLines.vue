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
  <div class="list-lines-table">
    <el-table
      ref="lineTable"
      v-loading="isLoading"
      class="lines-table"
      sise="mini"
      :height="tableHeigth"
      :data="records"
      border
      style="width: 100%;"
      :element-loading-text="$t('notifications.loading')"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      @select="selectionOrder"
    >
      <el-table-column type="selection" />

      <el-table-column
        prop="document_no"
        :label="$t('form.outBoundOrder.lines.documentNo')"
        align="left"
        width="125"
      />
      <el-table-column
        prop="product"
        :label="$t('form.outBoundOrder.lines.product')"
        align="left"
        min-width="300"
      >
        <template slot-scope="scope">
          <p
            style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 14px;font-size: 14px;margin: 0px;"
          >
            <el-popover
              placement="top-start"
              trigger="hover"
              width="300"
            >
              {{ scope.row.product }}
              <p
                slot="reference"
                type="text"
                style="color: #606266;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 15px;font-size: 14px;margin: 0px;"
              >
                {{ scope.row.product }}
              </p>
            </el-popover>
          </p>
        </template>
      </el-table-column>

      <el-table-column
        prop="uom"
        :label="$t('form.outBoundOrder.lines.uom')"
        align="left"
        width="70"
      />

      <el-table-column
        prop="on_hand_quantity"
        :label="$t('form.outBoundOrder.lines.onHandQuantity')"
        align="left"
        width="140"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.on_hand_quantity < 0 }">
            {{ formatQuantity({ value: scope.row.on_hand_quantity }) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="quantity"
        :label="$t('form.outBoundOrder.lines.quantity')"
        align="left"
        width="150"
      >
        <template slot-scope="scope">
          <span v-if="activateField[scope.row.id]">
            <el-input-number
              v-model="scope.row.quantity"
              size="mini"
              controls-position="right"
              style="text-align-last: end !important;"
              @input="handleQuantityChange(scope.row)"
            />
          </span>
          <span v-else :class="{ 'cell-align-right': true, 'number-negative': scope.row.quantity < 0 }">
            {{ scope.row.quantity }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="order_uom"
        :label="$t('form.outBoundOrder.lines.uomOrder')"
        align="left"
        width="115"
      />

      <el-table-column
        prop="weight"
        :label="$t('form.outBoundOrder.header.weight')"
        align="left"
        width="90"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.weight < 0 }">
            {{ formatQuantity({ value: scope.row.weight }) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="volume"
        :label="$t('form.outBoundOrder.header.volume')"
        align="left"
        width="90"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.volume < 0 }">
            {{ formatQuantity({ value: scope.row.volume }) }}
          </span>
        </template>
      </el-table-column>

      <!--
      <el-table-column
        prop="loadSequence"
        :label="$t('form.outBoundOrder.lines.loadSequence')"
        align="left"
        width="160"
      />
      -->

      <el-table-column
        prop="ordered_quantity"
        :label="$t('form.outBoundOrder.lines.orderedQuantity')"
        align="left"
        width="140"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.ordered_quantity < 0 }">
            {{ formatQuantity({ value: scope.row.ordered_quantity }) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="reserved_quantity"
        :label="$t('form.outBoundOrder.lines.reservedQuantity')"
        align="left"
        width="140"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.reserved_quantity < 0 }">
            {{ formatQuantity({ value: scope.row.reserved_quantity }) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="quantity_invoiced"
        :label="$t('form.outBoundOrder.lines.quantityInvoiced')"
        align="left"
        width="140"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.quantity_invoiced < 0 }">
            {{ formatQuantity({ value: scope.row.quantity_invoiced }) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="delivered_quantity"
        :label="$t('form.outBoundOrder.lines.deliveredQuantity')"
        align="left"
        width="140"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.delivered_quantity < 0 }">
            {{ formatQuantity({ value: scope.row.delivered_quantity }) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="quantity_in_transit"
        :label="$t('form.outBoundOrder.lines.quantityInTransit')"
        align="left"
        width="140"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.quantity_in_transit < 0 }">
            {{ formatQuantity({ value: scope.row.quantity_in_transit }) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="delivery_rule"
        :label="$t('form.outBoundOrder.lines.deliveryRule')"
        align="left"
        width="160"
      />
    </el-table>
  </div>
</template>

<script>
import store from '@/store'
import { defineComponent, computed, ref, watch, nextTick } from '@vue/composition-api'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'
import { formatQuantity } from '@/utils/ADempiere/formatValue/numberFormat'

export default defineComponent({
  name: 'TableOrder',

  props: {
    isExpandHeader: {
      type: Boolean,
      default: true
    }
  },

  setup(props) {
    const activateField = ref({})
    const lineTable = ref()

    const isLoading = computed(() => {
      return store.getters.getIsLoadingListDocumentLine
    })

    const records = computed(() => {
      return store.getters.getListDocumentLine
    })

    const tableHeigth = computed(() => {
      if (!props.isExpandHeader) {
        return '58vh'
      }
      return '27vh'
    })

    function selectionOrder(selection) {
      if (!isEmptyValue(selection)) {
        const newActivateField = {}
        selection.forEach(row => {
          newActivateField[row.id] = true
        })
        activateField.value = newActivateField
        store.commit('setRecordsSelection', selection)
      } else {
        activateField.value = false
        store.commit('setRecordsSelection', [])
      }
    }

    function handleQuantityChange(row) {
      const storeRecords = store.getters.getRecordsSelection
      const updatedRecords = storeRecords.map(record => {
        if (row.id === record.id) {
          return {
            ...record,
            quantity: row.quantity
          }
        }
        return record
      })
      store.commit('setRecordsSelection', updatedRecords)
    }

    watch(records, (newRecords) => {
      const selectedRecords = store.getters.getRecordsSelection
      if (selectedRecords && selectedRecords.length > 0) {
        nextTick(() => {
          const newActivateField = {}
          selectedRecords.forEach(row => {
            const record = newRecords.find(r => r.id === row.id)
            if (record) {
              newActivateField[record.id] = true
              lineTable.value.toggleRowSelection(record, true)
            }
          })
          activateField.value = newActivateField
        })
      } else {
        activateField.value = {}
      }
    }, { deep: true })

    return {
      // Ref
      activateField,
      lineTable,
      // Computed
      isLoading,
      records,
      tableHeigth,
      //
      formatDate,
      formatQuantity,
      selectionOrder,
      handleQuantityChange
    }
  }
})
</script>

<style lang="scss">
.list-lines-table {
  th.el-table__cell.is-leaf, .el-table td.el-table__cell {
    padding: 0px !important
  }
  // .el-input--medium .el-input__inner{
  //   height: 25px !important
  // }
}
</style>

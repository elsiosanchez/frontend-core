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
  <el-card class="list-products-table">
    <el-table
      ref="productInfoTable"
      class="products-table"
      sise="mini"
      :data="records"
      height="80vh"
      border
      style="width: 100%"
      :element-loading-text="$t('notifications.loading')"
      element-loading-background="rgba(255, 255, 255, 0.8)"
    >
      <el-table-column
        prop="product"
        :label="$t('form.outBoundOrder.productInfo.product')"
        align="left"
        min-width="200"
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
                style="color: #606266;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 14px;font-size: 14px;margin: 0px;"
              >
                <b>
                  <copy-clipboard
                    :text="scope.row.product_value"
                  />
                  {{ scope.row.product_value }}
                </b>
                -
                {{ scope.row.product }}
              </p>
            </el-popover>
          </p>
        </template>
      </el-table-column>

      <el-table-column
        prop="uom"
        :label="$t('form.outBoundOrder.productInfo.uom')"
        align="left"
        width="80"
      />
      <el-table-column
        prop="warehouse"
        :label="$t('form.outBoundOrder.productInfo.warehouse')"
        align="left"
        width="150"
      />
      <el-table-column
        prop="on_hand_quantity"
        :label="$t('form.outBoundOrder.productInfo.onHandQuantity')"
        align="right"
        header-align="right"
        width="160"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.on_hand_quantity < 0 }">
            {{ formatQuantity({ value: scope.row.on_hand_quantity }) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="quantity_in_transit"
        :label="$t('form.outBoundOrder.productInfo.quantityInTransit')"
        align="right"
        header-align="right"
        width="160"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.quantity_in_transit < 0 }">
            {{ formatQuantity({ value: scope.row.quantity_in_transit }) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="totalQuantityToSet"
        :label="$t('form.outBoundOrder.productInfo.quantity')"
        align="right"
        header-align="right"
        width="160"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.totalQuantityToSet < 0 }">
            {{ formatQuantity({ value: scope.row.totalQuantityToSet }) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="pickedQuantity"
        :label="$t('form.outBoundOrder.productInfo.pickedQuantity')"
        align="right"
        header-align="right"
        width="160"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.quantity_in_transit < 0 }">
            {{ formatQuantity({ value: scope.row.pickedQuantity }) }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script>
import store from '@/store'
import { defineComponent, computed } from '@vue/composition-api'

// Components and Mixins
import CopyClipboard from '@/components/ADempiere/CopyClipboard'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { formatQuantity } from '@/utils/ADempiere/formatValue/numberFormat'

export default defineComponent({
  name: 'InfoPanel',

  components: {
    CopyClipboard
  },

  setup() {
    const records = computed(() => {
      const recordLines = store.getters.getLinesSelection
      if (isEmptyValue(recordLines)) {
        return []
      }
      const recordsGroup = {}
      recordLines.forEach(row => {
        const { product_id } = row
        const onHandQuantity = parseFloat(row.on_hand_quantity)
        const quantityInTransit = parseFloat(row.quantity_in_transit)
        const quantityToSet = parseFloat(row.quantity)
        if (recordsGroup[product_id]) {
          const newQuantity = recordsGroup[product_id].totalQuantityToSet + quantityToSet
          const pickedQty = onHandQuantity - quantityInTransit - newQuantity
          recordsGroup[product_id].totalQuantityToSet = newQuantity
          recordsGroup[product_id].pickedQuantity = pickedQty
        } else {
          const sequence = (Object.keys(recordsGroup).length + 1) * 10
          const pickedQty = onHandQuantity - quantityInTransit - quantityToSet
          recordsGroup[product_id] = {
            ...row,
            totalQuantityToSet: quantityToSet,
            pickedQuantity: pickedQty,
            sequence: sequence
          }
        }
      })

      const productsList = Object.values(recordsGroup)
        .sort((a, b) => {
          return a.sequence > b.sequence
        })
      return productsList
    })

    return {
      records,
      //
      formatQuantity
    }
  }
})
</script>

<style lang="scss">
.list-products-table {
  th.el-table__cell.is-leaf, .el-table td.el-table__cell {
    padding: 2px !important
  }
  // .el-input--medium .el-input__inner{
  //   height: 25px !important
  // }
}
</style>

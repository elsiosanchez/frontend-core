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
  <div>
    <el-table
      ref="listOrderTable"
      v-loading="isLoading"
      class="list-order-table"
      sise="mini"
      height="25vh"
      :data="records"
      border
      style="width: 100%"
      :element-loading-text="$t('notifications.loading')"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      @select="selectionOrder"
      @select-all="selectionOrder"
    >
      <el-table-column type="selection" />

      <!--
      <el-table-column
        prop="warehouse"
        :label="$t('form.outBoundOrder.header.warehouse')"
        align="left"
        width="110"
      />
      -->
      <el-table-column
        prop="document_no"
        :label="$t('form.outBoundOrder.header.documentNo')"
        align="left"
        width="120"
      >
        <template slot-scope="scope">
          <copy-clipboard
            :text="scope.row.document_no"
          />
          {{ scope.row.document_no }}
        </template>
      </el-table-column>

      <el-table-column
        prop="date_ordered"
        :label="$t('form.outBoundOrder.header.dateOrdered')"
        align="left"
        width="150"
      >
        <span slot-scope="scope">
          {{ formatDate({ value: scope.row.date_ordered }) }}
        </span>
      </el-table-column>
      <el-table-column
        prop="date_promised"
        :label="$t('form.outBoundOrder.header.datePromised')"
        align="left"
        width="150"
      >
        <span slot-scope="scope">
          {{ formatDate({ value: scope.row.date_promised }) }}
        </span>
      </el-table-column>
      <el-table-column
        prop="region"
        :label="$t('form.outBoundOrder.header.region')"
        align="left"
        width="110"
      />
      <el-table-column
        prop="city"
        :label="$t('form.outBoundOrder.header.city')"
        align="left"
        width="110"
      />
      <el-table-column
        prop="sales_representative"
        :label="$t('form.outBoundOrder.header.salesRepresentative')"
        align="left"
        width="200"
      />
      <el-table-column
        prop="business_partner"
        :label="$t('form.outBoundOrder.header.businessPartner')"
        align="left"
        min-width="160"
      />

      <el-table-column
        prop="location"
        :label="$t('form.outBoundOrder.header.location')"
        align="left"
        width="180"
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
              {{ scope.row.location }}
              <p
                slot="reference"
                type="text"
                style="color: #606266;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;line-height: 14px;font-size: 14px;margin: 0px;"
              >
                {{ scope.row.location }}
              </p>
            </el-popover>
          </p>
        </template>
      </el-table-column>

      <!--
      <el-table-column
        prop="address1"
        :label="$t('form.outBoundOrder.header.address1')"
        align="left"
        width="110"
      />
      <el-table-column
        prop="address2"
        :label="$t('form.outBoundOrder.header.address2')"
        align="left"
        width="110"
      />
      <el-table-column
        prop="address3"
        :label="$t('form.outBoundOrder.header.address3')"
        align="left"
        width="110"
      />
      <el-table-column
        prop="address4"
        :label="$t('form.outBoundOrder.header.address4')"
        align="left"
        width="110"
      />
      -->
      <el-table-column
        prop="weight"
        :label="$t('form.outBoundOrder.header.weight')"
        align="left"
        width="100"
      >
        <template slot-scope="scope">
          <span class="cell-align-right">
            {{ formatQuantity({ value: scope.row.weight }) }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="volume"
        :label="$t('form.outBoundOrder.header.volume')"
        align="left"
        width="100"
      >
        <template slot-scope="scope">
          <span class="cell-align-right">
            {{ formatQuantity({ value: scope.row.volume }) }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import store from '@/store'
import { defineComponent, computed, ref, watch, nextTick } from '@vue/composition-api'

// Components and Mixins
import CopyClipboard from '@/components/ADempiere/CopyClipboard'

// Constants
import {
  MOVEMENT_TYPE_SALES_ORDER
} from '@/utils/ADempiere/dictionary/form/WOutBoundOrder'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { formatQuantity } from '@/utils/ADempiere/formatValue/numberFormat'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'TableOrder',

  components: {
    CopyClipboard
  },

  setup() {
    const listOrderTable = ref()

    const isLoading = computed(() => {
      return store.getters.getIsLoadingListDocument
    })

    const records = computed(() => {
      return store.getters.getListDocument
    })

    function selectionOrder(selection) {
      const {
        organizationId, movementTypeId, warehouseId,
        salesRegionId, salesRepresentativeId, documentTypeId
      } = store.getters.getSearchFilterGenerateOrder

      let movementType = movementTypeId
      if (isEmptyValue(movementTypeId)) {
        movementType = MOVEMENT_TYPE_SALES_ORDER
      }
      if (!isEmptyValue(selection)) {
        const recordsId = selection.map(data => data.id)
        store.dispatch('searchListDocumentLine', {
          organizationId,
          movementTypeId: movementType,
          warehouseId,
          recordsId: recordsId,
          salesRegionId,
          salesRepresentativeId,
          documentTypeId
        })
      } else {
        store.dispatch('searchListDocumentLine', {
          organizationId,
          movementTypeId: movementType,
          warehouseId,
          recordsId: -1,
          salesRegionId,
          salesRepresentativeId,
          documentTypeId
        })
        store.commit('setRecordsSelection', [])
      }
    }

    watch(records, (newRecords) => {
      const selectedRecords = store.getters.getRecordsId
      if (selectedRecords && selectedRecords.length > 0) {
        nextTick(() => {
          selectedRecords.forEach(row => {
            const record = newRecords.find(r => r.id === row)
            if (record) {
              listOrderTable.value.toggleRowSelection(record, true)
            }
          })
        })
      }
    }, { deep: true })

    return {
      listOrderTable,
      //
      isLoading,
      records,
      //
      selectionOrder,
      //
      formatDate,
      formatQuantity
    }
  }
})
</script>

<style>
.list-order-table  th.el-table__cell.is-leaf, .el-table td.el-table__cell {
  padding: 0px !important
}
</style>

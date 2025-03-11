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
  <div class="list-headers-table">
    <el-table
      ref="headerTable"
      v-loading="isLoading"
      class="headers-table"
      sise="mini"
      height="25vh"
      :data="records"
      border
      style="width: 100%"
      :element-loading-text="$t('notifications.loading')"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      @select="handleSelectionHeader"
      @select-all="handleSelectionHeader"
    >
      <el-table-column type="selection" />
      <el-table-column
        prop="document_no"
        :label="$t('form.outBoundOrder.header.documentNo')"
        align="left"
        width="125"
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
      <el-table-column
        prop="weight"
        :label="$t('form.outBoundOrder.header.weight')"
        align="left"
        width="100"
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
        width="100"
      >
        <template slot-scope="scope">
          <span :class="{ 'cell-align-right': true, 'number-negative': scope.row.volume < 0 }">
            {{ formatQuantity({ value: scope.row.volume }) }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import store from '@/store'
import {
  defineComponent, computed, ref, onMounted, watch
} from '@vue/composition-api'

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
  name: 'TableHeader',

  components: {
    CopyClipboard
  },

  setup() {
    const headerTable = ref(null)

    const isLoading = computed(() => {
      return store.getters.getIsLoadingListDocument
    })

    const selectedRecordsId = computed(() => {
      return store.getters.getHeaderRecordsId
    })

    const records = computed(() => {
      return store.getters.getListDocument
    })

    function handleSelectionHeader(selection) {
      const {
        organizationId, movementTypeId
      } = store.getters.getSearchFilterGenerateOrder

      let movementType = movementTypeId
      if (isEmptyValue(movementTypeId)) {
        movementType = MOVEMENT_TYPE_SALES_ORDER
      }

      const recordsId = selection.map(data => data.id)
      store.commit('setRecordsId', recordsId)

      if (!isEmptyValue(selection)) {
        store.dispatch('searchListDocumentLine', {
          organizationId,
          movementTypeId: movementType,
          recordsId: recordsId
        })
      } else {
        store.dispatch('searchListDocumentLine', {
          movementTypeId: movementType,
          recordsId: -1
        })
      }
    }
    function toggleSelection() {
      if (isEmptyValue(headerTable.value)) {
        return
      }

      headerTable.value.clearSelection()

      if (isEmptyValue(selectedRecordsId.value)) {
        return
      }

      records.value.forEach(row => {
        if (selectedRecordsId.value.includes(row.id)) {
          headerTable.value.toggleRowSelection(row, true)
        }
      })
    }
    onMounted(() => {
      toggleSelection()
    })

    watch(records, () => {
      setTimeout(() => {
        toggleSelection()
      }, 0)
    }, { deep: true })

    return {
      headerTable,
      //
      isLoading,
      records,
      //
      handleSelectionHeader,
      //
      formatDate,
      formatQuantity
    }
  }
})
</script>

<style lang="scss">
.list-headers-table {
  .th.el-table__cell.is-leaf, .el-table td.el-table__cell {
    padding: 0px !important
  }
}
</style>

<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
  Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
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
  <span>
    <el-dropdown
      v-if="!isEmptyValue(printFormatsList) || currentTableName === FINANCIAL_REPORT_TABLE_NAME"
      split-button
      size="small"
      trigger="click"
      class="print-button"
      style="margin-left: 8px; padding-right: 9px;"
      @click="printWithFormat"
      @command="handleStartPrintFormat"
    >
      <i
        v-if="!isLoading"
        style="font-size: 21px;"
        class="el-icon-data-analysis"
      />
      <i
        v-else
        style="font-size: 21px;"
        class="el-icon-loading"
      />

      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(printFormat, index) in printFormatsList"
          :key="index"
          :command="printFormat"
          :icon="printFormat.isLegacy ? 'el-icon-document' : 'el-icon-document-add' "
        >
          {{ printFormat.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-button
      v-if="isEmptyValue(printFormatsList)"
      plain
      type="info"
      size="small"
      style="margin: 0px 5px;padding-top: 1px;padding-right: 5px;padding-bottom: 8px;padding-left: 5px;"
      :disabled="isLoading || isEmptyValue(printFormatsList)"
      :loading="isLoading"
      @click="printWithFormat()"
    >
      <i
        v-if="!isLoading"
        style="font-size: 21px;"
        class="el-icon-data-analysis"
      />
      <i
        v-else
        style="font-size: 21px;"
        class="el-icon-loading"
      />
    </el-button>
  </span>
</template>

<script>
import { defineComponent, computed, ref, onMounted } from '@vue/composition-api'

import router from '@/router'
import store from '@/store'

// Constants
import {
  COLUMNNAME_AD_Table_ID, COLUMNNAME_Record_ID
} from '@/utils/ADempiere/constants/systemColumns'
import {
  FINANCIAL_REPORT_TABLE_NAME
} from '@/utils/ADempiere/dictionary/report/financialReport.ts'
import {
  REPORT_VIEWER_TABLE_NAME
} from '@/utils/ADempiere/dictionary/report'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { getContextAttributes } from '@/utils/ADempiere/contextUtils/contextAttributes'

export default defineComponent({
  name: 'PrintFormatsButton',

  props: {
    parentUuid: {
      type: [String, Number],
      required: false
    },
    containerManager: {
      type: Object,
      required: true
    },
    tabAttributes: {
      type: Object,
      default: () => ({})
    }
  },

  setup(props) {
    /**
     * Ref
     */
    const isLoading = ref(false)

    /**
     * Const
     */
    const containerUuid = props.tabAttributes.uuid

    /**
     * Computed
     */
    const relatedColumsNames = computed(() => {
      let relatedColumns = []
      const parentColumns = props.tabAttributes.fieldsList
        .filter(fieldItem => {
          return fieldItem.is_parent || fieldItem.is_key || fieldItem.is_mandatory
        })
        .map(fieldItem => {
          return fieldItem.columnName
        })

      if (!isEmptyValue(props.tabAttributes.parent_column_name)) {
        relatedColumns = relatedColumns.push(props.tabAttributes.parent_column_name)
      }
      relatedColumns = relatedColumns.concat(parentColumns).sort()
      return relatedColumns
    })

    const currentTableName = computed(() => {
      if (isEmptyValue(props.tabAttributes.table) || isEmptyValue(props.tabAttributes.table.table_name)) {
        return props.tabAttributes.table_name
      }
      return props.tabAttributes.table.table_name
    })

    const recordId = computed(() => {
      const { containerUuid, table_name, table } = props.tabAttributes
      const getRecordId = store.getters.getIdOfContainer({
        containerUuid: containerUuid,
        tableName: table_name
      })
      if (isEmptyValue(getRecordId) && !isEmptyValue(table.key_columns)) {
        return store.getters.getIdKeyColumnsOfContainer({
          containerUuid: containerUuid,
          key_column: table.key_columns.at()
        })
      }
      return getRecordId
    })

    const printFormatsList = computed(() => {
      return store.getters.getPrintFormatsListTableName(currentTableName.value)
    })

    /**
     * Methods
     */
    const selectionsList = computed(() => {
      if (props.containerManager.getSelection) {
        return props.containerManager.getSelection({
          containerUuid: containerUuid
        })
      }
      return []
    })

    function printWithFormat() {
      // store.commit('setIsLoadingDialog', false)

      // set context values
      const parentValues = getContextAttributes({
        parentUuid: props.parentUuid,
        containerUuid: containerUuid,
        contextColumnNames: relatedColumsNames.value
      })
      parentValues.push({
        columnName: COLUMNNAME_AD_Table_ID,
        value: props.tabAttributes.table.internal_id
      })
      parentValues.push({
        columnName: COLUMNNAME_Record_ID,
        value: recordId.value
      })
      // store.dispatch('updateValuesOfContainer', {
      //   containerUuid: process.uuid,
      //   attributes: parentValues
      // })

      // if (!isEmptyValue(selectionsList) && !isEmptyValue(selectionsList.value) && selectionsList.value.length > 1) {
      //   store.commit('setViewDialog', true)
      // }
      const firstPrintFormat = printFormatsList.value.at()
      handleStartPrintFormat(firstPrintFormat)
    }

    function handleStartPrintFormat(command) {
      store.dispatch('printViewByTable', {
        printFormatId: command.id,
        tableName: currentTableName.value,
        recordId: recordId.value,
        isSummary: true
      })
        .then(reportResponse => {
          const {
            // id,
            name,
            instance_id
          } = reportResponse
          router.push({
            path: `/report-viewer-engine/table/${currentTableName.value}/${command.id}/${command.uuid}`,
            name: REPORT_VIEWER_TABLE_NAME,
            params: {
              tableName: currentTableName.value,
              printFormatId: command.id,
              printFormatUuid: command.uuid,
              instanceUuid: currentTableName.value,
              fileName: name,
              name: name
              // menuParentUuid,
            },
            query: {
              tableName: currentTableName.value,
              recordId: recordId.value,
              printFormatId: command.id,
              printFormatUuid: command.uuid,
              instanceUuid: instance_id,
              fileName: name,
              name: name
            }
          }, () => {})
        })
      // }
    }

    function loadPrintFormats() {
      store.dispatch('listPrintFormatWindow', {
        tableName: currentTableName.value
      })
    }

    onMounted(() => {
      if (isEmptyValue(printFormatsList.value)) {
        loadPrintFormats()
      }
    })

    return {
      // Ref
      isLoading,
      // Const
      FINANCIAL_REPORT_TABLE_NAME,
      selectionsList,
      containerUuid,
      // Computed
      recordId,
      printFormatsList,
      currentTableName,
      // Methods
      printWithFormat,
      handleStartPrintFormat
    }
  }
})
</script>

<style lang="scss">
.print-button {
  &.el-dropdown {
    .el-button {
      padding-top: 3px;
      color: #909399;
      padding-bottom: 3px;
      background: #f4f4f5;
      border-color: #d3d4d6;

      &:hover {
        // as button success without plain
        background: #909399;
        border-color: #909399;
        color: #fff;
      }
    }
  }
}
</style>

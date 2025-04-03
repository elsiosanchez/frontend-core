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
      v-if="!isEmptyValue(reportsLists) || currentTableName === FINANCIAL_REPORT_TABLE_NAME"
      size="small"
      trigger="click"
      class="print-button"
      split-button
      style="margin-left: 8px; padding-right: 9px;"
      @click="printProcess"
      @command="handleCommandActions"
    >
      <svg-icon
        v-if="!isLoading"
        style="font-size: 21px;"
        icon-class="print"
      />
      <i
        v-else
        style="font-size: 21px;"
        class="el-icon-loading"
      />

      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(reportItem, index) in reportsLists"
          :key="index"
          :command="reportItem"
          :icon="reportItem.isLegacy ? 'el-icon-document' : 'el-icon-document-add' "
        >
          {{ reportItem.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-button
      v-if="isEmptyValue(reportsLists)"
      plain
      type="info"
      size="small"
      style="margin-left: 5px;padding-top: 1px;padding-right: 5px;padding-bottom: 8px;padding-left: 5px;"
      :disabled="isLoading || isEmptyValue(process) || !process.is_report || isEmptyValue(reportsLists)"
      :loading="isLoading"
      @click="printProcess()"
    >
      <svg-icon
        v-if="!isLoading"
        style="font-size: 21px;"
        icon-class="print"
      />
      <i
        v-else
        style="font-size: 21px;"
        class="el-icon-loading"
      />
    </el-button>

    <dialog-legacy
      :table-name="currentTableName"
      :process="process"
      :record-id="recordId"
      :container-uuid="containerUuid"
    />
  </span>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import language from '@/lang'
import store from '@/store'
import router from '@/router'

// Constants
import {
  COLUMNNAME_AD_Table_ID, COLUMNNAME_Record_ID
} from '@/utils/ADempiere/constants/systemColumns'
import {
  FINANCIAL_REPORT_TABLE_NAME
} from '@/utils/ADempiere/dictionary/report/financialReport.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { showMessage } from '@/utils/ADempiere/notification.js'
import { getContextAttributes } from '@/utils/ADempiere/contextUtils/contextAttributes'
import {
  generateReportOfWindow
} from '@/utils/ADempiere/dictionary/window'

// Components and Mixins
import DialogLegacy from '@/components/ADempiere/Report/Data/Dialog.vue'
import { mergeArrays } from '@/utils/ADempiere/formatValue/iterableFormat'

export default defineComponent({
  name: 'PrintProcess',

  components: {
    DialogLegacy
  },

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

  setup(props, { root }) {
    /**
     * Ref
     */
    const isLoading = ref(false)

    /**
     * Const
     */
    const containerUuid = props.tabAttributes.uuid
    const { process } = props.tabAttributes
    const currentRoute = router.app._route
    let instanceUuid
    if (currentRoute.params && currentRoute.params.instanceUuid) {
      instanceUuid = currentRoute.params.instanceUuid
    }
    /**
     * Computed
     */
    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(props.containerUuid)
    })

    const selectionsList = computed(() => {
      if (props.containerManager.getSelection) {
        return props.containerManager.getSelection({
          containerUuid: containerUuid
        })
      }
      return []
    })

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
      return store.getters.getIdOfContainer({
        containerUuid,
        tableName: currentTableName.value
      })
    })

    const reportsListsByTable = computed(() => {
      const list = store.getters.getListProcess({
        tableName: currentTableName.value
      })
      if (isEmptyValue(list)) {
        return []
      }
      const listReport = list.filter(reportItem => {
        return reportItem.is_report
      })
      if (isEmptyValue(listReport)) {
        return []
      }
      return listReport
    })

    const reportsListsByFields = computed(() => {
      const fieldsList = props.tabAttributes.fieldsList
      if (isEmptyValue(fieldsList)) {
        return []
      }
      const listReport = fieldsList
        .filter(fieldItem => {
          return fieldItem.process_id > 0 &&
            fieldItem.process.is_report
        })
        .map(fieldItem => {
          return fieldItem.process
        })
      if (isEmptyValue(listReport)) {
        return []
      }
      return listReport
    })

    const reportsLists = computed(() => {
      const tabProcess = []
      if (!isEmptyValue(process) && process.is_report) {
        tabProcess.push(process)
      }

      const allReports = mergeArrays(
        'uuid',
        tabProcess,
        reportsListsByTable.value,
        reportsListsByFields.value
      )
      return allReports
    })

    /**
     * Methods
     */

    function printProcess() {
      store.commit('setIsLoadingDialog', false)
      if (isEmptyValue(process)) {
        showMessage({
          message: language.t('process.whithoutAssociatedReport'),
          type: 'info'
        })
        return
      }

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
      store.dispatch('updateValuesOfContainer', {
        containerUuid: process.uuid,
        attributes: parentValues
      })

      if (!isEmptyValue(selectionsList.value) && selectionsList.value.length > 1) {
        store.commit('setViewDialog', true)
      } else {
        if (isEmptyValue(process)) {
          showMessage({
            message: language.t('process.whithoutAssociatedReport'),
            type: 'info'
          })
          return
        }
        isLoading.value = true
        store.dispatch('runReport', {
          containerUuid: process.uuid,
          reportId: process.internal_id,
          //
          recordId: recordId.value,
          tableName: currentTableName.value
        })
          .finally(() => {
            isLoading.value = false
          })
      }
    }

    function handleCommandActions(action) {
      generateReportOfWindow.generateReportOfWindow({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        // containerManager: props.containerManager,
        // recordUuid: recordUuid.value,
        uuid: action.uuid
      })
    }

    return {
      // Ref
      isLoading,
      // Const
      process,
      FINANCIAL_REPORT_TABLE_NAME,
      selectionsList,
      containerUuid,
      // Computed
      recordId,
      recordUuid,
      instanceUuid,
      reportsLists,
      reportsListsByTable,
      reportsListsByFields,
      currentTableName,
      // Methods
      printProcess,
      // loadProcessData,
      handleCommandActions
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

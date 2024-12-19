<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
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
  <span
    v-if="isRowChangeEdited"
    key="field-component"
  >
    <field-definition
      key="field-definition"
      v-shortkey="shortkey"
      :container-uuid="containerUuid"
      :container-manager="containerManager"
      :is-data-table="true"
      :is-show-label="false"
      :in-table="true"
      :metadata-field="{
        ...fieldAttributes,
        rowIndex: scope.$index,
        rowUid: dataRow.rowUid,
        recordUuid: dataRow.UUID
      }"
      size="mini"
      size-field-input="mini"
      @keyup.native.enter="actionKeyEnter(fieldAttributes)"
      @shortkey="keyboardShortcuts"
    />
  </span>

  <span v-else key="cell-info">
    <cell-display-info
      key="info-value"
      :class="cellCssClass"
      :field-attributes="fieldAttributes"
      :data-row="dataRow"
    />
  </span>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'
import store from '@/store'
import router from '@/router'
import language from '@/lang'
// Components and Mixins
import CellDisplayInfo from '@/components/ADempiere/DataTable/Components/CellDisplayInfo.vue'
import FieldDefinition from '@/components/ADempiere/FieldDefinition/index.vue'

// Constants
import { BINARY_DATA, BUTTON, IMAGE } from '@/utils/ADempiere/references'
import { LOG_COLUMNS_NAME_LIST } from '@/utils/ADempiere/constants/systemColumns'

// Utils and Helpers Methods
import {
  isEmptyValue
  // setRecordPath
} from '@/utils/ADempiere/valueUtils'
import { refreshRecord } from '@/utils/ADempiere/dictionary/window'
import { showMessage } from '@/utils/ADempiere/notification'

export default defineComponent({
  name: 'CellEditInfo',

  components: {
    CellDisplayInfo,
    FieldDefinition
  },

  props: {
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      required: true
    },
    fieldAttributes: {
      type: Object,
      required: true
    },
    containerManager: {
      type: Object,
      required: true
    },
    scope: {
      type: Object,
      default: () => {}
    },
    dataRow: {
      type: Object,
      default: () => {}
    },
    tableName: {
      type: String,
      default: () => ''
    }
  },

  setup(props, { root }) {
    const isReadOnly = computed(() => {
      return props.containerManager.isReadOnlyColumn({
        field: props.fieldAttributes,
        row: props.dataRow
      })
    })

    const shortkey = computed(() => {
      return {
        send: ['ctrl', 'enter'],
        exit: ['esc']
      }
    })

    const isRowChangeEdited = computed(() => {
      if ([BINARY_DATA.id, BUTTON.id, IMAGE.id].includes(props.fieldAttributes.display_type)) {
        return false
      }
      if (props.dataRow.isEditRow && !isReadOnly.value) {
        return props.dataRow.isEditRow
      }
      if (!isEmptyValue(props.parentUuid)) {
        return false
      }
      if (!props.dataRow.isSelectedRow) {
        return false
      }
      if (props.dataRow.isEditRow && !isReadOnly.value) {
        return true
      }
      return false
    })

    const cellTable = computed(() => {
      return props.dataRow
    })

    /**
     * Css class style
     */
    const cellCssClass = computed(() => {
      let classCss = ' cell-info-edit '
      if (isReadOnly.value) {
        classCss += ' cell-no-edit '
      }
      return classCss
    })

    const emptyMandatoryFields = computed(() => {
      return store.getters.getTabFieldsEmptyMandatory({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        formatReturn: false
      }).filter(itemField => {
        // omit send to server (to create or update) columns manage by backend
        return itemField.is_always_updateable ||
          !LOG_COLUMNS_NAME_LIST.includes(itemField.columnName)
      }).map(itemField => {
        return itemField.name
      })
    })

    const tabAttributes = computed(() => {
      return store.getters.getStoredTab(props.parentUuid, props.containerUuid)
    })

    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(props.containerUuid)
    })

    const currentRouter = root._route

    const recordId = computed(() => {
      const { table } = tabAttributes.value
      const { key_columns, table_name } = table
      const { query } = currentRouter
      const currentReccord = store.getters.getTabCurrentRow({
        containerUuid: tabAttributes.value.containerUuid
      })
      let id = -1
      if (!isEmptyValue(currentReccord[table_name + '_ID'])) {
        id = currentReccord[table_name + '_ID']
      }
      if (isEmptyValue(id) && !isEmptyValue(key_columns)) {
        const keyIndex = key_columns.length - 1
        id = currentReccord[key_columns.at(keyIndex)]
      }
      if (isEmptyValue(id) && !isEmptyValue(query) && !isEmptyValue(query.recordId)) {
        id = query.recordId
      }
      return id
    })

    function isRowCanBeEdited(record) {
      if (!record.isSelectedRow) {
        return false
      }
      if (!isReadOnly.value) {
        return false
      }
      return record.isEditRow
    }

    function exitEdit(record) {
      record.isEditRow = !record.isEditRow
    }

    function enterEdit(record) {
      record.isEditRow = !record.isEditRow
      props.containerManager.exitEditMode({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        tableName: props.tableName,
        recordUuid: record.UUID
      })
    }

    function actionKeyEnter(params) {
      const { currentTab } = store.getters.getContainerInfo
      const emptyMandatory = emptyMandatoryFields.value.join(', ')
      if (!isEmptyValue(emptyMandatory)) {
        showMessage({
          message: language.t('notifications.mandatoryFieldMissing') + emptyMandatory,
          type: 'info'
        })
        return
      }

      const info = {
        fieldsList: currentTab.fieldsList,
        option: language.t('actionMenu.save')
      }

      store.dispatch('fieldListInfo', { info })
      const currentRoute = router.app._route
      const recordUuid = store.getters.getUuidOfContainer(currentTab.containerUuid)
      const currentReccord = store.getters.getTabCurrentRow({
        containerUuid: currentTab.containerUuid
      })
      let recordId = -1
      if (!isEmptyValue(currentReccord[currentTab.table_name + '_ID'])) recordId = currentReccord[currentTab.table_name + '_ID']
      store.dispatch('flushPersistenceQueue', {
        parentUuid: currentTab.parentUuid,
        containerUuid: currentTab.containerUuid,
        tabId: currentTab.internal_id,
        tableName: currentTab.table_name,
        recordUuid,
        recordId
      })
        .then(response => {
          const { query } = currentRoute
          let id = query.recordId
          if (!isEmptyValue(response)) id = response.id
          // refresh parent tab on document window
          if (!currentTab.isParentTab) {
            const { firstTabUuid } = currentTab
            const firstTab = store.getters.getStoredTab(
              currentTab.parentUuid,
              firstTabUuid
            )
            if (!isEmptyValue(firstTab) && firstTab.table.is_document) {
              refreshRecord.refreshRecord({
                parentUuid: currentTab.parentUuid,
                containerUuid: firstTabUuid
              })
            }
          }

          recordPath({
            currentRoute,
            recordId: id
          })
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'error'
          })
        })
    }

    function recordPath({
      currentRoute,
      recordId
    }) {
      const {
        name,
        query,
        params
      } = currentRoute
      router.replace({
        name,
        query: {
          ...query,
          recordId,
          filters: []
        },
        params: {
          ...params,
          filters: []
        }
      }, () => {})
    }

    function keyboardShortcuts(event) {
      switch (event.srcKey) {
        case 'exit':
          exitEdit(props.dataRow)
          break

        case 'send':
        default:
          enterEdit(props.dataRow)
          break
      }
    }

    return {
      // computeds
      recordId,
      cellTable,
      recordUuid,
      cellCssClass,
      tabAttributes,
      isRowChangeEdited,
      emptyMandatoryFields,
      // methods
      actionKeyEnter,
      isRowCanBeEdited,
      exitEdit,
      enterEdit,
      keyboardShortcuts,
      shortkey
    }
  }
})
</script>

<style lang="scss">
.cell-info-edit {
  width: 100%;
  display: inline-block;
}

// style in cursor if cell is no edit
.cell-no-edit {
  cursor: not-allowed !important;
}
</style>

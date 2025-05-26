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
  <el-popover
    v-model="isVisibleConfirmDelete"
    placement="top"
    width="485"
  >
    <p style="margin-left: 5px;margin-bottom: 5px;margin-top: 5px;font-size: 18px;">
      <b>
        {{ deleteTitle }}
      </b>
    </p>
    <el-card
      shadow="never"
      :body-style="{ padding: '0px' }"
    >
      <div class="table-options-delete">
        <el-table
          :data="recordsListToDelete"
          :border="true"
          style="width: 100%"
        >
          <el-table-column
            v-for="(fieldAttributes, index) in tabAttributes.identifierColumns"
            :key="index"
            :prop="fieldAttributes.columnName"
            header-align="center"
            label-class-name="header-table"
            width="auto"
          >
            <template slot="header">
              <b>
                {{ fieldAttributes.name }}
              </b>
            </template>
            <template slot-scope="scope">
              <cell-display-info
                key="info-value"
                :class="'cell-delete'"
                :field-attributes="fieldAttributes"
                :data-row="scope.row"
                :style-display="'margin: 0px 10px!important;'"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    <div
      style="text-align: right; margin: 0;margin-top: 5px;"
    >
      <el-button
        type="danger"
        class="button-base-icon"
        icon="el-icon-close"
        @click="isVisibleConfirmDelete = false"
      />
      <el-button
        type="primary"
        class="button-base-icon"
        icon="el-icon-check"
        @click="deleteCurrentRecord()"
      />
    </div>
    <el-button
      slot="reference"
      plain
      size="small"
      type="danger"
      class="undo-changes-button"
    >
      <svg-icon icon-class="delete" />
      <span v-if="!isMobile">
        {{ $t('actionMenu.delete') }}
      </span>
    </el-button>
  </el-popover>
</template>

<script>
import { computed, defineComponent, ref, nextTick, watch } from '@vue/composition-api'

import language from '@/lang'
import store from '@/store'

// Components and Mixins
import CellDisplayInfo from '@/components/ADempiere/DataTable/Components/CellDisplayInfo.vue'

// Utils and Melper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { containerManager } from '@/utils/ADempiere/dictionary/window'
import { deleteRecord } from '@/utils/ADempiere/dictionary/window/actionsMenu'

export default defineComponent({
  name: 'DeleteRecordButton',

  components: {
    CellDisplayInfo
  },

  props: {
    parentUuid: {
      type: [String, Number],
      required: false
    },
    containerUuid: {
      type: [String, Number],
      required: true
    }
  },

  setup(props) {
    const isVisibleConfirmDelete = ref(false)
    const buttonConfirmDelete = ref(null)
    const currentComnad = ref('')
    const title = ref('')
    const okMethod = ref(() => {})

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(props.containerUuid)
    })

    const tabAttributes = computed(() => {
      return store.getters.getStoredTab(props.parentUuid, props.containerUuid)
    })

    // TODO: Evaluate if is required
    const isExistsChanges = computed(() => {
      const persistenceValues = store.getters.getPersistenceAttributesChanges({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        recordUuid: recordUuid.value
      })
      return !isEmptyValue(persistenceValues)
    })

    const isDeleteRecord = computed(() => {
      const { table } = tabAttributes.value
      if (!isEmptyValue(table) && table.is_view) {
        return false
      }
      if (!tabAttributes.value.isShowedTableRecords) {
        // Only single record
        if (isExistsChanges.value) {
          return false
        }
      }
      return deleteRecord.enabled({
        parentUuid: props.parentUuid,
        tabParentIndex: tabAttributes.value.tabParentIndex,
        containerUuid: props.containerUuid
      })
    })

    const selectionsRecords = computed(() => {
      return containerManager.getRecordsList({
        containerUuid: props.containerUuid
      }).filter(i => i.isSelectedRow)
    })

    const recordsListToDelete = computed(() => {
      if (!tabAttributes.value.isShowedTableRecords) {
        const record = store.getters.getTabCurrentRow({
          containerUuid: props.containerUuid
        })
        if (isEmptyValue(record)) {
          return []
        }
        return [
          record
        ]
      }
      return selectionsRecords.value
    })

    const disableTitle = computed(() => {
      let title = language.t('actionMenu.disabledRecord')
      if (tabAttributes.value.isShowedTableRecords) {
        if (!isEmptyValue(recordsListToDelete.value) && recordsListToDelete.value.length > 1) {
          title = language.t('actionMenu.disabledSelectedRecords')
        }
      }
      return title
    })

    const confirmDisableTitle = computed(() => {
      let title = language.t('window.disabledRecord')
      if (tabAttributes.value.isShowedTableRecords) {
        if (!isEmptyValue(recordsListToDelete.value) && recordsListToDelete.value.length > 1) {
          title = language.t('window.disabledSelectedRecords')
        }
      }
      return title
    })

    const deleteTitle = computed(() => {
      let title = language.t('actionMenu.deleteRecord')
      if (tabAttributes.value.isShowedTableRecords) {
        if (selectionsRecords.value.length > 1) {
          title = language.t('actionMenu.deleteSelectedRecords')
        }
      }
      return title
    })

    const confirmDeleteTitle = computed(() => {
      let title = language.t('window.confirmDeleteRecord')
      if (tabAttributes.value.isShowedTableRecords) {
        if (!isEmptyValue(recordsListToDelete.value) && recordsListToDelete.value.length > 1) {
          title = language.t('window.confirmDeleteRecords')
        }
      }
      return title
    })

    function deleteCurrentRecord() {
      const info = {
        fieldsList: tabAttributes.value.fieldsList,
        option: language.t('actionMenu.delete')
      }
      store.dispatch('fieldListInfo', { info })

      const recordId = store.getters.getIdOfContainer({
        containerUuid: tabAttributes.value.containerUuid,
        tableName: tabAttributes.value.table_name
      })

      deleteRecord.deleteRecord({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        recordUuid: recordUuid.value,
        recordId
      })
      isVisibleConfirmDelete.value = false
    }

    function focusConfirmDelete() {
      if (buttonConfirmDelete.value) {
        nextTick(() => {
          // TODO: Doesn't work, focus confirm button with displayed popover.
          // buttonConfirmDelete.value.$el.focus()
        })
      }
    }
    function disableCurrentRecord() {
      if (tabAttributes.value.isShowedTableRecords && !isEmptyValue(selectionsRecords.value)) {
        store.dispatch('disabledSelectedRecorsFromWindow', {
          parentUuid: props.parentUuid,
          containerUuid: props.containerUuid,
          activate: false
        })
        isVisibleConfirmDelete.value = false
        return
      }
      const info = {
        fieldsList: tabAttributes.value.fieldsList,
        option: language.t('actionMenu.delete')
      }
      store.dispatch('fieldListInfo', { info })
    }

    function handleCommandActions(command) {
      if (command === 'deleteRecord') {
        title.value = confirmDeleteTitle.value
        okMethod.value = deleteCurrentRecord
      } else if (command === 'disabledRecord') {
        title.value = confirmDisableTitle.value
        okMethod.value = disableCurrentRecord
      }
      currentComnad.value = command
      isVisibleConfirmDelete.value = true
    }

    watch(recordsListToDelete, (newValue, oldValue) => {
      if (currentComnad.value === 'deleteRecord') {
        title.value = confirmDeleteTitle.value
      } else if (currentComnad.value === 'disabledRecord') {
        title.value = confirmDisableTitle.value
      }
    })

    watch(recordsListToDelete, (newValue, oldValue) => {
      if (currentComnad.value === 'deleteRecord') {
        title.value = confirmDeleteTitle.value
      } else if (currentComnad.value === 'disabledRecord') {
        title.value = confirmDisableTitle.value
      }
    })

    watch(
      () => tabAttributes.value.isShowedTableRecords,
      (newIsShowedTableRecords, oldIsShowedTableRecords) => {
        if (currentComnad.value === 'deleteRecord') {
          title.value = confirmDeleteTitle.value
        } else if (currentComnad.value === 'disabledRecord') {
          title.value = confirmDisableTitle.value
        }
      }
    )

    return {
      isVisibleConfirmDelete,
      buttonConfirmDelete,
      title,
      okMethod,
      //
      isDeleteRecord,
      tabAttributes,
      isMobile,
      recordsListToDelete,
      selectionsRecords,
      deleteTitle,
      confirmDeleteTitle,
      disableTitle,
      confirmDisableTitle,
      // Methods
      deleteCurrentRecord,
      focusConfirmDelete,
      disableCurrentRecord,
      handleCommandActions
    }
  }
})
</script>

<style lang="scss">
.delete-record-container {
  &.el-dropdown {
    .el-button {
      // as button success with plain
      background: #f8eeee;
      color: #ff1e1e;
      border-color: #eba1a1;

      &:hover {
        // as button success without plain
        background: #ff1e1e;
        border-color: #ff1e1e;
        color: #fff;
      }
    }
  }
}
.table-options-delete {
  height: 100%;
  overflow: auto;
  .el-table {
    height: 100% !important;
    overflow: hidden !important;
  }
  .el-table .el-table__cell {
    padding: 0px !important;
    line-height: 1.5 !important;
  }
  .el-table .success-row {
    background: #e8f4ff;
  }
  .el-table .cell {
    padding: 0px !important;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    line-height: 1.5 !important;
  }
  .el-table .cell:hover {
    border: 1px solid blue;
    overflow: hidden;
  }
  .el-table th.el-table__cell > .cell{
    padding-left: 5px !important;
    padding-right: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
  .header-table {
    padding: 0px !important;
    background: #f5f7fa;
  }
}
.header-table {
  padding: 0px !important;
  background: #f5f7fa;
}
</style>

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
  <div class="el-dropdown" style="padding: 0px">
    <el-dropdown
      size="small"
      trigger="click"
      class="options-batch-container"
      @command="runAction"
    >
      <el-button
        plain
        size="small"
        type="primary"
      >
        <svg-icon
          icon-class="more-vertical"
        />
        {{ $t('actionMenu.actions') }}
        <i
          class="el-icon-arrow-down el-icon--right"
        />
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(action, index) in listActions"
          v-show="!action.displayed || (action.displayed && action.displayed({
            parentUuid,
            containerUuid
          }))"
          :key="index"
          :command="action"
          :disabled="!action.enabled({
            root: $root,
            parentUuid,
            containerUuid,
            uuid: action.uuid,
            containerId: action.containerId,
            containerManager
          })"
          :divided="true"
        >
          <svg-icon
            v-if="action.isSvgIcon || action.svg === true"
            :icon-class="action.icon"
            class="size-icon"
          />
          <i
            v-else
            :class="action.icon"
            style="font-size: 18px"
          />
          {{ action.name }}
        </el-dropdown-item>
        <el-dropdown-item
          divided
          command="disabledRecord"
        >
          <svg-icon icon-class="disabled" class="size-icon" />
          {{ disableTitle }}
        </el-dropdown-item>
        <el-dropdown-item
          divided
          command="deleteRecord"
        >
          <svg-icon icon-class="delete" class="size-icon" />
          {{ deleteTitle }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-popover
      v-model="isVisibleConfirmDelete"
      placement="top"
      width="485"
    >
      <p style="margin-left: 5px;margin-bottom: 5px;margin-top: 5px;font-size: 18px;">
        <b>
          {{ $t(title) }}
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
          @click="handleSubmit()"
        />
      </div>
      <el-button slot="reference" type="text" style="padding: 0;" />
    </el-popover>
  </div>
</template>

<script>
import { computed, defineComponent, ref, nextTick } from '@vue/composition-api'

import language from '@/lang'
import router from '@/router'
import store from '@/store'

// Components and Mixins
import CellDisplayInfo from '@/components/ADempiere/DataTable/Components/CellDisplayInfo.vue'

// Utils and Melper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { containerManager } from '@/utils/ADempiere/dictionary/window'
import { deleteRecord } from '@/utils/ADempiere/dictionary/window/actionsMenu'
import { refreshRecord, refreshRecords } from '@/utils/ADempiere/dictionary/window/actionsMenu'

export default defineComponent({
  name: 'OptionsBatch',

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
    },
    containerManager: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    const isVisibleConfirmDelete = ref(false)
    const buttonConfirmDelete = ref(null)
    const currentComnad = ref('')
    const title = ref('')

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(props.containerUuid)
    })

    const tabAttributes = computed(() => {
      return store.getters.getStoredTab(props.parentUuid, props.containerUuid)
    })

    const recordId = computed(() => {
      const { containerUuid, table_name, table } = tabAttributes.value
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

    const currentRoute = router.app._route
    let instanceUuid
    if (currentRoute.params && currentRoute.params.instanceUuid) {
      instanceUuid = currentRoute.params.instanceUuid
    }

    const listActions = computed(() => {
      return store.getters.getStoredActionsMenu({ containerUuid: props.containerUuid })
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
      return containerManager.getSelection({
        containerUuid: props.containerUuid
      })
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
        if (selectionsRecords.value.length > 1) {
          title = language.t('actionMenu.disabledSelectedRecords')
        }
      }
      return title
    })

    const confirmDisableTitle = computed(() => {
      let title = language.t('actionMenu.disabledRecord')
      if (tabAttributes.value.isShowedTableRecords) {
        if (selectionsRecords.value.length > 1) {
          title = language.t('actionMenu.disabledSelectedRecords')
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
        if (selectionsRecords.value.length > 1) {
          title = language.t('window.confirmDeleteRecords')
        }
      }
      return title
    })

    function deleteCurrentRecord() {
      if (selectionsRecords.value.length > 1) {
        store.dispatch('deleteSelectedRecordsFromWindow', {
          parentUuid: props.parentUuid,
          containerUuid: props.containerUuid
        })
        isVisibleConfirmDelete.value = false
        return
      }

      const info = {
        fieldsList: tabAttributes.value.fieldsList,
        option: language.t('actionMenu.delete')
      }
      store.dispatch('fieldListInfo', { info })

      deleteRecord.deleteRecord({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        recordUuid: recordUuid.value,
        recordId: recordId.value
      })
      isVisibleConfirmDelete.value = false
    }

    function handleSubmit() {
      if (title.value === confirmDeleteTitle.value) {
        deleteCurrentRecord()
      } else if (title.value === confirmDisableTitle.value) {
        disableCurrentRecord()
      }
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
      let recordIds = []
      if (!tabAttributes.value.isShowedTableRecords) recordIds = recordId.value
      // if (selectionsRecords.value.length > 1) {
      store.dispatch('disabledSelectedRecorsFromWindow', {
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        recordIds
      })
        .finally(() => {
          isVisibleConfirmDelete.value = false
          if (tabAttributes.value.isShowedTableRecords) {
            refreshRecords.refreshRecords({
              parentUuid: props.parentUuid,
              containerUuid: props.containerUuid
            })
          } else {
            refreshRecord.refreshRecord({
              parentUuid: props.parentUuid,
              containerUuid: props.containerUuid,
              recordUuid: recordUuid.value,
              recordId: recordId.value
            })
          }
        })
    }

    /**
     * Run selected action
     * @param {object} action
     */
    function runAction(action) {
      if (action === 'deleteRecord') {
        title.value = confirmDeleteTitle.value
        currentComnad.value = action
        isVisibleConfirmDelete.value = true
        return
      }
      if (action === 'disabledRecord') {
        title.value = confirmDisableTitle.value
        currentComnad.value = action
        isVisibleConfirmDelete.value = true
        return
      }
      store.commit('setTabAttributes', tabAttributes.value)
      const { actionName } = action
      if (actionName === 'Moreoptions') {
        return store.commit('setShowMenuMobile', true)
      }
      action[actionName]({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid, // currentTab.value.uuid,
        containerId: action.containerId, // currentTab.value.uuid,
        instanceUuid,
        containerManager: props.containerManager,
        recordUuid: recordUuid.value,
        uuid: action.uuid
      })
    }

    return {
      isVisibleConfirmDelete,
      buttonConfirmDelete,
      title,
      recordId,
      handleSubmit,
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
      listActions,
      // Methods
      runAction,
      deleteCurrentRecord,
      focusConfirmDelete,
      disableCurrentRecord
    }
  }
})
</script>

<style lang="scss">
.options-batch-container {
  &.el-dropdown {
    .el-button {
      // as button success with plain
      color: #1890ff;
      background: #e8f4ff;
      border-color: #a3d3ff;

      &:hover {
        // as button success without plain
        background: #409EFF;
        border-color: #409EFF;
        color: #fff;
      }
    }
  }
}
.options-select-items-danger {
  color: #ff4949;
  background: #ffeded;
  border-color: #ffb6b6;
}
.options-select-items-process {
  color: #909399;
    background: #f4f4f5;
    border-color: #d3d4d6;
}
.size-icon {
  font-size: 18px;
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

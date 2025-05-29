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
  <div
    v-if="!isChangeOptions"
    id="mainBrowseDataTable"
    class="multipleTableBrowser"
    :onLoad="adjustSize()"
    :onresize="setTableHeight()"
  >

    <el-row>
      <el-col :span="24">
        <filter-fields
          :container-uuid="panelMetadata.uuid"
          :fields-list="containerManager.getFieldsList({ containerUuid: panelMetadata.uuid })"
          :fields-to-hidden="containerManager.getFieldsToHidden"
          :filter-manager="containerManager.changeColumnShowedFromUser"
          :showed-manager="containerManager.isDisplayedColumn"
          :is-filter-records="false"
          :in-table="true"
          :container-manager="containerManager"
        />
      </el-col>

      <!-- {{ selectionsList.map(i => i[panelMetadata.keyColumn]) }} -->
    </el-row>

    <el-table
      id="multipleTable"
      ref="multipleTable"
      v-loading="isLoadingDataTable"
      border
      :row-key="keyColumn"
      reserve-selection
      :data="recordsWithFilter"
      size="small"
      :element-loading-text="$t('notifications.loading')"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      :class="tableClass"
      :row-class-name="tableRowClassName"
      :cell-class-name="getColumnStyle"
      :header-cell-style="headerCellStyle"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
      @select="handleSelection"
      @select-all="activateAll"
    >
      <!-- column with the checkbox -->
      <el-table-column
        v-if="isTableSelection"
        type="selection"
        :prop="keyColumn"
        min-width="50"
      />

      <el-table-column
        v-for="(fieldAttributes, key) in headerList"
        :key="key"
        :column-key="fieldAttributes.columnName"
        :prop="String(fieldAttributes.is_read_only)"
        sortable
        :label="fieldAttributes.columnName"
        :sort-by="fieldAttributes.sortByProperty"
        :width="widthColumn(fieldAttributes)"
        :fixed="fieldAttributes.isFixedTableColumn"
      >
        <template slot="header">
          <span v-if="containerManager.isMandatoryColumn(fieldAttributes)" style="color: red">
            *
          </span>
          {{ fieldAttributes.name }}
        </template>

        <template slot-scope="scope">
          <p
            style="margin: 0px; height: 100%; width: 100%; display: block ruby;"
            @click="editCell(scope.row, fieldAttributes)"
          >
            <field-definition
              v-if="isEditing && editingRow === scope.row && !isEmptyValue(editingColumn) && editingColumn.uuid === fieldAttributes.uuid"
              key="field-definition"
              :container-uuid="containerUuid"
              :container-manager="containerManager"
              :is-data-table="true"
              :is-show-label="false"
              :in-table="true"
              :metadata-field="{
                ...fieldAttributes,
                rowIndex: scope.row.$index,
                rowUid: scope.row.rowUid,
                recordUuid: scope.row.UUID
              }"
              size="mini"
              size-field-input="mini"
            />
            <span v-else key="cell-info">
              <cell-display-info
                key="info-value"
                class="cell-info-edit"
                :field-attributes="fieldAttributes"
                :data-row="scope.row"
              />
            </span>
          </p>
        </template>
      </el-table-column>
    </el-table>

    <custom-pagination
      :parent-uuid="parentUuid"
      :container-uuid="containerUuid"
      :container-manager="containerManager"
      :total-records="recordCount"
      :is-showed-selected="true"
      :selection="selectionsLength"
      :page-number="currentPageNumber"
      :page-size="currentPageSize"
      :handle-change-page-number="handleChangePage"
      :handle-change-page-size="handleChangeSizePage"
    />

    <div class="browser-footer" style="margin-top: 10px !important; display: flex; justify-content: space-between; align-items: center">
      <div style="float: left">
        <el-button
          type="success"
          class="button-base-icon"
          icon="el-icon-refresh-right"
          @click="refreshRecord()"
        />
        <el-dropdown
          split-button
          type="primary"
          trigger="click"
          style="margin-left: 10px; font-size: 39px;"
          class="export-button"
          :disabled="!disableExport"
          @click="exportRecords()"
          @command="exportAllRecords"
        >
          <i class="el-icon-download" style="font-size: 27px;" />

          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="onlyRecord" icon="el-icon-download">
              {{ $t('actionMenu.exportSelectedRecords') }}
            </el-dropdown-item>
            <el-dropdown-item command="allRecord" icon="el-icon-download">
              {{ $t('smartBrowser.exportAllRecords.title') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

      <div style="float: right;">
        <el-popover
          v-model="isVisibleConfirmDelete"
          placement="left-start"
          width="450"
        >
          <el-table
            :data="selectionsList"
            border
            style="width: 100%"
          >
            <el-table-column
              v-for="(item, index) in storedPanel.identifierColumns"
              :key="index"
              :prop="item.columnName"
              :label="item.name"
              width="180"
            />
          </el-table>
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
          <el-button
            v-if="currentBrowser.is_deleteable"
            slot="reference"
            plain
            type="danger"
            class="button-base-icon"
            style="margin-right: 10px;"
            :disabled="isEmptyValue(selectionsList)"
          >
            <svg-icon icon-class="delete" />
          </el-button>
        </el-popover>
        <el-button
          plain
          type="info"
          class="button-base-icon"
          @click="clearParameters()"
        >
          <svg-icon icon-class="layers-clear" />
        </el-button>
        <el-button
          type="danger"
          class="button-base-icon"
          icon="el-icon-close"
          @click="closeBrowser()"
        />
        <el-button
          type="primary"
          class="button-base-icon"
          icon="el-icon-check"
          :disabled="!isEnableProcess"
          :title="processDescription"
          @click="runProcess()"
        />
      </div>
    </div>
  </div>

  <loading-view
    v-else
    key="browser-table-loading"
  />
</template>

<script>
import {
  defineComponent, computed, onMounted, onUpdated, ref, watch
} from '@vue/composition-api'

import lang from '@/lang'
import router from '@/router'
import store from '@/store'

// Constants
import { BINARY_DATA, BUTTON, IMAGE } from '@/utils/ADempiere/references'
import { ROWS_OF_RECORDS_BY_PAGE } from '@/utils/ADempiere/tableUtils'

// Components and Mixins
import CustomPagination from '@/components/ADempiere/DataTable/Components/CustomPagination.vue'
import CellDisplayInfo from '@/components/ADempiere/DataTable/Components/CellDisplayInfo.vue'
import CellEditInfo from '@/components/ADempiere/DataTable/Components/CellEditInfo.vue'
import FieldDefinition from '@/components/ADempiere/FieldDefinition/index.vue'
import FilterFields from '@/components/ADempiere/FilterFields/index.vue'
import LoadingView from '@/components/ADempiere/LoadingView/index.vue'

// Utils and Helper Methods
import { isWidthColumn } from '@/utils/ADempiere/references'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showNotification } from '@/utils/ADempiere/notification.js'
import { runProcessOfBrowser } from '@/utils/ADempiere/dictionary/browser/actionsMenu'
import { convertStringToBoolean } from '@/utils/ADempiere/formatValue/booleanFormat'
/**
 * TODO: Reindex with `rowIndex` property when sorting by Column without refreshing records
 */
export default defineComponent({
  name: 'BrowserTable',

  components: {
    CustomPagination,
    FieldDefinition,
    CellDisplayInfo,
    CellEditInfo,
    FilterFields,
    LoadingView
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
    containerManager: {
      type: Object,
      required: true
    },
    panelMetadata: {
      type: Object,
      required: true
    },
    isLoadingDataTable: {
      type: Boolean,
      default: false
    },
    // get the table header
    header: {
      type: Array,
      required: true,
      default: () => []
    },
    dataTable: {
      type: Array,
      default: () => []
    },
    // Show check column from selection row
    isTableSelection: {
      type: Boolean,
      default: true
    }
  },

  setup(props) {
    const panelMain = document.getElementById('mainBrowseDataTable')
    const multipleTable = ref(null)
    const isEditing = ref(true)
    const editingRow = ref(null)
    const editingColumn = ref(null)

    const heightTable = ref()
    const timeOut = ref(null)
    const isChangeOptions = ref(false)
    const heightSize = ref()
    const currentRowSelect = ref({})
    const isVisibleConfirmDelete = ref(false)

    const disableExport = computed(() => {
      return props.containerManager.enableExport({
        containerUuid: props.containerUuid
      })
    })

    const isLoadingDataTale = computed(() => {
      if (props.containerManager && props.containerManager.isLoadedRecords) {
        return !props.containerManager.isLoadedRecords({
          containerUuid: props.containerUuid
        })
      }
      return !isEmptyValue(props.dataTable)
    })

    const currentOption = computed(() => {
      return store.getters.getTableOption(props.containerUuid)
    })

    const keyColumn = computed(() => {
      // if (props.panelMetadata) {
      //   return props.panelMetadata.keyColumn
      // }
      // return undefined
      return 'rowUid'
    })

    const headerList = computed(() => {
      return props.header.filter(fieldItem => {
        if (props.containerManager.isDisplayedColumn(fieldItem)) {
          const isMandatoryGenerated = props.containerManager.isMandatoryColumn(fieldItem)
          const isDisplayedDefault = props.containerManager.isDisplayedDefaultTable({
            ...fieldItem,
            is_mandatory: isMandatoryGenerated
          })
          // madatory, not parent column and without default value to window, mandatory or with default value to others
          if (isDisplayedDefault) {
            return true
          }
          // tableColumnDataType(fieldItem, currentOption.value)
          // showed by user
          return fieldItem.isShowedTableFromUser
        }

        return false
      })
    })

    function widthColumn(fieldAttributes) {
      const { name, display_type } = fieldAttributes
      const size = 12
      let caracter = name.length
      if (isWidthColumn(display_type)) {
        return caracter * size + 100
      }
      if (caracter <= 9) {
        caracter = 10
      }
      return caracter * size
    }

    const selectionsLength = computed(() => {
      return props.containerManager.getSelection({
        containerUuid: props.containerUuid
      }).length
    })

    const currentPageNumber = computed(() => {
      if (props.containerManager.getPageNumber) {
        return parseInt(props.containerManager.getPageNumber({
          containerUuid: props.containerUuid
        }), 10)
      }
      return 1
    })

    const currentPageSize = computed(() => {
      if (props.containerManager.getPageSize) {
        return parseInt(props.containerManager.getPageSize({
          containerUuid: props.containerUuid
        }), 10)
      }
      return ROWS_OF_RECORDS_BY_PAGE
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const selectionsList = computed(() => {
      if (props.containerManager.getSelection) {
        return props.containerManager.getSelection({
          containerUuid: props.containerUuid
        })
      }
      return []
    })

    const recordCount = computed(() => {
      if (props.containerManager.getRecordCount) {
        return props.containerManager.getRecordCount({
          containerUuid: props.containerUuid
        })
      }
      return recordsWithFilter.value.length
    })

    const defaultSize = computed(() => {
      // const main = document.getElementById('multipleTable')
      if (!isEmptyValue(multipleTable.value) &&
        !isEmptyValue(multipleTable.value.$el.clientHeight)) {
        return multipleTable.value.$el.clientHeight
      }
      return 500
    })

    const sizeViewTable = computed(() => {
      if (isMobile.value) {
        return 500
      }
      if (!isEmptyValue(panelMain) && !isEmptyValue(heightSize.value)) {
        return heightSize.value - 400
      }
      return defaultSize.value
    })

    const storedPanel = computed(() => {
      return props.containerManager.getPanel({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      })
    })

    const isCollapse = computed(() => {
      const panel = storedPanel.value
      if (!isEmptyValue(panel)) {
        if (panel.isShowedCriteria) {
          // open criteria
          return true
        }
      }
      // by default criteria if closed
      return false
    })

    // TODO: Add rows visible
    const tableClass = computed(() => {
      let classCss = 'browser-table'
      if (isCollapse.value) {
        classCss += ' browser-criteria-expand'
      } else {
        classCss += ' browser-criteria-collapse'
      }
      return classCss
    })

    const processDescription = computed(() => {
      if (isEmptyValue(props.panelMetadata.process_id) || props.panelMetadata.process_id <= 0) {
        return lang.t('smartBrowser.withoutProcess')
      }
      const browserProcess = store.getters.getProcessOfBrowser(props.panelMetadata.uuid)
      if (isEmptyValue(browserProcess)) {
        return ''
      }
      return browserProcess.description
    })

    const isEnableProcess = computed(() => {
      return runProcessOfBrowser.enabled({
        containerUuid: props.panelMetadata.uuid
      })
    })

    const currentBrowser = computed(() => {
      return store.getters.getStoredBrowser(props.containerUuid)
    })

    /**
     * Select record row
     * @param {object} row
     * @param {string} column
     */
    function handleRowClick(row, column, event) {
      if (!isEmptyValue(column) && column.type === 'selection') {
        return
      }
    }

    /**
     * To confirm edit record row
     * @param {object} row
     * @param {string} column
     */
    function handleRowDblClick(row, column, event) {
      noEditCell(row, column)
    }

    /**
     * custom method to handle change page
     */
    function handleChangePage(pageNumber) {
      props.containerManager.setPageNumber({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        pageNumber,
        pageSize: store.getters.getBrowserPageSize({ containerUuid: props.containerUuid })
      })

      const currentRoute = router.app._route
      router.push({
        name: currentRoute.name,
        query: {
          ...currentRoute.query,
          page: pageNumber
        }
      }, () => {})
    }

    function handleChangeSizePage(pageSize) {
      props.containerManager.setPageSize({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        pageSize,
        pageNumber: 1
      })
    }

    // get table data
    const recordsWithFilter = computed(() => {
      if (props.containerManager && props.containerManager.getRecordsList) {
        return props.containerManager.getRecordsList({
          containerUuid: props.containerUuid
        })
      }
      return props.dataTable
    })

    function handleSelection(selections, rowSelected) {
      let index = 0
      rowSelected.isSelectedRow = !rowSelected.isSelectedRow
      rowSelected.rowSelectedIndex = index++
      rowSelected.isEditRow = rowSelected.isSelectedRow // edit record if is selected

      handleSelectionAll(selections)
    }

    function handleSelectionAll(selections = []) {
      props.containerManager.setSelection({
        containerUuid: props.containerUuid,
        recordsSelected: selections
      })
    }

    function activateAll() {
      let index = 0
      recordsWithFilter.value.forEach((row) => {
        row.isSelectedRow = !row.isSelectedRow
        row.rowSelectedIndex = index++
        row.isEditRow = row.isSelectedRow
      })
      handleSelectionAll(recordsWithFilter.value)
    }

    /**
     * Select or unselect rows
     * USE ONLY MOUNTED
     */
    function toggleSelection(rows = []) {
      if (isEmptyValue(multipleTable.value)) {
        return
      }
      multipleTable.value.clearSelection()
      if (!isEmptyValue(rows)) {
        rows.forEach(row => {
          multipleTable.value.toggleRowSelection(row, true)
        })
      }
    }

    function isSelectDefault() {
      const browser = store.getters.getStoredBrowser(props.containerUuid)
      if (!isEmptyValue(browser)) {
        const { is_selected_by_default } = browser
        if (is_selected_by_default) {
          activateAll()
        }
      }
    }

    /**
     * Handle Cell Click
     * @param {object} row
     * @param {object} column
     * @param {object} cell
     * @param {*} event
     */
    function handleCellClick(row, column, cell, event) {
      row.isEditRow = !row.isEditRow
    }

    function tableRowClassName(params) {
      const recordUuid = store.getters.getUuidOfContainer(props.containerUuid)
      if (params.row.UUID === recordUuid && !isEmptyValue(props.parentUuid) && isEmptyValue(currentRowSelect.value)) {
        return 'success-row'
      }
      return ''
    }

    function adjustSize() {
      if (!isEmptyValue(panelMain) && !isEmptyValue(panelMain.clientHeight)) {
        const size = parseInt(panelMain.clientHeight) / 2
        if (recordsWithFilter.value.length < 5) {
          heightTable.value = 'auto'
          return
        }
        heightTable.value = size
      }
    }

    function setTableHeight() {
      adjustSize()
    }

    function loadSelection() {
      if (!props.isTableSelection) {
        return
      }
      clearTimeout(timeOut.value)
      timeOut.value = setTimeout(() => {
        toggleSelection(selectionsList.value)
      }, 100)
    }
    function refreshRecord() {
      props.containerManager.refreshRecords({
        containerUuid: props.panelMetadata.uuid
      })
    }
    function runProcess() {
      runProcessOfBrowser.runProcessOfBrowser({
        containerUuid: props.panelMetadata.uuid
      })
    }

    function closeBrowser() {
      const currentRoute = router.app._route
      const tabViewsVisited = store.getters.visitedViews
      store.dispatch('tagsView/delView', currentRoute)
      const oldRouter = tabViewsVisited[tabViewsVisited.length - 1]
      router.push({
        path: oldRouter.path
      }, () => {})
    }

    function exportAllRecords() {
      props.containerManager.exportAllRecords({
        containerUuid: props.panelMetadata.uuid
      })
    }
    function exportRecords(command) {
      if (command === 'onlyRecord') {
        props.containerManager.exportOnlyRecords({
          parentUuid: props.parentUuid,
          containerUuid: props.panelMetadata.uuid,
          containerManager: props.containerManager
        })
      }
      if (command === 'allRecord') {
        exportAllRecords()
      }
    }

    function getColumnStyle({
      row,
      column,
      rowIndex,
      columnIndex
    }) {
      const { columnKey } = column
      const currentCell = headerList.value.find(list => list.column_name === columnKey)
      if (
        !isEmptyValue(currentCell)
      ) {
        if ([BINARY_DATA.id, BUTTON.id, IMAGE.id].includes(currentCell.display_type)) {
          return 'highlight'
        }
        if (!currentCell.is_read_only) {
          return ''
        }
      }
      return 'highlight'
    }

    function headerCellStyle(row, column, rowIndex, columnIndex) {
      if (!isEmptyValue(row) && !isEmptyValue(row.column) && !isEmptyValue(row.column.property)) {
        if (convertStringToBoolean(row.column.property) || row.column.property === 'rowUid') {
          return 'background-color: #f4f4f5'
        }
      }
      return ''
    }

    function editCell(row, column) {
      if (!row.isSelectedRow) {
        isEditing.value = false
        return
      }
      const isReadOnlyColumn = props.containerManager.isReadOnlyColumn({
        field: column,
        row
      })
      if (isReadOnlyColumn) {
        isEditing.value = false
        return
      }
      isEditing.value = true
      editingRow.value = row
      editingColumn.value = column
    }
    function noEditCell(row, column) {
      isEditing.value = false
      editingRow.value = null
      editingColumn.value = null
    }

    function clearParameters() {
      store.dispatch('setBrowserDefaultValues', {
        containerUuid: props.panelMetadata.uuid
      })

      const emptyMandatory = store.getters.getBrowserFieldsEmptyMandatory({
        containerUuid: props.panelMetadata.uuid
      })
      if (isEmptyValue(emptyMandatory)) {
        store.dispatch('getBrowserSearch', {
          containerUuid: props.panelMetadata.uuid
        })
      }
    }

    function handleSubmit() {
      if (isEmptyValue(selectionsList.value)) {
        showNotification({
          title: lang.t('data.selectionRequired'),
          type: 'warning'
        })
        return
      }
      store.dispatch('deleteRecordOfBrowser', {
        containerUuid: props.panelMetadata.uuid,
        selection: selectionsList.value
      })
      isVisibleConfirmDelete.value = false
    }

    watch(currentOption, (newValue, oldValue) => {
      isChangeOptions.value = true
      setTimeout(() => {
        isChangeOptions.value = false
      }, 500)
    })

    watch(recordsWithFilter, () => {
      isSelectDefault()
    })

    onUpdated(() => {
      const main = document.getElementById('mainBrowse')
      if (!isEmptyValue(main) &&
        !isEmptyValue(main.clientHeight)) {
        heightSize.value = main.clientHeight
      }
      // loadSelection()
    })

    onMounted(() => {
      // adjustSize()
      // setTableHeight()
      loadSelection()
    })

    return {
      // Refs
      multipleTable,
      timeOut,
      isChangeOptions,
      heightTable,
      heightSize,
      storedPanel,
      //
      isEditing,
      editingRow,
      editingColumn,
      // Computeds
      currentBrowser,
      headerList,
      isLoadingDataTale,
      recordsWithFilter,
      currentOption,
      keyColumn,
      recordCount,
      currentPageNumber,
      currentPageSize,
      selectionsLength,
      defaultSize,
      sizeViewTable,
      tableClass,
      isMobile,
      currentRowSelect,
      disableExport,
      isEnableProcess,
      processDescription,
      selectionsList,
      isVisibleConfirmDelete,
      // Methods
      isSelectDefault,
      editCell,
      noEditCell,
      handleSubmit,
      clearParameters,
      getColumnStyle,
      //
      headerCellStyle,
      setTableHeight,
      adjustSize,
      tableRowClassName,
      handleChangePage,
      handleRowClick,
      handleRowDblClick,
      handleCellClick,
      handleSelection,
      handleSelectionAll,
      loadSelection,
      handleChangeSizePage,
      activateAll,
      widthColumn,
      refreshRecord,
      runProcess,
      closeBrowser,
      exportRecords,
      exportAllRecords
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

.highlight {
  background-color: #f4f4f5;
}

.browser-footer {
  .el-dropdown {
    .el-button-group {
      height: 39px;

      .el-button {
        padding-left: 8px;
        padding-right: 8px;

        &.el-dropdown__caret-button {
          padding-left: 5px;
          padding-right: 5px;
        }
      }
    }
  }
}
.multipleTableBrowser {
  height: 85%;
  .el-table {
    height: 100% !important;

    .success-row {
      background: #e8f4ff;
    }

    // .caret-wrapper {
    //   height: 20px;
    // }
    .cell {
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
      word-break: break-all;
      line-height: 15px;
      padding-left: 10px;
      padding-right: 10px;
    }
  }

  .browser-criteria-collapse {
    .el-table__body-wrapper {
      overflow: auto;
      height: calc(100vh - 365px);
    }
  }
  .browser-criteria-expand {
    .el-table__body-wrapper {
      overflow: auto;
      height: calc(80vh - 450px);
    }
  }
  .el-table thead tr {
    height: 40px!important
  }
  .el-table td.el-table__cell{
    padding: 0 !important
  }
}
</style>

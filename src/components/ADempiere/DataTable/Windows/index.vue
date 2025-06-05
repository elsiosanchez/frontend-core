<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A.
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
    id="mainWindowDataTable"
    class="multipleTableWindow"
    :onLoad="adjustSize()"
    :onresize="adjustSize()"
  >
    <!-- {{ selectionsList.map(i => i[keyColumn]) }} -->
    <el-table
      id="multipleTable"
      ref="multipleTable"
      v-loading="!isLoadingDataTale"
      :border="true"
      :row-key="keyColumn"
      reserve-selection
      :data="recordsList"
      highlight-current-row
      size="small"
      height="500"
      element-loading-background="rgba(255, 255, 255, 0.8)"
      :element-loading-text="$t('notifications.loading')"
      :row-class-name="tableRowClassName"
      style="overflow: auto"
      @row-click="handleRowClick"
      @row-dblclick="handleRowDblClick"
      @select="handleSelection"
      @select-all="handleSelectionAll"
      @sort-change="handleSortChange"
    >
      <span slot="empty" style="width: 100%;">
        <refresh-record-button
          v-show="isLoadRefreshDataTale"
          :parent-uuid="parentUuid"
          :container-uuid="containerUuid"
        />
        <el-empty
          v-show="!isLoadRefreshDataTale"
          :image-size="100"
        />
      </span>

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
        sortable
        :label="fieldAttributes.name"
        :prop="fieldAttributes.columnName"
        :width="widthColumn(fieldAttributes)"
        :column-key="fieldAttributes.columnName"
        :fixed="fieldAttributes.isFixedTableColumn"
      >
        <template slot="header">
          <span v-if="containerManager.isMandatoryColumn(fieldAttributes)" style="color: red">
            *
          </span>
          <span>
            {{ fieldAttributes.name }}
          </span>
        </template>

        <template slot-scope="scope">
          <cell-display-info
            key="info-value"
            :class="classDefaultsCells"
            :field-attributes="fieldAttributes"
            :data-row="scope.row"
            :column-width="columnWidths({ fieldAttributes })"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>

  <loading-view
    v-else
    key="window-table-loading"
  />
</template>

<script>
import {
  defineComponent,
  onBeforeMount,
  onMounted,
  onUpdated,
  computed,
  watch,
  ref,
  nextTick
} from '@vue/composition-api'

import store from '@/store'
import router from '@/router'

// Components and Mixins
import CellDisplayInfo from '@/components/ADempiere/DataTable/Components/CellDisplayInfo.vue'
import FullScreenContainer from '@/components/ADempiere/ContainerOptions/FullScreenContainer/index.vue'
import LoadingView from '@/components/ADempiere/LoadingView/index.vue'
import useFullScreenContainer from '@/components/ADempiere/ContainerOptions/FullScreenContainer/useFullScreenContainer'
import RefreshRecordButton from '@/components/ADempiere/TabManager/convenienceButtons/RefreshRecordButton.vue'

// Utils and Helper Methods
import { isEmptyValue, setRecordPath } from '@/utils/ADempiere/valueUtils.js'
import { isLookup, isDateField, isNumberField, isBooleanField } from '@/utils/ADempiere/references'

export default defineComponent({
  name: 'WindowsTable',

  components: {
    LoadingView,
    CellDisplayInfo,
    FullScreenContainer,
    RefreshRecordButton
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
    },
    isShowSearch: {
      type: Boolean,
      default: true
    },
    isNavigation: {
      type: Boolean,
      default: false
    },
    classDefaultsCells: {
      type: String,
      default: ' cell-info-edit cell-no-edit '
    }
  },

  setup(props) {
    const panelMain = document.getElementById('mainWindowDataTable')
    const multipleTable = ref(null)

    const attributeName = 'isShowedTableRecords'
    const action = 'changeTabAttribute'
    const currentRoute = router.app._route
    const {
      storedWindow
    } = useFullScreenContainer({
      parentUuid: props.parentUuid,
      containerUuid: props.containerUuid
    })

    const heightTable = ref()
    const timeOut = ref(() => {})
    const isChangeOptions = ref(false)
    const heightSize = ref()
    const currentRowSelect = ref({})

    const isLoadingDataTale = computed(() => {
      return store.getters.getIsLoadedTabRecord({
        containerUuid: props.containerUuid
      })
    })

    const isLoadRefreshDataTale = computed(() => {
      return store.getters.getTabData({
        containerUuid: props.containerUuid
      }).isError
    })

    const currentOption = computed(() => {
      return store.getters.getTableOption(props.containerUuid)
    })

    const keyColumn = computed(() => {
      if (props.panelMetadata) {
        return props.panelMetadata.keyColumn
      }
      return undefined
    })

    const headerList = computed(() => {
      return props.header.filter(fieldItem => {
        // if (fieldItem.is_key) {
        //   return true
        // }
        // if (fieldItem.columnName === 'UUID') {
        //   return true
        // }
        if (!props.containerManager.isDisplayedColumn(fieldItem)) {
          return false
        }
        const isMandatoryGenerated = props.containerManager.isMandatoryColumn(fieldItem)
        const isDisplayedDefault = props.containerManager.isDisplayedDefaultTable({
          ...fieldItem,
          isMandatory: isMandatoryGenerated
        })
        // madatory, not parent column and without default value to window, mandatory or with default value to others
        if (isDisplayedDefault) {
          return true
        }
        // showed by user
        return fieldItem.isShowedTableFromUser
      })
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const recordsList = computed(() => {
      if (props.containerManager && props.containerManager.getRecordsList) {
        return props.containerManager.getRecordsList({
          containerUuid: props.containerUuid
        })
      }
      return props.dataTable || []
    })

    const selectionsList = computed(() => {
      if (props.containerManager.getSelection) {
        return props.containerManager.getSelection({
          containerUuid: props.containerUuid
        })
      }
      return []
    })

    const defaultSize = computed(() => {
      const main = document.getElementById('multipleTable')
      if (!isEmptyValue(main) &&
        !isEmptyValue(main.clientHeight)) {
        return main.clientHeight
      }
      return 600
    })

    const sizeViewTable = computed(() => {
      if (isMobile.value) {
        return 500
      }
      if (!isEmptyValue(panelMain) && !isEmptyValue(heightSize.value)) {
        const currentTab = store.getters.getStoredTab(
          props.parentUuid,
          props.containerUuid
        )

        if (!isEmptyValue(currentTab)) {
          if (currentTab.isParentTab) {
            if (storedWindow.value.isFullScreenTabsParent) {
              return heightSize.value - 250
            } else {
              return heightSize.value - 200
            }
          } else {
            if (storedWindow.value.isFullScreenTabsChildren) {
              return heightSize.value - 250
            } else {
              return heightSize.value - 200
            }
          }
        }
      }
      return 'auto'
    })

    const currentRowChildren = computed(() => {
      const currentTab = store.getters.getStoredTab(
        props.parentUuid,
        props.containerUuid
      )
      if (!isEmptyValue(currentTab) && !currentTab.isParentTab) {
        const record = store.getters.getTabCurrentRow({
          containerUuid: props.containerUuid
        })
        return record
      }
      return {}
    })

    /**
     * Handle Selection
     * @param {array} selections
     * @param {object} rowSelected
     */
    function handleSelection(selections, rowSelected) {
      let index = 0
      rowSelected.isSelectedRow = !rowSelected.isSelectedRow
      rowSelected.rowSelectedIndex = index++
      // rowSelected.isEditRow = rowSelected.isSelectedRow // edit record if is selected

      handleSelectionAll(selections)
    }

    /**
     * Handle Selection All
     * @param {object} selections
     */
    function handleSelectionAll(selections = []) {
      props.containerManager.setSelection({
        containerUuid: props.containerUuid,
        recordsSelected: selections
      })
    }

    /**
     * To confirm edit record row
     * @param {object} row
     * @param {string} column
     */
    function handleRowDblClick(row, column) {
      // disable edit mode
      changeTable(false)

      const currentTab = store.getters.getStoredTab(
        props.parentUuid,
        props.containerUuid
      )

      const recordUuid = store.getters.getUuidOfContainer(props.containerUuid)
      if (recordUuid !== row.UUID && currentTab.isParentTab) handleSelectionAll([])

      // if (
      //   props.containerManager.confirmRowChanges &&
      //   row.isSelectedRow &&
      //   row.isEditRow
      // ) {
      //   row.isEditRow = false
      //   props.containerManager.confirmRowChanges({
      //     parentUuid: props.parentUuid,
      //     containerUuid: props.containerUuid,
      //     row
      //   })
      // }
    }

    /**
     * Select record row
     * @param {object} row
     * @param {string} column
     */
    let scrollPosition = 0
    function handleRowClick(row, column, event) {
      const { table_name } = props.panelMetadata
      const currentReccordId = store.getters.getIdOfContainer({ containerUuid: props.containerUuid, tableName: table_name })
      if (currentReccordId === row[table_name + '_ID']) return
      const tableElement = multipleTable.value.$el
      scrollPosition = tableElement.scrollTop
      currentRowSelect.value = row
      if (row.isNewRow || column.type === 'selection') {
        return
      }

      // enable edit mode
      row.isEditRow = true
      row.isSelectedRow = true

      handleSelectionAll([row])
      toggleSelection([row])
      store.dispatch('changeTabAttribute', {
        attributeName: 'currentRowSelect',
        attributeNameControl: undefined,
        attributeValue: row,
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      })
      if (!isEmptyValue(table_name) && !isEmptyValue(row[table_name + '_ID'])) {
        const currentTab = store.getters.getStoredTab(
          props.parentUuid,
          props.containerUuid
        )
        if (currentTab.isParentTab) {
          setRecordPath({
            recordId: row[table_name + '_ID'],
            scrollPosition
          })
        } else {
          setRecordPath({
            recordChildId: row[table_name + '_ID'],
            scrollPosition
          })
        }
      }

      // if (isMobile.value) {
      //   changeTable(false)
      // }
      props.containerManager.seekRecord({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        row
      })
    }

    /**
     * Table Row Class Name
     * @param {object} params
     */
    function tableRowClassName(params) {
      const recordUuid = store.getters.getUuidOfContainer(props.containerUuid)
      if (params.row.UUID === recordUuid && isEmptyValue(currentRowSelect.value)) {
        return 'success-row'
      }
      return ''
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

    function handleSortChange({ prop, order }) {
      const fieldSort = headerList.value.find(fieldItem => {
        return fieldItem.columnName === prop || fieldItem.displayColumnName === prop
      })
      let sortColumn = fieldSort.columnName
      if (isLookup(fieldSort.display_type)) {
        sortColumn = fieldSort.displayColumnName
      }

      let sortType = 'asc' // by default
      if (order === 'descending') {
        sortType = 'desc'
      }
      const sortByClause = `${sortColumn} ${sortType}`
      const filter = store.getters.getTabDataFilters({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      })
      let reference = ''
      if (!isEmptyValue(currentRoute.query) && !isEmptyValue(currentRoute.query.referenceUuid)) {
        reference = currentRoute.query.referenceUuid
      }
      store.dispatch('getEntities', {
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        sortBy: sortByClause,
        filters: filter,
        referenceUuid: reference
      })
    }

    /**
     * Handle Cell Click
     * @param {object} row
     * @param {object} column
     * @param {object} cell
     * @param {*} event
     */
    function handleCellClick(row, column, cell, event) {
      if (column.type === 'selection') {
        let currentSelection = selectionsList.value
        row.isSelectedRow = !row.isSelectedRow
        // row.isEditRow = row.isSelectedRow
        if (row.isSelectedRow) {
          currentSelection.push(row)
        } else {
          currentSelection = currentSelection.filter(rowSelected => row.UUID !== rowSelected.UUID)
        }
        handleSelectionAll(currentSelection)
        toggleSelection(currentSelection)
        return
      // } else {
      //   row.isEditRow = row.isSelectedRow
      }

      const { table_name } = props.panelMetadata
      let currentRowEdit = {
        UUID: ''
      }
      currentRowEdit = recordsList.value.find(records => records.isEditRow)
      if (!isEmptyValue(currentRowEdit) && currentRowEdit.UUID === row.UUID) {
        row.isEditRow = true
        return
      } else {
        const changeAllOthers = recordsList.value.filter(records => row[table_name + '_ID'] !== records[table_name + '_ID'])
        changeAllOthers.forEach(element => {
          element.isEditRow = false
        })
        row.isEditRow = false
        row.isSelectedRow = true
        if (!isEmptyValue(currentRowEdit) && !isEmptyValue(currentRowEdit.UUID)) {
          props.containerManager.exitEditMode({
            parentUuid: props.parentUuid,
            containerUuid: props.containerUuid,
            tableName: table_name,
            recordUuid: currentRowEdit.UUID
          })
        }
      }
    }

    /**
     * Adjust Size
     */
    function adjustSize() {
      if (!isEmptyValue(panelMain) && !isEmptyValue(panelMain.clientHeight)) {
        const size = parseInt(panelMain.clientHeight) / 2
        if (recordsList.value.length < 5) {
          heightTable.value = 'auto'
          return
        }
        heightTable.value = size
      }
    }

    /**
     * Change Table
     * @param {boolean} change
     */
    function changeTable(change) {
      store.dispatch(action, {
        attributeName: attributeName,
        attributeNameControl: undefined,
        attributeValue: change,
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      })
    }

    /**
     * Load Selection
     */
    function loadSelection() {
      if (!props.isTableSelection) {
        return
      }
      clearTimeout(timeOut.value)
      timeOut.value = setTimeout(() => {
        const selections = selectionsList.value
        const records = recordsList.value

        if (!isEmptyValue(selections)) {
          toggleSelection(selections)
        } else {
          const currentRow = getCurrentRow(records)
          if (currentRow) {
            enableEditMode(currentRow)
            const newSelection = [currentRow]
            handleSelectionAll(newSelection)
            toggleSelection(newSelection)
          } else {
            handleLoadRefresh()
          }
        }
      }, 1000)
    }

    function getCurrentRow(records) {
      const recordUuid = store.getters.getUuidOfContainer(props.containerUuid)

      if (!isEmptyValue(recordUuid)) {
        const foundRow = records.find(row => row.UUID === recordUuid)
        if (foundRow) {
          return foundRow
        }
      }
      // Return the first record if no UUID found or if not found
      return records.at(0) || null
    }

    function enableEditMode(row) {
      row.isEditRow = true
      row.isSelectedRow = true
    }

    /**
     * Load Height
     * @param {boolean} newValue
     */

    function loadHeight(newValue) {
      setTimeout(() => {
        changeTable(newValue)
      }, 90)
    }

    function widthColumn(fieldAttributes) {
      const { name, display_type, columnName } = fieldAttributes
      const size = 8
      const lenght = name.length
      if (['C_BPartner_ID', 'C_Project_ID', 'C_BankAccount_ID'].includes(columnName)) {
        return 300
      }
      if (columnName === 'Name') {
        return 350
      }
      if (columnName === 'M_Product_ID') {
        return 400
      }
      const sum = (lenght * size) + 50
      if (isBooleanField(display_type)) {
        if (sum < 140) {
          return 140
        }
      }
      if (isDateField(display_type)) {
        if (sum > 100) {
          return 150
        }
        return 100
      }
      if (isNumberField(display_type)) {
        if (sum > 125) {
          return 160
        }
        return 100
      }
      return sum
    }

    function columnWidths({
      fieldAttributes
    }) {
      if (multipleTable.value) {
        // TODO: Validate performance
        const key = multipleTable.value.$children.findIndex(list => {
          return list.label === fieldAttributes.name
        })
        return multipleTable.value.$children[key].label.length
      }
      return 25
    }

    function scrollToBottom() {
      nextTick(() => {
        const container = multipleTable.value
        const { query } = currentRoute
        if (!isEmptyValue(container) && !isEmptyValue(query.scrollPosition)) {
          multipleTable.value.$el.scrollTop = query.scrollPosition
        }
      })
    }

    /**
     * Load Refresh
     */
    function handleLoadRefresh() {
      const {
        searchValue
      } = store.getters.getTabData({
        containerUuid: props.containerUuid
      })
      if (!isLoadingDataTale.value) {
        return
      }
      if (!isEmptyValue(searchValue)) {
        return
      }
      store.dispatch('getEntities', {
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      })
    }

    /**
     * Watch - watch works directly on a ref
     * @param newValue - New Assessed Property value
     * @param oldValue - Old Assessed Property value
     */
    watch(currentRowChildren, (newValue, oldValue) => {
      if (!isEmptyValue(newValue) && newValue !== oldValue) {
        loadSelection()
      }
    })
    watch(selectionsList, (newValue, oldValue) => {
      if (!isEmptyValue(newValue)) {
        const row = newValue.at()
        if (row.isNewRow) {
          toggleSelection([row])
        }
      }
      // clearTimeout(timeOut.value)
      // timeOut.value = setTimeout(() => {
      //   toggleSelection(newValue)
      //   // loadSelection()
      // }, 100)
    })

    watch(isLoadingDataTale, (newValue, oldValue) => {
      if (selectionsList.value.length > 1) {
        toggleSelection(selectionsList.value)
        return
      }
      // changeTable(!newValue)
      if (newValue) {
        // loadHeight(newValue)
        loadSelection()
      }
    })

    watch(currentOption, (newValue, oldValue) => {
      isChangeOptions.value = true
      setTimeout(() => {
        isChangeOptions.value = false
      }, 500)
    })

    onUpdated(() => {
      const main = document.getElementById('mainWindowDataTable')
      if (!isEmptyValue(main) &&
        !isEmptyValue(main.clientHeight)) {
        heightSize.value = main.clientHeight
      }
      // loadSelection()
    })

    onBeforeMount(() => {
      const main = document.getElementById('mainWindowDataTable')
      if (!isEmptyValue(main) &&
        !isEmptyValue(main.clientHeight)) {
        heightSize.value = main.clientHeight
      }
      // loadSelection()
    })

    /**
     * Mounted
     * Registers a callback to be called after the component has been mounted
     */
    onMounted(() => {
      scrollToBottom()
      loadSelection()
    })
    return {
      // Refs
      multipleTable,
      timeOut,
      isChangeOptions,
      heightTable,
      heightSize,
      // Computeds
      isLoadingDataTale,
      isLoadRefreshDataTale,
      headerList,
      recordsList,
      currentOption,
      keyColumn,
      currentRowChildren,
      currentRowSelect,
      selectionsList,
      sizeViewTable,
      defaultSize,
      isMobile,
      // Methods
      handleSelectionAll,
      tableRowClassName,
      handleRowDblClick,
      handleSortChange,
      handleSelection,
      handleCellClick,
      handleRowClick,
      columnWidths,
      widthColumn,
      changeTable,
      adjustSize,
      loadHeight
    }
  }
})
</script>

<style lang="scss">
.multipleTableWindow {
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
}
</style>

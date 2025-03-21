<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanches@gmail.com www.erpya.com https://github.com/elsiosanchez
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
  <el-container style="height: 100%;" class="tab-panel" :class="{ 'collapsed': collapseWindow }">
    <el-header :style="styleHeadPanel" class="tab-panel-header">
      <tab-options
        :parent-uuid="parentUuid"
        :container-manager="containerManager"
        :current-tab-uuid="currentTabUuid"
        :container-uuid="tabAttributes.uuid"
        :tab-attributes="tabAttributes"
        :is-child-tab="isChildTab"
        :is-change-record="!isShowedTableRecords"
      >
        <template v-slot:convenience-additional-options>
          <el-checkbox
            v-show="!isEmptyValue(batchEntry) && isShowedTableRecords"
            v-model="isBachtEntry"
            :border="true"
            size="small"
            :label="$t('table.dataTable.batchEntry')"
            @change="changeBatchEntry"
          />
        </template>
      </tab-options>

      <filter-fields
        v-if="isShowedTableRecords"
        v-bind="commonFilterFielsProperties"
        :parent-uuid="parentUuid"
        :container-uuid="tabAttributes.uuid"
        :fields-list="containerManager.getFieldsList({ parentUuid, containerUuid: tabAttributes.uuid })"
        :fields-to-hidden="containerManager.getFieldsToHidden"
        :is-filter-records="true"
        :in-table="isShowedTableRecords"
        :container-manager="containerManager"
      />
    </el-header>

    <el-main id="tab-panel-body" class="tab-panel-body">
      <div style="width: 100%;height: 100%;">
        <batch-entry
          v-if="!isEmptyValue(batchEntry) && isShowedTableRecords && isBachtEntry"
          :parent-uuid="parentUuid"
          :container-uuid="tabAttributes.uuid"
          :container-manager="containerManager"
          :field-list-batch-entry="batchEntry"
          :table-name="tabAttributes.table_name"
          :field-list-all="tableHeaders"
        />
        <default-table
          v-show="isShowedTableRecords"
          id="default-table"
          key="default-table"
          :parent-uuid="parentUuid"
          :container-uuid="tabAttributes.uuid"
          :container-manager="containerManager"
          :header="tableHeaders"
          :data-table="recordsList"
          :panel-metadata="tabAttributes"
          :is-navigation="true"
        />
        <panel-definition
          v-show="!isShowedTableRecords"
          key="panel-definition"
          :parent-uuid="parentUuid"
          :container-uuid="tabAttributes.uuid"
          :container-manager="containerManager"
          :group-tab="tabAttributes.tabGroup"
          :style="overflowHeightScrooll"
          :is-tab-panel="true"
          :is-filter-records="true"
        />
      </div>
    </el-main>

    <el-footer :style="styleFooterPanel" class="tab-panel-footer">
      <!-- pagination table, set custom or use default change page method -->
      <custom-pagination
        :parent-uuid="parentUuid"
        :container-uuid="tabAttributes.uuid"
        :container-manager="containerManager"
        :total-records="recordsLength"
        :selection="selectionsLength"
        :page-number="currentPageNumber"
        :page-size="currentPageSize"
        :handle-change-page-number="handleChangePage"
        :handle-change-page-size="handleChangeSizePage"
      />
    </el-footer>
  </el-container>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import router from '@/router'
import store from '@/store'

// Components and Mixins
import BatchEntry from '@/components/ADempiere/DataTable/Components/BatchEntry.vue'
import CustomPagination from '@/components/ADempiere/DataTable/Components/CustomPagination.vue'
import DefaultTable from '@/components/ADempiere/DataTable/Windows/index.vue'
import FilterFields from '@/components/ADempiere/FilterFields/index.vue'
import PanelDefinition from '@/components/ADempiere/PanelDefinition/index.vue'
import TabOptions from '@/components/ADempiere/TabManager/TabOptions.vue'
// Constants
import { ROWS_OF_RECORDS_BY_PAGE } from '@/utils/ADempiere/tableUtils'

// Utils and Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { createNewRecord } from '@/utils/ADempiere/dictionary/window'

export default defineComponent({
  name: 'modeDesktop',

  components: {
    CustomPagination,
    DefaultTable,
    FilterFields,
    PanelDefinition,
    TabOptions,
    BatchEntry
  },

  props: {
    parentUuid: {
      type: String,
      required: false
    },
    containerManager: {
      type: Object,
      required: true
    },
    tabAttributes: {
      type: Object,
      default: () => ({})
    },
    tabsList: {
      type: Array,
      required: true
    },
    allTabsList: {
      type: Array,
      required: true
    },
    actionsManager: {
      type: Object,
      required: true
    },
    // used only window
    isChildTab: {
      type: Boolean,
      default: false
    }
  },

  setup(props, { root }) {
    const activeNames = ref(['0'])

    const isBachtEntry = ref(false)

    const currentTabUuid = props.tabAttributes.uuid

    const overflowHeightScrooll = computed(() => {
      return ''
    })

    const isShowedTableRecords = computed(() => {
      return currentTab.value.isShowedTableRecords
    })

    const currentTab = computed(() => {
      return store.getters.getStoredTab(
        props.parentUuid,
        props.tabAttributes.uuid
      )
    })

    function changeBatchEntry(value) {
      isBachtEntry.value = value
      if (value) {
        store.commit('setisBatchEntry', {
          value: value,
          containerUuid: currentTab.value.firstTabUuid
        })
      }
    }
    const storedWindow = computed(() => {
      return store.getters.getStoredWindow(props.parentUuid)
    })

    const styleHeadPanel = computed(() => {
      if (isShowedTableRecords.value) {
        // multi record
        return 'height: 78px'
      }
      // mono record
      return 'height: 40px'
    })

    const styleFooterPanel = computed(() => {
      if (!props.tabAttributes.isParentTab) {
        return 'height: 100px'
      }
      return 'height: 35px'
    })

    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(props.tabAttributes.uuid)
    })

    const list = store.getters.getTabRecordsList({
      containerUuid: currentTab.value.containerUuid
    })
    const currentRecord = list.find(row => {
      return row.UUID === recordUuid.value
    })

    if (currentTab.value.isParentTab) {
      store.dispatch('panelInfo', {
        currentTab: currentTab.value,
        currentRecord
      })
    }

    if (props.tabAttributes.isParentTab) {
      store.dispatch('changeTabAttribute', {
        parentUuid: currentTab.value.parentUuid,
        containerUuid: currentTab.value.containerUuid,
        attributeName: 'isSelected',
        attributeValue: !currentTab.value.isSelected
      })
    }

    const tableHeaders = computed(() => {
      const panel = currentTab.value
      if (panel && panel.fieldsList) {
        return panel.fieldsList
      }
      return []
    })

    // get records list
    const recordsList = computed(() => {
      return props.containerManager.getRecordsList({
        containerUuid: props.tabAttributes.uuid
      })
    })
    const collapseWindow = computed(() => {
      return !isEmptyValue(store.getters.getCollapseWindow)
    })
    const currentPageNumber = computed(() => {
      if (props.containerManager.getPageNumber) {
        return parseInt(props.containerManager.getPageNumber({
          containerUuid: props.tabAttributes.uuid
        }), 10)
      }
      return 1
    })
    const showFullGridMode = computed(() => {
      return store.getters['settings/getFullGridMode']
    })

    const recordsLength = computed(() => {
      if (props.containerManager.getRecordCount) {
        return props.containerManager.getRecordCount({
          containerUuid: props.tabAttributes.uuid
        })
      }
      return 0
    })

    const currentPageSize = computed(() => {
      if (props.containerManager && props.containerManager.getPageSize) {
        return props.containerManager.getPageSize({
          containerUuid: props.tabAttributes.uuid
        })
      }
      return ROWS_OF_RECORDS_BY_PAGE
    })

    const selectionsLength = computed(() => {
      const selection = props.containerManager.getSelection({
        containerUuid: props.tabAttributes.uuid
      })
      if (isEmptyValue(selection)) {
        return 0
      }
      return selection.length
    })

    const commonFilterFielsProperties = computed(() => {
      if (isShowedTableRecords.value) {
        return {
          filterManager: props.containerManager.changeColumnShowedFromUser,
          showedManager: props.containerManager.isDisplayedColumn
        }
      }
      return {
        filterManager: props.containerManager.changeFieldShowedFromUser,
        showedManager: props.containerManager.isDisplayedField
      }
    })

    const batchEntry = computed(() => {
      return tableHeaders.value.filter(fieldItem => fieldItem.is_quick_entry)
    })

    function handleChangePage(pageNumber) {
      props.containerManager.setPageNumber({
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid,
        pageSize: store.getters.getTabPageSize({ containerUuid: props.tabAttributes.uuid }),
        pageNumber
      })
      router.push({
        name: root.$route.name,
        query: {
          ...root.$route.query,
          page: currentTab.value.isParentTab ? pageNumber : root.$route.query.page,
          pageChild: !currentTab.value.isParentTab ? pageNumber : root.$route.query.pageChild
        }
      }, () => {})
    }

    /**
     * custom method to handle change size page
     */
    function handleChangeSizePage(pageSize) {
      props.containerManager.setPageSize({
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid,
        pageSize,
        pageNumber: 1
      })
    }

    function loadOpenWindows() {
      if (root.$route.query.options === 'listRecords' && currentTab.value.isParentTab) {
        showedTableRecords(true)
      } else if (root.$route.query.options === 'create-new' && currentTab.value.isParentTab) {
        const { parentUuid, containerUuid } = props.tabAttributes
        showedTableRecords(false)
        setTimeout(() => {
          createNewRecord.createNewRecord({
            parentUuid,
            containerUuid,
            isCopyValues: false
          })
        }, 500)
      }
    }

    function showedTableRecords(attributeValue = false) {
      const { parentUuid, containerUuid } = currentTab.value
      store.dispatch('changeTabAttribute', {
        attributeName: 'isShowedTableRecords',
        attributeValue,
        containerUuid,
        parentUuid
      })
    }
    const styleScroll = computed(() => {
      if (showFullGridMode.value) return 'overflow: auto;'
      return 'min-height: 84vh !important;'
    })

    loadOpenWindows()

    return {
      currentTabUuid,
      // computeds
      commonFilterFielsProperties,
      recordsList,
      isShowedTableRecords,
      tableHeaders,
      currentTab,
      overflowHeightScrooll,
      recordUuid,
      styleScroll,
      showFullGridMode,
      collapseWindow,
      // pagination
      styleHeadPanel,
      styleFooterPanel,
      currentPageNumber,
      recordsLength,
      selectionsLength,
      currentPageSize,
      storedWindow,
      batchEntry,
      activeNames,
      isBachtEntry,
      // methods
      loadOpenWindows,
      handleChangePage,
      handleChangeSizePage,
      changeBatchEntry
    }
  }

})
</script>

<style lang="scss" scoped>
.scroll-tab-panel {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
  ::v-deep {
    .el-scrollbar__bar {
      bottom: 0px;
    }
    // .el-scrollbar__wrap {
    //   height: 49px;
    // }
  }
}
</style>

<style>
.tab-panel-body {
  height: calc(100vh - 366px) !important
}
.el-tabs--border-card > .el-tabs__content {
  /* padding: 15px; */
  overflow: auto;
  height: 92%;
  padding-top: 5px;
  padding-right: 15px;
  padding-bottom: 0px;
  padding-left: 15px;
}
</style>

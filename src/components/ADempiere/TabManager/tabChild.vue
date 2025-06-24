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
    @keyup.alt.90="ActionAltZ"
    @keyup.alt.78="ActionAltN"
    @keyup.alt.13="ActionAltS"
  >
    <el-tabs
      v-if="!isEmptyValue(showedTabsList)"
      v-model="currentTabNo"
      type="border-card"
      style="width: 100%"
      @tab-click="handleClick"
    >
      <el-tab-pane
        v-for="(tabAttributes, key) in showedTabsList"
        :key="tabAttributes.tabChildIndex"
        :label="tabAttributes.name"
        :name="String(tabAttributes.tabChildIndex)"
        :tabuuid="tabAttributes.uuid"
        :tabindex="String(tabAttributes.tabChildIndex)"
        lazy
        :disabled="isDisabledTab(key)"
        :style="tabStyle"
      >
        <tab-label
          slot="label"
          :is-active-tab="tabAttributes.uuid === tabUuid"
          :parent-uuid="parentUuid"
          :container-uuid="tabAttributes.uuid"
        />
        <div
          style="height: 100% !important;"
          @click="selectTab(tabsList[parseInt(currentTabNo)])"
        >
          <tab-panel
            :parent-uuid="parentUuid"
            :container-manager="containerManager"
            :tabs-list="tabsList"
            :all-tabs-list="allTabsList"
            :current-tab-uuid="tabUuid"
            :tab-attributes="tabAttributes"
            :actions-manager="actionsManager"
            :is-child-tab="true"
            style="height: 100% !important;"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </span>
</template>

<script>
import { defineComponent, computed, watch, ref, onUnmounted } from '@vue/composition-api'

import language from '@/lang'
import router from '@/router'
import store from '@/store'

// Components and Mixins
import DefaultTable from '@/components/ADempiere/DataTable/index.vue'
import TabLabel from '@/components/ADempiere/TabManager/TabLabel.vue'
import TabPanel from '@/components/ADempiere/TabManager/TabPanel/index.vue'
import TabOptions from './TabOptions.vue'

// Constants
import {
  COLUMNNAME_UUID,
  LOG_COLUMNS_NAME_LIST
} from '@/utils/ADempiere/constants/systemColumns'

// Utils and Helper Methods
import { isEmptyValue, setRecordPath } from '@/utils/ADempiere/valueUtils.js'
import { isDisplayedTab } from '@/utils/ADempiere/dictionary/window/tab'
import { showMessage } from '@/utils/ADempiere/notification'
import {
  getContextAttributes,
  generateContextKey
} from '@/utils/ADempiere/contextUtils/contextAttributes'
import {
  createNewRecord,
  refreshRecord,
  undoChange
} from '@/utils/ADempiere/dictionary/window/actionsMenu'

export default defineComponent({
  name: 'TabManagerChild',

  components: {
    DefaultTable,
    TabPanel,
    TabLabel,
    TabOptions
  },

  props: {
    parentUuid: {
      type: String,
      required: true
    },
    containerManager: {
      type: Object,
      required: true
    },
    allTabsList: {
      type: Array,
      required: false
    },
    tabsList: {
      type: Array,
      default: () => []
    },
    actionsManager: {
      type: Object,
      default: () => ({})
    }
  },

  setup(props, { root }) {
    const queryProperty = 'tabChild'
    const currentRoute = router.app._route

    // if tabParent is present in path set this
    const tabNo = root.$route.query[queryProperty] || '0'
    const currentTabNo = ref(tabNo)

    const tabUuid = ref(props.tabsList[tabNo].uuid)

    const tabStyle = computed(() => {
      // height tab content
      if (store.state.app.device === 'mobile') {
        return {
          height: '100% !important'
        }
      }
      return {
        height: '100% !important',
        overflow: 'auto'
      }
    })

    // use getter to reactive properties
    const currentTabMetadata = computed(() => {
      return store.getters.getStoredTab(props.parentUuid, tabUuid.value)
    })

    // tabs with display logic
    const showedTabsList = computed(() => {
      return props.tabsList.filter(tab => {
        return isDisplayedTab({
          parentUuid: props.parentUuid,
          containerUuid: tab.uuid,
          displayLogic: tab.display_logic
        })
      })
    })

    if (!isEmptyValue(showedTabsList.value)) {
      currentTabNo.value = showedTabsList.value[0].tabChildIndex.toString()
    }

    const isShowedTabs = computed(() => {
      const storedWindow = store.getters.getStoredWindow(props.parentUuid)

      return storedWindow.isShowedTabsChildren
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const isShowedTableRecords = computed(() => {
      return currentTabMetadata.value.isShowedTableRecords
    })

    const isCreateNew = computed(() => {
      return isEmptyValue(store.getters.getUuidOfContainer(currentTabMetadata.value.firstTabUuid))
    })

    function isDisabledTab(key) {
      return key > 0 && (isCreateNew.value || isEmptyValue(recordUuidTabParent.value))
    }

    function changeShowedRecords() {
      store.dispatch('changeTabAttribute', {
        attributeName: 'isShowedTableRecords',
        attributeNameControl: undefined,
        attributeValue: !currentTabMetadata.value.isShowedTableRecords,
        parentUuid: props.parentUuid,
        containerUuid: tabUuid.value
      })
    }
    function setCurrentTab() {
      store.commit('setCurrentTabChild', {
        parentUuid: props.parentUuid,
        tab: props.tabsList[currentTabNo.value]
      })
    }

    // create the table header
    const tableHeaders = computed(() => {
      const panel = props.tabsList[currentTabNo.value]
      if (panel && panel.fieldsList) {
        return panel.fieldsList
      }
      return []
    })

    /**
     * @param {object} tabHTML DOM HTML the tab clicked
     */
    const handleClick = (tabHTML) => {
      const { tabuuid, tabindex } = tabHTML.$attrs
      changeTab({
        uuid: tabuuid,
        index: tabindex
      })
    }

    function changeTab({ uuid, index }) {
      setRecordPath({
        tabChild: index
      })
      setTabNumber(index)

      // set metadata tab
      if (tabUuid.value !== uuid) {
        tabUuid.value = uuid
        setCurrentTab()
      }

      const containerInfo = store.getters.getContainerInfo
      if (!isEmptyValue(containerInfo)) {
        const currentTabDefinition = props.tabsList.find(row => row.uuid === uuid)
        if (!isEmptyValue(currentTabDefinition)) {
          if (!isEmptyValue(currentTabDefinition.currentTab)) {
            store.dispatch('changeTabAttribute', {
              parentUuid: containerInfo.currentTab.parentUuid,
              containerUuid: containerInfo.currentTab.containerUuid,
              attributeName: 'isSelected',
              attributeValue: false
            })
          }
          const currentTabData = store.getters.getTabData({
            containerUuid: uuid
          })

          const recordsListTab = currentTabData.recordsList
          if (isEmptyValue(recordsListTab)) {
            if (!currentTabData.isLoaded && !currentTabData.isLoading) {
              // load records
              getData()
            }
          }
          store.dispatch('changeTabAttribute', {
            parentUuid: currentTabDefinition.parentUuid,
            containerUuid: currentTabDefinition.containerUuid,
            attributeName: 'isSelected',
            attributeValue: true
          })
        }
      }
    }

    function setTabNumber(tabNumber = '0') {
      if (isEmptyValue(tabNumber)) {
        tabNumber = '0'
      }
      if (tabNumber !== currentTabNo.value) {
        currentTabNo.value = String(tabNumber)
      }

      router.push({
        query: {
          ...root.$route.query,
          [queryProperty]: currentTabNo.value
        },
        params: {
          ...root.$route.params
        }
      }, () => {})

      return tabNumber
    }

    const tabData = computed(() => {
      return store.getters.getTabData({
        containerUuid: currentTabMetadata.value.uuid
      })
    })

    // get records list
    const recordsList = computed(() => {
      return tabData.value.recordsList
    })

    const recordUuidTabParent = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        parentUuid: props.parentUuid,
        containerUuid: currentTabMetadata.value.firstTabUuid,
        columnName: COLUMNNAME_UUID
      })
    })

    function getData() {
      const containerUuid = tabUuid.value
      const filters = []
      if (!isEmptyValue(root.$route.query) &&
        !isEmptyValue(root.$route.query.columnName) &&
        !isEmptyValue(root.$route.query.value)) {
        filters.push({
          columnName: root.$route.query.columnName,
          value: root.$route.query.value
        })
      }
      const contextAttributes = store.getters.getTabData({
        containerUuid: currentTabMetadata.value.uuid
      }).contextAttributes
      store.dispatch('getEntities', {
        parentUuid: props.parentUuid,
        containerUuid,
        filters,
        contextAttributes
      }).then(responseData => {
        if (isCreateNew.value || isEmptyValue(responseData)) {
          // set values in panel
          props.containerManager.seekRecord({
            parentUuid: props.parentUuid,
            containerUuid,
            row: {}
          })
          return
        }

        let row = {}
        const { action } = root.$route.query
        // uuid into action query
        if (!isEmptyValue(action) && action !== 'create-new') {
          /*
          // search link value
          const { link_column_name } = tab
          const value = store.getters.getValueOfField({
            parentUuid: props.parentUuid,
            columnName: link_column_name
          })
          if (link_column_name && !isEmptyValue(value)) {
            row = responseData.find(rowData => {
            return rowData[link_column_name] === value
          })
          }
          */
        }

        // set first record
        if (
          !isEmptyValue(root.$route.query) &&
          !isEmptyValue(root.$route.query.columnName)
        ) {
          row = responseData.find(row => row[root.$route.query.columnName] === Number(root.$route.query.recordIdChildren))
          setRecordRoute({
            row,
            recordChildId: Number(root.$route.query.recordIdChildren)
          })
        }
        if (isEmptyValue(row)) {
          row = responseData[0]
          // props.containerManager.seekRecord({
          //   parentUuid: props.parentUuid,
          //   containerUuid,
          //   row
          // })
          setRecordRoute({ row })
        }

        // set values in panel

        // props.containerManager.seekRecord({
        //   parentUuid: props.parentUuid,
        //   containerUuid,
        //   row
        // })
      })
    }

    // const storedContextAttributes = computed(() => {
    //   return store.getters.getTabContextKey({
    //     containerUuid: props.tabsList[currentTabNo.value].uuid
    //   })
    // })

    const storedOldContextAttibutes = computed(() => {
      return store.getters.getTabOldContextKey({
        containerUuid: props.tabsList[currentTabNo.value].uuid
      })
    })

    const currentContextAttributes = computed(() => {
      const contextAttributesList = getContextAttributes({
        parentUuid: props.parentUuid,
        contextColumnNames: currentTabMetadata.value.context_column_names,
        keyName: 'key'
      })
      return generateContextKey(contextAttributesList, 'key')
    })

    const storedOldRecord = computed(() => {
      return store.getters.getCurrentRecordOnPanel(props.tabsList[currentTabNo.value].uuid)
    })

    /**
     * Vuex suscription when record parent change
     */
    const unsuscribeChangeParentRecord = () => {}

    // // if changed record in parent tab, reload tab child
    // watch(currentTabNo, (newValue, oldValue) => {
    //   if (newValue !== oldValue && !isEmptyValue(newValue)) {
    //     getData()
    //   }
    // })

    // if changed record in parent tab, reload tab child
    watch(recordUuidTabParent, (newValue, oldValue) => {
      if (newValue !== oldValue && !isEmptyValue(newValue)) {
        if (currentContextAttributes.value === storedOldContextAttibutes.value) {
          store.dispatch('setOldAsCurrentTabData', {
            parentUuid: props.parentUuid,
            containerUuid: props.tabsList[currentTabNo.value].uuid
          })
        }
      }
    })

    if (!isEmptyValue(recordUuidTabParent.value) && !tabData.value.isLoading) {
      if (!isEmptyValue(tabData.value.recordsList)) {
        const hasEditRow = tabData.value.recordsList.some((data, index) => {
          return data.isEditRow && index !== 0
        })
        if (!hasEditRow) getData()
      } else {
        getData()
      }
    }

    setTimeout(() => {
      if (
        !isEmptyValue(currentRoute.params) &&
        !isEmptyValue(currentRoute.params.children) &&
        !isEmptyValue(currentRoute.params.children.tab_id)
      ) {
        const children = currentRoute.params.children
        const indexTab = showedTabsList.value.findIndex(items => {
          if (items.id === children.tab_id) {
            return items
          }
        })
        changeTab({
          uuid: children.tab_uuid,
          index: indexTab
        })
      }
    }, 100)

    watch(showedTabsList, (newValue, oldValue) => {
      if (newValue) {
        const currentIndexDisplayed = newValue.some(newTab => {
          return String(newTab.tabChildIndex) === currentTabNo.value
        })
        if (!currentIndexDisplayed) {
          const tab = newValue.at(0)
          if (isEmptyValue(tab)) return
          changeTab({
            uuid: tab.uuid,
            index: String(tab.tabChildIndex)
          })
        }
      }
    })

    setTabNumber(currentTabNo.value)

    // remove susbscriptions
    onUnmounted(() => {
      unsuscribeChangeParentRecord()
    })

    function selectTab(params) {
      // store.dispatch('panelInfo', {
      //   currentTab: params
      // })
    }

    function setRecordRoute({
      row,
      recordChildId
    }) {
      props.containerManager.seekRecord({
        parentUuid: props.parentUuid,
        containerUuid: tabUuid.value,
        row
      })
      if (isEmptyValue(recordChildId)) return
      setRecordPath({
        recordChildId
      })
    }

    // Current Record UUID
    const currentRecordUuid = computed(() => {
      if (currentTabMetadata.value) {
        return store.getters.getUuidOfContainer(currentTabMetadata.value.uuid)
      }
      return ''
    })

    const emptyMandatoryFields = computed(() => {
      if (isEmptyValue(currentTabMetadata.value)) return []
      const { parentUuid, containerUuid } = currentTabMetadata.value
      return store.getters.getTabFieldsEmptyMandatory({
        parentUuid,
        containerUuid,
        formatReturn: false
      }).filter(itemField => {
        // omit send to server (to create or update) columns manage by backend
        return itemField.is_always_updateable ||
          !LOG_COLUMNS_NAME_LIST.includes(itemField.columnName)
      }).map(itemField => {
        return itemField.name
      })
    })

    function ActionAltZ() {
      if (currentTabMetadata.value.isShowedTableRecords) return

      const { parentUuid, fieldsList, containerUuid } = currentTabMetadata.value

      const info = {
        fieldsList: fieldsList,
        option: language.t('actionMenu.undo')
      }

      store.dispatch('fieldListInfo', { info })
      undoChange.undoChange({
        parentUuid,
        containerUuid
      })
    }

    function ActionAltN() {
      if (currentTabMetadata.value.isShowedTableRecords) return
      const { parentUuid, fieldsList, containerUuid } = currentTabMetadata.value
      createNewRecord.createNewRecord({
        parentUuid,
        containerUuid,
        isCopyValues: false
      })

      // store.dispatch('panelInfo', {
      //   currentTab: currentTabMetadata.value,
      //   currentRecord: currentRecordUuid.value
      // })
      const info = {
        fieldsList: fieldsList,
        option: language.t('actionMenu.new')
      }
      store.dispatch('fieldListInfo', { info })
    }

    function ActionAltS() {
      if (currentTabMetadata.value.isShowedTableRecords) return
      const {
        parentUuid,
        fieldsList,
        table_name,
        internal_id,
        isParentTab,
        firstTabUuid,
        containerUuid
      } = currentTabMetadata.value
      const emptyMandatory = emptyMandatoryFields.value.join(', ')
      if (!isEmptyValue(emptyMandatory)) {
        showMessage({
          message: language.t('notifications.mandatoryFieldMissing') + emptyMandatory,
          type: 'info'
        })
        return
      }

      const info = {
        fieldsList,
        option: language.t('actionMenu.save')
      }

      store.dispatch('fieldListInfo', { info })
      const currentRoute = router.app._route
      const recordUuid = store.getters.getUuidOfContainer(containerUuid)
      const currentReccord = store.getters.getTabCurrentRow({
        containerUuid
      })
      let recordId = -1
      if (!isEmptyValue(currentReccord[table_name + '_ID'])) recordId = currentReccord[table_name + '_ID']
      store.dispatch('flushPersistenceQueue', {
        parentUuid,
        containerUuid,
        tabId: internal_id,
        tableName: table_name,
        recordUuid,
        recordId
      })
        .then(response => {
          const {
            name,
            query,
            params
          } = currentRoute
          let id = query.recordId
          if (!isEmptyValue(response)) id = response.id
          // refresh parent tab on document window
          if (!isParentTab) {
            const firstTab = store.getters.getStoredTab(
              parentUuid,
              firstTabUuid
            )
            if (!isEmptyValue(firstTab) && firstTab.table.is_document) {
              refreshRecord.refreshRecord({
                parentUuid,
                containerUuid: firstTabUuid
              })
            }
          }

          router.replace({
            name,
            query: {
              ...query,
              recordId: id,
              filters: []
            },
            params: {
              ...params,
              filters: []
            }
          }, () => {})
        })
        .catch(error => {
          showMessage({
            message: error.message,
            type: 'error'
          })
        })
    }

    return {
      tabUuid,
      currentTabNo,
      tableHeaders,
      recordsList,
      // computed
      tabData,
      isMobile,
      tabStyle,
      isShowedTabs,
      showedTabsList,
      storedOldRecord,
      currentRecordUuid,
      currentTabMetadata,
      recordUuidTabParent,
      isShowedTableRecords,
      emptyMandatoryFields,
      storedOldContextAttibutes,
      currentContextAttributes,
      // methods
      ActionAltZ,
      ActionAltN,
      ActionAltS,
      handleClick,
      isDisabledTab,
      setRecordRoute,
      changeShowedRecords,
      selectTab
    }
  }

})
</script>

<style>
/* .el-tabs--border-card > .el-tabs__content {
  padding: 15px;
  overflow: auto;
  height: 100%;
} */
.scroll-child {
  /* max-height: 300px; */
  overflow-x: hidden;
}
</style>

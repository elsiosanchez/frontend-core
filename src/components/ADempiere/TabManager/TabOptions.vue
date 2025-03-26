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
  <div>
    <el-dropdown
      v-if="storedTab && (listOptionsDisplayDefenitions && listOptionsDisplayDefenitions.length > 0)"
      split-button
      size="small"
      type="primary"
      trigger="click"
      style="margin-right: 2px;"
      @click="changeShowedRecords"
      @command="handleCommandActions"
    >
      <span style="padding: 0px;">
        <svg-icon icon-class="table" />
        <b v-show="!isMobile">
          {{ label }}
        </b>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(data, index) in listOptionsDisplayDefenitions"
          :key="index"
          :command="data"
          :class="{ 'selected-option': selectedOption.id === data.id }"
        >
          <template>
            <div class="header">
              <svg-icon :icon-class="getIcon(data.display_type)" />
              {{ data.name }}
            </div>
            <span
              class="info"
              style="color: #7e7e7e; display: block; font-size: 12px; border-bottom: 1px solid #d0d7de;"
            >
              {{ data.description || $t('data.noDescription') }}
            </span>
          </template>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-button
      v-else
      plain
      size="small"
      type="primary"
      style="margin-right: 2px;"
      @click="changeShowedRecords"
    >
      <span style="padding: 0px;">
        <svg-icon icon-class="table" />
        <b v-show="!isMobile">
          {{ label }}
        </b>
      </span>
    </el-button>
    <div v-if="!isEmptyValue(title) || !isEmptyValue(optionDescrip)" style="line-height: 1.2; font-size: 12px; color: #303133; position: absolute; top: 17px; left: 180px;">
      <span style="font-weight: bold;">
        {{ title }}
      </span>
      <div style="color: rgb(130, 132, 138);">
        {{ optionDescrip }}
      </div>
    </div>
    <change-record
      :parent-uuid="parentUuid"
      :container-uuid="tabAttributes.uuid"
      :container-manager="containerManager"
      :is-change-record="isChangeRecord"
    />
    <convenience-buttons
      :parent-uuid="parentUuid"
      :container-uuid="tabAttributes.uuid"
      :container-manager="containerManager"
      :tab-attributes="tabAttributes"
    >
      <template v-slot:additional-options>
        <slot name="convenience-additional-options" style="display: contents;" />
      </template>
    </convenience-buttons>
    <!-- <span v-if="storedTab && !isEmptyValue(recordTitle)" style="left: 50%">
      {{ recordTitle }}
    </span> -->
    <action-menu
      :parent-uuid="parentUuid"
      :container-uuid="containerUuid? containerUuid: tabAttributes.uuid"
      :container-manager="containerManager"
      :actions-manager="listAction"
      style="float: right;"
    />
    <el-drawer
      :visible.sync="showMenuMobile"
      :with-header="true"
      size="100%"
      class="drawer-panel-info"
    >
      <span slot="title">
        <span style="color: #606266; font-weight: bold;">
          {{ $t('actionMenu.menu') }} {{ tabAttributes.name }}
        </span>
      </span>
      <menu-mobile
        :parent-uuid="parentUuid"
        :container-uuid="tabAttributes.containerUuid"
        :container-manager="containerManager"
        :actions-manager="listAction"
      />
    </el-drawer>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import language from '@/lang'
import store from '@/store'
import router from '@/router'
// Components and Mixins
import ActionMenu from '@/components/ADempiere/ActionMenu/index.vue'
import menuMobile from '@/components/ADempiere/ActionMenu/menuMobile.vue'
import ConvenienceButtons from '@/components/ADempiere/TabManager/convenienceButtons/index.vue'
// import FullScreenContainer from '@/components/ADempiere/ContainerOptions/FullScreenContainer'
import ChangeRecord from '@/components/ADempiere/DataTable/Components/ChangeRecord.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { DISPLAY_COLUMN_PREFIX } from '@/utils/ADempiere/dictionaryUtils'

export default defineComponent({
  name: 'TabOptions',

  components: {
    ActionMenu,
    ConvenienceButtons,
    // AdvancedTabQuery,
    // FullScreenContainer,
    ChangeRecord,
    menuMobile
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
    currentTabUuid: {
      type: String,
      default: ''
    },
    containerUuid: {
      type: String,
      default: ''
    },
    tabAttributes: {
      type: Object,
      default: () => ({})
    },
    // used only window
    isChangeRecord: {
      type: Boolean,
      required: false
    },
    showTitlePanel: {
      type: Boolean,
      default: true
    }
  },

  setup(props) {
    const title = ref('')
    const optionDescrip = ref('')
    const displayOptions = computed(() => {
      const response = store.getters.getDefinition({ tableName: tableName.value })
      // const filteredOptions = response.filter(option => option.display_type === 'K' || option.display_type === 'C' || option.display_type === 'R')
      return response
    })
    const recordTitle = computed(() => {
      const tab = store.getters.getTabCurrentRow({
        containerUuid: props.containerUuid
      })
      if (!isEmptyValue(tab) && !isEmptyValue(props.tabAttributes.table_name)) {
        const title = tab[DISPLAY_COLUMN_PREFIX + props.tabAttributes.table_name + '_ID']
        if (!isEmptyValue(title)) {
          return title.toString()
        }
        return ''
      }
      return ''
    })
    const selectedOption = computed(() => {
      const tabOptions = store.getters.getTabOptions
      if (!isEmptyValue(tabOptions)) {
        const { name, description } = tabOptions
        title.value = name
        optionDescrip.value = description
        return tabOptions
      }
      return ''
    })
    const listAction = computed(() => {
      const tab = props.tabAttributes
      return {
        parentUuid: props.parentUuid,
        containerUuid: isEmptyValue(tab) ? props.tabAttributes.uuid : tab.containerUuid,
        defaultActionName: language.t('actionMenu.createNewRecord'),
        tableName: isEmptyValue(tab) ? props.tabAttributes.table_name : tab.table_name,
        withoutDefaulAction: true,
        getActionList: () => {
          return store.getters.getStoredActionsMenu({
            containerUuid: isEmptyValue(tab) ? props.tabAttributes.uuid : tab.containerUuid
          })
        }
      }
    })
    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const isShowedTableRecords = computed(() => {
      return tabData.value.isShowedTableRecords
    })

    const isEditSecuence = computed(() => {
      return tabData.value.isEditSecuence
    })

    const listOptionsDisplayDefenitions = computed(() => {
      const list = []
      const displays = store.getters.getListDisplayTabDefinitions({ tableName: props.tabAttributes.table_name })
      if (!isEmptyValue(displays)) {
        displays.forEach(display => {
          if (display.display_type !== 'X') {
            list.push(display)
          }
        })
      }
      return list
    })

    const tabData = computed(() => {
      return store.getters.getStoredTab(
        props.parentUuid,
        props.tabAttributes.uuid
      )
    })
    const storedTab = computed(() => {
      const tab = store.getters.getStoredTab(
        props.parentUuid,
        props.containerUuid
      )
      const { isParentTab } = tab
      return isParentTab
    })
    const label = computed(() => {
      if (isShowedTableRecords.value) {
        return language.t('window.toggleSingle')
      }
      return language.t('window.multiRecord')
    })

    const currentRoute = router.app._route

    const currentRecordId = computed(() => {
      const { currentTab } = store.getters.getContainerInfo
      if (!isEmptyValue(currentRoute.query) && !isEmptyValue(currentRoute.query.recordId)) return Number(currentRoute.query.recordId)
      if (!isEmptyValue(currentRoute.params) && !isEmptyValue(currentRoute.params.recordId)) return Number(currentRoute.params.recordId)
      if (currentTab) {
        const { table } = currentTab
        const { key_columns, table_name } = table
        const currentRecord = store.getters.getTabCurrentRow({
          containerUuid: currentTab.containerUuid
        })
        if (!isEmptyValue(currentRecord[table_name + '_ID'])) return currentRecord[table_name + '_ID']
        if (!isEmptyValue(key_columns)) return currentRecord[key_columns[0]]
        return 1
      }
      return ''
    })

    const showMenuMobile = computed({
      // getter
      get() {
        return store.getters.getShowMenuMobile
      },
      // setter
      set(newValue) {
        store.commit('setShowMenuMobile', newValue)
      }
    })
    const tableName = computed(() => {
      const { currentTab } = store.getters.getContainerInfo
      if (!isEmptyValue(currentTab) && !isEmptyValue(currentTab.table_name)) return currentTab.table_name
      return ''
    })
    function changeShowedRecords() {
      const row = store.getters.getTabCurrentRow({ containerUuid: props.currentTabUuid })
      store.dispatch('changeTabAttribute', {
        attributeName: 'currentRowSelect',
        attributeNameControl: undefined,
        attributeValue: row,
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid
      })
      // props.containerManager.setSelection({
      //   containerUuid: props.containerUuid,
      //   recordsSelected: [tabData.value.currentRowSelect]
      // })
      title.value = undefined
      optionDescrip.value = undefined
      store.commit('setFilters', [])
      store.commit('setTabOptions', undefined)
      store.commit('setPanelKanban', {
        tableName: tableName.value,
        show: false
      })
      store.commit('setPanelCalendar', {
        tableName: tableName.value,
        show: false
      })
      store.commit('setPanelResource', {
        tableName: tableName.value,
        show: false
      })
      store.commit('setTabSelectionsList', {
        containerUuid: props.containerUuid,
        recordsSelected: [row]
      })
      // props.containerManager.setSelection({
      //   containerUuid: props.containerUuid,
      //   recordsSelected: [row]
      // })
      store.dispatch('changeTabAttribute', {
        attributeName: 'isShowedTableRecords',
        attributeNameControl: undefined,
        attributeValue: !tabData.value.isShowedTableRecords,
        parentUuid: props.parentUuid,
        containerUuid: props.tabAttributes.uuid
      })
    }
    function handleCommandActions(definition) {
      store.dispatch('changeTabPanelRightDefinition', {
        tableName: props.tabAttributes.table_name,
        definition
      })
    }

    function getIcon(type) {
      if (type === 'K') return 'kanbanMode'
      if (type === 'C') return 'calendar'
      if (type === 'R') return 'resources'
      if (type === 'E') return 'collapse'
      if (type === 'M') return 'mosaic'
      if (type === 'H') return 'groups'
      return ''
    }

    return {
      // ref
      displayOptions,
      selectedOption,
      title,
      optionDescrip,
      // computed
      storedTab,
      label,
      isMobile,
      listAction,
      isEditSecuence,
      listOptionsDisplayDefenitions,
      currentRecordId,
      showMenuMobile,
      isShowedTableRecords,
      tableName,
      recordTitle,
      // methods
      changeShowedRecords,
      handleCommandActions,
      getIcon
    }
  }

})
</script>

<style scoped>
.selected-option {
  background-color: #e6f7ff;
  font-weight: bold;
}
</style>

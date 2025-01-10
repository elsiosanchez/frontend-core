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
    <span v-show="!isEditSecuence">
      <el-dropdown
        v-if="storedTab && (displayOptions && displayOptions.length > 0)"
        split-button
        size="small"
        type="primary"
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
            v-for="(data, index) in displayOptions"
            :key="index"
            :command="data"
            :class="{ 'selected-option': selectedOption.id === data.id }"
          >
            <template>
              <div class="header">
                <svg-icon icon-class="kanbanMode" />
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
      <span v-if="!isEmptyValue(title) || !isEmptyValue(description)" style="font-size: 12px; color: #303133; font-weight: bold;">
        {{ title + ' - ' + optionDescrip }}
      </span>
      <change-record
        :parent-uuid="parentUuid"
        :container-uuid="tabAttributes.uuid"
        :container-manager="containerManager"
        :is-change-record="isChangeRecord"
      />
    </span>

    <convenience-buttons
      :parent-uuid="parentUuid"
      :container-uuid="tabAttributes.uuid"
      :container-manager="containerManager"
      :tab-attributes="tabAttributes"
      style="display: contents;"
    />

    <!--
    <full-screen-container
      style="float: right;"
      :parent-uuid="parentUuid"
      :container-uuid="currentTabUuid"
    />
    -->

    <action-menu
      :parent-uuid="parentUuid"
      :container-uuid="tabAttributes.uuid"
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
// Components and Mixins
import ActionMenu from '@/components/ADempiere/ActionMenu/index.vue'
import menuMobile from '@/components/ADempiere/ActionMenu/menuMobile.vue'
import ConvenienceButtons from '@/components/ADempiere/TabManager/convenienceButtons/index.vue'
// import FullScreenContainer from '@/components/ADempiere/ContainerOptions/FullScreenContainer'
import ChangeRecord from '@/components/ADempiere/DataTable/Components/ChangeRecord.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

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
    }
  },

  setup(props) {
    const title = ref('')
    const optionDescrip = ref('')
    const displayOptions = ref({})
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
      store.commit('setFilters', undefined)
      store.commit('setTabOptions', undefined)
      store.commit('setPanelKanban', false)
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
    function handleCommandActions(data) {
      store.commit('setTabOptions', data)
      store.commit('setPanelKanban', true)
      store.dispatch('searchPanelKanban', {
        id: data.id
      })
    }

    function searchDisplay() {
      if (storedTab.value) {
        store.dispatch('getDisplayDefinition', {
          tableName: tableName.value
        })
          .then(response => {
            if (!isEmptyValue(response)) {
              const filteredOptions = response.filter(option => option.display_type === 'K')
              displayOptions.value = filteredOptions
            }
          })
      }
    }
    searchDisplay()
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
      showMenuMobile,
      isShowedTableRecords,
      tableName,
      // methods
      changeShowedRecords,
      handleCommandActions,
      searchDisplay
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

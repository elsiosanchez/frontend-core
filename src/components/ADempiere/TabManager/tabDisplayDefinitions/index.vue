<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A.
  Contributor(s): Elsio Sanchez elsiosanchez@gmail.com https://github.com/elsiosanchez
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
  <el-container style="height: 100%;" class="tab-panel-definitions">
    <el-header v-if="!isPanelRight" style="padding: 0px !important;">
      <MenuActionDefinitions
        :parent-uuid="parentUuid"
        :tab-attributes="tabAttributes"
        :container-uuid="tabAttributes.uuid"
        :container-manager="containerManager"
        :actions-manager="actionsManagers"
        :is-display-menu="!isPanelRight"
        style="float: left;"
      />
      <action-menu
        :parent-uuid="parentUuid"
        :container-uuid="tabAttributes.uuid"
        :container-manager="containerManager"
        :actions-manager="actionsManagers"
        style="float: right;"
      />
    </el-header>
    <el-main style="padding: 0px !important;">
      <component
        :is="templatePanel"
        :parent-uuid="parentUuid"
        :container-manager="containerManager"
        :tabs-list="tabsList"
        :all-tabs-list="allTabsList"
        :current-tab-uuid="tabUuid"
        :tab-attributes="tabAttributes"
        :actions-manager="actionsManager"
        :is-panel-right="isPanelRight"
        style="height: 100% !important;"
        :is-open-details="openPanel"
        :hangle-change-record="changeRecord"
        :action-option="openPanelDisplayDefinition"
      />
    </el-main>
    <el-drawer
      :visible.sync="showContainerInfo"
      :with-header="true"
      :before-close="showPanel"
      :size="isDrawerWidth"
      class="drawer-panel-info"
    >
      <span slot="title">
        <svg-icon icon-class="tab" style="margin-right: 10px;" />
        {{ $t('window.containerInfo.log.tab') }}
      </span>
      <panel-info
        v-if="showContainerInfo"
        :all-tabs-list="allTabsList"
        :show-container-info="showContainerInfo"
        :container-manager="containerManager"
        :current-record="{}"
        :tab-attributes="tabAttributes"
        :is-accounting-info="false"
        :default-opened-tab="'getRecordLogs'"
        :is-panel-right="isPanelRight"
        :record-id="recordId"
      />
    </el-drawer>
    <el-dialog
      :visible.sync="isDialogoPanelDifinition"
      custom-class="modal-display-definition"
      :modal="false"
    >
      <panel-display-definitions
        :current-display-definition="currentDisplyDefinitions"
        :container-manager="containerManager"
        :parent-uuid="parentUuid"
        :type-panel="typeAction"
        :current-record="currentRecord"
        :action-close="openPanelDisplayDefinition"
      />
    </el-dialog>
  </el-container>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import ActionMenu from '@/components/ADempiere/ActionMenu/index.vue'
// src/components/ADempiere/PanelDefinition/PanelDisplayDefinitions.vue
import PanelDisplayDefinitions from '@/components/ADempiere/PanelDisplayDefinitions/index.vue'
import MenuActionDefinitions from '@/components/ADempiere/TabManager/tabDisplayDefinitions/menuActionDefinitions.vue'

// Utils and Helper Methods
import { setRecordPath } from '@/utils/ADempiere/valueUtils'
import { isEmptyValue } from '@/utils/ADempiere'

export default defineComponent({
  name: 'TabDisplayDefinitions',

  components: {
    ActionMenu,
    MenuActionDefinitions,
    PanelDisplayDefinitions,
    PanelInfo: () => import('@/components/ADempiere/PanelInfo/index.vue')
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
    actionsManager: {
      type: Object,
      required: false
    },
    currentTabUuid: {
      type: String,
      default: ''
    },
    tabUuid: {
      type: String,
      default: ''
    },
    tabAttributes: {
      type: Object,
      default: () => ({})
    },
    tabsList: {
      type: Array,
      required: false
    },
    allTabsList: {
      type: Array,
      required: false
    },
    // used only window
    isChildTab: {
      type: Boolean,
      default: false
    },
    hangleChangeRecord: {
      type: Function,
      default: (recordPrevious) => {
        console.info('implement method Change to Previous Record ', recordPrevious)
      }
    },
    isPanelRight: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    // Ref
    const showContainerInfo = ref(false)
    // const isDialogoPanelDifinition = ref(false)
    const typeAction = ref('')
    const recordId = ref(-1)
    const currentRecord = ref({})
    // Conputed
    const isDialogoPanelDifinition = computed({
      get: () => {
        return store.getters.getShowPanel
      },
      set: (value) => {
        store.commit('setShowPanel', value)
      }
    })
    //   return store.getters.getShowPanel
    // })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const isDrawerWidth = computed(() => {
      if (isMobile.value) {
        return '100%'
      }
      return '65%'
    })

    const actionsManagers = computed(() => {
      return {
        ...props.actionsManager,
        withoutDefaulAction: true
      }
    })

    const currentDisplyDefinitions = computed(() => {
      if (props.isPanelRight) return store.getters.getCurrentDisplayPanelRightDefinitions({ tableName: props.tabAttributes.table_name })
      return store.getters.getCurrentDisplayTabDefinitions({ tableName: props.tabAttributes.table_name })
    })

    const displayDefinitionMetadata = computed(() => {
      // return store.getters.getDisplayTabDefinition({
      //   id: currentDisplyDefinitions.value.id,
      //   recordId: currentRecord.value.id
      // })
      return store.getters.getDisplayTabDefinition({ id: currentDisplyDefinitions.value.id })
    })

    const displayDefinitionFields = computed(() => {
      if (
        !isEmptyValue(displayDefinitionMetadata.value) &&
        !isEmptyValue(displayDefinitionMetadata.value.fields)
      ) {
        return displayDefinitionMetadata.value.fields
      }
      return []
    })

    const templatePanel = computed(() => {
      let panel
      switch (currentDisplyDefinitions.value.display_type) {
        case 'K':
          panel = () => import('@/components/ADempiere/TabManager/tabDisplayDefinitions/componentPanel/kanban.vue')
          break
        case 'C':
          panel = () => import('@/components/ADempiere/TabManager/tabDisplayDefinitions/componentPanel/calendar.vue')
          break
        case 'R':
          panel = () => import('@/components/ADempiere/TabManager/tabDisplayDefinitions/componentPanel/resource.vue')
          break
        case 'T':
          panel = () => import('@/components/ADempiere/TabManager/tabDisplayDefinitions/componentPanel/timeLine.vue')
          break
        case 'W':
          panel = () => import('@/components/ADempiere/TabManager/tabDisplayDefinitions/componentPanel/workflow.vue')
          break
      }
      return panel
    })

    const defaultNameTab = computed(() => {
      return store.getters.getDefaultOpenedTab
    })

    // Methods

    function showPanel() {
      showContainerInfo.value = false
    }

    function openPanel(element) {
      recordId.value = element
      // Set the record path for the panel info component
      setRecordPath({
        recordId: element
      })
      showContainerInfo.value = true
      store.commit('setShowLogs', !showContainerInfo.value)
    }

    function changeRecord(element) {
      currentRecord.value = element
    }

    function openPanelDisplayDefinition(type) {
      store.dispatch('changeTabPanelDefinition', {
        name: type,
        id: currentDisplyDefinitions.value.id,
        recordId: currentRecord.value.id
      })
      isDialogoPanelDifinition.value = !isDialogoPanelDifinition.value
      if (!isEmptyValue(displayDefinitionFields.value)) return
      loadFields()
    }

    function loadFields() {
      store.dispatch('listDisplayDefinitionFieldsMetadata', {
        id: currentDisplyDefinitions.value.id
      })
    }

    return {
      // Ref
      recordId,
      typeAction,
      currentRecord,
      showContainerInfo,
      isDialogoPanelDifinition,
      // computeds
      isMobile,
      isDrawerWidth,
      templatePanel,
      defaultNameTab,
      actionsManagers,
      displayDefinitionFields,
      currentDisplyDefinitions,
      // Methods
      openPanelDisplayDefinition,
      changeRecord,
      showPanel,
      openPanel
    }
  }
})
</script>

<style lang="scss">
.tab-panel-definitions {
  height: 100%;
  .el-header {
    padding: 0px !important;
  }
  .el-main {
    padding: 0px !important;
  }
}
.modal-display-definition{
  .el-dialog {
    border-radius: 10px;
    border: 1px solid #e6ebf5;
  }
  .el-dialog__header {
    padding: 0px;
    padding-bottom: 0px;
    background: transparent !important;
    display: none;
  }
  .el-dialog__body {
    padding: 0px;
    overflow: auto;
    border-radius: 10px;
    border: 1px solid #e6ebf5;
  }
}
</style>

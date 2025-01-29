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
  <!-- <el-card shadow="never"> -->
  <el-tabs
    v-model="currentab"
    type="card"
    @tab-click="handleTabClick"
  >
    <template
      v-for="tab in listTabs"
    >
      <el-tab-pane
        :key="tab.name"
        :name="tab.name"
        :label="tab.label"
      >
        <span slot="label">
          <i :class="tab.icon" /> {{ tab.label }}
        </span>
        <el-card class="box-card-panel-display-definition" shadow="never">
          <component
            :is="componentRender"
            :parent-uuid="parentUuid"
            :container-uuid="containerUuid"
            :current-disply-definitions="currentDisplayDefinition"
            :container-manager="containerManagerPanel"
            :current-record="currentRecord"
            :panel-metadata="panelMetadata"
            :button-close-panel="actionClose"
          >
            <template v-slot:footer-buttons>
              <div style="display: flex; justify-content: flex-end;">
                <el-button
                  type="danger"
                  class="button-base-icon button-base-delete"
                  icon="el-icon-delete"
                  @click="handleDelete()"
                />
                <el-button
                  type="danger"
                  class="button-base-icon"
                  icon="el-icon-close"
                  @click="actionClose('')"
                />
              </div>
            </template>
          </component>
        </el-card>
      </el-tab-pane>
    </template>
  </el-tabs>
  <!-- </el-card> -->
</template>

<script>
import {
  defineComponent,
  computed
  // ref
} from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'PanelDisplayDefinitions',

  props: {
    parentUuid: {
      type: [String, Number],
      default: undefined
    },
    containerUuid: {
      type: [String, Number],
      required: false
    },
    containerManager: {
      type: Object,
      required: true
    },
    currentDisplayDefinition: {
      type: Object,
      required: false
    },
    typePanel: {
      type: String,
      required: true
    },
    actionClose: {
      type: Function,
      required: true
    },
    currentRecord: {
      type: Object,
      required: false
    }
  },

  setup(props) {
    // const currentab = ref('')
    const currentab = computed({
      // store.getters.getCurrentTabPanelDefinition
      get() {
        return store.getters.getCurrentTabPanelDefinition
      },
      set() {}

    })

    const getCurrentRecord = computed(() => {
      const record = store.getters.getRecordValuesData({
        recordId: props.currentRecord.id
      })
      if (record) return record.data
      return props.currentRecord
    })

    const containerManagerPanel = computed(() => {
      return props.containerManager
    })

    const listTabs = computed(() => {
      return [
        { label: lang.t('component.displayDefinition.cardNew'), name: 'new', icon: 'el-icon-plus' },
        { label: lang.t('component.displayDefinition.cardView'), name: 'view', icon: 'el-icon-news' }
      ]
    })

    /**
     * Get the panel object with all its attributes as well as
     * the fields it contains
     */
    const panelMetadata = computed(() => {
      return containerManagerPanel.value.getPanel({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid
      }) || {}
    })

    const componentRender = computed(() => {
      let panelComponent
      switch (currentab.value) {
        case 'new':
          panelComponent = () => import('@/components/ADempiere/PanelDisplayDefinitions/PanelNew.vue')
          break
        case 'view':
          panelComponent = () => import('@/components/ADempiere/PanelDisplayDefinitions/PanelView.vue')
          break
      }

      return panelComponent
    })

    // Methods

    function handleTabClick(tab) {
      store.dispatch('changeTabPanelDefinition', {
        name: tab.name,
        id: props.currentDisplayDefinition.id,
        recordId: props.currentRecord

      })
      // currentab.value = tab.name
    }
    const tableName = computed(() => {
      const { currentTab } = store.getters.getContainerInfo
      if (!isEmptyValue(currentTab) && !isEmptyValue(currentTab.table_name)) return currentTab.table_name
      return ''
    })
    function handleDelete() {
      store.dispatch('deleteRecord', {
        id: props.currentRecord.id,
        displayDefinition: props.currentDisplayDefinition,
        tableName: tableName.value,
        isPanelRight: props.isPanelRight
      })
    }
    return {
      // Ref
      currentab,
      // computeds
      listTabs,
      getCurrentRecord,
      containerManagerPanel,
      panelMetadata,
      componentRender,
      // Methods
      handleTabClick,
      handleDelete
    }
  }
})
</script>

<style lang="scss">
.box-card-panel-display-definition {
  .el-card__body {
    padding: 5px !important;
  }
}
.button-base-delete{
  background: #f8eeee;
  color: #ff1e1e;
  border-color: #eba1a1;
  &:hover {
    background: #ff1e1e;
    border-color: #ff1e1e;
    color: #fff;
  }
}
</style>


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
  <span class="menu-action-definitions">
    <el-dropdown
      v-if="isDisplayMenu"
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
        <b>
          {{ label }}
        </b>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(data, index) in listOptionsDisplayDefenitions"
          :key="index"
          :command="data"
          :class="{ 'selected-option': currentDisplyDefinitions.id === data.id }"
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
    <div
      v-if="isDisplayDetails"
      class="info-definitions"
    >
      <span style="font-weight: bold;">
        {{ currentDisplyDefinitions.name }}
      </span>
      <div style="color: rgb(130, 132, 138);">
        {{ currentDisplyDefinitions.description }}
      </div>
    </div>
  </span>
</template>

<script>
import {
  defineComponent,
  computed
} from '@vue/composition-api'
// Global Methods
import language from '@/lang'
import store from '@/store'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'MenuActionDefinitions',

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
      required: true
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
    isChildTab: {
      type: Boolean,
      default: false
    },
    isDisplayMenu: {
      type: Boolean,
      default: true
    },
    isDisplayDetails: {
      type: Boolean,
      default: true
    }
  },

  setup(props) {
    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const actionsManagers = computed(() => {
      return {
        ...props.actionsManager,
        withoutDefaulAction: true
      }
    })

    const label = computed(() => {
      if (props.tabAttributes.isShowedTableRecords) {
        return language.t('window.toggleSingle')
      }
      return language.t('window.multiRecord')
    })

    const listOptionsDisplayDefenitions = computed(() => {
      const listDefinitions = store.getters.getListDisplayTabDefinitions({
        tableName: props.tabAttributes.table_name
      })
      if (isEmptyValue(listDefinitions)) return []
      return listDefinitions
    })

    const currentDisplyDefinitions = computed(() => {
      return store.getters.getCurrentDisplayTabDefinitions({ tableName: props.tabAttributes.table_name })
    })

    // Methods

    function getIcon(type) {
      if (type === 'K') return 'kanbanMode'

      if (type === 'C') return 'calendar'

      if (type === 'R') return 'resources'
      if (type === 'E') return 'collapse'
      return ''
    }

    function changeShowedRecords() {
      store.commit('setCurrentTabDefinition', {
        currentDefinition: {},
        tableName: props.tabAttributes.table_name
      })
    }

    function handleCommandActions(definition) {
      // store.commit('setCurrentTabDefinition', {
      //   currentDefinition: definitions,
      //   tableName: props.tabAttributes.table_name
      // })
      // store.dis
      // changeTabPanelRightDefinition
      store.dispatch('changeTabPanelRightDefinition', {
        tableName: props.tabAttributes.table_name,
        definition
      })
      // if (definitions.display_type === 'K') {
      //   store.dispatch('requestKanban', {
      //     id: definitions.id,
      //     tableName: props.tabAttributes.table_name
      //   })
      // }
      // if (definitions.display_type === 'R') {
      //   store.dispatch('requestResource', {
      //     id: definitions.id,
      //     tableName: props.tabAttributes.table_name
      //   })
      // }
    }

    return {
      // computeds
      label,
      isMobile,
      actionsManagers,
      currentDisplyDefinitions,
      listOptionsDisplayDefenitions,
      // Methods
      getIcon,
      changeShowedRecords,
      handleCommandActions
    }
  }
})
</script>

<style lang="scss" scoped>
.menu-action-definitions {
  display: flex;
  .info-definitions {
    line-height: 1.2;
    font-size: 12px;
    color: #303133;
  }
  .selected-option {
    background-color: #e6f7ff;
    font-weight: bold;
  }
}
</style>

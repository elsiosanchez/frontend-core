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
  <span>
    <div
      v-if="isPanelRight"
      class="info-definitions"
    >
      <span style="font-weight: bold;">
        {{ currentDisplayDefinition.name }}
      </span>
      <div style="color: rgb(130, 132, 138);">
        {{ currentDisplayDefinition.description }}
      </div>
    </div>
    <el-card v-loading="isLoading" :body-style="{ padding: '10px' }">
      <div class="kanban-columns-container" style="height: calc(100vh - 250px)">
        <div
          v-for="(column, index) in columns"
          :key="index"
          class="kanban-column"
        >
          <template>
            <b style="font-size: 16px;padding-left: 10px;">
              {{ column.title }}
            </b>
            <options-panel
              :action-option="actionOption"
              :is-option-new="true"
              style="float: right;"
            />
          </template>
          <draggable
            v-model="column.items"
            v-bind="dragOptions"
            class="list-group"
            @start="isDragging = true"
            @end="isDragging = false"
            @change="handleCardMove($event, column)"
          >
            <template>
              <div
                v-for="element in column.items"
                :key="element.id"
                class="list-group-item"
                @dblclick="isOpenDetails(element.id)"
                @click="hangleChangeRecord(element)"
              >
                <div
                  class="kanban-column-header"
                  style="display: block;"
                >
                  <span class="column-title">{{ element.title }}</span>
                  <options-panel
                    :action-option="actionOption"
                    :current-resource="element"
                    :is-option-edit="true"
                    :is-option-delete="true"
                    style="float: right;"
                  />
                </div>
                <div style="padding-left: 5px; padding-right: 5px; color: rgb(130, 132, 138); line-height: 1.2; padding-bottom: 1rem;">
                  <span style="font-size: 12px;">
                    {{ element.description }}
                  </span>
                </div>
              </div>
            </template>
            <div v-if="column.items.length < 1" class="empty-placeholder">{{ $t('form.kanban.dropCard') }}</div>
          </draggable>
        </div>
      </div>
    </el-card>
  </span>
</template>

<script>
import {
  defineComponent,
  computed
  // watch
} from '@vue/composition-api'

import store from '@/store'
import lang from '@/lang'

// Components and Mixins
import draggable from 'vuedraggable'
import optionsPanel from '@/components/ADempiere/TabManager/tabDisplayDefinitions/componentPanel/optionsPanel.vue'

// API Request Methods
import { requestUpdateEntity } from '@/api/ADempiere/business-data/entities.ts'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { refreshRecord } from '@/utils/ADempiere/dictionary/window'

export default defineComponent({
  name: 'KanbanDefinitions',

  components: {
    draggable,
    optionsPanel
  },

  props: {
    parentUuid: {
      type: String,
      required: false
    },
    containerManager: {
      type: Object,
      required: false
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
    isPanelRight: {
      type: Boolean,
      default: false
    },
    isOpenDetails: {
      type: Function,
      default: (recordPrevious) => {
        console.info('implement method Change to Previous Record ', recordPrevious)
      }
    },
    hangleChangeRecord: {
      type: Function,
      default: (record) => {
        console.info('implement method Change to Previous Record ', record)
      }
    },
    actionOption: {
      type: Function,
      default: (recordPrevious) => {
        console.info('implement method Open Action New', recordPrevious)
      }
    }
  },

  setup(props) {
    // Computed
    const currenPanelKanban = computed(() => {
      return store.getters.getKanbanPanel({
        tableName: props.tabAttributes.table_name,
        isPanel: props.isPanelRight
      })
    })

    const columns = computed({
      // getter
      get() {
        // const columnsStore = store.getters.getKanbanColumnsDefinition({ tableName: props.tabAttributes.table_name })
        // if (!isEmptyValue(columnsStore)) return columnsStore
        if (
          !isEmptyValue(KanbanDefinitions.value) &&
          !isEmptyValue(KanbanDefinitions.value.steps)
        ) {
          const { steps, records } = KanbanDefinitions.value
          const ungroupedItems = records
            .filter(record => !steps.some(step => record.group_id === step.value))
          const ungroupedColumn = {
            title: lang.t('form.kanban.noStatus'),
            items: ungroupedItems
          }

          const groupedColumns = steps.map(step => ({
            title: step.name,
            value: step.value,
            items: records
              .filter(record => record.group_id === step.value)
          }))

          return [ungroupedColumn, ...groupedColumns]
        }
        return []
      },
      // setter
      set(newValue) {
        store.commit('setKanbanColumns', {
          tableName: props.tabAttributes.table_name,
          columns: newValue
        })
      }
    })
    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    const actionsManagers = computed(() => {
      return {
        ...props.actionsManager,
        withoutDefaulAction: true
      }
    })

    const currentDisplayDefinition = computed(() => {
      if (props.isPanelRight) {
        return store.getters.getCurrentDisplayPanelRightDefinitions({
          tableName: props.tabAttributes.table_name
        })
      }
      return store.getters.getCurrentDisplayTabDefinitions({
        tableName: props.tabAttributes.table_name
      })
    })

    const KanbanDefinitions = computed(() => {
      if (props.isPanelRight) {
        return store.getters.getCurrentKanbanPanelRightDefinition({
          tableName: props.tabAttributes.table_name
        })
      }
      return store.getters.getCurrentKanbanDefinition({
        tableName: props.tabAttributes.table_name
      })
    })

    const isLoading = computed(() => {
      if (props.isPanelRight) {
        return store.getters.getKanbanPanelRightLoading({
          tableName: props.tabAttributes.table_name
        })
      }
      return store.getters.getKanbanLoading({
        tableName: props.tabAttributes.table_name
      })
    })

    const dragOptions = computed(() => {
      return {
        animation: 150,
        group: 'kanban',
        disabled: false,
        ghostClass: 'ghost'
      }
    })

    // Mehtods

    /**
     * TODO: Revert when reject update on server
     * @param event
     * @param column
     */
    function handleCardMove(event, column) {
      if (!isEmptyValue(event) && !isEmptyValue(event.added) && !isEmptyValue(event.added.element)) {
        let { value } = column
        if (isEmptyValue(value)) {
          value = null
        }
        const { id, uuid } = event.added.element
        const { table_name } = currentDisplayDefinition.value
        const { column_name } = KanbanDefinitions.value
        const recordAttributes = {
          [column_name]: value
        }
        loading(true)
        requestUpdateEntity({
          tableName: table_name,
          recordId: id,
          recordAttributes
        })
          .then(response => {
            this.$message({
              type: 'success',
              showClose: true,
              message: 'OK'
            })
            const { currentTab } = store.getters.getContainerInfo
            const { parentUuid, firstTabUuid } = currentTab

            // const { values } = response
            // const serverValue = values[column_name]
            // if (!isSameValues(serverValue, event.added.element.group_id )) {
            //   event.added.element.group_id = serverValue
            // }

            refreshRecord.refreshRecord({
              parentUuid: parentUuid,
              containerUuid: firstTabUuid,
              recordId: id,
              recordUuid: uuid
            })
          })
          .catch(error => {
            this.$message({
              type: 'error',
              showClose: true,
              message: error.message
            })
          })
          .finally(() => {
            loading(false)
          })
      }
    }

    function loading(load) {
      if (props.isPanelRight) {
        store.commit('setKanbanRightLoading', {
          tableName: props.tabAttributes.table_name,
          isLoading: load
        })
        return
      }
      store.commit('setKanbanLoading', {
        tableName: props.tabAttributes.table_name,
        isLoading: load
      })
    }

    return {
      // computeds
      columns,
      isMobile,
      isLoading,
      dragOptions,
      actionsManagers,
      currenPanelKanban,
      KanbanDefinitions,
      currentDisplayDefinition,
      // Mehtods
      handleCardMove
    }
  }
})
</script>

<style lang="scss">
.info-definitions {
  line-height: 1.2;
  font-size: 12px;
  color: #303133;
}
.menu-options-display {
  float: right;
}
// .kanban-column-header {
//   display: block;
// }
</style>

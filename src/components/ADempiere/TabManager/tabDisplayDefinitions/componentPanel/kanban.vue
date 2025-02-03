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
    <div v-if="isPanelRight" class="info-definitions">
      <span style="font-weight: bold;">
        {{ currentDisplayDefinition.name }}
      </span>
      <div style="color: rgb(130, 132, 138);">
        {{ currentDisplayDefinition.description }}
      </div>
    </div>
    <el-card v-loading="isLoading" :body-style="{ padding: '10px' }">
      <div class="kanban-columns-container" style="height: calc(100vh - 250px)">
        <div v-for="(column, index) in columnsList" :key="index" class="kanban-column">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <b style="font-size: 16px; padding-left: 10px;">
              {{ column.title }}
            </b>
            <el-button
              plain
              circle
              type="success"
              style="padding: 5px 5px;"
              :title="$t('component.displayDefinition.cardNew')"
              @click="newEntry(column)"
            >
              <el-icon class="el-icon-plus" />
            </el-button>
          </div>
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
                <div class="kanban-column-header" style="display: block;">
                  <span class="column-title-kanban">{{ element.title }}</span>
                  <options-panel
                    :action-option="actionOption"
                    :current-resource="element"
                    :is-option-edit="true"
                    :is-option-delete="true"
                    :display-definition="currentDisplayDefinition"
                    style="float: right;"
                  />
                </div>
                <div class="column-description-kanban">
                  <span style="font-size: 12px; display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
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

    const kanbanDefinition = computed(() => {
      if (props.isPanelRight) {
        return store.getters.getCurrentKanbanPanelRightDefinition({
          tableName: props.tabAttributes.table_name
        })
      }
      return store.getters.getCurrentKanbanDefinition({
        tableName: props.tabAttributes.table_name
      })
    })

    const columnsList = computed({
      // getter
      get() {
        // const columnsStore = store.getters.getKanbanColumnsDefinition({ tableName: props.tabAttributes.table_name })
        // if (!isEmptyValue(columnsStore)) return columnsStore
        if (
          isEmptyValue(kanbanDefinition.value) ||
          isEmptyValue(kanbanDefinition.value.steps)
        ) {
          return []
        }
        const { steps, records, column_name } = kanbanDefinition.value
        const ungroupedItems = records
          .filter(record => {
            return !steps.some(step => {
              return record.group_id === step.value
            })
          })
        const ungroupedColumn = {
          title: lang.t('form.kanban.noStatus'),
          column_name,
          value: null,
          items: ungroupedItems
        }

        const groupedColumns = steps.map(step => {
          return {
            title: step.name,
            column_name,
            value: step.value,
            items: records
              .filter(record => {
                return record.group_id === step.value
              })
          }
        })

        return [
          ungroupedColumn,
          ...groupedColumns
        ]
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

    const displayDefinitionMetadata = computed(() => {
      return store.getters.getDisplayTabDefinition({
        id: currentDisplayDefinition.value.id
      })
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
        const { column_name } = kanbanDefinition.value
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

    function newEntry(currentColumn) {
      const { value, column_name } = currentColumn
      let groupValue = null
      if (!isEmptyValue(value)) {
        groupValue = value
      }
      // Add group/column value
      const additionalAttributes = {
        [column_name]: groupValue
      }

      store.dispatch('changeTabPanelDefinition', {
        type: 'new',
        id: currentDisplayDefinition.value.id,
        recordId: -1,
        additionalAttributes
      })
      store.commit('setShowPanel', {
        id: currentDisplayDefinition.value.id,
        show: true
      })
      if (!isEmptyValue(displayDefinitionFields.value)) {
        return
      }
      loadFields()
    }

    function loadFields() {
      store.dispatch('listDisplayDefinitionFieldsMetadata', {
        id: currentDisplayDefinition.value.id
      })
    }

    return {
      // Computeds
      columnsList,
      isMobile,
      isLoading,
      dragOptions,
      actionsManagers,
      currenPanelKanban,
      kanbanDefinition,
      currentDisplayDefinition,
      // Mehtods
      handleCardMove,
      newEntry
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
.column-title-kanban {
  font-size: 12px;
  font-weight: bold;
  width: 90%;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.column-description-kanban {
  font-size: 12px;
  // display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

// .kanban-column-header {
//   display: block;
// }
</style>

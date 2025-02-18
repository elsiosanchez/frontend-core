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
        <div v-for="column in columnsList" :key="column.value" class="kanban-column">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <el-badge :value="column.records.length" style="font-size: 16px; padding-left: 10px;" type="primary" class="item">
              <b>{{ column.name ? column.name : lang.t('form.kanban.noStatus') }}</b>
            </el-badge>
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
            v-model="column.records"
            v-bind="dragOptions"
            class="list-group"
            @start="isDragging = true"
            @end="isDragging = false"
            @change="handleCardMove($event, column)"
          >
            <template>
              <div
                v-for="element in column.records"
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
                    :is-panel-right="isPanelRight"
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
            <div v-if="column.records.length < 1" class="empty-placeholder">{{ $t('form.kanban.dropCard') }}</div>
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

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { containerManagerFieldDefinition } from '@/utils/ADempiere/displayDefinition'

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
        return kanbanDefinition.value.steps
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
    const { currentTab } = store.getters.getContainerInfo
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
        const { id } = event.added.element
        const { column_name } = kanbanDefinition.value
        const recordAttributes = {
          [column_name]: value
        }
        loading(true)
        containerManagerFieldDefinition.updateField({
          recordId: id,
          displyDefinitions: currentDisplayDefinition.value,
          attributes: recordAttributes,
          isPanelRight: props.isPanelRight,
          currentTab,
          isEditRecord: false
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
      const { value, name } = currentColumn
      const { column_name } = kanbanDefinition.value
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
        displyDefinitions: currentDisplayDefinition.value,
        recordId: -1,
        additionalAttributes,
        currentAttributes: {
          [column_name]: {
            display_value: name,
            value
          }
        }
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
      newEntry,
      //
      lang
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
.kanban-columns-container .el-badge__content.is-fixed {
  top: 1px !important
}
.kanban-container {
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

.kanban-columns-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 1rem;
  padding-top: 0.5rem;
}

.kanban-column {
  flex: 0 0 auto;
  width: 300px;
  background-color: #ffffff;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(27, 31, 35, 0.12);
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.kanban-column h3 {
  margin: 0;
  margin-bottom: 1rem;
  color: #24292f;
  font-size: 1.25rem;
  font-weight: 600;
  border-bottom: 1px solid #d0d7de;
  padding-bottom: 0.5rem;
}

.list-group {
  list-style: none;
  padding: 0;
  margin: 0;
}

.list-group-item {
  cursor: grab;
  background-color: #ffffff;
  border-width: 1px;
  border-style: solid;
  border-color: #d0d7de;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: background-color 0.2s, border-color 0.2s;
  box-shadow: 0 3px 6px rgba(140,149,159,0.15);
  padding: 0px 5px;
}

.list-group-item:hover {
  background-color: #f3f4f6;
  border-color: #c9d1d9;
}

.list-group-item i {
  cursor: pointer;
  margin-right: 8px;
  color: #57606a;
  transition: color 0.2s;
}

.list-group-item i:hover {
  color: #24292f;
}

.list-group-item strong {
  font-size: 1rem;
  color: #24292f;
}

.list-group-item p {
  font-size: 0.875rem;
  color: #57606a;
  margin: 0.5rem 0 0;
}

.ghost {
  opacity: 0.5;
  background: #d8e2ec;
  border: 2px dashed #c9d1d9;
}
.empty-placeholder {
  min-height: 50px;
  padding: 10px;
  background-color: #f6f8fa;
  border: 2px dashed #d0d7de;
  border-radius: 6px;
  text-align: center;
  color: #57606a;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, border-color 0.2s;
}

.empty-placeholder:hover {
  background-color: #e1e4e8;
  border-color: #c9d1d9;
}
.tab-options-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: #ffffff;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.list-group-item strong{
  font-size: 12px !important;
  color: #495060;
}
.kanban-column-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.2rem;
  padding-left: 5px;
  padding-right: 5px;
  border-width: 1px 0px;
  border-style: solid none;
  border-color: rgb(230, 235, 245) currentcolor;
}

.column-icon {
  color: green;
  margin-left: 4px;
  margin-right: 4px;
}
.column-title {
  font-size: 12px;
  font-weight: bold;
}
</style>

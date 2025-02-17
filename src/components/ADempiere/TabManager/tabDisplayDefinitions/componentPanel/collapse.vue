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
    <el-card v-if="!isLoading" :body-style="{ padding: '10px' }">
      <el-collapse v-model="activeNames">
        <el-collapse-item
          v-for="(column, index) in groupsList"
          :key="index"
          :name="index"
        >
          <template slot="title">
            <p style="margin: 0px 5px;width: 95%;">
              <el-badge
                :value="column.records.length"
                style="font-size: 16px; padding-left: 10px;"
                type="info"
                class="item-table-collapse"
              >
                <b style="padding-right: 3px;">
                  {{ isEmptyValue(column.name) ? $t('form.kanban.noStatus') : column.name }}
                </b>
              </el-badge>
            </p>
            <el-button
              plain
              circle
              type="success"
              style="padding: 5px;float: right;"
              :title="$t('component.displayDefinition.cardNew')"
              @click="newEntry(column)"
            >
              <el-icon class="el-icon-plus" />
            </el-button>
          </template>
          <el-empty v-if="isEmptyValue(column.records)" :image-size="200" />
          <el-table
            v-else
            :data="column.records"
            style="width: 100%"
            @row-dblclick="openPanelDetails"
          >
            <el-table-column
              v-for="(field, key) in filedLists"
              :key="key"
              :column-key="field.column_name"
              :label="field.name"
              :align="isNumberField(field.display_type) ? 'right' : 'left'"
              width="180"
            >
              <template slot-scope="scope">
                <p
                  class="description-column"
                  @click="readRecord({
                    record: scope.row,
                    view: false
                  })"
                >
                  {{ displayValue({ fields: scope.row, columnName: field.column_name }) }}
                </p>
              </template>
            </el-table-column>
            <el-table-column
              fixed="right"
              label=""
              width="50"
            >
              <template slot-scope="scope">
                <span
                  @click="readRecord({ record: scope.row, view: false })"
                >
                  <options-panel
                    :action-option="actionOption"
                    :current-resource="scope.row"
                    :is-option-edit="true"
                    :is-option-delete="true"
                    :display-definition="currentDisplayDefinition"
                    style="float: right;"
                  />
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </el-card>
    <loading-view
      v-else
      key="process-loading"
    />
  </span>
</template>
<script>
import {
  defineComponent,
  computed,
  ref
  // watch
} from '@vue/composition-api'

import store from '@/store'
// import lang from '@/lang'

// Components and Mixins
import draggable from 'vuedraggable'
import LoadingView from '@/components/ADempiere/LoadingView/index.vue'
import optionsPanel from '@/components/ADempiere/TabManager/tabDisplayDefinitions/componentPanel/optionsPanel.vue'

// API Request Methods

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { containerManagerFieldDefinition } from '@/utils/ADempiere/displayDefinition'
import { isNumberField } from '@/utils/ADempiere/references'

export default defineComponent({
  name: 'CollapseDefinitions',

  components: {
    draggable,
    optionsPanel,
    LoadingView
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
    const activeNames = ref([])
    // Computed
    const currenPanelKanban = computed(() => {
      return store.getters.getKanbanPanel({
        tableName: props.tabAttributes.table_name,
        isPanel: props.isPanelRight
      })
    })

    const collapseDefinition = computed(() => {
      if (props.isPanelRight) {
        return store.getters.getCurrentCollapsePanelRightDefinition({
          tableName: props.tabAttributes.table_name
        })
      }
      return store.getters.getCurrentCollapseDefinition({
        tableName: props.tabAttributes.table_name
      })
    })

    const filedLists = computed(() => {
      if (isEmptyValue(currentDisplayDefinition.value.field_definitions)) return []
      return currentDisplayDefinition.value.field_definitions.filter(field => field.is_displayed_grid)
    })

    const groupsList = computed({
      // getter
      get() {
        return collapseDefinition.value.groups
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
        return store.getters.getCollapsePanelRightLoading({
          tableName: props.tabAttributes.table_name
        })
      }
      return store.getters.getCollapseLoading({
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
        const { column_name } = collapseDefinition.value
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
      const { value, title } = currentColumn
      const { group_column } = currentDisplayDefinition.value
      let groupValue = null
      if (!isEmptyValue(value)) {
        groupValue = value
      }
      // Add group/column value
      const additionalAttributes = {
        [group_column]: groupValue
      }

      store.dispatch('changeTabPanelDefinition', {
        type: 'new',
        displyDefinitions: currentDisplayDefinition.value,
        recordId: -1,
        additionalAttributes,
        currentAttributes: {
          [group_column]: {
            display_value: title,
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

    function displayValue({
      fields,
      columnName
    }) {
      if (isEmptyValue(fields)) return
      const column = fields.fields
      const { display_value, value } = column[columnName]
      if (!isEmptyValue(display_value)) return display_value
      return value
    }

    function readRecord({
      record,
      view = false
    }) {
      props.hangleChangeRecord(record)
      if (view) viewRecord()
    }

    function viewRecord() {
      props.actionOption('view')
    }

    function openPanelDetails(element) {
      if (props.isPanelRight) return
      props.isOpenDetails(element.id)
    }

    return {
      // Ref
      activeNames,
      // Computeds
      groupsList,
      isMobile,
      isLoading,
      filedLists,
      dragOptions,
      actionsManagers,
      currenPanelKanban,
      collapseDefinition,
      displayDefinitionFields,
      currentDisplayDefinition,
      // Mehtods
      openPanelDetails,
      handleCardMove,
      isNumberField,
      displayValue,
      readRecord,
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

.description-column {
  max-height: 40px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0px 5px; margin: 0px;
}
.item-table-collapse {
  .el-badge__content.is-fixed {
    position: absolute;
    top: 10px;
    right: 0px;
    -webkit-transform: translateY(-50%) translateX(100%);
    transform: translateY(-50%) translateX(100%);
  }
}
.treeTable {
  .el-table td.el-table__cell div {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding: 0px !important;
  }
  .el-table__expand-column .cell {
    padding: 0;
    text-align: center;
    padding: 0px !important;
  }
}
</style>

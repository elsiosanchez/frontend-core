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
      <div
        v-shortkey="{ new: ['ctrl', 'alt', 'n'] }"
        @shortkey="theAction"
      >
        <el-table
          ref="tableGroup"
          v-loading="isLoading"
          class="table-group"
          :height="500"
          :data="groupsList"
          :border="false"
          :default-expand-all="false"
          style="width: 100%; font-size: 12px !important;"
        >
          <el-table-column type="expand" style="overflow: hidden">
            <template slot-scope="props">
              <div v-if="props.row.records && props.row.records.length > 0">
                <el-table
                  :data="props.row.records"
                  :border="false"
                  :show-header="false"
                >
                  <el-table-column width="200" />
                  <el-table-column
                    v-for="(field, key) in filedLists"
                    :key="key"
                    :column-key="field.column_name"
                    :label="field.name"
                    :align="isNumberField(field.display_type) ? 'right' : 'left'"
                    width="150"
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
                  >
                    <template slot-scope="scope">
                      <span @click="hangleChangeRecord(scope.row)">
                        <options-panel
                          :action-option="actionOption"
                          :current-resource="scope.row"
                          :is-option-edit="true"
                          :is-panel-right="isPanelRight"
                          :is-option-delete="true"
                          :display-definition="currentDisplayDefinition"
                          style="float: right;"
                        />
                      </span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-table-column>
          <el-table-column width="150" label="Title">
            <template slot-scope="scope">
              <el-badge :value="scope.row.records ? scope.row.records.length : 0" style="font-size: 16px; font-weight: bold;" type="primary">
                {{ isEmptyValue(scope.row.name) ? $t('form.kanban.noStatus') : scope.row.name }}
              </el-badge>
            </template>
          </el-table-column>
          <el-table-column
            v-for="field in filedLists"
            :key="field.id"
            :label="field.name"
            style="font-weight: bold;"
            width="150"
          />
          <el-table-column
            fixed="right"
            width="30"
          >
            <template slot-scope="scope">
              <el-button
                plain
                circle
                type="success"
                style="padding: 1px"
                :title="$t('component.displayDefinition.cardNew')"
                @click="newEntry(scope.row)"
              >
                <el-icon class="el-icon-plus" />
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
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
    function theAction(event) {
      switch (event.srcKey) {
        case 'new':
          store.dispatch('changeTabPanelDefinition', {
            type: 'new',
            displyDefinitions: currentDisplayDefinition.value,
            recordId: -1
          })
          store.commit('setShowPanel', {
            id: currentDisplayDefinition.value.id,
            show: true
          })
          break
      }
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
      newEntry,
      theAction
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
.el-table th.el-table__cell.is-leaf, .el-table td.el-table__cell {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
.el-table--enable-row-transition .el-table__body td.el-table__cell {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  border: none
}
.el-table__body-wrapper .is-scrolling-left {
  overflow: hidden;
}
</style>

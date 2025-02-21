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
        {{ currentDisplyDefinitions.name }}
      </span>
      <div style="color: rgb(130, 132, 138);">
        {{ currentDisplyDefinitions.description }}
      </div>
    </div>
    <el-card>
      <div>
        <el-table
          ref="tableGroup"
          v-loading="isLoading"
          class="table-group"
          :height="600"
          :data="groupDefinition.records"
          :border="false"
          :default-expand-all="false"
          style="width: 100%; font-size: 12px !important;"
          :row-class-name="rowClassName"
        >
          <el-table-column type="expand" style="overflow: hidden; border-left: 20px solid red;">
            <template slot-scope="props">
              <div v-if="props.row.childs && props.row.childs.length > 0">
                <el-table
                  :data="props.row.childs"
                  :border="false"
                  :show-header="false"
                  :row-class-name="childRowClassName"
                >
                  <el-table-column width="50" />
                  <el-table-column fixed="right" label="">
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
                  <el-table-column
                    v-for="(field, key) in filedListsChild"
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
                </el-table>
              </div>
            </template>
          </el-table-column>

          <el-table-column width="250" label="Title">
            <template slot-scope="scope">
              <div class="parent-row">
                <span>
                  <el-badge :value="scope.row.childs ? scope.row.childs.length : 0" style="font-size: 16px; font-weight: bold;" type="primary">
                    {{ isEmptyValue(scope.row.title) ? $t('form.kanban.noStatus') : scope.row.title }}
                  </el-badge>
                </span>
                <span>
                  <div style="color: rgb(130, 132, 138);">
                    {{ scope.row.description }}
                  </div>
                </span>
              </div>
            </template>
          </el-table-column>
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
            v-for="field in filedLists"
            :key="field.id"
            :label="field.name"
            style="font-weight: bold;"
            width="150"
          />
          <el-table-column fixed="right" width="30">
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
  </span>
</template>

<script>
import store from '@/store'

import {
  defineComponent,
  // onMounted,
  computed
  // nextTick,
  // watch,
  // ref
} from '@vue/composition-api'

// Components and Mixins
import optionsPanel from '@/components/ADempiere/TabManager/tabDisplayDefinitions/componentPanel/optionsPanel.vue'

// // Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { isNumberField } from '@/utils/ADempiere/references'

export default defineComponent({
  name: 'Group',
  components: {
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
    actionOption: {
      type: Function,
      default: (recordPrevious) => {
        console.info('implement method Open Action New', recordPrevious)
      }
    },
    hangleChangeRecord: {
      type: Function,
      default: (record) => {
        console.info('implement method Change to Previous Record ', record)
      }
    }
  },

  setup(props) {
    const currenPanelGroup = computed(() => {
      return store.getters.getGroupPanel({
        tableName: props.tabAttributes.table_name,
        isPanel: props.isPanelRight
      })
    })
    const groupDefinition = computed(() => {
      if (props.isPanelRight) {
        return store.getters.getCurrentGroupPanelRightDefinition({
          tableName: props.tabAttributes.table_name
        })
      }
      return store.getters.getCurrentGroupDefinition({
        tableName: props.tabAttributes.table_name
      })
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
        return store.getters.getGroupPanelRightLoading({
          tableName: props.tabAttributes.table_name
        })
      }
      return store.getters.getGroupLoading({
        tableName: props.tabAttributes.table_name
      })
    })
    const filedLists = computed(() => {
      if (isEmptyValue(currentDisplayDefinition.value.field_definitions)) return []
      return currentDisplayDefinition.value.field_definitions.filter(field => field.is_displayed_grid)
    })
    const filedListsChild = computed(() => {
      if (isEmptyValue(currentDisplayDefinition.value.child_display_definition)) return []
      return currentDisplayDefinition.value.child_display_definition.field_definitions
    })
    function newEntry(currentColumn) {
      const { value, name } = currentColumn
      const { column_name } = groupDefinition.value
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
    function displayValue({
      fields,
      columnName
    }) {
      if (isEmptyValue(fields)) return
      const column = fields.fields
      if (isEmptyValue(column[columnName])) return
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
    function rowClassName({ row }) {
      if (row.childs) {
        return 'parent-row-border'
      }
      return 'row-empty'
    }
    function childRowClassName() {
      return 'child-row'
    }
    return {
      // computed
      currenPanelGroup,
      groupDefinition,
      currentDisplayDefinition,
      displayDefinitionMetadata,
      displayDefinitionFields,
      isLoading,
      filedLists,
      filedListsChild,
      //
      newEntry,
      theAction,
      displayValue,
      readRecord,
      rowClassName,
      childRowClassName,
      //
      isNumberField
    }
  }
})

</script>

<style>
.el-table__row .expanded {
  font-size: 12px !important;
  font-weight: 700 !important;
}
.el-table--enable-row-transition .el-table__body td.el-table__cell {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
.el-table th.el-table__cell.is-leaf, .el-table td.el-table__cell {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
.el-badge__content.is-fixed {
  top: 11px !important;
  right: -7px !important
}
.el-card__body{
  padding: 0 !important;
}
.table-group .parent-row-border > td:nth-child(1) {
  padding-left: 0 !important;
  margin-left: 0 !important;
  border-left: 10px solid yellowgreen;
}
.table-group .child-row > td:nth-child(2) {
  border-left: 5px solid blue;
}
.table-group .row-empty > td:nth-child(1) {
  border-left: 10px solid rgb(0, 200, 255);
}
</style>

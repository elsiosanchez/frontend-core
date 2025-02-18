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
    <el-card v-loading="isLoading" class="catalog" :body-style="{ padding: '10px' }">
      <div
        v-shortkey="{ new: ['ctrl', 'alt', 'n'] }"
        @shortkey="theAction"
      >
        <div slot="header">
          <el-button
            plain
            circle
            type="success"
            style="padding: 5px 5px;float: right"
            :title="$t('component.displayDefinition.cardNew')"
            @click="newEntry"
          >
            <el-icon class="el-icon-plus" />
          </el-button>
        </div>
        <el-row :gutter="5">
          <span
            v-for="element in listRecords"
            :key="element.id"
            @dblclick="isOpenDetails(element.id)"
            @click="hangleChangeRecord(element)"
          >
            <el-col :span="columnNumber" style="padding: 5px !important;">
              <el-card class="catalog" shadow="never">
                <div slot="header">
                  <span class="card-title">
                    {{ element.title }}
                  </span>
                  <options-panel
                    :action-option="actionOption"
                    :current-resource="element"
                    :is-option-edit="true"
                    :is-option-delete="true"
                    :display-definition="currentDisplayDefinition"
                    style="float: right;"
                  />
                </div>
                <el-row :gutter="0">
                  <el-col :span="4" style="text-align: center !important;padding-top: 10px !important;">
                    <el-avatar
                      src="https://empty"
                      shape="square"
                      :size="60"
                      @error="errorHandler"
                    >
                      <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png">
                    </el-avatar>
                  </el-col>
                  <el-col :span="20">
                    <el-row v-if="!isEmptyValue(displayDefinitionFields)" :gutter="0">
                      <span
                        v-for="(field, key) in displayDefinitionFields"
                        :key="key"
                      >
                        <el-col :span="12" style="padding: 0px !important;">
                          <el-descriptions :column="2" size="mini">
                            <el-descriptions-item
                              label-class-name="title-description"
                              :label="field.name"
                              content-class-name="content-description"
                            >
                              <text-truncation
                                :full-text="displayValue({ fields: element.fields, columnName: field.column_name })"
                                :max-words="3"
                                :max-lines="1.5"
                                style="display: flex;"
                              />
                            </el-descriptions-item>
                          </el-descriptions>
                        </el-col>
                      </span>
                    </el-row>
                  </el-col>
                </el-row>
              </el-card>
            </el-col>
          </span>
        </el-row>
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

// Components and Mixins
import draggable from 'vuedraggable'
import optionsPanel from '@/components/ADempiere/TabManager/tabDisplayDefinitions/componentPanel/optionsPanel.vue'
import TextTruncation from '@/components/ADempiere/PanelDisplayDefinitions/TextTruncation'
// API Request Methods

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { containerManagerFieldDefinition } from '@/utils/ADempiere/displayDefinition'

export default defineComponent({
  name: 'MosaicDefinition',

  components: {
    draggable,
    optionsPanel,
    TextTruncation
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
    const columnNumber = computed(() => {
      if (props.isPanelRight) return 12
      return 8
    })
    const currenPanelMosaic = computed(() => {
      return store.getters.getMosaicPanel({
        tableName: props.tabAttributes.table_name,
        isPanel: props.isPanelRight
      })
    })

    const mosaicDefinition = computed(() => {
      if (props.isPanelRight) {
        return store.getters.getCurrentMosaicPanelRightDefinition({
          tableName: props.tabAttributes.table_name
        })
      }
      return store.getters.getCurrentMosaicDefinition({
        tableName: props.tabAttributes.table_name
      })
    })

    const listRecords = computed(() => {
      return mosaicDefinition.value.records
    })

    const columnsList = computed(() => {
      if (
        isEmptyValue(mosaicDefinition.value) ||
        isEmptyValue(mosaicDefinition.value.steps)
      ) {
        return []
      }
      const { records } = mosaicDefinition.value

      return records
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
          .filter(fields => fields.is_displayed_grid)
          .sort((a, b) => a.sequence - b.sequence)
          .splice(0, 3)
      }
      return []
    })

    const isLoading = computed(() => {
      if (props.isPanelRight) {
        return store.getters.getMosaicPanelRightLoading({
          tableName: props.tabAttributes.table_name
        })
      }
      return store.getters.getMosaicLoading({
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
        const { column_name } = mosaicDefinition.value
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
        store.commit('setMosaicRightLoading', {
          tableName: props.tabAttributes.table_name,
          isLoading: load
        })
        return
      }
      store.commit('setMosaicLoading', {
        tableName: props.tabAttributes.table_name,
        isLoading: load
      })
    }

    function newEntry(currentColumn) {
      if (isEmptyValue(currentColumn)) {
        store.dispatch('changeTabPanelDefinition', {
          type: 'new',
          displyDefinitions: currentDisplayDefinition.value,
          recordId: -1,
          additionalAttributes
        })
        store.commit('setShowPanel', {
          id: currentDisplayDefinition.value.id,
          show: true
        })
        return
      }
      const { value, column_name, title } = currentColumn
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
      const { display_value, value } = fields[columnName]
      if (!isEmptyValue(display_value)) return display_value
      return value
    }

    function errorHandler() {
      return true
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
      // Computeds
      columnsList,
      isMobile,
      isLoading,
      listRecords,
      dragOptions,
      displayDefinitionFields,
      actionsManagers,
      currenPanelMosaic,
      mosaicDefinition,
      columnNumber,
      currentDisplayDefinition,
      // Mehtods
      handleCardMove,
      displayValue,
      errorHandler,
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
.catalog {
  .el-card__header {
    padding: 0px 10px;
    border-bottom: 1px solid #e6ebf5;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    height: 35px !important;
  }
  .card-title {
    text-overflow: ellipsis;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    max-width: 300px;
  }
}
.title-description {
  font-weight: bold;
  // color: black;
}
.content-description {
  text-align: initial;
}
</style>

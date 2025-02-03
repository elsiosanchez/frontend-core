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
  <el-card
    v-loading="isLoading"
    class="box-card-display-definition"
    :body-style="{ padding: '0px' }"
  >
    <div slot="header" class="clearfix">
      <p style="text-align: center;margin-top: 0px;margin-bottom: 0px;background: #e8f4ffa8;">
        <b style="font-size: larger;">
          {{ title }}
        </b>
        <br>
      </p>
      <p v-show="!isEmptyValue(description)" style="padding: 0px 10px;margin: 0px;">
        <text-truncation
          :full-text="description"
          :max-words="15"
          :max-lines="4"
        />
      </p>
    </div>
    <div>
      <el-empty v-if="isEmptyValue(fields)" :description="$t('component.displayDefinition.fieldEmpty')" />
      <el-descriptions v-else class="margin-top" :column="2" direction="horizontal">
        <el-descriptions-item
          v-for="field in fields"
          :key="field.sequence"
        >
          <template slot="label">
            <b> {{ field.name }} </b>
          </template>
          <span v-if="!field.is_show_components" style="display: flex;">
            <text-truncation
              :full-text="displayValue(recordMetadata.fields, field.column_name)"
              :max-words="3"
              :max-lines="1.5"
              style="display: flex;"
            />
            <el-button
              v-show="field.is_update_record && !field.is_show_components"
              style="padding: 0px;"
              icon="el-icon-edit"
              type="text"
              @click="ShowFieldComponent(field)"
            />
          </span>
          <span v-else>
            <FieldsDisplayDefinitions
              v-if="!isEmptyValue(recordMetadata.fields) && !isEmptyValue(field.column_name) && !isEmptyValue(recordMetadata.fields[field.column_name])"
              :field="field"
              :current-record="recordMetadata"
              :field-metadata="recordMetadata.fields[field.column_name]"
              :current-display-definition="currentDisplyDefinitions"
              :display-value="displayValue(recordMetadata.fields, field.column_name)"
              :update-field="updateFieldRecord"
              :update-record="updateRecord"
            >
              <template v-slot:button>
                <el-button
                  style="padding: 0px;color: red;font-size: medium;font-weight: 900;"
                  icon="el-icon-close"
                  type="text"
                  @click="hiddenFieldComponent(field)"
                />
              </template>
            </FieldsDisplayDefinitions>
          </span>
        </el-descriptions-item>
      </el-descriptions>
      <slot name="footer-buttons" />
      <el-popover
        v-model="localShowDeleteConfirmation"
        trigger="manual"
        placement="top"
        width="450"
        :title="$t('window.confirmDeleteRecord')"
      >
        <el-button
          slot="reference"
          type="danger"
          class="button-base-icon button-base-delete"
          icon="el-icon-delete"
          style="float: right;"
          :loading="isLoadingDelete"
          :disabled="recordMetadata.is_read_only"
          @click="showDelete(true)"
        />
        <div
          style="text-align: right; margin: 0;margin-top: 5px;"
        >
          <el-button
            type="danger"
            class="button-base-icon"
            icon="el-icon-close"
            @click="showDelete(false)"
          />
          <el-button
            type="primary"
            class="button-base-icon"
            icon="el-icon-check"
            @click="removerRecord()"
          />
        </div>
      </el-popover>
    </div>
  </el-card>
</template>

<script>
import { defineComponent, computed, ref, watch } from '@vue/composition-api'

import store from '@/store'

// Component
import FieldsDisplayDefinitions from '@/components/ADempiere/FieldsDisplayDefinitions'
import TextTruncation from '@/components/ADempiere/PanelDisplayDefinitions/TextTruncation'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'PanelDisplayDefinitions',

  components: {
    FieldsDisplayDefinitions,
    TextTruncation
  },

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
    currentDisplyDefinitions: {
      type: Object,
      required: true
    },
    currentRecord: {
      type: Object,
      required: false
    },
    buttonClosePanel: {
      type: Function,
      required: false
    },
    detailsTitle: {
      type: String,
      required: false
    }
  },

  setup(props) {
    // Ref
    const showButton = ref(false)
    const isLoadingDelete = ref(false)
    const localShowDeleteConfirmation = ref(false)
    // const recordMetadata = ref({})
    // recordMetadata.value = props.currentRecord
    // Computed
    const showDeleteConfirmation = computed(() => {
      return store.getters.getShowDeleteConfirmation
    })
    const recordMetadata = computed(() => {
      if (!isEmptyValue(getRecordValuesData.value)) return getRecordValuesData.value.data
      return {
        isLoading: false,
        data: {}
      }
    })
    const title = computed(() => {
      if (!isEmptyValue(props.detailsTitle)) {
        return props.detailsTitle
      }
      return recordMetadata.value.title || ''
    })

    const getRecordValuesData = computed(() => {
      return store.getters.getRecordValuesData({
        recordId: props.currentRecord.id
      })
    })

    const isLoading = computed(() => {
      if (!isEmptyValue(getRecordValuesData.value)) return getRecordValuesData.value.isLoading
      return false
    })

    const description = computed(() => {
      return recordMetadata.value.description || ''
    })

    const displayDefinitionMetadata = computed(() => {
      return store.getters.getDisplayTabDefinition({
        id: props.currentDisplyDefinitions.id
      })
    })

    const fields = computed(() => {
      if (
        !isEmptyValue(displayDefinitionMetadata.value) &&
        !isEmptyValue(displayDefinitionMetadata.value.fields)
      ) {
        return displayDefinitionMetadata.value.fields
      }
      return []
    })

    function displayValue(field, column_name) {
      if (
        !isEmptyValue(field) &&
        !isEmptyValue(field[column_name])
      ) {
        const { value: info, display_value } = field[column_name]
        if (!isEmptyValue(info) && typeof info === 'object' && info.type === 'date') {
          return formatDate({ value: info.value })
        }
        if (!isEmptyValue(display_value) && display_value !== 'null') {
          return display_value
        }
        return info
      }
      return ''
    }

    function ShowFieldComponent(field) {
      field.is_show_components = true
    }

    function hiddenFieldComponent(field) {
      field.is_show_components = false
    }

    function updateFieldRecord(value, field) {
      // recordMetadata.value.fields[field.column_name].value = value
      hiddenFieldComponent(field)
    }

    function updateRecord(attributes, field) {
      // recordMetadata.value = attributes
      hiddenFieldComponent(field)
    }
    function removerRecord() {
      showDelete(false)
      isLoadingDelete.value = true
      store.dispatch('removerRecord', {
        recordId: props.currentRecord.id,
        displayDefinitionId: props.currentDisplyDefinitions.id
      })
        .then(() => {
          props.buttonClosePanel('')
          isLoadingDelete.value = false
        })
        .catch(() => {
          isLoadingDelete.value = false
        })
        .finally(() => {
          isLoadingDelete.value = false
          store.commit('setShowPanel', false)
        })
    }
    function deleteRecord() {
      showDelete(true)
    }

    if (isEmptyValue(recordMetadata.value)) {
      store.dispatch('readRecordData', {
        recordId: props.currentRecord.id,
        displayDefinitionId: props.currentDisplyDefinitions.id
      })
    }
    function showDelete(show = true) {
      store.commit('setShowDeleteConfirmation', show)
    }
    watch(showDeleteConfirmation, (newValue) => {
      localShowDeleteConfirmation.value = newValue
    })
    return {
      // Ref
      showButton,
      recordMetadata,
      localShowDeleteConfirmation,
      // Computeds
      title,
      fields,
      isLoading,
      isLoadingDelete,
      getRecordValuesData,
      displayDefinitionMetadata,
      description,
      showDeleteConfirmation,
      // Methods
      deleteRecord,
      updateRecord,
      displayValue,
      updateFieldRecord,
      ShowFieldComponent,
      hiddenFieldComponent,
      removerRecord,
      showDelete
    }
  }
})
</script>

<style lang="scss">
.box-card-display-definition {
  width: 100%;
  height: 100%;
  overflow: auto;
  .el-card__header {
    padding: 0px;
  }
}
</style>

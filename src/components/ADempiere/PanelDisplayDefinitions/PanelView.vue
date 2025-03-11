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
    v-loading="isLoadingRecord"
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
          :max-words="16"
          :max-lines="4"
        />
      </p>
    </div>
    <div>
      <el-card shadow="never" class="card-text-content" :body-style="{ padding: '5px'}">
        <el-empty v-if="isEmptyValue(localFields)" :description="$t('component.displayDefinition.fieldEmpty')" />
        <el-row v-else>
          <el-col
            v-for="(group, keyGroup) in localFields"
            :key="keyGroup"
            :span="24"
          >
            <fieldset style="padding: 0.35em 0.75em 0.625em;border-radius: 6px;border: 1px solid #1890ff7a;">
              <legend>{{ group.title }}</legend>
              <el-form
                label-position="top"
                label-width="100px"
                size="small"
                class="field-component-display-definition"
              >
                <template
                  v-for="(field, key) in group.fields"
                >
                  <el-col :key="key" :span="sizeSpan(group.fields)">
                    <el-form-item
                      :label="field.name"
                      :required="field.isMandatory"
                      style="padding: 0px !important;"
                      class="label-field-title-display-definition"
                    >
                      <span v-if="!field.is_show_components" style="display: flex;">
                        <text-truncation
                          :full-text="displayValue(recordMetadata.fields, field.column_name)"
                          :max-words="3"
                          :max-lines="1.5"
                          style="display: flex;"
                        />
                        <el-button
                          v-show="field.is_update_record && !field.is_show_components && !field.is_read_only"
                          style="padding: 0px;"
                          icon="el-icon-edit"
                          type="text"
                          @click="ShowFieldComponent(field)"
                        />
                      </span>
                      <span v-else style="display: flex;padding-right: 10px;">
                        <FieldsDisplayDefinitions
                          v-if="!isEmptyValue(recordMetadata.fields) && !isEmptyValue(field.column_name) && !isEmptyValue(recordMetadata.fields[field.column_name])"
                          :field="field"
                          :current-record="recordMetadata"
                          :field-metadata="recordMetadata.fields[field.column_name]"
                          :current-display-definition="currentDisplyDefinitions"
                          :display-value="displayValue(recordMetadata.fields, field.column_name)"
                          :update-field="updateFieldRecord"
                          :update-record="updateRecord"
                          :is-panel-right="isPanelRight"
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
                    </el-form-item>
                  </el-col>
                </template>
              </el-form>
            </fieldset>
          </el-col>
        </el-row>
      </el-card>
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
import language from '@/lang'
// Component
import FieldsDisplayDefinitions from '@/components/ADempiere/FieldsDisplayDefinitions'
import TextTruncation from '@/components/ADempiere/PanelDisplayDefinitions/TextTruncation'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'
import { containerManagerFieldDefinition } from '@/utils/ADempiere/displayDefinition'
// Constants
// import { TEXT } from '@/utils/ADempiere/references'

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
    },
    isPanelRight: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    // Ref
    const localFields = ref([])
    // const fieldList = ref([])
    const showButton = ref(false)
    const isLoadingDelete = ref(false)
    const localShowDeleteConfirmation = ref(false)
    // const recordMetadata = ref({})
    // recordMetadata.value = props.currentRecord
    // Computed
    const showDeleteConfirmation = computed(() => {
      return store.getters.getShowDeleteConfirmation
    })

    const isLoadingRecord = computed(() => {
      return store.getters.getRecordLoading({
        recordId: props.currentRecord.id
      })
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
      const tabDefinition = store.getters.getDisplayTabDefinition({
        id: props.currentDisplyDefinitions.id
      })
      return tabDefinition
    })

    const fieldList = computed(() => {
      let fieldList
      if (
        !isEmptyValue(displayDefinitionMetadata.value) &&
        !isEmptyValue(displayDefinitionMetadata.value.fields)
      ) {
        fieldList = displayDefinitionMetadata.value.fields
      } else {
        fieldList = props.currentDisplyDefinitions.field_definitions
      }
      if (
        !isEmptyValue(fieldList)
      ) {
        return fieldList
          .filter(field => field.is_displayed)
          .map(field => ({
            ...field,
            is_show_components: false
          }))
      }
      return []
    })

    localFields.value = groupAndSortFields(fieldList.value)

    // Constants
    const { currentTab } = store.getters.getContainerInfo

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
      containerManagerFieldDefinition.deleteRecord({
        recordId: props.currentRecord.id,
        currentTab,
        isPanelRight: props.isPanelRight,
        displyDefinitions: props.currentDisplyDefinitions
      })
        .finally(() => {
          isLoadingDelete.value = false
        })
    }
    function deleteRecord() {
      showDelete(true)
    }

    function showDelete(show = true) {
      store.commit('setShowDeleteConfirmation', show)
    }
    // function updateLocalFields() {
    //   if (
    //     !isEmptyValue(displayDefinitionMetadata.value) &&
    //     !isEmptyValue(displayDefinitionMetadata.value.fields)
    //   ) {
    //     localFields.value = displayDefinitionMetadata.value.fields.map(field => ({
    //       ...field,
    //       is_show_components: false
    //     }))
    //   }
    // }

    function groupAndSortFields(fields) {
      const grouped = fields.reduce((acc, field) => {
        const groupKey = field.field_group ? field.field_group.name : language.t('field.noGroup')
        if (!acc[groupKey]) {
          acc[groupKey] = []
        }
        acc[groupKey].push(field)
        return acc
      }, {})

      Object.keys(grouped).forEach(group => {
        grouped[group].sort((a, b) => a.sequence - b.sequence)
      })

      const result = Object.keys(grouped)
        .filter(group => group !== language.t('field.noGroup'))
        .map(group => ({
          title: group,
          fields: grouped[group]
        }))

      if (grouped[language.t('field.noGroup')]) {
        result.push({
          title: language.t('field.noGroup'),
          fields: grouped[language.t('field.noGroup')]
        })
      }

      return result
    }

    function sizeSpan(quantityFields) {
      if (quantityFields.length <= 1) {
        return 24
      } else if (quantityFields.length <= 2) {
        return 12
      } else if (quantityFields.length <= 3) {
        return 8
      } else if (quantityFields.length >= 4) {
        return 6
      }
    }

    watch(showDeleteConfirmation, (newValue) => {
      localShowDeleteConfirmation.value = newValue
    })
    // watch(displayDefinitionMetadata, (newValue) => {
    //   updateLocalFields()
    // })

    // onMounted(() => {
    //   updateLocalFields()
    // })
    return {
      // Ref
      localFields,
      showButton,
      recordMetadata,
      localShowDeleteConfirmation,
      // Computeds
      title,
      isLoading,
      description,
      fieldList,
      isLoadingRecord,
      isLoadingDelete,
      getRecordValuesData,
      displayDefinitionMetadata,
      showDeleteConfirmation,
      // Methods
      sizeSpan,
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
.button-base-delete{
  background: #f8eeee;
  color: #ff1e1e;
  border-color: #eba1a1;
  float: left !important;
  &:hover {
    background: #ff1e1e;
    border-color: #ff1e1e;
    color: #fff;
  }
}
</style>

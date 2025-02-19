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
  <span style="display: flex;padding-right: 10px;">
    <el-select
      ref="inputSelect"
      v-model="fieldValue"
      remote
      clearable
      size="mini"
      filterable
      reserve-keyword
      :placeholder="fieldMetadata.description"
      :remote-method="remoteMethod"
      :loading="isLoadingSearch"
      style="width: 100%;"
      @visible-change="showList"
      @change="saveFieldValue"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.display_value"
        :value="item.value"
      />
    </el-select>
    <span v-if="!isNewRecord" style="display: flex;">
      <slot name="button-exit" />
      <el-button
        v-show="fieldValue !== displayValueOld && !isLoading"
        style="padding: 0px;color: green;font-size: medium;font-weight: 900;"
        icon="el-icon-check"
        type="text"
        @click="updateFieldValue(fieldValue, fieldMetadata)"
      />
      <i v-if="isLoading" class="el-icon-loading" />
    </span>
  </span>
</template>

<script>
import {
  defineComponent,
  computed,
  ref,
  onMounted
} from '@vue/composition-api'

// import lang from '@/lang'
import store from '@/store'
// Constants
import { DISPLAY_COLUMN_PREFIX } from '@/utils/ADempiere/dictionaryUtils'
// Utils and Helper Methods
import { getContext } from '@/utils/ADempiere/contextUtils'
// API Request Methods
import { requestLookupList } from '@/api/ADempiere/fields/lookups.ts'
import { isEmptyValue } from '@/utils/ADempiere'
import { containerManagerFieldDefinition } from '@/utils/ADempiere/displayDefinition'
import { getContextAttributes } from '@/utils/ADempiere/contextUtils/contextAttributes'

export default defineComponent({
  name: 'FieldSelect',

  props: {
    fieldMetadata: {
      type: Object,
      required: true
    },
    currentDisplayDefinition: {
      type: Object,
      required: false
    },
    currentRecord: {
      type: Object,
      required: false
    },
    displayValue: {
      type: [String, Number, Boolean],
      required: false
    },
    updateField: {
      type: Function,
      required: false
    },
    isNewRecord: {
      type: Boolean,
      required: false
    },
    additionalAttributes: {
      type: Object,
      required: false
    },
    isPanelRight: {
      type: Boolean,
      default: false
    },
    persistenceData: {
      type: Function,
      required: false
    },
    isValueBachtEntry: {
      type: [Boolean, Number, String, Object],
      required: false
    },
    isPanelGeneral: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const fieldValue = ref('')
    const displayValueOld = ref('')
    const isLoading = ref(false)
    const isLoadingSearch = ref(false)
    const options = ref([])
    const timeOut = ref(null)
    const inputSelect = ref(undefined)
    const { currentTab } = store.getters.getContainerInfo
    const { containerUuid, parentUuid } = currentTab
    const { internal_id, column_name } = props.fieldMetadata

    const IsSOTrx = computed(() => {
      const IsSOTrx = getContextAttributes({
        parentUuid,
        containerUuid,
        contextColumnNames: ['IsSOTrx'],
        isBooleanToString: true,
        format: 'object'
      })
      if (isEmptyValue(IsSOTrx)) return ''
      return JSON.stringify(IsSOTrx)
    })

    const lookupsAttribute = computed(() => {
      if (column_name === 'S_Resource_ID' && props.currentDisplayDefinition.is_resource) {
        return {
          columnId: internal_id
        }
      }
      if (props.isPanelGeneral) {
        return {
          fieldId: internal_id
        }
      }
      return {
        displayDefinitionFieldId: internal_id
      }
    })

    const contextValue = computed(() => {
      return getContext({
        parentUuid,
        containerUuid,
        columnName: column_name
      })
    })
    const contextDisplayValue = computed(() => {
      return getContext({
        columnName: DISPLAY_COLUMN_PREFIX + column_name,
        containerUuid,
        parentUuid
      })
    })

    // Watchers
    if (!isEmptyValue(props.currentRecord) && !isEmptyValue(props.currentRecord.fields)) {
      loadRecordValue({
        fieldList: props.currentRecord.fields,
        columnName: props.fieldMetadata.column_name
      })
    }
    if (props.isNewRecord) {
      loadDefaultValueFromServer()
    }

    // Methods
    function saveFieldValue(value, field) {
      if (isEmptyValue(value)) options.value = []
      if (props.isNewRecord) {
        props.updateField(value, props.fieldMetadata)
        if (props.fieldMetadata.is_allow_copy && props.fieldMetadata.is_quick_entry) dataBachtEntry(value)
        return
      }
    }

    function updateFieldValue(value, field) {
      isLoading.value = true
      containerManagerFieldDefinition.updateField({
        recordId: props.currentRecord.id,
        displyDefinitions: props.currentDisplayDefinition,
        currentTab,
        isPanelRight: props.isPanelRight,
        attributes: {
          [field.column_name]: value
        }
      })
        .finally(() => {
          isLoading.value = false
          props.updateField(value, field)
        })
    }

    function showList(isShow) {
      if (isShow && options.value.length <= 1 || !isEmptyValue(options.value)) {
        remoteMethod()
        return
      }
    }

    function remoteMethod(searchValue) {
      if (isEmptyValue(searchValue) && !isEmptyValue(options.value)) return
      clearTimeout(timeOut.value)
      timeOut.value = setTimeout(() => {
        isLoadingSearch.value = true
        requestLookupList({
          searchValue,
          pageSize: 10,
          contextAttributesList: IsSOTrx.value,
          ...lookupsAttribute.value
        })
          .then(responseLookupItem => {
            const { records } = responseLookupItem
            options.value = records.map(list => {
              const { values } = list
              return {
                display_value: values.DisplayColumn,
                value: values.KeyColumn
              }
            })
          })
          .finally(() => {
            isLoadingSearch.value = false
          })
      }, 500)
    }

    /**
     * Get server default value
     */
    function loadDefaultValueFromServer() {
      const { column_name } = props.fieldMetadata
      if (props.isPanelRight) {
        if (
          !isEmptyValue(contextDisplayValue.value) &&
          !isEmptyValue(contextValue.value)
        ) {
          getContexValues({
            value: contextValue.value,
            displayValue: contextDisplayValue.value
          })
          return
        }
      }
      let defaultValues
      if (
        !isEmptyValue(props.additionalAttributes) &&
        !isEmptyValue(props.additionalAttributes[column_name])
      ) {
        defaultValues = props.additionalAttributes[column_name]
      }
      if (!isEmptyValue(defaultValues)) {
        options.value = [defaultValues]
        fieldValue.value = defaultValues.value
        saveFieldValue(defaultValues.value)
        return
      }
      fieldValue.value = ''
      options.value = []
    }

    /**
     * Set Record Values
     * @param {Array} fieldList
     * @param {String} columnName
     */
    function loadRecordValue({
      fieldList,
      columnName
    }) {
      fieldValue.value = fieldList[columnName].value
      displayValueOld.value = fieldList[columnName].value
      options.value = [fieldList[columnName]]
    }

    /**
     * Get Contex Values
     */
    function getContexValues({
      displayValue,
      value
    }) {
      fieldValue.value = value
      options.value = [{
        display_value: displayValue,
        value: value
      }]
      saveFieldValue(value)
    }

    function dataBachtEntry(value) {
      const data = {
        value,
        options: options.value
      }
      props.persistenceData(data, props.fieldMetadata)
    }

    if (
      props.isNewRecord &&
      props.fieldMetadata.is_allow_copy &&
      props.fieldMetadata.is_quick_entry &&
      !isEmptyValue(props.isValueBachtEntry)
    ) {
      fieldValue.value = props.isValueBachtEntry.value
      options.value = props.isValueBachtEntry.options
    }
    onMounted(() => {
      if (props.fieldMetadata.sequence === 10) {
        inputSelect.value.focus()
      }
    })
    return {
      // Ref
      fieldValue,
      options,
      isLoading,
      timeOut,
      isLoadingSearch,
      displayValueOld,
      inputSelect,
      // Computed
      lookupsAttribute,
      contextValue,
      contextDisplayValue,
      // Methods
      showList,
      remoteMethod,
      getContexValues,
      updateFieldValue,
      requestLookupList,
      saveFieldValue
    }
  }
})
</script>

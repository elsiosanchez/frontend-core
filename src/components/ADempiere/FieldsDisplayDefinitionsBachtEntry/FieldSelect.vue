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
  <el-select
    ref="firstInput"
    v-model="fieldMetadata.value"
    remote
    clearable
    size="mini"
    filterable
    reserve-keyword
    :placeholder="fieldMetadata.description"
    :remote-method="remoteMethod"
    :loading="isLoadingSearch"
    style="padding-right: 10px;width: 100%;"
    :disabled="isReadOnly"
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
</template>

<script>
import {
  defineComponent,
  computed,
  ref
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
    },
    isReadOnly: {
      type: Boolean,
      default: false
    },
    containerManager: {
      type: Object,
      required: true
    },
    fieldList: {
      type: Array,
      required: false
    }
  },

  setup(props) {
    const fieldValue = ref('')
    const displayValueOld = ref('')
    const isLoading = ref(false)
    const isLoadingSearch = ref(false)
    const options = ref([])
    const timeOut = ref(null)

    const { containerUuid, parentUuid, reference } = props.fieldMetadata

    const defaultValue = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        parentUuid: props.fieldMetadata.parentUuid,
        columnName: props.fieldMetadata.column_name,
        containerUuid: props.fieldMetadata.containerUuid
      })
    })

    const defaultDisplayValue = computed(() => {
      return store.getters.getValueOfFieldOnContainer({
        parentUuid: props.fieldMetadata.parentUuid,
        columnName: props.fieldMetadata.displayColumnName,
        containerUuid: props.fieldMetadata.containerUuid
      })
    })

    const contexAttribute = ref({})

    const lookupsAttribute = computed(() => {
      return {
        fieldId: props.fieldMetadata.id,
        contextAttributesList: contexAttribute.value
      }
    })
    const contextValue = computed(() => {
      return getContext({
        parentUuid,
        containerUuid,
        columnName: props.fieldMetadataa.columnName
      })
    })
    const contextDisplayValue = computed(() => {
      return getContext({
        columnName: DISPLAY_COLUMN_PREFIX + props.fieldMetadataa.columnName,
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
    if (props.isNewRecord && props.fieldMetadata.defaultValue) {
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
      if (!isEmptyValue(reference.context_column_names)) {
        const attributesBachtEntry = {}
        reference.context_column_names.forEach(list => {
          const fieldValue = props.fieldList.find(field => field.columnName === list)
          attributesBachtEntry[list] = fieldValue.value
        })
        contexAttribute.value = JSON.stringify(attributesBachtEntry)
      }
      requestLookupList({
        pageSize: 10,
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
        .catch(() => {
          options.value = [{
            display_value: '',
            value: ''
          }]
          isLoadingSearch.value = false
        })
        .finally(() => {
          isLoadingSearch.value = false
        })
      // if (isShow && options.value.length <= 1 || !isEmptyValue(options.value)) {
      //   remoteMethod()
      //   return
      // }
    }

    function remoteMethod(searchValue) {
      if (isEmptyValue(searchValue) && !isEmptyValue(options.value)) return
      clearTimeout(timeOut.value)
      timeOut.value = setTimeout(() => {
        isLoadingSearch.value = true
        requestLookupList({
          searchValue,
          pageSize: 10,
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
          .catch(() => {
            options.value = [{
              display_value: '',
              value: ''
            }]
            isLoadingSearch.value = false
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
      const {
        uuid,
        columnName,
        parentUuid,
        internal_id,
        containerUuid,
        default_value,
        context_column_names
      } = props.fieldMetadata
      props.containerManager.getDefaultValue({
        parentUuid,
        containerUuid,
        contextColumnNames: context_column_names,
        defaultValue: default_value,
        uuid,
        id: internal_id,
        columnName,
        value: defaultValue.value
      })
        .then(responseLookupItem => {
          let displayedValue, value
          if (!isEmptyValue(responseLookupItem.displayedValue) && !isEmptyValue(responseLookupItem.value)) {
            displayedValue = responseLookupItem.displayedValue
            value = responseLookupItem.value
          } else {
            displayedValue = defaultDisplayValue.value
            value = defaultValue.value
          }
          props.fieldMetadata.value = defaultValue.value
          saveFieldValue(defaultValue.value)
          options.value = [{
            display_value: displayedValue,
            value
          }]
        })
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
      props.fieldMetadata.value = fieldList[columnName].value
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
      props.fieldMetadata.value = value
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
      props.fieldMetadata.value = props.isValueBachtEntry.value
      options.value = props.isValueBachtEntry.options
    }

    return {
      // Ref
      fieldValue,
      options,
      isLoading,
      timeOut,
      isLoadingSearch,
      displayValueOld,
      // Computed
      contextValue,
      defaultValue,
      contexAttribute,
      lookupsAttribute,
      defaultDisplayValue,
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

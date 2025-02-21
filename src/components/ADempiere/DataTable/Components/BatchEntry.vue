<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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
  <div
    class="field-component-bacht"
    @keyup.alt.13="saveEntity"
  >
    <el-row :gutter="20">
      <el-card
        shadow="never"
        class="card-text-content"
        :body-style="{ padding: '5px'}"
      >
        <el-col :span="24">
          <el-form
            id="fieldsDisplay"
            label-position="top"
            label-width="100px"
            size="small"
            class="field-component-bacht-entry"
          >
            <template
              v-for="(field, key) in fieldsListBatchEntry"
            >
              <el-col :key="key" :span="6">
                <el-form-item
                  :label="field.name"
                  :required="field.isMandatory"
                  style="padding: 0px !important;"
                  class="label-field-title"
                >
                  <fields-display-definitions
                    ref="fieldsDisplay"
                    :field="field"
                    :update-field="updateField"
                    :persistence-data="persistenceBachtEntry"
                    :is-new-record="true"
                    :field-list="fieldsListBatchEntry"
                    :is-panel-general="true"
                    :is-read-only="!isCreateRecord"
                    :container-manager="containerManager"
                    :is-value-bacht-entry="attributesBachtEntry[field.column_name]"
                  />
                </el-form-item>
              </el-col>
            </template>
          </el-form>
        </el-col>
        <el-col :span="24">
          <p style="text-align: end;margin: 0px;">
            <i style="color: #9198a1;margin-right: 5px;">
              {{ $t('table.dataTable.commandSave') }}
            </i>
            <b>
              {{ $t('table.dataTable.batchEntry') }}
            </b>
            <el-switch
              v-model="bachtEntry"
              active-color="#13ce66"
              inactive-color="#ff4949"
              :disabled="!isCreateRecord"
            />
            <el-button
              plain
              type="info"
              class="button-base-icon"
              style="font-size: 25px;margin-left: 5px;"
              :disabled="!isCreateRecord"
              @click="cleanField"
            >
              <svg-icon icon-class="layers-clear" />
            </el-button>
            <el-button
              type="primary"
              class="button-base-icon"
              icon="el-icon-check"
              :loading="isLoadingPanel"
              :disabled="isLoadingPanel || !isCreateRecord"
              @click="saveEntity"
            />
          </p>
        </el-col>
      </el-card>
    </el-row>
  </div>
</template>

<script>
import { defineComponent, computed, nextTick, ref } from '@vue/composition-api'

import store from '@/store'
import lang from '@/lang'

// Components and Mixins
// import FieldDefinition from '@/components/ADempiere/FieldDefinition/index.vue'
import LoadingView from '@/components/ADempiere/LoadingView/index.vue'
import FieldsDisplayDefinitions from '@/components/ADempiere/FieldsDisplayDefinitionsBachtEntry'
// Utils and Helpers Methods
import {
  isMandatoryField,
  isDisplayedField,
  isDisplayedDefault,
  isReadOnlyField
} from '@/components/ADempiere/DataTable/Components/containerManagerBatchEntry'
import { isSalesTransaction } from '@/utils/ADempiere/contextUtils'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { convertObjectToKeyValue } from '@/utils/ADempiere/formatValue/iterableFormat'
import { convertArrayKeyValueToObject } from '@/utils/ADempiere/formatValue/iterableFormat.js'
import { showMessage } from '@/utils/ADempiere/notification.js'
import { createNewRecord } from '@/utils/ADempiere/dictionary/window'
// import { containerManagerFieldDefinition } from '@/utils/ADempiere/displayDefinition'

export default defineComponent({
  name: 'BatchEntry',

  components: {
    LoadingView,
    FieldsDisplayDefinitions
  },

  props: {
    parentUuid: {
      type: String,
      required: false
    },
    containerUuid: {
      type: String,
      required: false
    },
    fieldListBatchEntry: {
      type: Array,
      default: () => []
    },
    fieldListAll: {
      type: Array,
      default: () => []
    },
    containerManager: {
      type: Object,
      required: true
    },
    tableName: {
      type: String,
      default: () => ''
    }
  },

  setup(props, { refs }) {
    const bachtEntry = ref(false)
    const isLoadingPanel = ref(false)
    const attributesBachtEntry = ref({})
    const fieldsListBatchEntry = ref([])
    const attributes = ref({})
    const containerUuid = props.containerUuid + 'Batch_Entry'

    const recordUuid = computed(() => {
      return store.getters.getUuidOfContainer(props.containerUuid)
    })

    const tabAttributes = computed(() => {
      return store.getters.getStoredTab(props.parentUuid, props.containerUuid)
    })

    const isSecondaryParentTab = computed(() => {
      return !isEmptyValue(tabAttributes.value.tabParentIndex) && tabAttributes.value.tabParentIndex > 0
    })

    const isExistsChanges = computed(() => {
      const persistenceValues = store.getters.getPersistenceAttributesChanges({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        recordUuid: recordUuid.value
      })
      return !isEmptyValue(persistenceValues)
    })

    const isCreateRecord = computed(() => {
      const { table } = tabAttributes.value
      if (!isEmptyValue(table) && table.is_view) {
        return false
      }
      if (isSecondaryParentTab.value) {
        return false
      }
      if (isExistsChanges.value) {
        return false
      }

      return createNewRecord.enabled({
        parentUuid: props.parentUuid,
        tabParentIndex: tabAttributes.value.tabParentIndex,
        containerUuid: props.containerUuid
      })
    })

    const fieldsList = computed(() => {
      return props.fieldListAll.map(fieldAttributes => {
        return {
          ...fieldAttributes,
          value: '',
          parentUuid: fieldAttributes.parentUuid + 'Batch_Entry',
          containerUuid
        }
      })
    })

    fieldsListBatchEntry.value = fieldsList.value.filter(fieldAttributes => fieldAttributes.is_quick_entry)

    const defaultValues = computed(() => {
      const isSalesTransactionContext = isSalesTransaction({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        isRecord: false
      })
      return store.getters.getTabParsedDefaultValue({
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        isSOTrxDictionary: isSalesTransactionContext
      })
    })

    defaultValues.value.forEach(attribute => {
      if (!isEmptyValue(attribute.value)) {
        store.commit('addChangeToPersistenceQueue', {
          ...attribute,
          containerUuid
        })
      }
    })

    store.dispatch('updateValuesOfContainer', {
      // parentUuid: props.parentUuid + 'Batch_Entry',
      containerUuid: props.containerUuid + 'Batch_Entry',
      attributes: defaultValues.value
    })

    const containerManagerBatchEntry = computed(() => {
      return {
        ...props.containerManager,
        isMandatoryField,
        isDisplayedField,
        isDisplayedDefault,
        isReadOnlyField
      }
    })

    function actionKeyEnter(key) {
      const listVisibleFields = fieldsList.value.filter(a => a.isQuickEntry)
      const nextField = listVisibleFields.findIndex(a => a.columnName === key.columnName)
      if (nextField >= listVisibleFields.length - 1) {
        sendValuesToServer()
        return
      }
      const columnNameNextField = listVisibleFields[nextField + 1].columnName
      const indexNextField = fieldsList.value.findIndex(a => a.columnName === columnNameNextField)
      const currentFieldKeyPress = fieldsList.value.find(a => a.columnName === key.columnName)

      if (props.fieldListBatchEntry[props.fieldListBatchEntry.length - 1].columnName !== currentFieldKeyPress.columnNameObject) {
        if (isEmptyValue(refs.fieldComponent[indexNextField].$refs[columnNameNextField].$refs[columnNameNextField])) {
          refs.fieldComponent[indexNextField].$refs[columnNameNextField].$children[0].$refs[columnNameNextField].focus()
          return
        }
        refs.fieldComponent[indexNextField].$refs[columnNameNextField].$refs[columnNameNextField].focus()
        return
      }
    }

    function sendValuesToServer() {
      isLoadingTable(false)
      const changes = convertArrayKeyValueToObject({
        array: store.getters.getPersistenceAttributes({
          containerUuid
        })
      })
      const parsedDefaultValues = convertArrayKeyValueToObject({
        array: defaultValues.value
      })

      const sendFieldServer = convertObjectToKeyValue({
        object: {
          ...parsedDefaultValues,
          ...changes
        }
      })

      store.dispatch('flushPersistenceQueue', {
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        tabId: tabAttributes.value.internal_id,
        tableName: props.tableName,
        attributesList: sendFieldServer
      })
      store.dispatch('updateValuesOfContainer', {
        containerUuid,
        attributes: defaultValues.value
      })
        .then(() => {
          isLoadingTable(true)
        })
    }

    function isLoadingTable(load) {
      store.dispatch('reloadTableData', {
        isLoaded: load,
        containerUuid
      })
    }

    function persistenceBachtEntry(value, field) {
      attributesBachtEntry.value = {
        ...attributesBachtEntry.value,
        [field.column_name]: value
      }
    }

    function updateField(value, field) {
      attributes.value = {
        ...attributes.value,
        [field.column_name]: value
      }
    }

    function saveEntity() {
      const fieldsMandatory = validateMandatoryFieldsEmpty({
        attributes: {
          ...parsedDefaultValues,
          ...attributes.value
        },
        fieldList: fieldsListBatchEntry.value
      })
      const parsedDefaultValues = convertArrayKeyValueToObject({
        array: defaultValues.value
      })

      if (!isEmptyValue(fieldsMandatory)) {
        showMessage({
          message: lang.t('notifications.mandatoryFieldMissing') + fieldsMandatory,
          type: 'warning'
        })
        return
      }

      const sendFieldServer = convertObjectToKeyValue({
        object: {
          ...parsedDefaultValues,
          ...attributes.value
        }
      })
      isLoadingPanel.value = true
      store.dispatch('flushPersistenceQueue', {
        parentUuid: props.parentUuid,
        containerUuid: props.containerUuid,
        tabId: tabAttributes.value.internal_id,
        tableName: props.tableName,
        attributesList: sendFieldServer
      })
        .then(() => {
          if (bachtEntry.value) {
            clearField()
            return
          }
          attributesBachtEntry.value = {}
          cleanField()
        })
        .finally(() => {
          isLoadingPanel.value = false
          focusFirstInput()
        })
    }

    function clearField() {
      fieldsListBatchEntry.value.forEach(element => {
        if (!element.is_allow_copy) {
          element.value = undefined
        }
      })
    }

    function validateMandatoryFieldsEmpty({
      fieldList = [],
      attributes = {}
    }) {
      if (isEmptyValue(fieldList)) return []
      const mandatoryFields = fieldList.filter(field => field.isMandatory && field.isDisplayed)

      const emptyMandatoryFields = mandatoryFields
        .filter(field => !(field.column_name in attributes) || !attributes[field.column_name])
        .map(field => field.name)

      return emptyMandatoryFields
    }

    function cleanField() {
      fieldsListBatchEntry.value.forEach(element => {
        if (element.componentPath === 'FieldNumber') {
          element.value = 0
        } else if (element.componentPath === 'FieldYesNo') {
          element.value = false
        } else {
          element.value = ''
        }
      })
    }

    const fieldsDisplay = ref({})

    function focusFirstInput() {
      nextTick(() => {
        const fieldEmptyIndex = fieldsListBatchEntry.value.findIndex(element => isEmptyValue(element.value))
        const main = document.getElementById('fieldsDisplay')
        main.children[fieldEmptyIndex].__vue__.$children[0].$children[1].$children[0].$children[0].focus()
      })
    }

    setTimeout(() => {
      focusFirstInput()
    }, 500)

    return {
      fieldsDisplay,
      bachtEntry,
      fieldsList,
      containerManagerBatchEntry,
      tabAttributes,
      isCreateRecord,
      attributes,
      isLoadingPanel,
      fieldsListBatchEntry,
      attributesBachtEntry,
      persistenceBachtEntry,
      actionKeyEnter,
      updateField,
      sendValuesToServer,
      isLoadingTable,
      saveEntity,
      cleanField
    }
  }
})
</script>
<style lang="scss">
.field-component-bacht-entry {
  .el-form--label-top .el-form-item__label {
    padding: 0px !important;
  }
  .label-field-title{
    .el-form--label-top {
      padding: 0px !important;
      .el-form-item__label {
        float: none;
        display: inline-block;
        text-align: left;
        padding: 0px !important;
      }
    }
    label {
      font-weight: 700;
      padding: 0px !important;
    }
  }
  .el-form--label-top {
    padding: 0px !important;
    .el-form-item__label {
      float: none;
      display: inline-block;
      text-align: left;
      padding: 0px !important;
    }
  }
  label {
    font-weight: 700;
    padding: 0px !important;
  }
  .el-form-item {
    margin-bottom: 0px;
  }
}
.label-field-title{
    .el-form--label-top {
      padding: 0px !important;
      .el-form-item__label {
        float: none;
        display: inline-block;
        text-align: left;
        padding: 0px !important;
      }
    }
    label {
      font-weight: 700;
      padding: 0px !important;
    }
  }
</style>

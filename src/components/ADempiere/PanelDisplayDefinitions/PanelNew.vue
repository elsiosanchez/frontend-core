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
    v-if="!isLoading"
    class="box-card-display-definition"
    :body-style="{ padding: '0px' }"
    @keyup.ctrl.13="actionsSave"
  >
    <div slot="header" class="clearfix">
      <p style="text-align: center;margin-top: 0px;margin-bottom: 5px;background: #e8f4ffa8;">
        <b style="font-size: larger;">
          {{ currentDisplyDefinitions.name }}
        </b>
      </p>
    </div>
    <div class="text item">
      <el-card shadow="never" class="card-text-content" :body-style="{ padding: '5px'}">
        <div v-shortkey="{ save: ['alt', 'enter'] }" @shortkey="actionsSave">
          <el-empty v-if="isEmptyValue(fields)" :description="$t('component.displayDefinition.fieldEmpty')" />
          <el-descriptions v-else class="margin-top" :column="2" direction="horizontal">
            <template
              v-for="(field, indexSequence) in localFields"
            >
              <el-descriptions-item
                v-if="isDisplayField(field)"
                :key="indexSequence"
              >
                <template slot="label">
                  <b>
                    <span
                      v-show="field.is_mandatory"
                      style="color: red;"
                    >
                      *
                    </span>
                    {{ field.name }}
                  </b>
                </template>
                <fields-display-definitions
                  :field="field"
                  :current-record="currentRecord"
                  :current-display-definition="currentDisplyDefinitions"
                  :update-field="updateFieldRecord"
                  :persistence-data="persistenceBachtEntry"
                  :additional-attributes="addCurrentAttributes"
                  :is-new-record="true"
                  :is-panel-right="isPanelRight"
                  :is-value-bacht-entry="attributesBachtEntry[field.column_name]"
                />
              </el-descriptions-item>
            </template>
          </el-descriptions>
        </div>
      </el-card>
      <el-button
        type="primary"
        class="button-base-icon"
        icon="el-icon-check"
        style="float: right; margin-left: 10px;"
        :loading="isLoading"
        :disabled="containerManagerFieldDefinition.validateMandatoryFieldsEmpty({
          fieldList: fields,
          attributes
        }) || isLoading"
        @click="actionsSave()"
      />
      <slot name="footer-buttons" />
    </div>
  </el-card>
  <loading-view
    v-else
    key="panel-new-loading"
    style="min-height: 250px !important;"
  />
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import store from '@/store'
// import language from '@/lang'

// Components and Mixins
import FieldsDisplayDefinitions from '@/components/ADempiere/FieldsDisplayDefinitions'
import LoadingView from '@/components/ADempiere/LoadingView/index.vue'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { containerManagerFieldDefinition } from '@/utils/ADempiere/displayDefinition'

export default defineComponent({
  name: 'PanelDisplayDefinitionsNew',

  components: {
    LoadingView,
    FieldsDisplayDefinitions
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
    isPanelRight: {
      type: Boolean,
      default: false
    },
    isQuickEntry: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    // Ref
    const attributes = ref({})
    const attributesBachtEntry = ref({})
    const isLoading = ref(false)
    const localFields = ref([])

    // Computed
    const displayDefinitionMetadata = computed(() => {
      return store.getters.getDisplayTabDefinition({
        id: props.currentDisplyDefinitions.id
      })
    })

    const additionalAttributes = computed(() => {
      if (isEmptyValue(store.getters.getCurrentTabPanelDefinition)) {
        return {}
      }
      const attributes = store.getters.getCurrentTabPanelDefinition.additionalAttributes
      return {
        ...attributes
      }
    })

    const addCurrentAttributes = computed(() => {
      const attributes = store.getters.getCurrentTabPanelDefinition
      if (isEmptyValue(attributes)) {
        return {}
      }
      const { currentAttributes } = attributes
      return currentAttributes
    })

    const isLoadingDisplayDefinitions = computed(() => {
      if (
        !isEmptyValue(displayDefinitionMetadata.value) &&
        !isEmptyValue(displayDefinitionMetadata.value.isLoading)
      ) {
        return displayDefinitionMetadata.value.isLoading
      }
      return false
    })

    const fields = computed(() => {
      if (
        !isEmptyValue(displayDefinitionMetadata.value) &&
        !isEmptyValue(displayDefinitionMetadata.value.fields)
      ) {
        return displayDefinitionMetadata.value.fields.filter(field => field.is_displayed && field.is_insert_record)
      }
      return []
    })

    // Constants
    const { currentTab } = store.getters.getContainerInfo

    // Methods
    function displayValue(field) {
      if (isEmptyValue(field)) {
        return
      }
      const { value, display_value } = field
      if (!isEmptyValue(display_value)) {
        return display_value
      }
      return value
    }

    function updateFieldRecord(value, field) {
      attributes.value = {
        ...attributes.value,
        [field.column_name]: value
      }
    }

    function persistenceBachtEntry(value, field) {
      attributesBachtEntry.value = {
        ...attributesBachtEntry.value,
        [field.column_name]: value
      }
    }

    function isDisplayField(field) {
      return containerManagerFieldDefinition.isDisplayedField({
        ...field,
        isNewRecord: true
      })
    }

    function validateMandatory() {
      return containerManagerFieldDefinition.validateMandatoryFieldsEmpty({
        fieldList: fields.value,
        attributes: attributes.value
      })
    }

    localFields.value = fields.value

    function clearField(attributes) {
      fields.value.forEach(element => {
        if (attributes[element.column_name] && !element.is_allow_copy) {
          attributes[element.column_name] = undefined
        }
      })
    }

    async function actionsSave() {
      isLoading.value = true
      const recordAttibutes = {
        ...additionalAttributes.value,
        ...attributes.value
      }
      containerManagerFieldDefinition.createNewRecord({
        parentUuid: props.parentUuid,
        displayDefinitionId: props.currentDisplyDefinitions.id,
        displyDefinitions: props.currentDisplyDefinitions,
        attributes: recordAttibutes,
        keyAttribute: additionalAttributes.value,
        isPanelRight: props.isPanelRight,
        isBachtEntry: props.isQuickEntry,
        currentTab
      })
        .finally(() => {
          isLoading.value = false
          if (props.isQuickEntry) clearField(attributesBachtEntry.value)
        })
    }

    return {
      // Ref
      attributes,
      isLoading,
      // computeds
      isLoadingDisplayDefinitions,
      displayDefinitionMetadata,
      additionalAttributes,
      addCurrentAttributes,
      attributesBachtEntry,
      localFields,
      fields,
      // methods
      actionsSave,
      displayValue,
      isDisplayField,
      validateMandatory,
      updateFieldRecord,
      persistenceBachtEntry,
      containerManagerFieldDefinition
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
  .el-card__body {
    padding: 0px;
  }
}
.card-text-content {
  margin-bottom: 16px !important;
}
</style>

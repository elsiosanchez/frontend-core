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
                        <fields-display-definitions
                          ref="fieldsDisplay"
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
                      </el-form-item>
                    </el-col>
                  </template>
                </el-form>
              </fieldset>
            </el-col>
            <el-col :span="24">
              <samp style="float: right; padding-right: 10px;">
                <el-checkbox
                  v-model="isVisibleAddress"
                  :label="$t('form.pos.order.BusinessPartnerCreate.addAddress')"
                  :border="true"
                  style="float: right;margin: 0px;"
                />
              </samp>
            </el-col>
          </el-row>
        </div>
      </el-card>
      <!-- <address-new  /> -->
      <address-standard v-if="isVisibleAddress" />
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
import { defineComponent, computed, nextTick, ref } from '@vue/composition-api'

import store from '@/store'
import language from '@/lang'

// Components and Mixins
// import AddressNew from '@/components/ADempiere/StandardAddressPanel/AddressNew/index.vue'
import AddressStandard from '@/components/ADempiere/StandardAddressPanel/AddAddress/index.vue'
import Panel from '@/components/ADempiere/FieldDefinition/FieldOptions/infoCustomer/Panel.vue'
import FieldsDisplayDefinitions from '@/components/ADempiere/FieldsDisplayDefinitions'
import LoadingView from '@/components/ADempiere/LoadingView/index.vue'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { IDENTIFIER_COLUMN_SUFFIX, DISPLAY_COLUMN_PREFIX } from '@/utils/ADempiere/dictionaryUtils'
import { containerManagerFieldDefinition } from '@/utils/ADempiere/displayDefinition'

export default defineComponent({
  name: 'PanelDisplayDefinitionsNew',

  components: {
    Panel,
    // AddressNew,
    AddressStandard,
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
    isPanelWindow: {
      type: Boolean,
      default: false
    },
    isQuickEntry: {
      type: Boolean,
      default: false
    },
    customer: {
      type: Object,
      default: false
    }
  },

  setup(props) {
    // Ref
    const attributes = ref({})
    const attributesBachtEntry = ref({})
    const isLoading = ref(false)
    const localFields = ref([])
    const isVisibleAddress = ref(false)

    // Computed
    const updateFIeldDisplay = computed(() => {
      const { displyDefinitions } = store.getters.getCurrentTabPanelDefinition
      const { isReadOnlyField } = displyDefinitions
      return isReadOnlyField
    })
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
        return fieldList.filter(field => field.is_displayed && field.is_insert_record)
      }
      return []
    })

    const contextCountrytId = computed(() => {
      return store.getters.getSessionContextCountrytId
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

    localFields.value = groupAndSortFields(fields.value)

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
      const isUpdateCurrentField = updateFIeldDisplay.value
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
        .then(response => {
          if (!isUpdateCurrentField) {
            setValueField({
              displayValue: response.title,
              columnName: props.currentDisplyDefinitions.table_name + IDENTIFIER_COLUMN_SUFFIX,
              id: response.id
            })
          }
          if (isVisibleAddress.value) {
            const mandatoryAttribute = {
              DUNS: !isEmptyValue(response.fields['DUNS']) ? response.fields['DUNS'].value : '',
              Name: !isEmptyValue(response.fields['Name']) ? response.fields['Name'].value : '',
              NAICS: !isEmptyValue(response.fields['NAICS']) ? response.fields['NAICS'].value : '',
              Value: !isEmptyValue(response.fields['Value']) ? response.fields['Value'].value : '',
              TaxID: !isEmptyValue(response.fields['TaxID']) ? response.fields['TaxID'].value : ''
            }

            store.dispatch('updateBPartner', {
              ...response,
              ...mandatoryAttribute,
              displayDefinitionId: props.currentDisplyDefinitions.id,
              recordId: response.id,
              addresses: [store.getters.getAddressFields]
            })
              .finally(() => {
                cleanAddress()
              })
          }
        })
        .finally(() => {
          isLoading.value = false
          cleanAddress()
          if (props.isQuickEntry) clearField(attributesBachtEntry.value)
        })
    }

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

    function setValueField({
      displayValue,
      columnName,
      id
    }) {
      const { containerUuid, parentUuid } = currentTab
      store.commit('updateValueOfField', {
        containerUuid,
        columnName,
        parentUuid,
        value: id
      })
      store.commit('updateValueOfField', {
        columnName: DISPLAY_COLUMN_PREFIX + columnName,
        value: displayValue,
        containerUuid,
        parentUuid
      })
    }

    const fieldsDisplay = ref([])

    function focusFirstInput() {
      cleanAddress()
      nextTick(() => {
        if (fieldsDisplay.value.length > 0) {
          const firstField = fieldsDisplay.value[0]
          if (firstField.$children[0]) {
            firstField.$children[0].$children[0].focus()
          }
        }
      })
    }

    function cleanAddress() {
      store.dispatch('clearFieldStandardAddress', {
        typeLocations: 'shippingAddress'
      })
      store.dispatch('clearFieldStandardAddress', {
        typeLocations: 'billingAddress'
      })
    }

    function setDeafultCountries() {
      store.dispatch('countriesStandardAddress', {})
        .finally(() => {
          store.commit('setAttributeAddres', {
            countryId: contextCountrytId.value,
            listCountries: store.getters.getAttributeFieldStandardAddress({
              attribute: 'listCountries'
            })
          })
          store.dispatch('countrieStandardAddress', { countryId: contextCountrytId.value })
        })
    }

    setTimeout(() => {
      setDeafultCountries()
      focusFirstInput()
    }, 500)
    // cleanAddress()

    return {
      // Ref
      attributes,
      isLoading,
      fieldsDisplay,
      isVisibleAddress,
      // computeds
      isLoadingDisplayDefinitions,
      displayDefinitionMetadata,
      additionalAttributes,
      addCurrentAttributes,
      attributesBachtEntry,
      updateFIeldDisplay,
      contextCountrytId,
      localFields,
      fields,
      // methods
      sizeSpan,
      actionsSave,
      displayValue,
      isDisplayField,
      validateMandatory,
      updateFieldRecord,
      setDeafultCountries,
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

.fieldset {
  padding: 0.35em 0.75em 1.625em;
  border-radius: 6px;
  border: 1px solid #1890ff7a;
}

.field-component-display-definition {
  .el-form--label-top .el-form-item__label {
    padding: 0px 5px !important;
  }
  .label-field-title-display-definition{
    .el-form--label-top {
      padding: 0px 5px !important;
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
    padding: 0px 5px !important;
    .el-form-item__label {
      float: none;
      display: inline-block;
      text-align: left;
      padding: 0px 5px !important;
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
.label-field-title-display-definition{
    .el-form--label-top {
      padding: 0px 5px !important;
      .el-form-item__label {
        float: none;
        display: inline-block;
        text-align: left;
        padding: 0px 5px !important;
      }
    }
    label {
      font-weight: 700;
      padding: 0px !important;
    }
  }
</style>

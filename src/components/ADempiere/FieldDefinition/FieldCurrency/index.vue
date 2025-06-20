<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
Contributor(s): Elsio Sanchez ElsioSanchez15@outlook.com https://github.com/ElsioSanchez
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
  <div class="el-dropdown" style="width: -webkit-fill-available;padding: 0px">
    <el-dropdown
      size="small"
      trigger="click"
      :disabled="metadata.readonly"
      placement="bottom-start"
      class="currency-fiedls"
      @visible-change="showMenu"
      @command="changeValuewithCommand"
    >
      <el-button-group style="width: 100%;">
        <el-button
          plain
          size="small"
          :disabled="metadata.readonly"
          style="width: -webkit-fill-available;"
        >
          <b v-if="!isEmptyValue(displayedValue)" style="font-size: 17px;">
            {{ flagDisplay(displayedValue) }}
            {{ displayedValue }}
            <b v-if="!isEmptyValue(currencySymbolDisplay(displayedValue))"> {{ currencySymbolDisplay(displayedValue) }} </b>
          </b>
          <b v-else>
            {{ '-' }}
          </b>
        </el-button>
        <el-button
          plain
          size="small"
          :disabled="metadata.readonly"
          style="width: 15%;padding: 0px 5px;"
          @click="value = ''"
        >
          <b> <i class="el-icon-circle-close" style="color: red;font-weight: 900;font-size: 15px;" /> </b>
        </el-button>
        <el-button
          plain
          size="small"
          :disabled="metadata.readonly"
          style="width: 15%;padding: 0px 5px;"
        >
          <b>
            <i
              :class="iconsdropdowns"
              style="font-weight: 900;font-size: 15px;"
            />
          </b>
        </el-button>
      </el-button-group>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(option, key) in listCurrencies"
          :key="key"
          :divided="key > 0"
          :class="cssOptionClass(option.value)"
          :disabled="!isEmptyValue(option.isActive) && option.isActive === false"
          :command="option"
          style="width: 260px;"
        >
          {{ flagDisplay(option.displayedValue) }}
          {{ option.displayedValue }}
          <b v-if="!isEmptyValue(currencySymbolDisplay(option.displayedValue))"> {{ currencySymbolDisplay(option.displayedValue) }} </b>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
// Components and Mixins
import fieldMixin from '@/components/ADempiere/FieldDefinition/mixin/mixinField.js'
import fieldWithDisplayColumn from '@/components/ADempiere/FieldDefinition/mixin/mixinWithDisplayColumn.js'
// import selectMixin from '@/components/ADempiere/FieldDefinition/FieldCurrency/mixinFieldSelect'

// Constants
import {
  IDENTIFIER_COLUMN_SUFFIX
} from '@/utils/ADempiere/dictionaryUtils'
import {
  COLUMNNAME_IsActive
} from '@/utils/ADempiere/constants/systemColumns'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { convertStringToBoolean } from '@/utils/ADempiere/formatValue/booleanFormat'
import isoCountryCurrency from 'iso-country-currency'
import { CURRENCY_TO_COUNTRY } from '@/utils/ADempiere/constants/currency'
/**
 * This component is a lookup type field, use as a replacement for fields:
 * - Reference List
 * - Table List
 * - Table Direct
 *
 * TODO: String values add single quotation marks 'value' (see removeQuotationMark)
 * TODO: No includes default value into list on forms or field with dynamic validation (see default value City on location form)
 */
export default {
  name: 'FieldCurrency',

  mixins: [
    fieldMixin,
    // selectMixin,
    fieldWithDisplayColumn
  ],

  props: {
    sizeField: {
      type: String,
      default: undefined
    }
  },

  data() {
    return {
      componentKey: 0,
      defaultFlag: '🏳️',
      displayMenuOptions: false
    }
  },

  computed: {
    isWithSearchValue() {
      return Boolean(
        this.$store.getters.getStoredSearchValueLookup({
          parentUuid: this.metadata.parentUuid,
          containerUuid: this.metadata.containerUuid,
          contextColumnNames: this.metadata.context_column_names,
          uuid: this.metadata.uuid,
          id: this.metadata.internal_id
        })
      )
    },

    value: {
      get() {
        const { column_name, containerUuid, inTable } = this.metadata
        // table records values
        if (inTable) {
          return this.containerManager.getCell({
            containerUuid,
            rowIndex: this.metadata.rowIndex,
            rowUid: this.metadata.rowUid,
            columnName: column_name
          })
        }
        return this.$store.getters.getValueOfFieldOnContainer({
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          columnName: column_name
        })
      },
      set(newValue) {
        const { column_name, containerUuid, inTable } = this.metadata
        // Before handling the change
        this.preHandleChange(newValue)
        // table records values
        if (inTable) {
          this.containerManager.setCell({
            containerUuid,
            rowIndex: this.metadata.rowIndex,
            rowUid: this.metadata.rowUid,
            columnName: column_name,
            value: newValue
          })
        } else {
          const option = this.findOption(newValue)
          // always update uuid
          this.uuidValue = option.uuid

          this.$store.commit('updateValueOfField', {
            parentUuid: this.metadata.parentUuid,
            containerUuid,
            columnName: column_name,
            value: newValue
          })
          // update element column name
          if (!this.metadata.isSameColumnElement) {
            this.$store.commit('updateValueOfField', {
              parentUuid: this.metadata.parentUuid,
              containerUuid,
              columnName: this.metadata.element_name,
              value: newValue
            })
          }
        }
        this.handleFieldChange({
          value: newValue,
          displayedValue: this.displayedValue
        })
      }
    },
    currentTab() {
      if (isEmptyValue(this.metadata.parentUuid) || !this.containerManager.getPanel) {
        return {}
      }
      return this.containerManager.getPanel({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid
      })
    },
    currentRecord() {
      return this.$store.getters.getTabCurrentRow({
        containerUuid: this.metadata.containerUuid
      })
    },
    listCurrencies() {
      const {
        uuid,
        reference,
        columnName,
        parentUuid,
        internal_id,
        containerUuid,
        referenceTableName,
        context_column_names
      } = this.metadata
      return this.$store.getters.getStoredLookupAll({
        contextColumnNamesByDefaultValue: context_column_names,
        contextColumnNames: reference.context_column_names,
        tableName: referenceTableName,
        value: this.value,
        id: internal_id,
        containerUuid,
        parentUuid,
        uuid,
        columnName
      })
    },

    recordUuid() {
      return this.$store.getters.getUuidOfContainer(this.metadata.containerUuid)
    },
    parentTabs() {
      const { parentTabs } = this.currentTab
      if (!isEmptyValue(parentTabs)) {
        return parentTabs[0]
      }
      return {}
    },
    parentTabColumName() {
      if (isEmptyValue(this.parentTabs)) {
        return ''
      }
      return this.parentTabs.table_name + IDENTIFIER_COLUMN_SUFFIX
    },
    iconsdropdowns() {
      if (this.displayMenuOptions) return 'el-icon-arrow-up'
      return 'el-icon-arrow-down'
    }
  },

  watch: {
    isSelectMultiple(isMultiple) {
      let value = this.value
      if (isMultiple) {
        const valueInArray = []
        if (!isEmptyValue(value)) {
          valueInArray.push(value)
        }
        value = valueInArray
      } else {
        if (Array.isArray(value)) {
          if (value.length) {
            // set first value
            value = value.at(0)
          } else {
            value = this.blankOption.value
          }
        }
      }
      this.value = value
    },
    'metadata.displayed': {
      handler(value) {
        if (value || this.isAlwaysDisplayColumn) {
          this.setDisplayedValue()
        }
      },
      deep: true,
      immediate: true
    },
    value(newValue) {
      this.setDisplayedValue()
    },
    recordUuid(newRecordUuid) {
      if (!isEmptyValue(newRecordUuid)) {
        this.setDisplayedValue()
      }
    }
  },

  beforeMount() {
    if (this.metadata.displayed || this.isAlwaysDisplayColumn) {
      this.setDisplayedValue()
    }
  },

  methods: {
    showMenu(show) {
      this.displayMenuOptions = show
    },
    currencySymbolDisplay(isoCode) {
      const currency = isoCountryCurrency.getAllISOCodes()
        .find(country => country.currency === isoCode)

      if (isEmptyValue(currency)) return ''
      return '( ' + currency.symbol + ' )'
    },
    flagDisplay(isoCode) {
      if (isEmptyValue(isoCode)) return ''
      if (!isEmptyValue(CURRENCY_TO_COUNTRY[isoCode])) return CURRENCY_TO_COUNTRY[isoCode]
      return this.defaultFlag
    },
    forceRerender() {
      this.componentKey += 1
    },
    cssOptionClass(optionValue) {
      const {
        column_name, element_name
      } = this.metadata
      if ([column_name, element_name].includes(COLUMNNAME_IsActive)) {
        if (convertStringToBoolean(optionValue) === false) {
          return ' number-negative '
        }
      }
      return ''
    },
    changeValuewithCommand(command) {
      this.value = command.value
    },

    preHandleChange(value) {
      const { displayedValue } = this.findOption(value)
      this.displayedValue = displayedValue
      // this.handleFieldChange({
      //   value,
      //   displayedValue
      // })
    },
    findOption(value) {
      const option = this.optionsList.find(item => item.value === value)
      if (option && option.displayedValue) {
        return option
      }
      return {
        uuid: undefined,
        value: undefined,
        displayedValue: undefined,
        reason: 'Unknow find option'
      }
    },
    setDisplayedValue() {
      const value = this.value
      // if empty clear all values
      if (isEmptyValue(value)) {
        this.displayedValue = undefined
        this.uuidValue = undefined
        if (this.metadata.isGetServerValue) {
          this.getValueOfLookup()
        }
        return
      }

      this.optionsList = [...this.listCurrencies]
      this.forceRerender()

      // find local list value
      const option = this.findOption(value)
      if (!isEmptyValue(option) && !isEmptyValue(option.value)) {
        if (!isEmptyValue(option.uuid)) {
          this.uuidValue = option.uuid
        }
        if (!isEmptyValue(option.displayedValue)) {
          this.displayedValue = option.displayedValue
          return
        }

        // add to list if no exist (with callouts, table record)
        const displayedValue = this.displayedValue
        if (!isEmptyValue(displayedValue)) {
          // verify if exists to add (in table)
          this.optionsList.push({
            value,
            uuid: option.uuid,
            displayedValue
          })
          return
        }
      }

      // request displayed value
      this.getValueOfLookup()
    },

    // TODO: With remote and filter is enabled not working displayed value
    // https://github.com/ElemeFE/element/issues/20706
    // https://github.com/ElemeFE/element/issues/21287
    // https://github.com/ElemeFE/element/issues/21465
    getValueOfLookup() {
      if (this.isSelectMultiple) {
        return
      }
      this.isLoading = true

      this.displayedValue = undefined
      this.uuidValue = undefined
      // this.setDefaultValue()
      this.loadDefaultValueFromServer()
        .then(responseLookupItem => {
          // with value response update local component list
          if (!isEmptyValue(responseLookupItem) && !isEmptyValue(responseLookupItem.value)) {
            if (
              isEmptyValue(this.metadata.default_value) &&
              // !this.metadata.isGetServerValue &&
              !this.currentTab.isParentTab &&
              !isEmptyValue(this.parentTabs)
            ) {
              const {
                parentUuid,
                column_name,
                displayColumnName
              } = this.metadata
              if (
                !isEmptyValue(this.parentTabColumName) &&
                this.parentTabColumName === column_name
              ) {
                this.setParentValue({
                  containerUuid: this.parentTabs.uuid,
                  parentUuid,
                  columnName: column_name,
                  displayColumnName
                })
              }
            } else {
              this.value = responseLookupItem.value
              this.displayedValue = responseLookupItem.displayedValue
              this.uuidValue = responseLookupItem.uuid
            }
          }
        })
        .finally(() => {
          if (this.metadata.inTable) {
            setTimeout(() => {
              this.optionsList = this.listCurrencies
              this.forceRerender()
            }, 100)
          } else {
            this.optionsList = this.listCurrencies
            this.forceRerender()
          }

          this.isLoading = false
        })
    },
    /**
     * @param {boolean} isShowList triggers when the pull-down menu appears or disappears
     */
    getDataLookupList(isShowList) {
      // establish
      this.setContainerInformation()
      // get stored list and refresh local component
      this.optionsList = this.listCurrencies

      if (isShowList) {
        const listLookups = this.getStoredLookupList
        if (!isEmptyValue(listLookups)) {
          this.optionsList = listLookups
        } else if (isEmptyValue(listLookups) || this.isWithSearchValue) {
          this.loadListFromServer()
        } else if (listLookups.length === 1) {
          const firstOption = listLookups.at(0)
          if (firstOption && this.blankValues.includes(firstOption.value)) {
            this.loadListFromServer()
          }
        }
      }
    },
    remoteSearch(searchQuery = '') {
      // const results = this.localSearch(searchQuery)
      // if (isEmptyValue(searchQuery) ||
      //   (!isEmptyValue(searchQuery) && (isEmptyValue(results) || results.length < 3))) {
      clearTimeout(this.timeOut)
      this.timeOut = setTimeout(() => {
        this.loadListFromServer(searchQuery)
      }, 500)
      // return
      // }
      // use this, if remote is enabled, local search not working
      // this.optionsList = results
    },
    localSearch(searchQuery = '') {
      if (isEmptyValue(searchQuery)) {
        return this.optionsList
      }
      return this.optionsList.filter(option => {
        return option.displayedValue.toLowerCase().includes(searchQuery.toLowerCase())
      })
    },
    loadListFromServer(searchQuery = '') {
      this.isLoading = true
      this.containerManager.getLookupList({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        contextColumnNames: this.metadata.reference.context_column_names,
        uuid: this.metadata.uuid,
        id: this.metadata.internal_id,
        //
        tableName: this.metadata.referenceTableName,
        columnName: this.metadata.column_name,
        columnUuid: this.metadata.columnUuid,
        searchValue: searchQuery,
        referenceUuid: this.metadata.reference.uuid,
        // app attributes
        isAddBlankValue: !this.metadata.required,
        blankValue: this.blankOption.value
      })
        .then(responseLookupList => {
          if (!isEmptyValue(responseLookupList)) {
            this.optionsList = responseLookupList
          } else {
            this.optionsList = this.listCurrencies
          }
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    clearLookup() {
      this.$store.dispatch('deleteLookup', {
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        contextColumnNames: this.metadata.reference.context_column_names,
        contextColumnNamesByDefaultValue: this.metadata.context_column_names,
        uuid: this.metadata.uuid,
        //
        tableName: this.metadata.referenceTableName,
        columnName: this.metadata.column_name,
        value: this.value
      })
        .then(() => {
          // set empty list and empty option
          this.optionsList = [
            this.blankOption
          ]

          // set empty value
          this.value = this.blankOption.value
        })
    },
    setParentValue({
      containerUuid,
      parentUuid,
      columnName,
      displayColumnName
    }) {
      this.value = this.$store.getters.getValueOfFieldOnContainer({
        containerUuid,
        parentUuid,
        columnName
      })
      this.displayedValue = this.$store.getters.getValueOfFieldOnContainer({
        containerUuid,
        parentUuid,
        columnName: displayColumnName
      })
    }
  }

}
</script>

<style lang="scss">
.currency-fiedls{
  width: -webkit-fill-available;
  // .ul{
  //   width: 300px;
  // }
}
</style>

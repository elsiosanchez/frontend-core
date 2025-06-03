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
  <el-autocomplete
    ref="autocompleteBusinessPartner"
    v-model="displayedValue"
    v-bind="commonsProperties"
    value-key="name"
    clearable
    :debounce="10"
    style="width: 100%;"
    popper-class="custom-field-bpartner-info"
    :trigger-on-focus="false"
    :fetch-suggestions="localSearch"
    :select-when-unmatched="true"
    :highlight-first-item="true"
    :size="sizeField"
    @keyup.native="enterKey"
    @select="handleSelect"
    @clear="clearValues"
    @focus="searchFocus"
    @blur="setOldDisplayedValue"
  >
    <template slot-scope="recordRow">
      <span :class="{ 'disabled-record': !recordRow.item.is_active }">
        <div class="header">
          {{ recordRow.item.value }}
          -
          {{ recordRow.item.name }}
        </div>
        <span class="info">
          {{ recordRow.item.tax_id }}
          {{ recordRow.item.name2 }}
          {{ recordRow.item.description }}
          ({{ recordRow.item.business_partner_group }})
        </span>
      </span>
    </template>

    <button-list
      slot="append"
      :is-disabled="isDisabled"
      :parent-metadata="metadata"
      :container-manager="containerManager"
    />
  </el-autocomplete>
</template>

<script>
// import store from '@/store'

// Components and Mixins
import fieldMixin from '@/components/ADempiere/FieldDefinition/mixin/mixinField.js'
import fieldSearchMixin from '@/components/ADempiere/FieldDefinition/FieldSearch/mixinFieldSearch.js'
import businessPartnerMixin from './mixinBusinessPartner'
import ButtonList from './buttonList.vue'

// Constants
import { TABLE_NAME, COLUMN_NAME } from '@/utils/ADempiere/dictionary/field/search/businessPartner.ts'
import { RECORD_ROWS_BY_LIST } from '@/utils/ADempiere/dictionary/field/lookups'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default {
  name: 'BusinessPartnerInfoField',

  components: {
    ButtonList
  },

  mixins: [
    fieldMixin,
    fieldSearchMixin,
    businessPartnerMixin
  ],

  props: {
    containerManager: {
      type: Object,
      required: true
    },
    parentMetadata: {
      type: Object,
      default: () => {
        return {
          containerUuid: ''
        }
      }
    },
    sizeField: {
      type: String,
      default: undefined
    }
  },

  computed: {
    cssClassCustomField() {
      return ' custom-field-bpartner-info '
    }
  },

  beforeMount() {
    if (this.metadata.displayed) {
      this.setDisplayedValue()
    }
  },

  methods: {
    enterKey(event) {
      // TODO: Implement key enter event.
    },
    keyPressField() {
      if (!this.isEmptyValue(this.$refs['autocompleteBusinessPartner' + this.metadata.columnName])) {
        this.remoteSearch(this.displayedValue, true)
      }
    },
    /**
     * Search Focus
     * This function is executed when the autocomplete field receives the focus. If there is a value displayed, it selects the text in the input field.
     */
    searchFocus() {
      // Checks if `displayedValue` is not empty
      this.hasFocus = true
      if (!isEmptyValue(this.displayedValue)) {
        this.$refs.autocompleteBusinessPartner.$el.firstElementChild.firstElementChild.select()
      }
      this.setNewDisplayedValue()
    },
    handleSelect(recordSelected) {
      // Checks if the selected record is empty or if its value in the specified column is less than or equal to zero.
      if (isEmptyValue(recordSelected) || recordSelected[COLUMN_NAME] <= 0) {
        // If the above condition is true, assigns blank values to the selected record.
        recordSelected = this.blankValues
      }

      // Calls the setValues function to set the values of the selected register in the component.
      this.setValues(recordSelected)

      // Generates a displayed value from the selected record and assigns it to `controlDisplayed`.
      // This prevents loss of the displayed value when the field receives focus.
      this.controlDisplayed = this.generateDisplayedValue(recordSelected)

      // Disables autocomplete to prevent it from remaining active after selection.
      this.$refs.autocompleteBusinessPartner.activated = false
    },

    localSearch(stringToMatch, callBack) {
      if (isEmptyValue(stringToMatch)) {
        // not show list
        callBack([])
        return
      }

      // Remote search
      clearTimeout(this.timeOutSearchRecords)

      this.timeOutSearchRecords = setTimeout(() => {
        this.remoteSearch(stringToMatch)
          .then(remoteResponse => {
            callBack(remoteResponse)
          })
      }, 500)
      return
    },
    remoteSearch(searchValue, isKeyEnterPress) {
      // Returns a new promise that will resolve with the search results.
      return new Promise(resolve => {
        // Get the parent UUID from the metadata.
        let parentUuid = this.metadata.parentUuid

        // If parentUuid is empty, assign the containerUuid as its value.
        if (isEmptyValue(parentUuid)) parentUuid = this.metadata.containerUuid

        // Indicate that data is being loaded.
        this.isLoading = true

        // Call the getSearchRecordsList method of the containerManager to perform the search.
        this.containerManager.getSearchRecordsList({
          parentUuid, // UUID of the parent
          containerUuid: this.metadata.containerUuid, // UUID of the container
          contextColumnNames: this.metadata.reference.context_column_names, // Context column names
          tableName: TABLE_NAME, // Name of the table to search
          uuid: this.metadata.uuid, // UUID of the record
          id: this.metadata.internal_id, // Internal ID of the record
          searchValue, // Search value entered by the user
          pageNumber: 1, // Page number for pagination
          pageSize: RECORD_ROWS_BY_LIST // Page size for pagination
        })
          .then(responseRecords => {
            // If no records are returned, show a message indicating no results.
            if (isEmptyValue(responseRecords)) {
              this.whitOutResultsMessage()

              // show table records
              // store.commit('setBusinessPartnerShow', {
              //   containerUuid: this.uuidForm,
              //   show: true
              // })
            } else {
              if (isKeyEnterPress || responseRecords.length === 1) {
                const recordSelected = responseRecords.at()
                this.handleSelect(recordSelected)
              }
            }

            // Resolve the promise with the obtained records.
            resolve(responseRecords)
          })
          .catch(error => {
            // If an error occurs during the search, log a warning message to the console.
            console.warn(error.message)

            // Show a message indicating no results.
            this.whitOutResultsMessage()

            // Resolve the promise with an empty array.
            resolve([])
          })
          .finally(() => {
            // Indicate that loading has finished.
            this.isLoading = false

            // If the Enter key was pressed or if there is only one record in the list, automatically select the first record.
            if (isKeyEnterPress || this.recordsList.length === 1) {
              const recordSelected = this.recordsList.at() // Get the first record from the list
              this.handleSelect(recordSelected) // Call handleSelect to manage the selection
            }
          })
      })
    }
  }
}
</script>

<style lang="scss" scope>
.custom-field-bpartner-info {
  &.el-autocomplete-suggestion {
    min-width: 250px !important;
  }

  li {
    line-height: normal;
    // padding: 15px;
    padding-bottom: 5px;
    padding-top: 5px;

    .header {
      text-overflow: ellipsis;
      overflow: hidden;
      font-weight: bold;
    }

    .info {
      color: #7e7e7e;
      float: left;
      font-size: 12px;
    }
  }
}
</style>

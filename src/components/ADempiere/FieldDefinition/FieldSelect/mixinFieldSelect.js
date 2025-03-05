/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import store from '@/store'

// Constants
import { ALWAYS_DISPLAY_COLUMN } from '@/utils/ADempiere/dictionaryUtils'
import { MULTIPLE_VALUES_OPERATORS_LIST } from '@/utils/ADempiere/dataUtils'

// Utils and Helper Methods
import { convertBooleanToString } from '@/utils/ADempiere/formatValue/booleanFormat.js'
import { getTypeOfValue, isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

export default {
  name: 'MixinFieldSelect',

  data() {
    return {
      isLoading: false,
      timeOut: null,
      optionsList: [],
      blankValues: [null, undefined, -1, '-1', '', ' ']
    }
  },

  computed: {
    isSelectMultiple() {
      return (this.metadata.isAdvancedQuery || this.metadata.is_query_criteria ||
        (this.metadata.isLegacyReport === false && !this.metadata.isProcessBeforeLaunch)) &&
        MULTIPLE_VALUES_OPERATORS_LIST.includes(this.metadata.operator)
    },

    blankOption() {
      let value
      if (Number(this.metadata.default_value) === -1) {
        value = this.metadata.default_value
      }

      return {
        // label with '' value is assumed to be undefined non-existent
        uuid: undefined,
        value,
        displayedValue: ' ',
        reason: 'Blank Option'
      }
    },
    getStoredLookupList() {
      if (!this.metadata.displayed && !this.isAlwaysDisplayColumn) {
        return [this.blankOption]
      }

      // add blanck option in firts element on list
      return store.getters.getStoredLookupList({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        contextColumnNames: this.metadata.reference.context_column_names,
        uuid: this.metadata.uuid,
        id: this.metadata.internal_id,
        //
        tableName: this.metadata.referenceTableName,
        columnName: this.metadata.columnName
      })
    },
    getTableOption() {
      return {
        value: this.value,
        displayedValue: this.displayedValue,
        uuid: undefined,
        reason: 'Table option'
      }
    },
    currentRecordUuid() {
      return this.$store.getters.getUuidOfContainer(this.metadata.containerUuid)
    },
    // Get default values from table
    getDefaulValuesTable() {
      const { parentUuid, containerUuid, displayColumnName } = this.metadata
      const displayedValue = store.getters.getValueOfFieldOnContainer({ parentUuid, containerUuid, columnName: displayColumnName })
      return [
        {
          value: this.value,
          displayedValue
        }
      ]
    },
    getStoredLookupAll() {
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

      if (isEmptyValue(this.currentRecordUuid)) {
        const allOptions = store.getters.getStoredLookupAll({
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

        // sets the value to blank when the lookupList or lookupItem have no
        // values, or if only lookupItem does have a value
        if (isEmptyValue(allOptions) || (!isEmptyValue(allOptions) && (!this.blankValues.includes(allOptions.at().value)))) allOptions.unshift(this.blankOption)

        return allOptions
      }
      return this.getDefaulValuesTable
    },

    isAlwaysDisplayColumn() {
      return ALWAYS_DISPLAY_COLUMN.includes(this.metadata.columnName)
    }
  },

  methods: {
    /**
     @overwride
     */
    parseValue(value) {
      if (getTypeOfValue(value) === 'BOOLEAN') {
        // value ? 'Y' : 'N'
        value = convertBooleanToString(value)
      }
      return value
    }
  }

}

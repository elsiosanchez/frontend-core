/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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

import lang from '@/lang'
import store from '@/store'

// Constants
import {
  DISPLAY_COLUMN_PREFIX,
  IDENTIFIER_COLUMN_SUFFIX
} from '@/utils/ADempiere/dictionaryUtils'
import { IMAGE } from '@/utils/ADempiere/references'

// Components and Mixins
import fieldWithDisplayColumn from '@/components/ADempiere/FieldDefinition/mixin/mixinWithDisplayColumn.js'

// Utils and Helper Methods
import { isEmptyValue, isSameValues } from '@/utils/ADempiere/valueUtils'
import { formatField, trimPercentage } from '@/utils/ADempiere/valueFormat'

export default {
  name: 'MixinFieldSearch',

  mixins: [
    fieldWithDisplayColumn
  ],

  data() {
    return {
      timeOutSearchRecords: null,
      isLoading: false,
      searchText: '',
      hasFocus: false,
      controlDisplayed: this.displayedValue
      // unsubscribe: null
    }
  },

  computed: {
    uuidForm() {
      if (!isEmptyValue(this.metadata.containerUuid)) {
        return this.metadata.column_name + '_' + this.metadata.containerUuid
      }
      return this.metadata.containerUuid
    },
    title() {
      let title = this.metadata.name
      if (!isEmptyValue(this.metadata.panelName) && !isSameValues(this.metadata.panelName, this.metadata.name)) {
        title += ` (${this.metadata.panelName})`
      }
      return title
    },

    storedReferenceTableName() {
      return store.getters.getTableNameByField({
        uuid: this.metadata.uuid
      })
    },
    searchTableName() {
      if (!isEmptyValue(this.storedReferenceTableName)) {
        return this.storedReferenceTableName
      }
      return this.metadata.referenceTableName
    },

    displayedValue: {
      get() {
        const { displayColumnName, containerUuid, inTable, display_type } = this.metadata

        if (isEmptyValue(this.value) && display_type === IMAGE.id) {
          return undefined
        }

        // DisplayColumn_'ColumnName'
        // table records values
        if (inTable) {
          return this.containerManager.getCell({
            containerUuid,
            rowIndex: this.metadata.rowIndex,
            rowUid: this.metadata.rowUid,
            columnName: displayColumnName
          })
        }
        // return store.getters.getValueOfFieldOnContainer({
        //   parentUuid: this.metadata.parentUuid,
        //   containerUuid,
        //   columnName: displayColumnName
        // })
        return store.getters.getValueOfField({
          containerUuid,
          columnName: displayColumnName
        })
      },
      set(newValue) {
        const { displayColumnName, containerUuid, inTable } = this.metadata

        // table records values
        if (inTable) {
          return this.containerManager.setCell({
            containerUuid,
            rowIndex: this.metadata.rowIndex,
            rowUid: this.metadata.rowUid,
            columnName: displayColumnName,
            value: newValue
          })
        }

        store.commit('updateValueOfField', {
          parentUuid: this.metadata.parentUuid,
          containerUuid,
          // DisplayColumn_'ColumnName'
          columnName: displayColumnName,
          value: newValue
        })
        // update element column name
        if (!this.metadata.isSameColumnElement) {
          store.commit('updateValueOfField', {
            parentUuid: this.metadata.parentUuid,
            containerUuid,
            columnName: DISPLAY_COLUMN_PREFIX + this.metadata.element_name,
            value: newValue
          })
        }
      }
    },

    blankValues() {
      const { column_name, elementColumnName } = this.metadata
      return {
        id: undefined,
        [column_name]: undefined,
        [elementColumnName]: undefined,
        uuid: undefined,
        UUID: undefined,
        [DISPLAY_COLUMN_PREFIX + column_name]: undefined,
        [DISPLAY_COLUMN_PREFIX + elementColumnName]: undefined,
        name: undefined,
        Name: undefined,
        value: undefined,
        Value: undefined,
        description: undefined,
        Description: undefined
      }
    },

    // implement to overwrite
    recordsList() {
      return store.getters.getGeneralInfoRecordsList({
        containerUuid: this.uuidForm
      })
    },
    // includes list lookups and default values
    getStoredLookupsAndDefaultValues() {
      const allOptions = store.getters.getStoredLookupAll({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.containerUuid,
        contextColumnNames: this.metadata.reference.context_column_names,
        contextColumnNamesByDefaultValue: this.metadata.context_column_names,
        uuid: this.metadata.uuid,
        id: this.metadata.internal_id,
        //
        tableName: this.searchTableName,
        columnName: this.metadata.column_name,
        value: this.value
      })

      return allOptions
    },

    storedIdentifierColumns() {
      const listIdentifier = store.getters.getIdentifierColumns({
        tableName: this.searchTableName
      })
      if (this.isEmptyValue(listIdentifier)) {
        return []
      }
      // TODO: Validate if is only column name
      return listIdentifier
        .filter(field => {
          // return field.display_type === CHAR.id
          return field.identifierSequence > 0
        })
        .sort((fieldA, fieldB) => {
          return fieldA.identifierSequence > fieldB.identifierSequence
        })
    }
  },

  methods: {
    clearValues() {
      this.controlDisplayed = undefined
      this.setValues(this.blankValues)
    },
    clearFormValues() {
      store.dispatch('clearValuesOnContainer', {
        containerUuid: this.uuidForm
      })
    },
    // subscribeChanges() {
    //   return store.subscribe((mutation, state) => {Q
    //     if (mutation.type === 'updateValueOfField') {
    //       if (mutation.payload.containerUuid === this.metadata.containerUuid) {
    //         // add displayed value to persistence
    //         if (mutation.payload.columnName === this.metadata.column_name) {
    //           this.preHandleChange(mutation.payload.value)

    //           store.dispatch('notifyFieldChange', {
    //             containerUuid: this.metadata.containerUuid,
    //             containerManager: this.containerManager,
    //             field: this.metadata,
    //             columnName: this.metadata.displayColumnName
    //           })
    //         }

    //         if (mutation.payload.columnName === this.metadata.displayColumnName) {
    //           // set current displayed value to clean on focus
    //           this.controlDisplayed = mutation.payload.value
    //         }
    //       }
    //     }
    //   })
    // },
    setNewDisplayedValue() {
      const displayValue = this.displayedValue
      if (!isSameValues(this.controlDisplayed, displayValue)) {
        this.controlDisplayed = displayValue
      }
    },
    setOldDisplayedValue() {
      if (!isSameValues(this.controlDisplayed, this.displayedValue)) {
        this.displayedValue = this.controlDisplayed
        this.controlDisplayed = ''
      }
      this.hasFocus = false
    },
    whitOutResultsMessage() {
      this.$message({
        message: lang.t('notifications.searchWithOutRecords'),
        type: 'info',
        showClose: true
      })
    },

    /**
     * Set displayed value from lookup list or default value
     * @returns
     */
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

      // find local list value
      const optionsList = [...this.getStoredLookupsAndDefaultValues]
      const option = optionsList.find(item => item.value === value)
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

      // request lookup
      this.getValueOfLookup()
    },
    getValueOfLookup() {
      this.isLoading = true
      this.loadDefaultValueFromServer()
        .then(responseLookupItem => {
          // with value response update local component list
          if (!this.isEmptyValue(responseLookupItem)) {
            this.value = responseLookupItem.value
            this.displayedValue = responseLookupItem.displayedValue
            this.uuidValue = responseLookupItem.uuid
          }
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    localSearch(stringToMatch, callBack) {
      if (isEmptyValue(stringToMatch)) {
        // not show list
        callBack([])
        return
      }

      const recordsList = this.recordsList
      let results = recordsList
      if (stringToMatch) {
        const parsedValue = trimPercentage(stringToMatch.toLowerCase().trim())

        results = recordsList.filter(row => {
          // find on all columns
          // for (const column in row) {
          //   const valueToCompare = String(row[column]).toLowerCase()

          //   if (valueToCompare.includes(parsedValue)) {
          //     return true
          //   }
          // }
          // find on identifier columns
          for (const field of this.storedIdentifierColumns) {
            const { column_name, displayColumnName, display_type } = field

            const currentValue = formatField({
              value: row[column_name],
              displayedValue: row[displayColumnName],
              displayType: display_type
            })
            const valueToCompare = String(currentValue).toLowerCase()

            if (valueToCompare.includes(parsedValue)) {
              return true
            }
          }
          return false
        })

        // Remote search
        if (isEmptyValue(results) && String(stringToMatch.length > 2)) {
          clearTimeout(this.timeOutSearchRecords)

          this.timeOutSearchRecords = setTimeout(() => {
            this.remoteSearch(stringToMatch)
              .then(remoteResponse => {
                callBack(remoteResponse)
              })
          }, 700)
          return
        }
      }

      // call callback function to return suggestions
      callBack(results)
    },

    /**
     * implement to overwrite
     * @param {string} searchValue
     * @returns {promise}
     */
    remoteSearch(searchValue) {
      return new Promise(resolve => {
        console.info('Implememnt to overwrite')
        resolve([])
      })
    },

    setValues(rowData) {
      const { parentUuid, containerUuid, column_name, elementName } = this.metadata
      const { UUID: uuid } = rowData

      const displayedValue = this.generateDisplayedValue(rowData)

      let value = rowData[column_name]
      if (isEmptyValue(value) && !this.metadata.isSameColumnElement) {
        value = rowData[elementName]
      }
      // when value is referneced as Account_ID -> C_ElementValue_ID, C_Currency_ID_To -> C_Currency_ID
      if (isEmptyValue(value) && !isEmptyValue(this.searchTableName)) {
        const referenceColumn = this.searchTableName + IDENTIFIER_COLUMN_SUFFIX
        value = rowData[referenceColumn]
      }

      // set ID value
      this.value = value
      // set display column (name) value
      this.displayedValue = displayedValue
      // set UUID value
      this.uuidValue = uuid

      // no enable callouts or create/update record
      if (this.metadata.isAdvancedQuery) {
        return
      }

      store.dispatch('notifyFieldChange', {
        parentUuid,
        containerUuid,
        containerManager: this.containerManager,
        field: this.metadata,
        columnName: column_name,
        newValue: value
      })
    },

    generateDisplayedValueWithIdentifiers(row) {
      let displayedValue
      if (isEmptyValue(row)) {
        return displayedValue
      }

      const identifierColumns = this.storedIdentifierColumns
      if (isEmptyValue(identifierColumns)) {
        return displayedValue
      }

      // generate with identifier columns
      this.storedIdentifierColumns.forEach(field => {
        const { column_name, displayColumnName, display_type } = field

        const currentValue = formatField({
          value: row[column_name],
          displayedValue: row[displayColumnName],
          displayType: display_type
        })

        if (isEmptyValue(currentValue)) {
          // omit empty value
          return
        }

        if (isEmptyValue(displayedValue)) {
          // set first value
          displayedValue = currentValue
          return
        }
        // concat additional values
        displayedValue += ' - ' + currentValue
      })

      return displayedValue
    },

    generateDisplayedValue(recordRow) {
      let displayedValue
      if (isEmptyValue(recordRow)) {
        return displayedValue
      }

      const { display_value } = recordRow
      if (!isEmptyValue(display_value)) {
        displayedValue = display_value
        return displayedValue
      }

      const { column_name, elementName, isSameColumnElement } = this.metadata
      displayedValue = recordRow[DISPLAY_COLUMN_PREFIX + column_name]
      if (!isEmptyValue(displayedValue)) {
        return displayedValue
      }
      // when column is a view (smart browse)
      if (!isSameColumnElement) {
        displayedValue = recordRow[DISPLAY_COLUMN_PREFIX + elementName]
        if (!isEmptyValue(displayedValue)) {
          return displayedValue
        }
      }
      // when value is referneced as Account_ID -> C_ElementValue_ID, C_Currency_ID_To -> C_Currency_ID
      if (!isEmptyValue(this.searchTableName)) {
        const referenceColumn = DISPLAY_COLUMN_PREFIX + this.searchTableName + IDENTIFIER_COLUMN_SUFFIX
        displayedValue = recordRow[referenceColumn]
        if (!isEmptyValue(displayedValue)) {
          return displayedValue
        }
      }

      displayedValue = this.generateDisplayedValueWithIdentifiers(recordRow)
      if (!isEmptyValue(displayedValue)) {
        return displayedValue
      }

      // generate with standard columns
      const { Value, DocumentNo, Name, Description } = recordRow

      if (!isEmptyValue(Value)) {
        displayedValue = Value
      } else if (!isEmptyValue(DocumentNo)) {
        displayedValue = DocumentNo
      }
      if (!isEmptyValue(Name)) {
        if (!isEmptyValue(displayedValue)) {
          displayedValue += ' - ' + Name
        } else {
          displayedValue = Name
        }
      }
      if (!isEmptyValue(Description)) {
        if (!isEmptyValue(displayedValue)) {
          displayedValue += ' - ' + Description
        } else {
          displayedValue = Description
        }
      }

      return displayedValue
    },

    generatedDescription(recordRow) {
      const identifierColumnName = this.storedIdentifierColumns.map(field => {
        return field.column_name
      })
      let displayedDescription

      const description = recordRow['Description']
      if (!isEmptyValue(description) && !identifierColumnName.includes('Description')) {
        displayedDescription = description
      }

      const help = recordRow['Help']
      if (!isEmptyValue(help) && !identifierColumnName.includes('Help')) {
        if (!isEmptyValue(displayedDescription)) {
          displayedDescription += ' - ' + help
        } else {
          displayedDescription = help
        }
      }

      return displayedDescription
    },

    handleSelect(recordSelected) {
      // Checks if the selected record is empty or if its value in the specified column is less than or equal to zero.
      if (isEmptyValue(recordSelected) || isEmptyValue(recordSelected.UUID)) {
        // set empty values
        recordSelected = this.blankValues
      }

      // Calls the setValues function to set the values of the selected register in the component.
      this.setValues(recordSelected)

      // Generates a displayed value from the selected record and assigns it to `controlDisplayed`.
      // This prevents loss of the displayed value when the field receives focus.
      this.controlDisplayed = this.generateDisplayedValue(recordSelected)

      // Disables autocomplete to prevent it from remaining active after selection.
      this.$refs.autocompleteGeneralInfo.activated = false
    }
  }

}

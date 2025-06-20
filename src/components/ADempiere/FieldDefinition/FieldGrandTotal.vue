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
  <p class="field-total">
    <b :class="colorText">
      {{ displayedValue }}
    </b>
  </p>
</template>

<script>
import store from '@/store'

// Components and Mixins
import fieldMixin from '@/components/ADempiere/FieldDefinition/mixin/mixinField.js'

// Constants
import { DISPLAY_COLUMN_PREFIX } from '@/utils/ADempiere/dictionaryUtils'
import {
  NUMBER
} from '@/utils/ADempiere/references.js'
import { COLUMNNAME_C_Currency_ID } from '@/utils/ADempiere/constants/systemColumns'

// Utils and Helper Methods
import { isAmountDecimalField, isNumberField } from '@/utils/ADempiere/references.js'
import { formatNumber } from '@/utils/ADempiere/formatValue/numberFormat.js'
import { getTypeOfValue, isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { standardPrecisionContext } from '@/utils/ADempiere/formatValue/numberFormat.js'

export default {
  name: 'FieldGrandTotal',

  mixins: [fieldMixin],

  props: {
    sizeField: {
      type: String,
      default: undefined
    }
  },

  computed: {
    precision() {
      // Amount, Costs+Prices, Number, Quantity
      const { precision, parentUuid, display_type, containerUuid } = this.metadata
      if (!isEmptyValue(precision)) {
        return precision
      }
      if (display_type === NUMBER.id) {
        return standardPrecisionContext({
          parentUuid: parentUuid,
          containerUuid: containerUuid
        })
      }
      if (isAmountDecimalField(display_type)) {
        return store.getters['user/getCurrencyPrecision'].standard_precision
      }
      if (isNumberField(display_type)) {
        return store.getters['user/getUOMPrecision'].standard_precision
      }
      return undefined
    },
    colorText() {
      if (Number(this.value) < 0) {
        return 'number-red'
      }
      return 'number-black'
    },
    currencyDocument() {
      const columnName = DISPLAY_COLUMN_PREFIX + COLUMNNAME_C_Currency_ID
      // table records values
      if (this.metadata.inTable) {
        // implement container manager row
        const value = this.containerManager.getCell({
          containerUuid: this.metadata.containerUuid,
          rowIndex: this.metadata.rowIndex,
          rowUid: this.metadata.rowUid,
          columnName
        })
        // types `decimal` and `date` is a object struct
        if ((getTypeOfValue(value) === 'OBJECT') && !isEmptyValue(value.type)) {
          return value.value
        }
        return value
      }

      const value = this.$store.getters.getValueOfField({
        parentUuid: this.metadata.parentUuid,
        containerUuid: this.metadata.firstTabUuid,
        columnName
      })
      // types `decimal` and `date` is a object struct
      if ((getTypeOfValue(value) === 'OBJECT') && !isEmptyValue(value.type)) {
        return value.value
      }
      return value
    },
    currencyCode() {
      if (!isEmptyValue(this.metadata.labelCurrency)) {
        return this.metadata.labelCurrency
      }
      const documentCurrency = this.currencyDocument
      if (!isEmptyValue(documentCurrency)) {
        return documentCurrency
      }
      return undefined
    },
    displayedValue() {
      return formatNumber({
        value: this.value,
        precision: this.precision,
        currency: this.currencyCode,
        displayType: this.metadata.display_type
      })
    }
  }
}
</script>

<style lang="scss">
.field-total {
  text-align: right;
  width: 100%;
  margin: 0px;
  font-size: 25px;
  font-family: serif;
  border: 1px solid #DCDFE6;
  box-sizing: border-box;
  border-radius: 4px;
}
</style>

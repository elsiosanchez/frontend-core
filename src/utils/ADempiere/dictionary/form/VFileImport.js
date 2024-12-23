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

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export const TABLE_NAME = 'AD_ImpFormat'

export const ROW_TYPE_CONSTANT = 'C'

export const ROW_TYPE_DATE = 'D'

export const ROW_TYPE_NUMBER = 'N'

export const ROW_TYPE_STRING = 'S'

/**
 * Format cell or field
 * @param {object} formatField
 * @param {object} row
 * @returns {mixes} value
 */
export function formatValue(formatField, row) {
  if (isEmptyValue(row)) {
    return undefined
  }
  if (isEmptyValue(formatField)) {
    return undefined
  }
  const {
    column_name, data_type,
    is_divide_by_100,
    default_value, constant_value
  } = formatField

  if (data_type === ROW_TYPE_CONSTANT) {
    return constant_value
  }

  const currentValue = row[column_name]
  if (isEmptyValue(currentValue)) {
    return default_value
  }

  if (data_type === ROW_TYPE_NUMBER) {
    const numberValue = currentValue.value
    if (is_divide_by_100 && currentValue !== 0) {
      return numberValue / 100
    }
    return numberValue
  }
  if (data_type === ROW_TYPE_DATE) {
    const dateValue = currentValue.value
    return dateValue
  }

  return currentValue
}

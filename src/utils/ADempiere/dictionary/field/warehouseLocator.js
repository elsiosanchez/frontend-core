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

export const TABLE_NAME = 'M_Locator'

export const COLUMN_NAME = 'M_Locator_ID'

export const WAREHOUSE_LOCATOR_LIST_FORM = 'Warehouse-Locator-List'

/**
 * Generate displayed value from values
 * @param {Object} recordRow
 * @returns {String}
 */
export function generateDisplayedValue(recordRow) {
  const { display_value } = recordRow

  let displayedValue = display_value
  if (!isEmptyValue(display_value)) {
    return display_value
  }

  // generate with standard columns
  const { value, aisle, bin, level } = recordRow
  if (!isEmptyValue(value)) {
    displayedValue = value
  }

  if (isEmptyValue(displayedValue)) {
    displayedValue = aisle + '-' + bin + '-' + level
  }

  return displayedValue
}

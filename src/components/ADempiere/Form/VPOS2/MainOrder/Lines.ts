/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import store from '@/store'
/**
 * Show the correct display format
 * @param {object} row record
 * @param {object} orderLine or field definition
 */

export function displayValue(row, orderLine) {
  return ''
}
/**
 * Show Table Label
 * @param {object} row record
 */
export function displayLabel({
  row
}) {
  const {
    displayCurrency,
    isDisplayDiscount,
    isDisplayTaxAmount
  } = store.getters.getVPOS
  const isMobile = store.getters.device === 'mobile'
  const { columnName } = row
  let display = false
  if (isMobile) {
    switch (columnName) {
      case 'LineDescription':
        display = true
        break
      case 'CurrentPrice':
        display = true
        break
      case 'QtyEntered':
        display = true
        break
      case 'GrandTotal':
        display = true
        break
      default:
        display = false
        break
    }
    return display
  }
  switch (columnName) {
    case 'ConvertedAmount':
      display = displayCurrency
      break
    case 'Discount':
      display = isDisplayDiscount
      break
    case 'DiscountTotal':
      display = isDisplayDiscount
      break
    case 'taxIndicator':
      display = isDisplayTaxAmount
      break
    case 'DisplayTaxAmount':
      display = isDisplayTaxAmount
      break
    case 'GrandTotal':
      display = true
      break
    default:
      display = true
      break
  }
  return display
}

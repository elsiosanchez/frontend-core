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

// Utils and Helpers Methods
import evaluator from '@/utils/ADempiere/contextUtils/evaluator'
import { getContext } from '@/utils/ADempiere/contextUtils'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

/**
 * Evaluate if tab is displayed
 * @param {string} parentUuid
 * @param {string} containerUuid
 * @param {string} displayLogic
 * @returns {boolean}
 */
export function isDisplayedTab({ parentUuid, containerUuid, displayLogic }) {
  // evaluate display logic
  if (!isEmptyValue(displayLogic)) {
    const isDisplayedFromLogic = evaluator.evaluateLogic({
      context: getContext,
      parentUuid,
      containerUuid,
      logic: displayLogic,
      defaultReturned: true
    })
    return isDisplayedFromLogic
  }

  return true
}

export function isReadOnlyTab({ parentUuid, containerUuid }) {
  const window = store.getters.getStoredWindow(parentUuid)
  if (isEmptyValue(window)) {
    return true
  }
  const { window_type } = window
  // window is "Only Query" type
  if (!isEmptyValue(window_type) && window_type === 'Q') {
    return true
  }
  const storeTab = store.getters.getStoredTab(parentUuid, containerUuid)
  if (isEmptyValue(storeTab)) {
    return true
  }
  const { table, is_read_only, read_only_logic } = storeTab
  if (!isEmptyValue(table) && table.is_view) {
    return true
  }
  // if tab is read only, all fields are read only
  if (is_read_only) {
    return true
  }

  if (!isEmptyValue(read_only_logic)) {
    const isReadOnlyFromLogic = evaluator.evaluateLogic({
      context: getContext,
      parentUuid,
      containerUuid,
      logic: read_only_logic,
      defaultReturned: false
    })
    if (isReadOnlyFromLogic) {
      return true
    }
  }

  return false
}

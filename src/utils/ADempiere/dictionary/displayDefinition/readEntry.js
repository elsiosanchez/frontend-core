/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Ricardo Fenomeno ricardofenomeno13@gmail.com https://github.com/Ricargame
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
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export const DisplayDefinition = {
  dislayDataWindows({
    type,
    id,
    filters,
    searchValue
  }) {
    hiddenAllWindows({ show: false })
    if (!isEmptyValue(id)) {
      if (type === 'K') {
        searchInfokanban({
          id,
          filters,
          searchValue
        })
      }
      if (type === 'C') {
        searchInfoCalender({
          id,
          filters,
          searchValue
        })
      }
      if (type === 'R') {
        searchInfoResource({
          id,
          filters,
          searchValue
        })
      }
    }
  }
}

export function searchInfokanban({
  id,
  filters,
  searchValue
}) {
  store.dispatch('searchPanelKanban', {
    id,
    filters,
    searchValue
  })
}
export function searchInfoCalender({
  id,
  filters,
  searchValue
}) {
  store.dispatch('getListTasksFromServer', {
    id,
    filters,
    searchValue
  })
}
export function searchInfoResource({
  id,
  filters,
  searchValue
}) {
  store.dispatch('searchPanelResource', {
    id,
    filters,
    searchValue
  })
}
export function searchTimeLine({
  id
}) {
  store.dispatch('searchPanelTimeLine', {
    id
  })
}
export function searchInfoWorkflow({
  id
}) {
  store.dispatch('getWorflowDisplay', {
    id
  })
}

export function hiddenAllWindows({
  show
}) {
  showWindownKanban({ show })
  showWindownCalendar({ show })
  showWindownResource({ show })
}

export function showWindownKanban({
  show
}) {
  store.commit('setPanelKanban', show)
}

export function showWindownCalendar({
  show
}) {
  store.commit('setPanelCalendar', show)
}

export function showWindownResource({
  show
}) {
  store.commit('setPanelResource', show)
}

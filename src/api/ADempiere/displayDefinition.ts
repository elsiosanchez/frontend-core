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

// Get Instance for connection
import { request } from '@/utils/ADempiere/request'

export function kanbans({
  id
}) {
  return request({
    url: `/display-definition/kanbans/${id}`,
    method: 'get'
  })
}

export function worflowsDefinitions({
  id
}) {
  return request({
    url: `/display-definition/workflows/${id}/definition`,
    method: 'get'
  })
}

export function displayDefinitions({
  tableName
}) {
  return request({
    url: `/display-definition/definitions/${tableName}`,
    method: 'get'
  })
}

export function displayDefinitionsExists({
  tableName
}) {
  return request({
    url: `/display-definition/definitions/${tableName}/exists`,
    method: 'get'
  })
}

export function timeLines({
  id,
  filters
}) {
  return request({
    url: `/display-definition/timelines/${id}`,
    method: 'get',
    params: {
      filters: JSON.stringify([filters])
    }
  })
}

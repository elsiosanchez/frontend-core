/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// Get Instance for connection
import { request } from '@/utils/ADempiere/request'
import { camelizeObjectKeys } from '@/utils/ADempiere/transformObject.js'

// constants
// import { ROWS_OF_RECORDS_BY_PAGE } from '@/utils/ADempiere/tableUtils'

export function requestCreateResource({
  area,
  name,
  description
}) {
  return request({
    url: '/form/addons/time-control/create-resource-assigment',
    method: 'get',
    params: {
      //  DSL Query
      area,
      name,
      description
    }
  })
    .then(response => {
      // const { convertEntityList } = require('@/utils/ADempiere/apiConverts/persistence.js')
      return camelizeObjectKeys(response)
    })
}
export function requestUpdateResource({
  id,
  uuid,
  area,
  name,
  description
}) {
  return request({
    url: '/form/addons/time-control/update-resource-assigment',
    method: 'get',
    params: {
      //  DSL Query
      id,
      uuid,
      area,
      name,
      description
    }
  })
    .then(response => {
      // const { convertEntityList } = require('@/utils/ADempiere/apiConverts/persistence.js')
      return camelizeObjectKeys(response)
    })
}
export function requestDeleteResource({
  id,
  uuid
}) {
  return request({
    url: '/form/addons/time-control/delete-resource-assigment',
    method: 'get',
    params: {
      //  DSL Query
      id,
      uuid
    }
  })
    .then(response => {
      // const { convertEntityList } = require('@/utils/ADempiere/apiConverts/persistence.js')
      return camelizeObjectKeys(response)
    })
}
export function requestListResource() {
  return request({
    url: '/form/addons/time-control/list-resources-assigment',
    method: 'get',
    params: {
      //  DSL Query
      // id,
      // uuid,
      // area,
      // name,
      // description,
      //  Page Data
      page_size: 25
    }
  })
    .then(response => {
      // const { convertEntityList } = require('@/utils/ADempiere/apiConverts/persistence.js')
      return camelizeObjectKeys(response)
    })
}

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
  id,
  filters,
  searchValue
}) {
  return request({
    url: `/display-definition/kanbans/${id}`,
    method: 'get',
    params: {
      filters,
      search_value: searchValue,
      page_size: 300
    }
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
  tableName,
  onlyeReferences
}) {
  return request({
    url: `/display-definition/definitions/${tableName}`,
    method: 'get',
    params: {
      only_references: onlyeReferences
    }
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
      filters,
      page_size: 300
    }
  })
}

export function workflowsDisplay({
  id,
  filters
}) {
  return request({
    url: `/display-definition/workflows/${id}`,
    method: 'get',
    params: {
      filters,
      page_size: 300
    }
  })
}
export function resources({
  id,
  filters,
  searchValue
}) {
  return request({
    url: `/display-definition/resources/${id}`,
    method: 'get',
    params: {
      search_value: searchValue,
      page_size: 300,
      filters
    }
  })
}

export function listDisplayDefinitionFieldsMetadata({
  id
}) {
  return request({
    url: `/display-definition/definitions/${id}/fields`,
    method: 'get'
  })
}
export function createDataEntry({
  attributes,
  contextAttributes,
  displayDefinitionId
}) {
  return request({
    url: `/display-definition/${displayDefinitionId}/entries`,
    method: 'post',
    data: {
      attributes,
      display_definition_id: displayDefinitionId,
      context_attributes: contextAttributes
    }
  })
}

export function readDataEntry({
  id,
  displayDefinitionId
}) {
  return request({
    url: `/display-definition/${displayDefinitionId}/entries/${id}`,
    method: 'get'
  })
}

export function updateDataEntry({
  id,
  attributes,
  displayDefinitionId
}) {
  return request({
    url: `/display-definition/${displayDefinitionId}/entries/${id}`,
    method: 'patch',
    data: {
      id,
      attributes,
      display_definition_id: displayDefinitionId
    }
  })
}

export function deleteDataEntry({
  id,
  displayDefinitionId
}) {
  return request({
    url: `/display-definition/${displayDefinitionId}/entries/${id}`,
    method: 'delete'
  })
}

/**
 * CRUD Resource
 */
export function createDataEntryResource({
  attributes,
  contextAttributes,
  displayDefinitionId
}) {
  return request({
    url: `/display-definition/${displayDefinitionId}/entries/resources`,
    method: 'post',
    data: {
      attributes,
      display_definition_id: displayDefinitionId,
      context_attributes: contextAttributes
    }
  })
}

export function readDataEntryResource({
  id,
  displayDefinitionId
}) {
  return request({
    url: `/display-definition/${displayDefinitionId}/entries/${id}/resources`,
    method: 'get'
  })
}

export function updateDataEntryResource({
  id,
  attributes,
  displayDefinitionId
}) {
  return request({
    url: `/display-definition/${displayDefinitionId}/entries/${id}/resources`,
    method: 'patch',
    data: {
      id,
      attributes,
      display_definition_id: displayDefinitionId
    }
  })
}

export function deleteDataEntryResource({
  id,
  displayDefinitionId
}) {
  return request({
    url: `/display-definition/${displayDefinitionId}/entries/${id}/resources`,
    method: 'delete'
  })
}
/**
 * Expand/Collapse
 */
export function collapse({
  id,
  filters
}) {
  return request({
    url: `/display-definition/expand-collapses/${id}`,
    method: 'get',
    params: {
      filters,
      page_size: 300
    }
  })
}
/**
 * Mosaic
 */
export function mosaic({
  id,
  filters
}) {
  return request({
    url: `/display-definition/mosaics/${id}`,
    method: 'get',
    params: {
      filters,
      page_size: 300
    }
  })
}

/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Ricardo Fenomeno ricardofenomeno13@gmail.com https://github.com/ricargame
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

import { request } from '@/utils/ADempiere/request'

// Constants
import { RECORD_ROWS_BY_LIST } from '@/utils/ADempiere/dictionary/field/lookups'
// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
export function requestListOrganizations({
  searchValue,
  pageToken,
  pageSize = RECORD_ROWS_BY_LIST
}) {
  return request({
    url: '/forms/out-bound-orders/organizations',
    method: 'get',
    params: {
      page_size: pageSize,
      page_token: pageToken,
      search_value: searchValue
    }
  })
}

export function requestListWarehouses({
  searchValue,
  pageToken,
  pageSize = RECORD_ROWS_BY_LIST,
  organization_id
}) {
  return request({
    url: `/forms/out-bound-orders/${organization_id}/warehouses`,
    method: 'get',
    params: {
      page_size: pageSize,
      page_token: pageToken,
      search_value: searchValue
    }
  })
}

export function requestListDocumentTypes({
  searchValue,
  pageToken,
  pageSize = RECORD_ROWS_BY_LIST,
  movement_type
}) {
  return request({
    url: `/forms/out-bound-orders/document-types/${movement_type}`,
    method: 'get',
    params: {
      page_size: pageSize,
      page_token: pageToken,
      search_value: searchValue
    }
  })
}

export function requestListTargetDocumentTypes({
  searchValue,
  pageToken,
  pageSize = RECORD_ROWS_BY_LIST
}) {
  return request({
    url: `/forms/out-bound-orders/target-document-types`,
    method: 'get',
    params: {
      page_size: pageSize,
      page_token: pageToken,
      search_value: searchValue
    }
  })
}

export function requestListSalesRegions({
  searchValue,
  pageToken,
  pageSize = RECORD_ROWS_BY_LIST
}) {
  return request({
    url: `/forms/out-bound-orders/sales-regions`,
    method: 'get',
    params: {
      page_size: pageSize,
      page_token: pageToken,
      search_value: searchValue
    }
  })
}

export function requestListSalesRepresentatives({
  searchValue,
  pageToken,
  pageSize = RECORD_ROWS_BY_LIST
}) {
  return request({
    url: `/forms/out-bound-orders/sales-representatives`,
    method: 'get',
    params: {
      page_size: pageSize,
      page_token: pageToken,
      search_value: searchValue
    }
  })
}

export function requestListDeliveryRules({
  searchValue,
  pageToken,
  pageSize = RECORD_ROWS_BY_LIST
}) {
  return request({
    url: `/forms/out-bound-orders/delivery-rules`,
    method: 'get',
    params: {
      page_size: pageSize,
      page_token: pageToken,
      search_value: searchValue
    }
  })
}

export function requestListDeliveryVias({
  searchValue,
  pageToken,
  pageSize = RECORD_ROWS_BY_LIST
}) {
  return request({
    url: `/forms/out-bound-orders/delivery-vias`,
    method: 'get',
    params: {
      page_size: pageSize,
      page_token: pageToken,
      search_value: searchValue
    }
  })
}

export function requestListShippers({
  searchValue,
  pageToken,
  pageSize = RECORD_ROWS_BY_LIST
}) {
  return request({
    url: `/forms/out-bound-orders/shippers`,
    method: 'get',
    params: {
      page_size: pageSize,
      page_token: pageToken,
      search_value: searchValue
    }
  })
}

// Process

export function requestListDocumentActions({
  searchValue,
  pageToken,
  pageSize = RECORD_ROWS_BY_LIST
}) {
  return request({
    url: `/forms/out-bound-orders/document-actions`,
    method: 'get',
    params: {
      page_size: pageSize,
      page_token: pageToken,
      search_value: searchValue
    }
  })
}

export function requestListLocators({
  searchValue,
  pageToken,
  pageSize = RECORD_ROWS_BY_LIST,
  warehouse_id
}) {
  return request({
    url: `/forms/out-bound-orders/warehouses/${warehouse_id}/locators`,
    method: 'get',
    params: {
      page_size: pageSize,
      page_token: pageToken,
      search_value: searchValue
    }
  })
}

// Table

export function requestListDocuments({
  movement_type,
  organization_id,
  warehouse_id,
  sales_region_id,
  sales_representative_id,
  document_type_id
}) {
  return request({
    url: `/forms/out-bound-orders/documents/${movement_type}`,
    method: 'get',
    params: {
      organization_id,
      warehouse_id,
      sales_region_id,
      sales_representative_id,
      document_type_id
    }
  })
}

export function requesListDocumentLines({
  movement_type,
  organization_id,
  warehouse_id,
  sales_region_id,
  sales_representative_id,
  document_type_id,
  recordsId
}) {
  const params = new URLSearchParams()
  params.append('organization_id', organization_id)
  params.append('warehouse_id', warehouse_id)
  params.append('sales_region_id', sales_region_id)
  params.append('sales_representative_id', sales_representative_id)
  params.append('document_type_id', document_type_id)
  if (!isEmptyValue(recordsId)) {
    recordsId.forEach((id) => {
      params.append('header_ids', id)
    })
  } else {
    params.append('header_ids', recordsId)
  }
  return request({
    url: `/forms/out-bound-orders/documents/${movement_type}/lines`,
    method: 'get',
    params
  })
}

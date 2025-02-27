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

const OutBoundOrder = {
  title: 'Generate Output Order',
  step: {
    searchCriteria: 'Search Criteria',
    order: 'Order',
    process: 'Process'
  },
  searchCriteria: {
    organization: 'Organization',
    moventType: 'Movement Type',
    documentType: 'Document Type',
    warehouse: 'Warehouse',
    salesRegion: 'Sales Region',
    salesRepresentative: 'Sales Representative',
    targetDocumentType: 'Target Document Type',
    deliveryRule: 'Delivery Rule',
    deliveryVia: 'delivery Via',
    shipper: 'shipper',
    order: 'Sales order',
    distributionOrder: 'Distribution Order',
    panel: {
      documentDate: 'Document Date',
      shipDate: 'Ship Date',
      documentAction: 'Document Action',
      locator: 'Locator'
    }
  },
  order: {
    title: 'Order'
  },
  select: {
    title: 'Select'
  }
}

export default OutBoundOrder

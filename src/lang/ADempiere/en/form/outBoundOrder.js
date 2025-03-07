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
  error: 'The Quantity Cannot be Greater than the Quantity Available.',
  step: {
    searchCriteria: 'Search Criteria',
    order: 'Order',
    process: 'Process'
  },
  searchCriteria: {
    organization: 'Organization',
    movementType: 'Movement Type',
    documentType: 'Document Type',
    warehouse: 'Warehouse',
    salesRegion: 'Sales Region',
    salesRepresentative: 'Sales Representative',
    salesOrder: 'Sales Order',
    distributionOrder: 'Distribution Order'
  },
  header: {
    title: 'Documents Headers',
    warehouse: 'Warehouse',
    documentNo: 'Document No',
    dateOrdered: 'Date Ordered',
    datePromised: 'Date Promised',
    region: 'Region',
    city: 'City',
    businessPartner: 'Business Partner',
    salesRepresentative: 'Sales Representative',
    location: 'Location',
    address1: 'Address 1',
    address2: 'Address 2',
    address3: 'Address 3',
    address4: 'Address 4',
    weight: 'Weight',
    volume: 'Volume'
  },
  lines: {
    title: 'Documents Lines',
    documentNo: 'Document No',
    product: 'Product',
    uom: 'UOM',
    uomOrder: 'UOM (Order)',
    weight: 'Weight',
    volume: 'Volume',
    onHandQuantity: 'On Hand Qty.',
    quantity: 'Quantity',
    loadSequence: 'Load Sequence',
    orderedQuantity: 'Ordered Qty.',
    reservedQuantity: 'Reserved Qty.',
    quantityInvoiced: 'Quantity Invoiced',
    deliveredQuantity: 'Delivered Qty.',
    quantityInTransit: 'Qty. In Transit',
    deliveryRule: 'Delivery Rule'
  },
  productInfo: {
    title: 'Product Stock for Warehouse',
    product: 'Product',
    uom: 'UOM',
    warehouse: 'Warehouse',
    quantityInTransit: 'Qty In Transit',
    onHandQuantity: 'On Hand Quantity',
    quantity: 'Quantity',
    pickedQuantity: 'Picked Qty'
  },
  process: {
    documentDate: 'Document Date',
    shipDate: 'Ship Date',
    documentAction: 'Document Action',
    locator: 'Locator',
    targetDocumentType: 'Target Document Type',
    deliveryRule: 'Delivery Rule',
    deliveryVia: 'Delivery Via',
    shipper: 'Shipper'
  }
}

export default OutBoundOrder

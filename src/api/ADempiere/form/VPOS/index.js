/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
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

import { request } from '@/utils/ADempiere/request'

/** ______________________________________________
 * |                                              |
 * | POS Service used for ADempiere integration   |
 * |______________________________________________|
 */

/**
 * List Point of Sales
 * @returns {array} ListPointOfSalesResponse
 */
export function listPointOfSales() {
  return request({
    url: '/point-of-sales/terminals',
    method: 'get'
  })
}

/**
 * Get POS Definition
 * @param {number} id
 * @returns {object} PointOfSales
 */
export function getPointOfSales({
  id
}) {
  return request({
    url: `/point-of-sales/terminals/${id}`,
    method: 'get'
  })
}

/**
 * List of Available Warehouses
 * @param {int32} posId
 * @returns {array} ListAvailableWarehousesResponse
 */

export function listAvailableWarehouses({
  posId
}) {
  return request({
    url: `/point-of-sales/${posId}/warehouses`,
    method: 'get'
  })
}

/**
 * List of Available Tender Types
 * @param {int32} posId
 * @returns {array} ListAvailablePaymentMethodsResponse
 */

export function listAvailablePaymentMethods({
  posId
}) {
  return request({
    url: `/point-of-sales/${posId}/payment-methods`,
    method: 'get'
  })
}

/**
 * List of Available Price List
 * @param {int32} posId
 * @returns {array} ListAvailablePriceListResponse
 */

export function listAvailablePriceList({
  posId
}) {
  return request({
    url: `/point-of-sales/${posId}/price-lists`,
    method: 'get'
  })
}

/**
 * List of Available Currencies
 * @param {int32} posId
 * @returns {array} ListAvailableCurrenciesResponse
 */

export function listAvailableCurrencies({
  posId
}) {
  return request({
    url: `/point-of-sales/${posId}/currencies`,
    method: 'get'
  })
}

/**
 * List of Available Document Types
 * @param {int32} posId
 * @returns {array} ListAvailableDocumentTypesResponse
 */

export function listAvailableDocumentTypes({
  posId
}) {
  return request({
    url: `/point-of-sales/${posId}/document-types`,
    method: 'get'
  })
}

/**
 * List of Available Discounts
 * @param {int32} posId
 * @returns {array} ListAvailableDiscountsResponse
 */

export function listAvailableDiscounts({
  posId
}) {
  return request({
    url: `/point-of-sales/${posId}/discounts`,
    method: 'get'
  })
}

/**
 * List of Available Sellers
 * @param {int32} posId
 * @returns {array} ListAvailableSellersResponse
 */

export function listAvailableSellers({
  posId
}) {
  return request({
    url: `/point-of-sales/${posId}/sellers`,
    method: 'get'
  })
}

/** __________________________________________
 * |                                          |
 * | List of Point of Sale Product Services   |
 * |__________________________________________|
 */

/**
 * Get Product Price from searchValue
 * @param {int32} posId
 * @param {string} searchValue
 * @param {int32} businessPartnerId
 * @param {string} validFrom
 * @param {int32} priceListId
 * @param {int32} warehouseId
 */

export function getProductPriceSearchValue({
  businessPartnerId,
  priceListId,
  warehouseId,
  searchValue,
  validFrom,
  posId
}) {
  return request({
    url: `point-of-sales/${posId}/product-prices/${searchValue}`,
    method: 'get',
    params: {
      business_partner_id: businessPartnerId,
      valid_from: validFrom,
      price_list_id: priceListId,
      warehouse_id: warehouseId
    }
  })
}

/**
 * Get Product Price from UPC
 * @param {int32} posId
 * @param {string} upc
 * @param {int32} businessPartnerId
 * @param {string} validFrom
 * @param {int32} priceListId
 * @param {int32} warehouseId
 */

export function getProductPriceUPC({
  businessPartnerId,
  priceListId,
  warehouseId,
  validFrom,
  posId,
  upc
}) {
  return request({
    url: `point-of-sales/${posId}/product-prices/upc/${upc}`,
    method: 'get',
    params: {
      business_partner_id: businessPartnerId,
      valid_from: validFrom,
      price_list_id: priceListId,
      warehouse_id: warehouseId
    }
  })
}

/**
 * Get Product Price from sku
 * @param {int32} posId
 * @param {string} sku
 * @param {int32} businessPartnerId
 * @param {string} validFrom
 * @param {int32} priceListId
 * @param {int32} warehouseId
 */

export function getProductPriceSKU({
  businessPartnerId,
  priceListId,
  warehouseId,
  validFrom,
  posId,
  sku
}) {
  return request({
    url: `point-of-sales/${posId}/product-prices/sku/${sku}`,
    method: 'get',
    params: {
      business_partner_id: businessPartnerId,
      valid_from: validFrom,
      price_list_id: priceListId,
      warehouse_id: warehouseId
    }
  })
}

/**
 * Get Product Price from Code(value)
 * @param {int32} posId
 * @param {string} value
 * @param {int32} businessPartnerId
 * @param {string} validFrom
 * @param {int32} priceListId
 * @param {int32} warehouseId
 */

export function getProductPriceCode({
  businessPartnerId,
  priceListId,
  warehouseId,
  validFrom,
  posId,
  value
}) {
  return request({
    url: `point-of-sales/${posId}/product-prices/value/${value}`,
    method: 'get',
    params: {
      business_partner_id: businessPartnerId,
      valid_from: validFrom,
      price_list_id: priceListId,
      warehouse_id: warehouseId
    }
  })
}

/**
 * Get Product Price from Name
 * @param {int32} posId
 * @param {string} name
 * @param {int32} businessPartnerId
 * @param {string} validFrom
 * @param {int32} priceListId
 * @param {int32} warehouseId
 */

export function getProductPriceName({
  businessPartnerId,
  priceListId,
  warehouseId,
  validFrom,
  posId,
  name
}) {
  return request({
    url: `point-of-sales/${posId}/product-prices/name/${name}`,
    method: 'get',
    params: {
      business_partner_id: businessPartnerId,
      valid_from: validFrom,
      price_list_id: priceListId,
      warehouse_id: warehouseId
    }
  })
}

/**
 * List Product Price
 * @param {int32} posId
 * @param {string} filters
 * @param {string} searchValue
 * @param {string} sortBy
 * @param {repeated string} groupColumns
 * @param {repeated string} selectColumns
 * @param {int32} pageSize
 * @param {string} pageToken
 * @param {int32} businessPartnerId
 * @param {string} validFrom
 * @param {int32} priceListId
 * @param {int32} warehouseId
 */

export function listProductPrice({
  posId,
  pageSize = 15,
  pageToken,
  validFrom,
  searchValue,
  priceListId,
  warehouseId,
  businessPartnerId
}) {
  return request({
    url: `point-of-sales/${posId}/product-prices`,
    method: 'get',
    params: {
      business_partner_id: businessPartnerId,
      valid_from: validFrom,
      price_list_id: priceListId,
      search_value: searchValue,
      warehouse_id: warehouseId,
      page_size: pageSize,
      page_token: pageToken
    }
  })
}

/** ___________________
 * |                   |
 * | Orders Services   |
 * |___________________|
 */

/**
 * Create Order
 * @param {int32} posId7
 * @param {int32} customerId
 * @param {int32} documentTypeId
 * @param {int32} priceListId
 * @param {int32} warehouseId
 * @param {int32} salesRepresentativeId
 * @param {int32} campaignId
 */
export function createOrder({
  posId,
  customerId,
  documentTypeId,
  priceListId,
  warehouseId,
  salesRepresentativeId,
  campaignId
}) {
  return request({
    url: `point-of-sales/${posId}/orders`,
    method: 'post',
    data: {
      customer_id: customerId,
      document_type_id: documentTypeId,
      price_list_id: priceListId,
      warehouse_id: warehouseId,
      sales_representative_id: salesRepresentativeId,
      campaign_id: campaignId
    }
  })
}

/**
 * Get a Order
 * @param {int32} posId
 * @param {int32} orderId
 */
export function getOrder({
  posId,
  orderId
}) {
  return request({
    url: `point-of-sales/${posId}/orders/${orderId}`,
    method: 'get'
  })
}

/**
 * UpdateOrder
 * @param {int32} posId
 * @param {int32} orderId
 */
export function updateOrder({
  posId,
  orderId,
  customer_id,
  document_type_id,
  price_list_id,
  warehouse_id,
  campaign_id,
  discount_rate,
  discount_rate_off,
  discount_amount_off,
  sales_representative_id
}) {
  return request({
    url: `point-of-sales/${posId}/orders/${orderId}`,
    method: 'put',
    params: {
      customer_id,
      document_type_id,
      price_list_id,
      warehouse_id,
      campaign_id,
      discount_rate,
      discount_rate_off,
      discount_amount_off,
      sales_representative_id
    }
  })
}
/**
 * Delete Order
 * @param {int32} posId
 * @param {int32} orderId
 */
export function deleteOrder({
  posId,
  orderId
}) {
  return request({
    url: `point-of-sales/${posId}/orders/${orderId}`,
    method: 'delete'
  })
}

/**
 * List Orders
 * @param {int32} posId
 */

export function listOrders({
  posId,
  pageSize,
  pageToken,
  search_value,
  document_no,
  document_status,
  business_partner_id,
  grand_total,
  open_amount,
  is_waiting_for_pay,
  is_only_processed,
  is_only_aisle_seller,
  is_waiting_for_invoice,
  is_waiting_for_shipment,
  is_binding_offer,
  is_closed,
  is_nullified,
  is_only_rma,
  date_ordered_from,
  date_ordered_to,
  sales_representative_id
}) {
  return request({
    url: `point-of-sales/${posId}/orders`,
    method: 'get',
    params: {
      page_size: pageSize,
      page_token: pageToken,
      search_value,
      document_no,
      document_status,
      business_partner_id,
      grand_total,
      open_amount,
      is_waiting_for_pay,
      is_only_processed,
      is_only_aisle_seller,
      is_waiting_for_invoice,
      is_waiting_for_shipment,
      is_binding_offer,
      is_closed,
      is_nullified,
      is_only_rma,
      date_ordered_from,
      date_ordered_to,
      sales_representative_id
    }
  })
}

/**
 * Release Order
 * @param {int32} posId
 * @param {int32} orderId
 */

export function releaseOrder({
  posId,
  orderId
}) {
  return request({
    url: `point-of-sales/${posId}/orders/${orderId}/release`,
    method: 'put'
  })
}

/**
 * Hold Order
 * @param {int32} posId
 * @param {int32} orderId
 */

export function holdOrder({
  posId,
  orderId
}) {
  return request({
    url: `point-of-sales/${posId}/orders/${orderId}/hold`,
    method: 'put'
  })
}

/** _________________________
 * |                         |
 * |   Order Line Services   |
 * |_________________________|
 */

/**
 * Create Order
 * @param {int32} posId
 * @param {int32} orderId
 * @param {int32} chargeId
 * @param {string} description
 * @param {google.protobuf.Value} quantity
 * @param {google.protobuf.Value} price
 * @param {google.protobuf.Value} discountRate
 * @param {int32} warehouseId
 * @param {int32} resourceAssignmentId
 */
export function createOrderLine({
  posId,
  orderId,
  chargeId,
  productId,
  description,
  quantity,
  price,
  discountRate,
  warehouseId,
  resourceAssignmentId
}) {
  return request({
    url: `point-of-sales/${posId}/orders/${orderId}/lines`,
    method: 'post',
    data: {
      product_id: productId,
      charge_id: chargeId,
      description,
      quantity,
      price,
      discount_rate: discountRate,
      warehouse_id: warehouseId,
      resource_assignment_id: resourceAssignmentId
    }
  })
}

/**
 * List Order Lines
 * @param {string} filters
 * @param {string} sortBy
 * @param {repeated string} groupColumns
 * @param {repeated string} selectColumns
 * @param {int32} filters
 * @param {int32} pageSize
 * @param {string} pageToken
 * @param {string} searchValue
 * @param {int32} posId
 * @param {int32} orderId
 */
export function listOrderLines({
  posId,
  sortBy,
  orderId,
  filters,
  pageSize = 15,
  pageToken,
  searchValue,
  groupColumns,
  selectColumns
}) {
  return request({
    url: `point-of-sales/${posId}/orders/${orderId}/lines`,
    method: 'get',
    params: {
      filters,
      sort_by: sortBy,
      group_columns: groupColumns,
      select_columns: selectColumns,
      page_size: pageSize,
      page_token: pageToken,
      search_value: searchValue
    }
  })
}

/**
 * Update Order Line
 * @param {int32} posId
 * @param {int32} orderId
 * @param {int32} lineId
 * @param {int32} uom_id
 * @param {int32} price
 * @param {int32} quantity
 * @param {int32} warehouse_id
 */
export function updateOrderLine({
  posId,
  orderId,
  lineId,
  uom_id,
  price,
  quantity,
  discount_rate,
  warehouse_id
}) {
  return request({
    url: `point-of-sales/${posId}/orders/${orderId}/lines/${lineId}`,
    method: 'put',
    params: {
      uom_id,
      price,
      quantity,
      discount_rate,
      warehouse_id
    }
  })
}

/**
 * Delete Order Line
 * @param {int32} posId
 * @param {int32} orderId
 * @param {int32} lineId
 */
export function deleteOrderLine({
  posId,
  orderId,
  lineId
}) {
  return request({
    url: `point-of-sales/${posId}/orders/${orderId}/lines/${lineId}`,
    method: 'delete'
  })
}

/** _________________________
 * |                         |
 * |   Customers Services   |
 * |_________________________|
 */

/**
 * List Customers
 * @param {string} filters
 * @param {string} sortBy
 * @param {repeated string} groupColumns
 * @param {repeated string} selectColumns
 * @param {int32} filters
 * @param {int32} pageSize
 * @param {string} pageToken
 * @param {string} searchValue
 * @param {string} name
 * @param {string} value
 * @param {string} email
 * @param {int32} posId
 */

export function listCustomers({
  name,
  email,
  value,
  posId,
  sortBy,
  filters,
  pageToken,
  searchValue,
  groupColumns,
  selectColumns,
  pageSize = 15
}) {
  return request({
    url: `point-of-sales/customers`,
    method: 'get',
    params: {
      filters,
      pos_id: posId,
      sort_by: sortBy,
      group_columns: groupColumns,
      select_columns: selectColumns,
      page_size: pageSize,
      page_token: pageToken,
      search_value: searchValue,
      name,
      email,
      value
    }
  })
}

/** ____________________________________
 * |                                    |
 * |  Payments Point of Sale Services   |
 * |____________________________________|
 */

/**
 * Create Payment
 */

export function createPayment({
  posId,
  order_id,
  invoice_id,
  bank_id,
  reference_no,
  description,
  amount,
  payment_date,
  tender_type_code,
  currency_id,
  payment_method_id,
  payment_account_date,
  is_refund,
  charge_id,
  collecting_agent_id,
  reference_bank_account_id,
  customer_bank_account_id,
  invoice_reference_id
}) {
  return request({
    url: `point-of-sales/${posId}/payments`,
    method: 'post',
    data: {
      order_id,
      invoice_id,
      bank_id,
      reference_no,
      description,
      amount,
      payment_date,
      tender_type_code,
      currency_id,
      payment_method_id,
      payment_account_date,
      is_refund,
      charge_id,
      collecting_agent_id,
      reference_bank_account_id,
      customer_bank_account_id,
      invoice_reference_id
    }
  })
}

/**
 * Update Payment
 */

export function updatePayment({
  posId,
  payment_id,
  order_id,
  invoice_id,
  bank_id,
  reference_no,
  description,
  amount,
  payment_date,
  tender_type_code,
  currency_id,
  payment_method_id,
  payment_account_date,
  is_refund,
  charge_id,
  collecting_agent_id,
  reference_bank_account_id,
  customer_bank_account_id,
  invoice_reference_id
}) {
  return request({
    url: `point-of-sales/${posId}/payments/${payment_id}`,
    method: 'put',
    data: {
      order_id,
      invoice_id,
      bank_id,
      reference_no,
      description,
      amount,
      payment_date,
      tender_type_code,
      currency_id,
      payment_method_id,
      payment_account_date,
      is_refund,
      charge_id,
      collecting_agent_id,
      reference_bank_account_id,
      customer_bank_account_id,
      invoice_reference_id
    }
  })
}

/**
 * Delete Payment
 */

export function deletePayment({
  posId,
  payment_id
}) {
  return request({
    url: `point-of-sales/${posId}/payments/${payment_id}`,
    method: 'delete'
  })
}

/**
 * List Payments
 */

export function listPayments({
  posId,
  orderId
}) {
  return request({
    url: `point-of-sales/${posId}/payments`,
    method: 'get',
    params: {
      order_id: orderId
    }
  })
}

/**
 * Process Order
 */

export function processOrder({
  posId,
  order_id,
  create_payments,
  is_open_refund,
  payments
}) {
  return request({
    url: `point-of-sales/${posId}/orders/${order_id}/process`,
    method: 'put',
    data: {
      create_payments,
      is_open_refund,
      payments
    }
  })
}

/** ______________________________________
 * |                                      |
 * |  Additional Point of Sale Services   |
 * |______________________________________|
 */

/**
 * List Product Conversion UOM
 */

export function listProductConversion({
  id
}) {
  return request({
    url: `common/product-conversions/${id}`,
    method: 'get'
  })
}

/**
 * List Stock: GET /api/stocks
 * @param {int32} posId
 * @param {string} value
 * @param {string} sku
 */
export function listStocks({
  posId,
  value,
  sku
}) {
  return request({
    url: `point-of-sales/terminals/${posId}/stocks`,
    method: 'get',
    params: {
      value,
      sku
    }
  })
}
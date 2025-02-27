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

const initState = {
  searchCriteria: {
    listOrganization: [],
    organizationId: -1,
    listMoventType: [],
    moventTypeId: -1,
    listDocumentType: [],
    documentTypeId: -1,
    listWarehouse: [],
    warehouseId: -1,
    listSalesRegion: [],
    salesRegionId: -1,
    listSalesRepresentative: [],
    salesRepresentativeId: -1,
    listTargetDocumentType: [],
    targetDocumentTypeId: -1,
    listDeliveryRule: [],
    deliveryRuleId: -1,
    listDeliveryVia: [],
    deliveryViaId: -1,
    listShipper: [],
    shipperId: -1
  }
}

const OutBoundOrder = {
  state: initState,
  mutations: {
    updateAttributeCriteriaGenerateOrder(state, {
      attribute,
      value
    }) {
      state.searchCriteria[attribute] = value
    }
  },
  action: {},
  getters: {
    getSearchFilterGenerateOrder: (state) => {
      return state.searchCriteria
    }
  }
}

export default OutBoundOrder

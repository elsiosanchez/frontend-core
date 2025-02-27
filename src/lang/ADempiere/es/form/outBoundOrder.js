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
  title: 'Generar Orden de Salida',
  step: {
    searchCriteria: 'Criterios de Búsqueda',
    order: 'Orden',
    process: 'Proceso'
  },
  searchCriteria: {
    organization: 'Organización',
    moventType: 'Tipo de Movimiento',
    documentType: 'Tipo de Documento',
    warehouse: 'Almacén',
    salesRegion: 'Región de Ventas',
    salesRepresentative: 'Representante de Ventas',
    targetDocumentType: 'Tipo de Documento de Destino',
    deliveryRule: 'Regla de Entrega',
    deliveryVia: 'Vía de Entrega',
    shipper: 'Transportista',
    order: 'Orden de Venta',
    distributionOrder: 'Orden de Distribución',
    panel: {
      documentDate: 'Fecha del Documento',
      shipDate: 'Fecha de Envío',
      documentAction: 'Acción del Documento',
      locator: 'Localizador'
    }
  },
  order: {
    title: 'Orden'
  },
  select: {
    title: 'Seleccionar'
  }
}

export default OutBoundOrder

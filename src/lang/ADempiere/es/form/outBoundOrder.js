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
  error: 'La Cantidad no Puede ser Mayor a la Cantidad Disponible',
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
    title: 'Orden',
    documentNo: 'No Documento',
    dateOrdered: 'Fecha Ordenada',
    datePromised: 'Fecha Prometida',
    region: 'Región',
    city: 'Ciudad',
    businessPartner: 'Socio del Negocios',
    location: 'Dirección',
    address1: 'Dirección 1',
    address2: 'Dirección 2',
    address3: 'Dirección 3',
    address4: 'Dirección 4',
    weight: 'Peso',
    volume: 'Volumen'
  },
  select: {
    title: 'Seleccionar',
    product: 'Producto',
    uom: 'UM',
    uomProcess: 'UM(Orden)',
    handQuantity: 'Cantidad Disponible',
    quantity: 'Cantidad',
    loadSequence: 'Secuencia de Carga',
    orderedQuantity: 'Cantidad Ordenada',
    reservedQuantity: 'Cantidad Reservada',
    quantityInvoiced: 'Cantidad Facturada',
    deliveredQuantity: 'Cantidad Entregada',
    qtyTransit: 'Cantidad en tránsito',
    deliveryRule: 'Regla de reparto'
  },
  productInfo: {
    title: 'Stock de Productos Para Almacén',
    pickedQty: 'Cantidad de Recolección'
  }
}

export default OutBoundOrder

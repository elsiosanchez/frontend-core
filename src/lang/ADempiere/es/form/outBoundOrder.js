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
    movementType: 'Tipo de Movimiento',
    documentType: 'Tipo de Documento',
    warehouse: 'Almacén',
    salesRegion: 'Región de Ventas',
    salesRepresentative: 'Representante de Ventas',
    salesOrder: 'Orden de Venta',
    distributionOrder: 'Orden de Distribución'
  },
  header: {
    title: 'Encabezados de Documentos',
    warehouse: 'Almacén',
    documentNo: 'No Documento',
    dateOrdered: 'Fecha Ordenada',
    datePromised: 'Fecha Prometida',
    region: 'Región',
    city: 'Ciudad',
    businessPartner: 'Socio del Negocios',
    salesRepresentative: 'Representante de Ventas',
    location: 'Dirección',
    address1: 'Dirección 1',
    address2: 'Dirección 2',
    address3: 'Dirección 3',
    address4: 'Dirección 4',
    weight: 'Peso',
    volume: 'Volumen'
  },
  lines: {
    title: 'Líneas de Documentos',
    documentNo: 'No Documento',
    product: 'Producto',
    uom: 'UM',
    uomOrder: 'UM (Orden)',
    weight: 'Peso',
    volume: 'Volumen',
    onHandQuantity: 'Cant. Existencia',
    quantity: 'Cantidad',
    loadSequence: 'Secuencia de Carga',
    orderedQuantity: 'Cant. Ordenada',
    reservedQuantity: 'Cant. Reservada',
    quantityInvoiced: 'Cant. Facturada',
    deliveredQuantity: 'Cant. Entregada',
    quantityInTransit: 'Cant. en Tránsito',
    deliveryRule: 'Regla de Entrega'
  },
  productInfo: {
    title: 'Resumen de Inventario por Producto',
    product: 'Producto',
    uom: 'UM',
    warehouse: 'Almacén',
    quantityInTransit: 'Cant. en Tránsito',
    onHandQuantity: 'Cant. Existencia',
    quantity: 'Cantidad',
    pickedQuantity: 'Cant. Recolección'
  },
  process: {
    documentDate: 'Fecha del Documento',
    shipDate: 'Fecha de Envío',
    documentAction: 'Acción del Documento',
    locator: 'Ubicación',
    targetDocumentType: 'Tipo de Documento de Destino',
    deliveryRule: 'Regla de Entrega',
    deliveryVia: 'Vía de Entrega',
    shipper: 'Transportista'
  }
}

export default OutBoundOrder

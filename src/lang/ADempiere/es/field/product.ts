/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
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

const product = {
  title: 'Productos',
  edit: 'Editar',
  emptyRecords: 'Utilice los filtros para la búsqueda de producto según su Código, Nombre, SKU',
  notFound: 'Producto no encontrado',
  searchWithEnter: 'Introduzca un valor para buscar productos',
  // fields
  value: 'Código',
  name: 'Nombre',
  upcEan: 'UPC/EAN',
  warehouse: 'Almacén',
  priceListVersion: 'Versión de Lista de Precios',
  productCategory: 'Categoria de Producto',
  productClass: 'Clase de Producto',
  productClassification: 'Clasificación de Producto',
  productGroup: 'Grupo de Producto',
  sku: 'SKU',
  upc: 'UPC/EAN',
  uom: 'UM',
  attributeSet: 'Conjunto de Atributos',
  attributeSetInstance: 'Instancia de Conjunto de Atributos',
  vendor: 'Proveedor',
  description: 'Descripción',
  // amount
  listPrice: 'Precio Lista',
  standardPrice: 'Precio Estándar',
  limitPrice: 'Precio Límite',
  margin: 'Margen',
  // quantity
  stocked: 'Almacenado',
  onlyOnHand: 'Solo Disponible',
  available: 'Cant. Disponible',
  onHandQuantity: 'Cant. Existencia',
  reservedQuantity: 'Cant. Reservada',
  orderedQuantity: 'Cant. Ordenada',
  unconfirmedQuantity: 'Cant. sin Confirmar',
  unconfirmedMove: 'Movimiento sin Confirmar',
  //
  instanceAttribute: 'Atributo de Instancia',
  //
  warehouseStocks: 'Existencias en Almacén',
  substitute: 'Sustituto',
  relateds: 'Relacionados',
  availableToPromises: 'Disponibles para Promesas',
  vendorPurchases: 'Compras de Proveedores',
  searchCriteria: 'Criterios de Búsqueda',
  wrehouseTables: {
    name: 'Nombre',
    availableQuantity: 'Cantidad Disponible',
    reservedQuantity: 'Cantidad Reservada',
    orderedQuantity: 'Cantidad Ordenada',
    onHandQuantity: 'Cantidad Existencia'
  },
  substituteTables: {
    name: 'Nombre',
    value: 'Código',
    warehouse: 'Almacén',
    availableQuantity: 'Cantidad Disponible',
    reservedQuantity: 'Cantidad Reservada',
    standardPrice: 'Precio Estandar',
    onHandQuantity: 'Cantidad Existencia'
  },
  relatedsTables: {
    name: 'Nombre',
    value: 'Código',
    warehouse: 'Almacén',
    availableQuantity: 'Cantidad Disponible',
    reservedQuantity: 'Cantidad Reservada',
    standardPrice: 'Precio Estandar',
    onHandQuantity: 'Cantidad Existencia',
    orderedQuantity: 'Cantidad Ordenada'
  },
  availableToPromisesTables: {
    showDetails: 'Mostrar Detalle',
    warehouse: 'Almacén',
    locator: 'Ubicacion',
    businessPartner: 'Socio de Negocios',
    documentNo: 'Número de Documento',
    date: 'Fecha',
    quantityStock: 'Cantidad en Existencia',
    availableQuantity: 'Cantidad Disponible',
    expectedChangeQuantity: 'Cantidad de Carga Esperada',
    onHandQuantity: 'Cantidad Existencia',
    reservedQuantity: 'Cantidad Reservada',
    orderedQuantity: 'Cantidad Ordenada',
    availablePromise: 'Disponible para Promesa',
    attributeSetInstance: 'Instancia Conjunto de Atributos'
  },
  vendorPurchasesTables: {
    name: 'Nombre',
    isCurrentVendor: 'Proveedor Actual',
    uom: 'UOM',
    currency: 'Moneda',
    listPrice: 'Precio de Lista',
    purchasePrice: 'Precio Orden de Compra',
    vendorProductKey: 'No. de Producto del Socio del Negocio',
    minOrderQuantity: 'Mínimo a Ordenar',
    promisedDeliveryTime: 'Tiempo de Entrega Prometido',
    actualDeliveryTime: 'Tiempo de Entrega Actual'
  },
  infoProduct: {
    infoProductoclassification: 'Clasificación',
    infoProductCategory: 'Categoría',
    infoProductClass: 'Clase',
    infoProductGroup: 'Grupo'
  }
}

export default product

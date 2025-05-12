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

import language from '@/lang'
import store from '@/store'

// Utils and Helper Methods
import {
  containerManager as containerManagerProcess
} from '@/utils/ADempiere/dictionary/process'
import {
  isEmptyValue
} from '@/utils/ADempiere/valueUtils.js'
import { getUuidv4 } from '@/utils/ADempiere/recordUtil'

/**
 * Prefix to generate unique key
 */
export const CONTAINER_REPORT_PREFIX = 'report_'

const today = new Date()

export const REPORT_VIEWER_NAME = 'Report Viewer'
export const REPORT_VIEWER_ENGINE_NAME = 'Report Viewer Engine'

export const staticReportRoutes = [
  {
    uuid: '92b9a696-adba-4409-a200-7df0ba74cb63',
    action: 'processOption',
    tabChild: undefined,
    parametersList: [
      { columnName: 'ValidFrom', value: today }
    ]
  },
  {
    uuid: '78b249ee-613e-4241-a2c1-00243fa36470',
    action: 'processOption',
    tabChild: undefined,
    parametersList: [
      { columnName: 'ValidFrom', value: today },
      { columnName: 'MustBeStocked', value: false }
    ]
  }
]

export const REPORT_EXPORT_TYPE_PS = {
  name: language.t('report.reportExportTypes.ps.name'),
  description: language.t('report.reportExportTypes.ps.description'),
  type: language.t('report.reportExportTypes.ps.type')
}

export const REPORT_EXPORT_TYPE_XML = {
  name: language.t('report.reportExportTypes.xml.name'),
  description: language.t('report.reportExportTypes.xml.description'),
  type: language.t('report.reportExportTypes.xml.type')
}

export const REPORT_EXPORT_TYPE_PDF = {
  name: language.t('report.reportExportTypes.pdf.name'),
  description: language.t('report.reportExportTypes.pdf.description'),
  type: language.t('report.reportExportTypes.pdf.type')
}

export const REPORT_EXPORT_TYPE_HTML = {
  name: language.t('report.reportExportTypes.html.name'),
  description: language.t('report.reportExportTypes.html.description'),
  type: language.t('report.reportExportTypes.html.type')
}

export const REPORT_EXPORT_TYPE_TXT = {
  name: language.t('report.reportExportTypes.txt.name'),
  description: language.t('report.reportExportTypes.txt.description'),
  type: language.t('report.reportExportTypes.txt.type')
}

export const REPORT_EXPORT_TYPE_SSV = {
  name: language.t('report.reportExportTypes.ssv.name'),
  description: language.t('report.reportExportTypes.ssv.description'),
  type: language.t('report.reportExportTypes.ssv.type')
}

export const REPORT_EXPORT_TYPE_CSV = {
  name: language.t('report.reportExportTypes.csv.name'),
  description: language.t('report.reportExportTypes.csv.description'),
  type: language.t('report.reportExportTypes.csv.type')
}

export const REPORT_EXPORT_TYPE_XLS = {
  name: language.t('report.reportExportTypes.xls.name'),
  description: language.t('report.reportExportTypes.xls.description'),
  type: language.t('report.reportExportTypes.xls.type')
}

export const REPORT_EXPORT_TYPE_XLSX = {
  name: language.t('report.reportExportTypes.xlsx.name'),
  description: language.t('report.reportExportTypes.xlsx.description'),
  type: language.t('report.reportExportTypes.xlsx.type')
}

export const REPORT_EXPORT_TYPE_ARXML = {
  name: language.t('report.reportExportTypes.arxml.name'),
  description: language.t('report.reportExportTypes.arxml.description'),
  type: language.t('report.reportExportTypes.arxml.type')
}

export const REPORT_EXPORT_TYPES = [
  REPORT_EXPORT_TYPE_PS,
  REPORT_EXPORT_TYPE_XML,
  REPORT_EXPORT_TYPE_PDF,
  REPORT_EXPORT_TYPE_HTML,
  REPORT_EXPORT_TYPE_TXT,
  REPORT_EXPORT_TYPE_SSV,
  REPORT_EXPORT_TYPE_CSV,
  REPORT_EXPORT_TYPE_XLS,
  REPORT_EXPORT_TYPE_XLSX,
  REPORT_EXPORT_TYPE_ARXML
]

/**
 * Suppoerted render files
 */
export const REPORT_VIEWER_SUPPORTED_FORMATS = [
  'csv',
  'html',
  'pdf',
  'ssv',
  'txt',
  'xls',
  'xlsx',
  'xml'
]

/**
 * All report extension file
 */
export const REPORT_FORMATS_LIST = [
  'arxml',
  'csv',
  'pdf',
  'ps',
  'ssv',
  'txt',
  'xls',
  'xlsx',
  'xml'
]

/**
 * Documents mime type
 */
export const mimeTypeOfReport = {
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  dot: 'application/msword',
  dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  csv: 'text/csv;charset=utf-8',
  htm: 'text/html;charset=utf-8',
  html: 'text/html;charset=utf-8',
  md: 'text/markdown;charset=utf-8',
  odt: 'application/vnd.oasis.opendocument.text',
  pdf: 'application/pdf',
  ps: 'application/postscript',
  rtf: 'application/rtf',
  ssv: 'application/vnd.shade-save-file',
  txt: 'text/plain;charset=utf-8',
  xls: 'application/vnd.ms-excel; ',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xml: 'application/xml'
}

/**
 * Default report type to generate
 */
export const DEFAULT_REPORT_TYPE = 'pdf'

/**
 * Is Legacy Print Format
 * @param {Object} printFormat
 * @returns {boolean}
 */
export function isLegacyPrintFormat(printFormat) {
  return printFormat.is_form || printFormat.is_standard_header_footer || printFormat.jasper_process_id > 0
}

export function changeFieldAttribure({
  containerUuid,
  columnName,
  attributeName,
  attributeValue
}) {
  return store.dispatch('changeReportFieldAttribute', {
    containerUuid,
    columnName,
    attributeName,
    attributeValue
  })
}

/**
 * Convert children records
 * @param {Array} children
 * @param {String} parentLevel
 * @param {String} parentColumnKey
 * @param {String} parentDisplayValue
 * @returns {Array}
 */
export function hasChildren(children, parentLevel, parentColumnKey, parentDisplayValue) {
  if (isEmptyValue(children)) {
    return children
  }
  return children.map((child, indexChild) => {
    const index = parentLevel + indexChild
    let value = ''
    if (!isEmptyValue(parentColumnKey)) {
      value = child.cells[parentColumnKey].display_value
    }
    const newRow = {
      ...child,
      children: hasChildren(child.children, index.toString(), parentColumnKey, value),
      level: index,
      rowUid: getUuidv4(),
      zoom_windows: [],
      isLoadingZoom: false
    }
    if (child.is_parent && value === parentDisplayValue && !isEmptyValue(parentColumnKey)) {
      // clean all values on same cell
      newRow.cells[parentColumnKey].display_value = ''
      newRow.cells[parentColumnKey].value = ''
    }
    return newRow
  })
}

export function generateRecordsList(rows) {
  const recordsList = rows.map((row, rowIndex) => {
    let isTopLevel = false
    if (row.level < 1) {
      isTopLevel = !isTopLevel
    }
    const index = rowIndex + 1
    const parentColumnKey = Object.keys(row.cells).find(key => {
      return row.cells[key].display_value !== ''
    })
    let value = ''
    if (!isEmptyValue(parentColumnKey)) {
      value = row.cells[parentColumnKey].display_value
    }
    const newRow = {
      ...row,
      children: hasChildren(row.children, index.toString(), parentColumnKey, value),
      level: index,
      rowUid: getUuidv4(),
      isTopLevel
    }
    return newRow
  })
  return recordsList
}

/**
 * Container manager to Report panel
 */
export const containerManager = {
  ...containerManagerProcess,

  getPanel({ containerUuid }) {
    return store.getters.getStoredReport(containerUuid)
  },
  changePanelAttribute({
    containerUuid,
    attributeName,
    attributeValue
  }) {
    store.commit('changeReportAttribute', {
      uuid: containerUuid,
      attributeName,
      attributeValue
    })
  },
  getFieldsList({ containerUuid }) {
    return store.getters.getStoredFieldsFromReport(containerUuid)
  },
  getFieldsToHidden: ({ parentUuid, containerUuid, fieldsList, showedMethod, isEvaluateDefaultValue, isTable }) => {
    return store.getters.getReportParametersListToHidden({
      parentUuid,
      containerUuid,
      fieldsList,
      showedMethod,
      isEvaluateDefaultValue,
      isTable
    })
  },

  changeFieldAttribure,
  changeFieldShowedFromUser({ containerUuid, fieldsShowed }) {
    store.dispatch('changeReportFieldShowedFromUser', {
      containerUuid,
      fieldsShowed
    })
  },

  actionPerformed: ({ field, value }) => {
    store.dispatch('reportActionPerformed', {
      field,
      value
    })
  },

  setDefaultValues: ({ containerUuid }) => {
    store.dispatch('setReportDefaultValues', {
      containerUuid
    })
  },

  setPageSize: ({
    containerUuid,
    pageNumber,
    pageSize,
    parametersList,
    reportId,
    printFormatId,
    instanceUuid,
    reportViewId
  }) => {
    store.dispatch('buildReport', {
      containerUuid,
      isSummary: true,
      parametersList,
      reportId,
      pageSize,
      pageToken: pageNumber,
      printFormatId,
      instanceUuid,
      reportViewId,
      isChangePanel: true
    })
  },

  setPageNumber: ({
    containerUuid,
    pageNumber,
    pageSize,
    parametersList,
    reportId,
    printFormatId,
    instanceUuid,
    reportViewId
  }) => {
    store.dispatch('buildReport', {
      containerUuid,
      isSummary: true,
      parametersList,
      reportId,
      pageSize,
      pageToken: pageNumber,
      printFormatId,
      instanceUuid,
      reportViewId,
      isChangePanel: true
    })
  }
}

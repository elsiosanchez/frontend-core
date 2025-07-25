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

/**
 * Account Element
 */
export const USER_LIST_TABLE_NAME = 'C_ElementValue'

export const User1_ID = {
  elementType: 'U1',
  tableName: USER_LIST_TABLE_NAME,
  columnName: 'User1_ID',
  name: language.t('form.accountingViewer.userList1'),
  isMandatory: false
}

export const User2_ID = {
  elementType: 'U2',
  tableName: USER_LIST_TABLE_NAME,
  columnName: 'User2_ID',
  name: language.t('form.accountingViewer.userList2'),
  isMandatory: false
}

export const User3_ID = {
  elementType: 'U3',
  tableName: USER_LIST_TABLE_NAME,
  columnName: 'User1_ID',
  name: language.t('form.accountingViewer.userList3'),
  isMandatory: false
}

export const User4_ID = {
  elementType: 'U4',
  tableName: USER_LIST_TABLE_NAME,
  columnName: 'User4_ID',
  name: language.t('form.accountingViewer.userList4'),
  isMandatory: false
}

export const UserElement1_ID = {
  elementType: 'X1',
  tableName: null,
  columnName: 'UserElement1_ID',
  name: language.t('form.accountingViewer.userElement1'),
  isMandatory: false
}

export const UserElement2_ID = {
  elementType: 'X2',
  tableName: null,
  columnName: 'UserElement2_ID',
  name: language.t('form.accountingViewer.userElement2'),
  isMandatory: false
}

/**
 * User List Accunt Element
 */
export const USER_LIST_COLUMNS_NAME_LIST = [
  'User1_ID', // U1
  'User2_ID', // U2
  'User3_ID', // U3
  'User4_ID' // U4
]

/**
 * User Element
 */
export const USER_ELEMENT_COLUMNS_NAME_LIST = [
  'UserElement1_ID', // X1
  'UserElement2_ID' // X2
]

export const ACCOUNTING_ELEMENT_COLUMNS = [
  // {
  //   elementType: 'OO',
  //   tableName: 'AD_Org',
  //   columnName: 'AD_Org_ID',
  //   name: language.t('form.accountingViewer.organization'),
  //   isMandatory: true,
  // },
  // {
  //   elementType: 'AC',
  //   tableName: 'C_ElementValue',
  //   columnName: 'Account_ID',
  //   name: language.t('form.accountingViewer.account'),
  //   isMandatory: true
  // },
  {
    elementType: 'PR',
    tableName: 'M_Product',
    columnName: 'M_Product_ID',
    name: language.t('form.accountingViewer.product'),
    isMandatory: false
  },
  {
    elementType: 'BP',
    tableName: 'C_BPartner',
    columnName: 'C_BPartner_ID',
    name: language.t('form.accountingViewer.businessPartner'),
    isMandatory: false
  },
  {
    elementType: 'PJ',
    tableName: 'C_Project',
    columnName: 'C_Project_ID',
    name: language.t('form.accountingViewer.project'),
    isMandatory: false
  },
  {
    elementType: 'MC',
    tableName: 'C_Campaign',
    columnName: 'C_Campaign_ID',
    name: language.t('form.accountingViewer.campaign'),
    isMandatory: false
  },
  {
    elementType: 'SR',
    tableName: 'C_SalesRegion',
    columnName: 'C_SalesRegion_ID',
    name: language.t('form.accountingViewer.salesRegion'),
    isMandatory: false
  },
  {
    elementType: 'OT',
    tableName: 'AD_Org',
    columnName: 'AD_OrgTrx_ID',
    name: language.t('form.accountingViewer.organizationTransaction'),
    isMandatory: false
  },
  {
    elementType: 'LF',
    tableName: 'C_Location',
    columnName: 'C_LocFrom_ID',
    name: language.t('form.accountingViewer.locationFrom'),
    isMandatory: false
  },
  {
    elementType: 'LT',
    tableName: 'C_Location',
    columnName: 'C_LocTo_ID',
    name: language.t('form.accountingViewer.locationTo'),
    isMandatory: false
  },
  {
    elementType: 'AY',
    tableName: 'C_Activity',
    columnName: 'C_Activity_ID',
    name: language.t('form.accountingViewer.activity'),
    isMandatory: false
  },
  {
    elementType: 'SA',
    tableName: 'C_ElementValue',
    columnName: 'C_SubAcct_ID',
    name: language.t('form.accountingViewer.subAccount'),
    isMandatory: false
  },
  UserElement1_ID,
  UserElement2_ID,
  User1_ID,
  User2_ID,
  User3_ID,
  User4_ID
]

const ACCOUNTING_ELEMENT_PREFIX = '$Element_'

export function getAvaliableAccountingElements() {
  const availableAccountingElements = ACCOUNTING_ELEMENT_COLUMNS.filter(acctElemnt => {
    const { elementType, isMandatory } = acctElemnt
    if (isMandatory) {
      return true
    }
    const isEnableContext = store.getters.getSessionContext({
      columnName: ACCOUNTING_ELEMENT_PREFIX + elementType
    })
    return Boolean(isEnableContext)
  })
  return availableAccountingElements
}

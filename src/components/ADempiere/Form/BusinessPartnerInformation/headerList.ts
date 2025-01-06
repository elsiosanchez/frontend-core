// ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
// Copyright (C) 2017-Present E.R.P. Consultores y Asociados, C.A.
// Contributor(s): Ricardo Fenomeno ricardofenomeno13@gmail.com https://github.com/Ricargame
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import lang from '@/lang'

export default [
  {
    label: lang.t('form.businessPartnerInformation.code'),
    columnName: 'value',
    width: '50',
    align: 'left'
  },
  {
    label: lang.t('form.businessPartnerInformation.companyName'),
    columnName: 'name',
    width: '60',
    align: 'left'
  },
  // {
  //   label: lang.t('form.businessPartnerInformation.fantasyName'),
  //   columnName: 'name2',
  //   width: '60',
  //   align: 'left'
  // },
  {
    label: lang.t('form.businessPartnerInformation.businessPartnerGroup'),
    columnName: 'business_partner_group',
    width: '60',
    align: 'left'
  },
  {
    label: lang.t('form.businessPartnerInformation.currentBalance'),
    columnName: 'open_balance_amount',
    width: '50',
    align: 'right'
  },
  {
    label: lang.t('form.businessPartnerInformation.availableCredit'),
    columnName: 'credit_available_amount',
    width: '50',
    align: 'right'
  },
  {
    label: lang.t('form.businessPartnerInformation.usedCredit'),
    columnName: 'credit_used_amount',
    width: '50',
    align: 'right'
  },
  {
    label: lang.t('form.businessPartnerInformation.income'),
    columnName: 'revenue_amount',
    width: '40',
    align: 'right'
  }
]

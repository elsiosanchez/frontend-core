<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https:www.gnu.org/licenses/>.
-->

<template>
  <el-table
    v-loading="isLoading"
    :data="recordList"
    border
    height="300"
    style="width: 100%"
  >
    <el-table-column
      prop="greeting"
      header-align="center"
      min-width="100"
      :label="$t('form.businessPartnerInformation.contactTab.greetings')"
    />
    <el-table-column
      prop="name"
      header-align="center"
      align="left"
      min-width="150"
      :label="$t('form.businessPartnerInformation.locations.name')"
    />
    <el-table-column
      prop="title"
      header-align="center"
      align="right"
      min-width="120"
      :label="$t('form.businessPartnerInformation.contactTab.title')"
    />
    <el-table-column
      prop="address"
      header-align="center"
      min-width="200"
      :label="$t('form.businessPartnerInformation.locationAndAddress')"
    />
    <el-table-column
      prop="phone"
      header-align="center"
      align="right"
      min-width="120"
      :label="$t('form.businessPartnerInformation.phone')"
    />
    <el-table-column
      prop="phone_2"
      header-align="center"
      align="right"
      min-width="120"
      :label="$t('form.businessPartnerInformation.locations.mobilePhone')"
    />
    <el-table-column
      prop="fax"
      header-align="center"
      align="left"
      min-width="100"
      :label="$t('form.businessPartnerInformation.locations.fax')"
    />
    <el-table-column
      prop="email"
      header-align="center"
      align="left"
      min-width="100"
      :label="$t('form.businessPartnerInformation.email')"
    />
    <el-table-column
      prop="last_contact"
      header-align="center"
      align="right"
      min-width="170"
      :label="$t('form.businessPartnerInformation.contactTab.lastContact')"
    />
    <el-table-column
      prop="last_result"
      header-align="center"
      align="left"
      min-width="170"
      :label="$t('form.businessPartnerInformation.contactTab.finalResult')"
    />
  </el-table>
</template>

<script>
import store from '@/store'
import { defineComponent, computed } from '@vue/composition-api'
import { formatDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'ContactTable',
  setup() {
    const recordList = computed(() => {
      return store.getters.getRowContact.map(data => {
        return {
          ...data,
          last_contact: formatDate({ value: data.last_contact })
        }
      })
    })
    const isLoading = computed(() => {
      return store.getters.getIsLoadingContact
    })
    return {
      recordList,
      isLoading
    }
  }
})

</script>

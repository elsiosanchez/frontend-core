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
      prop="name"
      header-align="center"
      min-width="100"
      :label="$t('form.businessPartnerInformation.locations.name')"
    />
    <el-table-column
      prop="phone"
      header-align="center"
      align="right"
      min-width="100"
      :label="$t('form.businessPartnerInformation.phone')"
    />
    <el-table-column
      prop="phone2"
      header-align="center"
      align="right"
      min-width="100"
      :label="$t('form.businessPartnerInformation.locations.mobilePhone')"
    />
    <el-table-column
      prop="fax"
      header-align="center"
      min-width="70"
      :label="$t('form.businessPartnerInformation.locations.fax')"
    />
    <el-table-column
      prop="address"
      header-align="center"
      min-width="200"
      :label="$t('form.businessPartnerInformation.locations.address')"
    />
    <el-table-column
      prop="is_ship_to_address"
      header-align="center"
      align="right"
      min-width="55"
      :label="$t('form.businessPartnerInformation.locations.addressDeliver')"
    />
    <el-table-column
      prop="is_bill_to_address"
      header-align="center"
      align="right"
      min-width="55"
      :label="$t('form.businessPartnerInformation.locations.addressInvoice')"
    />
    <el-table-column
      prop="is_remit_to_address"
      header-align="center"
      align="right"
      min-width="55"
      :label="$t('form.businessPartnerInformation.locations.addressRefer')"
    />
    <el-table-column
      prop="is_pay_form_address"
      header-align="center"
      align="right"
      min-width="60"
      :label="$t('form.businessPartnerInformation.locations.paymentAddress')"
    />
  </el-table>
</template>

<script>
import store from '@/store'
import { defineComponent, computed } from '@vue/composition-api'
import { convertBooleanToTranslationLang } from '@/utils/ADempiere/formatValue/booleanFormat'
export default defineComponent({
  name: 'LocationTable',
  setup() {
    const recordList = computed(() => {
      return store.getters.getRowLocation.map(data => {
        return {
          ...data,
          is_bill_to_address: convertBooleanToTranslationLang(data.is_bill_to_address),
          is_pay_form_address: convertBooleanToTranslationLang(data.is_pay_form_address),
          is_remit_to_address: convertBooleanToTranslationLang(data.is_remit_to_address),
          is_ship_to_address: convertBooleanToTranslationLang(data.is_ship_to_address)
        }
      })
    })
    const isLoading = computed(() => {
      return store.getters.getIsLoadingLocation
    })
    return {
      recordList,
      isLoading
    }
  }
})

</script>

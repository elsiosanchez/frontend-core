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
  <div
    class="business-partner-info-content"
  >
    <el-collapse
      v-model="activeCollapse"
    >
      <el-collapse-item name="1">
        <span slot="title" style="font-size: 18px !important; font-weight: bold !important">
          {{ $t('field.product.searchCriteria') }}
          <i style="font-size: 18px;" class="el-icon-s-operation" />
        </span>
        <query-criteria />
      </el-collapse-item>
    </el-collapse>
    <Table />
    <p>
      <span style="float: right;">
        <span style="display: inline-block; vertical-align: middle; margin-left: 50px;">
          <el-button
            type="info"
            class="button-base-icon"
            plain
            @click="cleanCriteria()"
          >
            <svg-icon icon-class="layers-clear" />
          </el-button>
          <el-button
            :loading="isLoading"
            type="success"
            class="button-base-icon"
            icon="el-icon-refresh-right"
            @click="search()"
          />
          <el-button
            type="primary"
            plain
            class="button-base-icon"
            icon="el-icon-download"
            @click="exportExcel()"
          />
        </span>
        <custom-pagination
          style="display: inline-block; vertical-align: middle;"
          :total-records="recordCount"
          :page-number="pageNumber"
          :page-size="pageSize"
          :handle-change-page-number="handleChangePage"
          :handle-change-page-size="handleChangeSizePage"
        />
      </span>
    </p>
    <Dialog />
  </div>
</template>

<script>
import store from '@/store'
import lang from '@/lang'

import { defineComponent, computed, watch, ref } from '@vue/composition-api'
import headerList from './headerList.ts'

// Component
import CustomPagination from '@/components/ADempiere/DataTable/Components/CustomPagination.vue'
import QueryCriteria from '@/components/ADempiere/Form/BusinessPartnerInformation/queryCriteria'
import Table from '@/components/ADempiere/Form/BusinessPartnerInformation/table'
import Dialog from '@/components/ADempiere/Form/BusinessPartnerInformation/dialog'

import { parseTime } from '@/utils'

export default defineComponent({
  name: 'BusinessPartnerInformation',

  components: {
    QueryCriteria,
    Table,
    CustomPagination,
    Dialog
  },

  setup() {
    const activeCollapse = ref(['1'])

    const isLoading = computed({
      set(newValue) {
        store.commit('setIsLoading', newValue)
      },
      get() {
        return store.getters.getIsLoadingBusinness || false
      }
    })

    const businessInfo = computed(() => {
      return store.getters.getBusinessPartners
    })

    const pageSize = computed(() => {
      return store.getters.getPageSizeBusiness
    })
    const pageNumber = computed(() => {
      return store.getters.getPageNumberBusiness
    })

    const recordCount = computed(() => {
      return store.getters.getRecordCount
    })
    const code = computed(() => {
      return store.getters.getCode
    })
    const contact = computed(() => {
      return store.getters.getContact
    })
    const phone = computed(() => {
      return store.getters.getPhone
    })
    const isCustomer = computed(() => {
      return store.getters.getIsCustomer
    })
    const isVendor = computed(() => {
      return store.getters.getIsVendor
    })
    const groupId = computed(() => {
      return store.getters.getBusinessPartnerGroupId
    })
    const name = computed(() => {
      return store.getters.getBusinessPartnerName
    })
    const email = computed(() => {
      return store.getters.getEmail
    })
    const zipCode = computed(() => {
      return store.getters.getZipCode
    })

    function handleChangeSizePage(value) {
      store.commit('setPageZise', value)
      search()
    }
    function handleChangePage(value) {
      store.commit('setPageNumber', value)
      search()
    }
    let timeoutSearch
    function search() {
      isLoading.value = true
      clearTimeout(timeoutSearch)
      timeoutSearch = setTimeout(() => {
        store.dispatch('loadBusinessPartnerFromServer', {
          tableName: 'C_BPartner',
          columnName: 'C_BPartner_ID',
          contact: contact.value,
          email: email.value,
          phone: phone.value,
          postal_code: zipCode.value,
          value: code.value,
          name: name.value,
          is_customer: isCustomer.value,
          is_vendor: isVendor.value,
          business_partner_group_id: groupId.value,
          pageNumber: pageNumber.value,
          pageSize: pageSize.value
        })
      }, 500)
    }

    function exportExcel() {
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = headerList.map(list => list.label)
        const filterVal = headerList.map(list => list.columnName)
        const list = businessInfo.value
        const data = formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: lang.t('form.businessPartnerInformation.title'),
          autoWidth: true,
          bookType: 'xlsx'
        })
      })
    }

    function formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
    function cleanCriteria() {
      store.commit('setDefaulCriteria')
    }
    watch(
      [contact, email, groupId, isCustomer, isVendor, phone, zipCode, code, name],
      () => {
        search()
      }
    )
    search()

    return {
      // Ref
      activeCollapse,
      //
      isLoading,
      pageNumber,
      pageSize,
      recordCount,
      code,
      contact,
      phone,
      isCustomer,
      isVendor,
      name,
      email,
      zipCode,
      businessInfo,
      //
      handleChangeSizePage,
      handleChangePage,
      search,
      exportExcel,
      cleanCriteria
    }
  }
})
</script>

<style lang="scss">
.business-info-tabla.el-table .el-table__body .el-table__row .el-table__cell {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}
.business-partner-info-content {
  height: 100% !important;
  padding-top: 0px;
  padding-bottom: 4px;
  padding-left: 10px;
  padding-right: 10px;
}
.business-partner-info-content {
  .el-collapse-item__content{
  padding-bottom: 0px !important
  }
  .el-form-item--mini.el-form-item {
    padding-bottom: 0px !important
  }
  .el-collapse-item__wrap{
    margin-bottom: -25px;
  }
}
</style>

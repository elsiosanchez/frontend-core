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
  <el-tabs
    v-model="activeName"
    @tab-click="selectTabs"
  >
    <el-tab-pane :label="$t('form.businessPartnerInformation.locationAndAddress')" name="location">
      <Location />
    </el-tab-pane>
    <el-tab-pane :label="$t('form.businessPartnerInformation.contact')" name="contact">
      <Contact />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import store from '@/store'
import { defineComponent, computed } from '@vue/composition-api'
import Location from './location.vue'
import Contact from './contact.vue'
export default defineComponent({
  name: 'TabPanel',
  components: {
    Location,
    Contact
  },
  setup() {
    const activeName = computed({
      set(value) {
        store.commit('setTabOptionsBusiness', value)
      },
      get() {
        return store.getters.getTabOptionsBusiness
      }
    })
    const rowSelect = computed(() => {
      return store.getters.getRowSelect
    })
    selectTabs(activeName.value)
    function selectTabs(currentTab) {
      const { name } = currentTab
      switch (name) {
        case 'location':
          store.dispatch('requestLocation', {
            id: rowSelect.value.id
          })
          break
        case 'contact':
          store.dispatch('requestContact', {
            id: rowSelect.value.id
          })
          break
      }
    }
    return {
      activeName,
      rowSelect,
      selectTabs
    }
  }
})
</script>

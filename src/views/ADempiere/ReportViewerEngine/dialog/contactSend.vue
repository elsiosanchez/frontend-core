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
  <div>
    <label>
      {{ $t('report.reportEnginer.optionsImport.contactsSend') }}
    </label>

    <el-select
      v-model="contantSend"
      filterable
      allow-create
      multiple
      style="width: 100%;"
      @change="setUser"
      @visible-change="searchUser"
    >
      <el-option
        v-for="(item, key) in listUserSend"
        :key="key"
        :label="item.label"
        :value="item"
      />
    </el-select>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from '@vue/composition-api'

import store from '@/store'

import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'ContactSend',

  setup() {
    const contantSend = ref(store.getters.getContactSend)
    const listUserSend = ref([])

    const typeContactSend = computed(() => {
      return store.getters.getContactSend
    })

    watch(typeContactSend, (newValue) => {
      contantSend.value = newValue
    })

    function searchUser() {
      store.dispatch('ListUser')
        .then(response => {
          if (!isEmptyValue(response)) {
            const { records } = response
            listUserSend.value = records.map(item => {
              return {
                label: item.values.DisplayColumn,
                value: item.id
              }
            })
          }
        })
    }

    function setUser(data) {
      store.commit('setContactSend', data)
    }

    return {
      contantSend,
      listUserSend,
      typeContactSend,
      setUser,
      searchUser
    }
  }
})
</script>

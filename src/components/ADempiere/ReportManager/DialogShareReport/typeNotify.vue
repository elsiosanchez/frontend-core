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
      {{ $t('report.reportEnginer.optionsImport.typeNotify') }}
    </label>

    <el-select
      v-model="notify"
      filterable
      allow-create
      style="width: 100%;"
      @visible-change="searchNotify"
      @change="setNotify"
    >
      <el-option
        v-for="(item, key) in listNotify"
        :key="key"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<script>
import { defineComponent, ref, watch, computed } from '@vue/composition-api'

import store from '@/store'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'TypeNotify',

  setup() {
    const notify = ref(store.getters.getTypeNotify)
    const listNotify = ref([])
    const typeNotifySend = computed(() => {
      return store.getters.getTypeNotify
    })

    watch(typeNotifySend, (newValue) => {
      notify.value = newValue
    })

    function searchNotify() {
      store.dispatch('ListNotifications')
        .then(response => {
          if (!isEmptyValue(response)) {
            const { records } = response
            listNotify.value = records.map(item => {
              return {
                label: item.name,
                value: item.value
              }
            })
          }
        })
    }

    function setNotify(data) {
      store.commit('setTypeNotify', data)
    }

    return {
      notify,
      listNotify,
      typeNotifySend,
      setNotify,
      searchNotify
    }
  }
})
</script>

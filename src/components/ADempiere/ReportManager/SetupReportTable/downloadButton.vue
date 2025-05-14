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
  <div style="align-items: center;">
    <el-button
      plain
      size="mini"
      type="primary"
      class="custom-button"
      :disabled="isLoadingReport"
      :loading="isLoadingReport"
      @click="viewShowDialog"
    >
      {{ $t('report.reportEnginer.share') }}
    </el-button>
  </div>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import store from '@/store'
import language from '@/lang'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'DownloadButton',

  props: {
    containerUuid: {
      type: String,
      required: false
    },
    isLoadingReport: {
      type: Boolean,
      required: false
    }
  },

  setup() {
    const storedMailTemplatesList = computed(() => {
      return store.getters.getListMailTemplates
    })

    function viewShowDialog() {
      let menuDefault = ''
      if (!isEmptyValue(storedMailTemplatesList.value) && !isEmptyValue(storedMailTemplatesList.value.menus)) {
        menuDefault = storedMailTemplatesList.value.menus[0].mail_text
      }
      const link = language.t('report.reportEnginer.urlPublic')
      store.commit('setDefaultBody', menuDefault + `\n\n\n[${link}](www.123892138.com)`)
      store.commit('setContactSend', '')
      store.commit('setTypeNotify', '')
      store.commit('setShowDialog', true)
    }

    return {
      storedMailTemplatesList,
      viewShowDialog
    }
  }
})
</script>

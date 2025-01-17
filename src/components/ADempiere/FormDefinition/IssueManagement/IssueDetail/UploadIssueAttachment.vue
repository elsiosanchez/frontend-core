<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/elsiosanchez
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
  <el-drawer
    class="issuesUpload"
    :visible.sync="showContainerInfo"
    :with-header="true"
    :before-close="uploadFile"
    :size="isDrawerWidth"
  >
    <span slot="title">
      <svg-icon
        icon-class="guide"
        style="font-size: 15px !important"
      />
      <span style="color: #606266; font-weight: bold;">
        {{ '#' + numberDocument + ' ' + subject }}
      </span>
    </span>
    <attachment-manager
      table-name="R_Request"
      :record-id="recordId"
    />
  </el-drawer>
</template>

<script>
import {
  defineComponent, computed
} from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import PanelInfo from '@/components/ADempiere/PanelInfo'
import AttachmentManager from '@/components/ADempiere/PanelInfo/Component/AttachmentManager'

export default defineComponent({
  name: 'UploadIssueAttachment',

  components: {
    PanelInfo,
    AttachmentManager
  },

  props: {
    numberDocument: {
      type: [String, Number],
      default: ''
    },
    recordId: {
      type: Number,
      default: ''
    },
    subject: {
      type: String,
      default: ''
    }
  },

  setup() {
    const showContainerInfo = computed(() => {
      return store.getters.getShowUploadImg
    })

    const isDrawerWidth = computed(() => {
      if (isMobile.value) {
        return '100%'
      }
      return '65%'
    })

    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })

    function uploadFile() {
      store.commit('setShowUploadImg', false)
    }

    return {
      uploadFile,
      showContainerInfo,
      isDrawerWidth,
      isMobile
    }
  }
})
</script>

<style>
.el-drawer__wrapper .issuesUpload {
  z-index: 2100 !important;
}

.v-modal {
  z-index: 2000 !important
}
</style>

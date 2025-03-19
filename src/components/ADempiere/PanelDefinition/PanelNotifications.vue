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
  <el-dialog
    :title="notificationsDetails.title"
    :visible.sync="isNotification"
    :append-to-body="true"
  >
    <p slot="title" style="text-align: center;margin: 0px;">
      {{ notificationsDetails.title }}
    </p>
    <el-descriptions
      v-if="!isEmptyValue(notificationsDetails.logs)"
      :title="notificationsDetails.message"
      class="margin-top"
      :column="1"
      :border="true"
    >
      <el-descriptions-item
        :label="$t('page.processActivity.logs')"
      >
        {{ notificationsDetails.summary }}
      </el-descriptions-item>
      <el-descriptions-item
        v-for="(logItem, key) in notificationsDetails.logs"
        :key="key"
        :label="logItem.record_id"
      >
        {{ logItem.log }}
      </el-descriptions-item>
    </el-descriptions>
    <p v-else>
      <el-card shadow="never" :body-style="{ padding: '5px' }">
        <v-md-preview
          :text="notificationsDetails.message"
          style="padding: 0px"
        />
      </el-card>
    </p>
    <p style="text-align=right">
      <el-button
        class="see-detail-button"
        @click="isNotification=false"
      >
        <p class="see-detail-button-paragraph">
          <i
            class="see-detail-icon el-icon-news"
          />
          <span class="see-detail-text">
            {{ $t('component.displayDefinition.cardView') }}
          </span>
        </p>
      </el-button>
      <el-button
        class="see-detail-button"
        style="float: left;"
        @click="copycontent()"
      >
        <p class="see-detail-button-paragraph">
          <i
            class="see-detail-icon el-icon-document-copy"
          />
        </p>
      </el-button>
      <el-button
        type="danger"
        class="button-base-icon"
        icon="el-icon-close"
        style="float: right;margin-left: 10px;"
        @click="isNotification=false"
      />
    </p>
  </el-dialog>
</template>

<script>
import store from '@/store'
import router from '@/router'
import { defineComponent, computed } from '@vue/composition-api'
import { copyToClipboard } from '@/utils/ADempiere/coreUtils.js'

export default defineComponent({
  name: 'PanelNotifications',

  setup() {
    const isNotification = computed({
      get: () => store.getters.getShowNotification,
      set: (value) => {
        store.commit('setShowNotification', value)
      }
    })

    const notificationsDetails = computed(() => {
      return store.getters.getDetailsNotifications
    })

    function zoomProcess() {
      router.push({
        name: 'ProcessActivity'
      }, () => {})
    }
    function copycontent() {
      copyToClipboard({
        text: notificationsDetails.value.message,
        isShowMessage: true
      })
    }
    return {
      isNotification,
      notificationsDetails,
      // Methods
      zoomProcess,
      copycontent
    }
  }
})
</script>

<style lang="scss">
.see-detail-button {
  float: right;
  margin-left: 10px;
  padding: 7px 10px;
}
.see-detail-button-paragraph {
  margin: 0px !important;
}
.see-detail-icon {
  font-size: 20px !important;
}
.see-detail-text {
  font-size: 18px !important;
}
</style>

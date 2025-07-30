<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
Contributor(s): Leonel Matos lmatos@erpya.com
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
    <el-descriptions
      direction="horizontal"
      :column="1"
    >
      <el-descriptions-item>
        <span style="margin-left: 0px; margin-bottom: 10px; font-weight: 700; font-size: medium;">
          {{ metadata.reference }}
        </span>
        <el-button
          style="margin-left: auto;"
          @click="handleCommandActions('read')"
        >
          {{ $t('window.containerInfo.notices.read') }}
        </el-button>
      </el-descriptions-item>
      <el-descriptions-item>
        <issue-avatar :user="metadata.user" />
      </el-descriptions-item>
      <el-descriptions-item>
        <el-card
          shadow="never"
          :body-style="{ padding: '0px' }"
        >
          <v-md-preview
            :text="metadata.text_message"
            height="150px"
            class="previwer-disable"
            style="padding: 0px"
          />
        </el-card>
      </el-descriptions-item>
      <el-descriptions-item content-class-name="footer-notice">
        <span>
          {{ diffInDays }}
        </span>
        <span style="float: right;color: #909399">
          {{ translateDate({ value: metadata.created, format: 'long' }) }}
        </span>
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script>
import store from '@/store'
import {
  defineComponent,
  computed
} from '@vue/composition-api'

// Components and Mixins
import IssueAvatar from '@/components/ADempiere/FormDefinition/IssueManagement/issueAvatar.vue'

// Utils and Helper Methods
import { translateDate } from '@/utils/ADempiere/formatValue/dateFormat'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
// import { formatDate, translateDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'noticeManagement',

  components: {
    IssueAvatar
  },

  props: {
    metadata: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    const diffInDays = computed(() => {
      const dateCreated = new Date(props.metadata.created).getTime()
      const newDate = new Date().getTime()
      const diff = newDate - dateCreated
      const integerDiff = Math.floor(diff / (1000 * 60 * 60 * 24))
      return integerDiff + ' Days ago'
    })
    function ledgeNoyice() {
      if (!isEmptyValue(props.metadata) && !isEmptyValue(props.metadata.id)) {
        store.dispatch('readCurrentNotice', {
          id: props.metadata.id
        })
      }
    }
    function readAll() {
      const { id } = store.getters['user/userInfo']
      store.dispatch('readAllNotices', {
        userId: id
      })
    }
    function handleCommandActions(command) {
      if (command === 'read') {
        ledgeNoyice()
        return
      }
      if (command === 'readAll') {
        readAll()
        return
      }
    }
    return {
      diffInDays,
      translateDate,
      ledgeNoyice,
      handleCommandActions,
      readAll
    }
  }
})
</script>

<style scoped>
  .el-table {
    background-color: #FFFFFF;
  }
  .search_recent {
    width: 50% !important;
    float: right;
  }
  .header {
    padding-bottom: 10px;
  }
  .recent-items {
    height: 455px;
    overflow: auto;
  }
  .time {
    float: left;
    font-size: 11px;
    color: #999;
  }
  .card-box {
    cursor: pointer;
  }
  .card-content {
    font-size: 15px;
  }
  .icon-window {
    font-size: large;
    color: #36a3f7;
    margin-left: 5px;
    margin-top:2px
  }
  .action-tag {
    float: right;
  }
</style>
<style>
.footer-notice {
  margin-left: 10px;
  width: 100% !important;
  display: block !important;
  padding-bottom: 10px;
}
.el-descriptions-item__label.has-colon::after {
  content: "";
}
</style>

<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez elsiosanches@gmail.com https://github.com/ElsioSanchez
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
    :title="$t('report.dialogLegacy.displayOptions')"
    top="2vh"
    :visible.sync="showDialog"
    @close="viewShowDialog"
  >
    <el-row :gutter="12">
      <el-col :span="24">
        <el-card>
          <el-row :gutter="12">
            <el-col :span="12" style="width: 50%; text-align: center;">
              <el-radio
                v-model="check"
                label="see"
                label-position="left"
                style="font-size: 18px; padding-bottom: 2%"
              >
                {{ $t('report.dialogLegacy.showReport') }}
                <i class="el-icon-view" />
              </el-radio>
            </el-col>

            <el-col :span="12" style="width: 50%; text-align: center;">
              <el-radio
                v-model="check"
                label="donwload"
                label-position="left"
                style="font-size: 18px; padding-right: 1%; padding-bottom: 2%"
              >
                {{ $t('report.dialogLegacy.downloadFiles') }}
                <svg-icon
                  icon-class="cloud_download"
                />
              </el-radio>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <el-col style="margin-top: 1%">
        <el-button
          class="button-base-icon"
          icon="el-icon-check"
          style="float: right;"
          type="primary"
          :disabled="isLoading"
          @click="printProcess()"
        />
        <el-button
          class="button-base-icon"
          icon="el-icon-close"
          style="float: right; margin-right: 1%;"
          type="danger"
          :disabled="isLoading"
          @click="viewShowDialog()"
        />
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import store from '@/store'

import { defineComponent, computed, ref } from '@vue/composition-api'

// Utils and Helper Methods
import { showNotification } from '@/utils/ADempiere/notification.js'

export default defineComponent({
  name: 'DialogShareReportLegacy',

  props: {
    tableName: {
      type: String,
      required: false
    },
    process: {
      type: Object,
      required: false
    },
    recordId: {
      type: Number,
      required: false
    },
    containerUuid: {
      type: [String, Number],
      required: false
    }
  },

  setup(props, { root }) {
    const check = ref('see')
    const ids = ref([])

    //
    const isLoading = computed(() => {
      return store.getters.getIsLoadingDialog
    })

    const showDialog = computed(() => {
      return store.getters.getViewDialog
    })

    const selectionsList = computed(() => {
      return store.getters.getTabSelectionsList({
        containerUuid: props.containerUuid
      })
    })

    //
    function viewShowDialog() {
      store.commit('setViewDialog', false)
    }

    function printProcess() {
      selectionsList.value.forEach(e => {
        const id = e[`${props.tableName}_ID`]
        if (!ids.value.includes(id)) {
          ids.value.push(id)
        }
      })
      showNotification({
        title: this.$t('notifications.processing'),
        message: props.tableName,
        type: 'info'
      })
      store.commit('setIsLoadingDialog', true)
      let fileType = 'pdf'
      if (check.value === 'donwload') {
        fileType = 'zip'
      }
      store.dispatch('printBarch', {
        tableName: props.tableName,
        reportId: props.process.internal_id,
        ids: ids.value,
        checkValue: check.value,
        containerUuid: props.containerUuid,
        reportUuid: root.$route.meta.action_uuid,
        fileType
      })
        .finally(() => {
          viewShowDialog()
          store.commit('setIsLoadingDialog', false)
        })
    }

    return {
      showDialog,
      isLoading,
      check,
      selectionsList,
      //
      viewShowDialog,
      printProcess
    }
  }
})

</script>

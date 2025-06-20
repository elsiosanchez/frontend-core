<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
  Contributor(s): Elsio Sanchez ElsioSanchez15@outlook.com https://github.com/ElsioSanchez
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
  <el-input
    v-model="value"
    :placeholder="metadata.description"
    :disabled="metadata.readonly"
    class="input-with-select"
  >
    <el-upload
      slot="append"
      ref="uploadComponent"
      :action="action"
      class="upload-demo"
      :multiple="false"
      :before-upload="isValidUploadHandler"
    >
      <el-button
        size="small"
        type="primary"
        style="font-size: 13px;"
      >
        <i
          v-if="isLoadingFile"
          class="el-icon-upload"
          style="font-size: 20px;padding: 0px;color: #909399;"
        />
        <svg-icon
          v-else
          icon-class="attach"
          style="font-size: 20px;padding: 0px;color: #909399;"
        />
      </el-button>
    </el-upload>
  </el-input>
</template>

<script>
import lang from '@/lang'
// import router from '@/router'
import store from '@/store'
import {
  ref
} from '@vue/composition-api'

// Components and Mixins
import fieldMixin from '@/components/ADempiere/FieldDefinition/mixin/mixinField.js'
import fieldWithDisplayColumn from '@/components/ADempiere/FieldDefinition/mixin/mixinWithDisplayColumn.js'

// API Request Methods
import { requestPresignedUrl } from '@/api/ADempiere/file-management/resource-reference.ts'

// // Utils and Helper Methods'
import { showMessage } from '@/utils/ADempiere/notification'

export default {
  name: 'FieldFilePath',

  mixins: [
    fieldMixin,
    fieldWithDisplayColumn
  ],

  props: {
    // receives the property that is an object with all the attributes
    binary: {
      type: Array,
      default: () => []
    }
  },

  setup() {
    // Ref
    const action = ref('')
    const isLoadingFile = ref(false)
    const uploadComponent = ref(null)
    // Methods
    function isValidUploadHandler(file) {
      const { uuid, client } = store.getters['user/getRole']
      isLoadingFile.value = true
      requestPresignedUrl({
        clientId: client.uuid,
        containerType: 'resource',
        filePath: 'tmp/',
        userId: uuid,
        fileName: file.name
      })
        .then(responseUrl => {
          uploadFile({
            file,
            presigned: responseUrl
          })
            .then(() => {
              this.value = file.name
              isLoadingFile.value = false
            })
            .catch((error) => {
              showMessage({
                message: error.message || error.result || lang.t('component.attachment.error'),
                type: 'error'
              })
            })
        })
        .catch(() => {
          isLoadingFile.value = false
        })
    }
    function uploadFile({ file, presigned }) {
      const { url, file_name } = presigned
      return new Promise((resolve, reject) => {
        fetch(url, {
          method: 'PUT',
          body: file
        }).then(() => {
          resolve(file_name)
        }).catch((error) => {
          showMessage({
            message: error.message || error.result || lang.t('component.attachment.error'),
            type: 'error'
          })
          reject(error)
        })
      })
    }

    return {
      // Ref
      action,
      isLoadingFile,
      uploadComponent,
      // Methods
      isValidUploadHandler
    }
  }
}
</script>

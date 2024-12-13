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
import store from '@/store'
import {
  defineComponent, computed
} from '@vue/composition-api'
import PanelInfo from '@/components/ADempiere/PanelInfo'
import AttachmentManager from '@/components/ADempiere/PanelInfo/Component/AttachmentManager'

export default defineComponent({
  name: 'uploadIssue',
  components: {
    PanelInfo,
    AttachmentManager
  },
  props: {
    numberDocument: {
      type: String,
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

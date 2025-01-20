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
  <el-card class="list-comments">
    <div slot="header" class="list-comments-clearfix">
      <issue-avatar :user="comment.user" />

      <el-dropdown
        trigger="click"
        style="float: right"
        @command="handleCommand"
      >
        <span class="el-dropdown-link">
          <el-button type="text" size="mini" style="color: black;">
            <b>
              <svg-icon icon-class="more-vertical" />
            </b>
          </el-button>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            icon="el-icon-edit"
            :disabled="isDisableToChange"
            :command="{ option:'edit' }"
          >
            {{ $t('issues.edit') }}
          </el-dropdown-item>
          <el-dropdown-item
            icon="el-icon-delete"
            :disabled="isDisableToChange"
            :command="{ option:'delete' }"
          >
            {{ $t('issues.delete') }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <v-md-preview
        v-if="!isEditComment"
        :text="comment.result"
        class="previwer-disable"
        style="padding: 0px"
      />

      <span v-else>
        <el-card v-if="commentUpdatePreview" shadow="never">
          <el-scrollbar wrap-class="scroll-previwer-disable">
            <v-md-preview
              :text="commentUpdate"
              class="previwer-disable"
              style="padding: 0px"
              height="150px"
            />
          </el-scrollbar>
        </el-card>
        <v-md-editor
          v-else
          v-model="commentUpdate"
          height="150px"
          left-toolbar="undo redo clear h bold italic strikethrough quote ul ol table hr link image code save | emoji listMailTemplates"
          :toolbar="editorToolbarList"
          right-toolbar="sync-scroll fullscreen"
          mode="edit"
        />

        <el-button
          type="primary"
          icon="el-icon-check"
          class="button-base-icon"
          style="float: right; margin: 10px;"
          @click="updateComment()"
        />
        <el-button
          type="danger"
          icon="el-icon-close"
          class="button-base-icon"
          style="float: right; margin-top: 10px;"
          @click="isEditComment = !isEditComment"
        />
        <el-button
          type="info"
          plain
          class="button-base-icon"
          style="float: right; margin-top: 10px;"
          @click="commentUpdate = ''"
        >
          <svg-icon icon-class="layers-clear" />
        </el-button>
        <el-checkbox
          v-model="commentUpdatePreview"
          :label="$t('issues.preview')"
          :border="true"
          style="float: right; margin-top: 10px;"
        />
      </span>
    </div>
  </el-card>
</template>

<script>
import {
  defineComponent,
  ref,
  computed
} from '@vue/composition-api'

import store from '@/store'

// Components and Mixins
import 'simple-m-editor/dist/simple-m-editor.css'
import IssueAvatar from '@/components/ADempiere/FormDefinition/IssueManagement/issueAvatar.vue'

export default defineComponent({
  name: 'IssueComment',

  components: {
    IssueAvatar
  },

  props: {
    issueId: {
      type: Number,
      required: true
    },
    comment: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    const commentUpdate = ref('')
    const commentUpdatePreview = ref(false)
    const isEditComment = ref(false)

    const userId = computed(() => {
      return store.getters['user/userInfo'].id
    })

    const isDisableToChange = computed(() => {
      return userId.value !== props.comment.user.id
    })

    const storedMailTemplatesList = computed(() => {
      return store.getters.getListMailTemplates
    })

    const editorToolbarList = computed(() => {
      return {
        listMailTemplates: storedMailTemplatesList.value
      }
    })

    function handleCommand(command) {
      const { comment, option } = command
      if (option === 'delete') {
        deleteComment(comment)
        return
      }
      editComment(comment)
    }

    function deleteComment() {
      const { id, uuid } = props.comment
      store.dispatch('deleteIssueComment', {
        id,
        uuid,
        issueId: props.issueId
      })
    }

    function editComment() {
      isEditComment.value = true
      commentUpdate.value = props.comment.result
    }

    function updateComment() {
      const { id, uuid } = props.comment
      isEditComment.value = false
      store.dispatch('updateIssueComment', {
        id,
        uuid,
        issueId: props.issueId,
        result: commentUpdate.value
      })
    }

    return {
      isEditComment,
      commentUpdate,
      commentUpdatePreview,
      isDisableToChange,
      editorToolbarList,
      // Methods
      handleCommand,
      updateComment
    }
  }
})
</script>

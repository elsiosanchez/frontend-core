<!--
 ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A.
 Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com, Elsio Sanchez elsiosanche@gmail.com www.erpya.com
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
    class="modal-dialog"
    :visible="isShowed"
    :width="widthDialogo"
    top="10vh"
    @close="cancelActionMethod(false)"
  >
    <span
      v-if="isEmptyValue(typeInfo)"
      slot="title"
    >
      <p style="text-align: center;">
        <b>
          {{ title }}
        </b>
      </p>
    </span>
    <el-result
      v-else
      :icon="typeInfo"
      :title="title"
    />
    <span class="content-modal-dialog">
      <component
        :is="componentRender"
      />
    </span>

    <span slot="footer" class="dialog-footer">
      <el-button
        type="danger"
        icon="el-icon-close"
        class="button-base-icon"
        @click="cancelActionMethod(false)"
      />
      <el-button
        v-if="isDisplayedOptionsAxillary"
        :type="optionsAxillary.typeButtons"
        class="button-base-icon"
        :loading="optionsAxillary.isLoading()"
        :disabled="optionsAxillary.enable()"
        @click="optionsAxillary.runActions()"
      >
        <span v-if="!optionsAxillary.isLoading()">
          <svg-icon
            v-if="optionsAxillary.svg"
            :icon-class="optionsAxillary.svgClass"
          />
          <i
            v-else
            :class="optionsAxillary.iconsClass"
          />
        </span>
        <b
          v-if="!isEmptyValue(optionsAxillary.name)"
          style="font-size: 18px !important"
        >
          {{ optionsAxillary.name }}
        </b>
      </el-button>
      <el-button
        v-if="isOptionsCancel && !isEmptyValue(isTypeButton)"
        :type="isTypeButton"
        class="button-base-icon"
        @click="cancelActionMethod(true)"
      >
        <svg-icon
          v-if="!isEmptyValue(isSvgButton)"
          :icon-class="isSvgButton"
        />
        <b style="font-size: 18px !important">
          {{ labelCancelMethod }}
        </b>
      </el-button>
      <el-button
        type="primary"
        icon="el-icon-check"
        class="button-base-icon"
        :loading="isLoadingDone"
        :disabled="isDisabledDone"
        @click="doneButton"
      />
    </span>
  </el-dialog>
</template>
<script>
import { defineComponent, computed } from '@vue/composition-api'

import store from '@/store'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

export default defineComponent({
  name: 'ModalDialog',
  props: {
    parentUuid: {
      type: String,
      default: undefined
    },
    containerUuid: {
      type: String,
      required: false
    },
    containerManager: {
      type: Object,
      required: false
    },
    cancelAction: {
      type: Function,
      default: () => {
      }
    },
    confirmAction: {
      type: Function,
      default: () => {
        console.info('Implement confirm action method')
      }
    }
  },

  setup(props) {
    const storedModalDialog = computed(() => {
      return store.getters.getModalDialogManagerVPOS
    })

    const isShowed = computed(() => {
      return store.getters.getShowedModalDialogVPOS
    })

    const typeInfo = computed(() => {
      return store.getters.getModalDialogManagerVPOS.type
    })

    const title = computed(() => {
      if (isEmptyValue(storedModalDialog.value)) {
        return ''
      }
      return storedModalDialog.value.title
    })

    const componentRender = computed(() => {
      if (!isEmptyValue(storedModalDialog.value)) return storedModalDialog.value.componentPath
      return ''
    })

    const isDisplayedOptionsAxillary = computed(() => {
      if (
        !isEmptyValue(storedModalDialog.value) &&
        !isEmptyValue(storedModalDialog.value.axillaryMethod)
      ) {
        return storedModalDialog.value.axillaryMethod.isDisplayed
      }
      return false
    })

    const optionsAxillary = computed(() => {
      return storedModalDialog.value.axillaryMethod
    })

    const isDisabledDone = computed(() => {
      if (
        !isEmptyValue(storedModalDialog.value) &&
        storedModalDialog.value.isDisabledDone
      ) {
        return Boolean(
          storedModalDialog.value.isDisabledDone()
        )
      }
      return false
    })

    const isTypeButton = computed(() => {
      return storedModalDialog.value.isTypeButton()
    })

    const isAutoClose = computed(() => {
      if (isEmptyValue(storedModalDialog.value)) {
        return true
      }
      return storedModalDialog.value.isAutoClose
    })

    const widthDialogo = computed(() => {
      // if (!isEmptyValue(storedModalDialog.value) && !isEmptyValue(storedModalDialog.value.widthDialogo)) {
      //   return storedModalDialog.value.widthDialogo
      // }
      return '80%'
    })

    const isSvgButton = computed(() => {
      if (isEmptyValue(storedModalDialog.value)) {
        return ''
      }
      return storedModalDialog.value.isSvgButton()
    })

    const isLoadingDone = computed(() => {
      if (
        !isEmptyValue(storedModalDialog.value) &&
        storedModalDialog.value.isLoadingDone
      ) {
        return Boolean(
          storedModalDialog.value.isLoadingDone()
        )
      }
      return false
    })

    const isOptionsCancel = computed(() => {
      if (
        !isEmptyValue(storedModalDialog.value) &&
        storedModalDialog.value.isOptionsCancel
      ) {
        return Boolean(
          storedModalDialog.value.isOptionsCancel()
        )
      }
      return false
    })

    const labelCancelMethod = computed(() => {
      return storedModalDialog.value.labelCancelMethod()
    })

    function cancelActionMethod(isCancele) {
      if (!isOptionsCancel.value) {
        closeDialog()
        return
      }
      storedModalDialog.value.cancelMethod(isCancele)
    }

    const closeDialog = () => {
      store.commit('setShowedModalDialogVPOS', {
        isShowed: false
      })
    }

    const doneButton = () => {
      storedModalDialog.value.doneMethod()
      if (!isAutoClose.value) return
      closeDialog()
    }

    return {
      // computeds
      isDisplayedOptionsAxillary,
      labelCancelMethod,
      storedModalDialog,
      optionsAxillary,
      isOptionsCancel,
      componentRender,
      isDisabledDone,
      isLoadingDone,
      widthDialogo,
      isTypeButton,
      isSvgButton,
      isAutoClose,
      isShowed,
      typeInfo,
      title,
      // methods
      cancelActionMethod,
      closeDialog,
      doneButton
    }
  }
})
</script>

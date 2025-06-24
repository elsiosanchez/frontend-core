<!--
ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/ElsioSanchez
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
    <span
      v-for="(buttonConfig, index) in buttonConfigs[currentStep]"
      :key="index"
    >
      <component
        :is="buttonConfig.component"
        v-bind="buttonConfig.props"
      />
    </span>
  </div>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

// Components and Mixins
import ButtonBase from '@/components/ADempiere/FormDefinition/outBoundOrder/footer/ButtonBase.vue'

// Utils and Helper Methods
// import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'FooterButtons',

  components: {
    ButtonBase
  },

  props: {
    metadata: {
      type: Object,
      default: () => {
        return {}
      }
    },
    currentStep: {
      type: String,
      required: false
    },
    recordsSelecion: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    isDisabledOrganizations: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    isLoadingProcess: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    isDisableProcess: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    actionRun: {
      type: Function,
      default: (Run) => {
        console.info('implement Run Method - 555', Run)
      }
    },
    actionClear: {
      type: Function,
      default: () => {
        return console.info('implement Clear Parameters Method')
      }
    },
    actionClose: {
      type: Function,
      default: () => {
        return console.info('implement Actions Close Method')
      }
    },
    nextStep: {
      type: Function,
      default: () => {
        return console.info('implement Next Step Method')
      }
    },
    previosStep: {
      type: Function,
      default: () => {
        return console.info('implement Previos Step Method')
      }
    },
    refresh: {
      type: Function,
      default: () => {
        return console.info('implement Previos Step Method')
      }
    },
    openPanelRight: {
      type: Function,
      default: () => {
        return console.info('implement Previos Step Method')
      }
    }
  },

  setup(props) {
    const buttonConfigs = computed(() => {
      return {
        order: [
          {
            component: ButtonBase,
            props: {
              type: 'primary',
              icon: 'el-icon-s-grid',
              styleButton: 'float: left',
              acttionButton: props.openPanelRight
            }
          },
          {
            component: ButtonBase,
            props: {
              size: 'small',
              type: 'success',
              styleButton: 'float: left',
              acttionButton: props.refresh,
              icon: 'el-icon-refresh-right'
            }
          },
          {
            component: ButtonBase,
            props: {
              plain: true,
              type: 'info',
              svg: 'layers-clear',
              styleButton: 'float: left',
              acttionButton: props.actionClear
            }
          },
          {
            component: ButtonBase,
            props: {
              type: 'danger',
              icon: 'el-icon-close',
              disabled: props.isLoadingProcess,
              acttionButton: props.actionClose
            }
          },
          {
            component: ButtonBase,
            props: {
              type: 'primary',
              icon: 'el-icon-arrow-left',
              acttionButton: props.previosStep
            }
          },
          {
            component: ButtonBase,
            props: {
              type: 'primary',
              icon: 'el-icon-arrow-right',
              acttionButton: props.nextStep,
              disabled: props.recordsSelecion
            }
          }
        ],
        process: [
          {
            component: ButtonBase,
            props: {
              type: 'danger',
              icon: 'el-icon-close',
              disabled: props.isLoadingProcess,
              acttionButton: props.actionClose
            }
          },
          {
            component: ButtonBase,
            props: {
              type: 'primary',
              icon: 'el-icon-arrow-left',
              acttionButton: props.previosStep
            }
          },
          {
            component: ButtonBase,
            props: {
              type: 'primary',
              icon: 'el-icon-check',
              acttionButton: props.actionRun,
              loading: props.isLoadingProcess,
              disabled: props.isDisableProcess
            }
          }
        ],
        searchCriteria: [
          {
            component: ButtonBase,
            props: {
              type: 'primary',
              icon: 'el-icon-arrow-right',
              acttionButton: props.nextStep,
              disabled: props.isDisabledOrganizations
            }
          }
        ]
      }
    })

    return {
      buttonConfigs
    }
  }
})
</script>

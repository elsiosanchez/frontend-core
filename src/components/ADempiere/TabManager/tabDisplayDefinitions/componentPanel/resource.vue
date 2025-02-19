<!--
  ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
  Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A.
  Contributor(s): Elsio Sanchez elsiosanchez@gmail.com https://github.com/elsiosanchez
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
  <span>
    <div
      v-if="isPanelRight"
      class="info-definitions"
    >
      <span style="font-weight: bold;">
        {{ currentDisplyDefinitions.name }}
      </span>
      <div style="color: rgb(130, 132, 138);">
        {{ currentDisplyDefinitions.description }}
      </div>
    </div>
    <el-card v-loading="isLoading" :body-style="{ padding: '10px', height: '10px' }" style="height: calc(100vh - 280px) !important">
      <div
        v-shortkey="{ new: ['ctrl', 'alt', 'n'] }"
        style="display: block;
        height: 100% !important"
        @shortkey="theAction"
      >
        <FullCalendar
          class="demo-app-resource"
          :options="calendarOptions"
        >
          <template v-slot:eventContent="arg">
            <div style="display: flex; align-items: center;" @click="openDetails(arg)">
              <options-panel
                v-show="isNumber(arg.event.id)"
                :action-option="actionOption"
                :current-resource="arg.event"
                :is-option-edit="true"
                :is-option-delete="true"
                :is-panel-right="isPanelRight"
                :display-definition="currentDisplyDefinitions"
                style="margin-right: 5px; color: white"
              />
              <p
                style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; padding: 0; height: 20px; line-height: 15px; font-size: 10px;"
              >
                {{ arg.event.title }}
              </p>
            </div>
          </template>
        </FullCalendar>
      </div>
    </el-card>
  </span>
</template>

<script>
import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'

import lang from '@/lang'
import store from '@/store'
import router from '@/router'
// Components and Mixins
import FullCalendar from '@fullcalendar/vue'
import SeeDetailsCalendar from '@/components/ADempiere/TabManager/tabDisplayDefinitions/componentPanel/seeDetailsCalendar.vue'
import esLocale from '@fullcalendar/core/locales/es'
import allLocales from '@fullcalendar/core/locales-all'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import optionsPanel from '@/components/ADempiere/TabManager/tabDisplayDefinitions/componentPanel/optionsPanel.vue'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { parseDate } from '@/utils/ADempiere/displayDefinition/resourceTime.js'

export default defineComponent({
  name: 'ResourceDefinitions',

  components: {
    FullCalendar,
    SeeDetailsCalendar,
    optionsPanel
  },

  props: {
    parentUuid: {
      type: String,
      required: false
    },
    containerManager: {
      type: Object,
      required: false
    },
    actionsManager: {
      type: Object,
      required: false
    },
    currentTabUuid: {
      type: String,
      default: ''
    },
    tabUuid: {
      type: String,
      default: ''
    },
    tabAttributes: {
      type: Object,
      default: () => ({})
    },
    tabsList: {
      type: Array,
      required: false
    },
    allTabsList: {
      type: Array,
      required: false
    },
    // used only window
    isPanelRight: {
      type: Boolean,
      default: false
    },
    isOpenDetails: {
      type: Function,
      default: (recordPrevious) => {
        console.info('implement method Change to Previous Record ', recordPrevious)
      }
    },
    actionOption: {
      type: Function,
      default: (recordPrevious) => {
        console.info('implement method Open Action New', recordPrevious)
      }
    },
    hangleChangeRecord: {
      type: Function,
      default: (record) => {
        console.info('implement method Change to Previous Record ', record)
      }
    }
  },

  setup(props) {
    // Ref
    const dialogVisibleDetails = ref(false)
    const currentResource = ref({})
    // Computed
    const currenPanelResource = computed(() => {
      return store.getters.getResourcePanel({
        tableName: props.tabAttributes.table_name,
        isPanel: props.isPanelRight
      })
    })
    const currentLenguage = computed(() => {
      const language = store.getters.language
      return allLocales.find(locale => locale.code.includes(language))
    })
    const groupedResourcesList = computed(() => {
      if (props.isPanelRight) {
        const { resourcesList } = store.getters.getCurrentResourcePanelRightDefinition({
          tableName: props.tabAttributes.table_name
        })
        if (isEmptyValue(resourcesList)) {
          return []
        }
        return resourcesList
      }

      const { resourcesList } = store.getters.getCurrentResourceDefinition({
        tableName: props.tabAttributes.table_name
      })
      if (isEmptyValue(resourcesList)) {
        return []
      }
      return resourcesList
    })

    const resourceEventsList = computed(() => {
      if (props.isPanelRight) {
        const { eventsList } = store.getters.getCurrentResourcePanelRightDefinition({
          tableName: props.tabAttributes.table_name
        })
        if (isEmptyValue(eventsList)) {
          return []
        }
        return eventsList
      }

      const { eventsList } = store.getters.getCurrentResourceDefinition({
        tableName: props.tabAttributes.table_name
      })
      if (isEmptyValue(eventsList)) {
        return []
      }
      return eventsList
    })

    const calendarOptions = computed(() => {
      return {
        expandRows: true,
        navLinks: true, // can click day/week names to navigate views
        selectable: true,
        nowIndicator: true,
        // dayMaxEvents: true, // allow "more" link when too many
        // timeZone: 'UTC',
        plugins: [resourceTimelinePlugin],
        headerToolbar: {
          left: 'today prev,next,myCustomButton',
          center: 'title',
          right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,resourceTimelineYear'
        },
        resourceAreaWidth: '30%',
        initialView: 'resourceTimelineMonth',
        eventMinWidth: 90,
        locale: currentLenguage.value,
        scrollTime: '01:00',
        // aspectRatio: 1,
        // editable: true,
        resourceAreaHeaderContent: lang.t('window.containerInfo.log.resource'),
        // resourceGroupField: 'group_name',
        resources: groupedResourcesList.value,
        events: resourceEventsList.value,
        views: {
          resourceTimelineDay: {
            slotDuration: '00:30:00', // Intervalos de 30 minutos
            slotLabelInterval: '00:30:00' // Etiquetas cada 30 minutos
          },
          resourceTimelineWeek: {
            slotDuration: '01:00:00', // Intervalos de 1 hora
            slotLabelInterval: '01:00:00' // Etiquetas cada 1 hora
          },
          resourceTimelineMonth: {
            slotDuration: { days: 1 }, // Intervalos de 1 día
            slotLabelInterval: { days: 1 } // Etiquetas cada día
          },
          resourceTimelineYear: {
            slotDuration: { months: 1 }, // Intervalos de 1 mes
            slotLabelInterval: { months: 1 } // Etiquetas cada mes
          }
        },
        datesSet: function(info, event) {
          changeRange(info)
        },
        dateClick: function(info) {
          console.log('dateClick', info)
        },
        customButtons: {
          myCustomButton: {
            text: lang.t('window.newRecord'),
            click: function() {
              props.actionOption('new')
            }
          }
        }
      }
    })

    const currentDisplyDefinitions = computed(() => {
      if (props.isPanelRight) {
        return store.getters.getCurrentDisplayPanelRightDefinitions({ tableName: props.tabAttributes.table_name })
      }
      return store.getters.getCurrentDisplayTabDefinitions({
        tableName: props.tabAttributes.table_name
      })
    })

    const isLoading = computed(() => {
      if (props.isPanelRight) return store.getters.getResourcePanelRightLoading({ tableName: props.tabAttributes.table_name })
      return store.getters.getResourceLoading({
        tableName: props.tabAttributes.table_name
      })
    })

    const currentRecord = computed(() => {
      return store.getters.getTabCurrentRow({
        containerUuid: props.tabAttributes.containerUuid
      })
    })

    // Mehtods

    function changeRange(params) {
      const definition = currentDisplyDefinitions.value
      // if (isEmptyValue(definition)) {
      //   definition = store.getters.getDisplayPanelRightDefinitions({ tableName: props.tabAttributes.table_name }).currentDefinition
      // }

      if (isEmptyValue(params) || isEmptyValue(definition)) {
        return
      }
      let recordId

      recordId = currentRecord.value[props.tabAttributes.table_name + '_ID']

      if (isEmptyValue(recordId)) {
        const currentRoute = router.app._route.query
        recordId = currentRoute.recordId
      }
      // console.log({
      //   listFilters: store.getters.getDisplayFilters({ tableName: props.tabAttributes.table_name })
      // })
      // if (props.isPanelRight) {
      const listFilters = store.getters.getDisplayFilters({
        tableName: props.tabAttributes.table_name
      })
      // }

      const { endStr, startStr } = params
      let dateStart = parseDate(startStr)
      let dateEnd = parseDate(endStr)
      if (props.isPanelRight) {
        // dateStart
        dateStart = null
        dateEnd = null
      } else {
        // Get the current date
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()

        // First day of the previous year
        const firstDayPreviousYear = new Date(currentYear - 1, 0, 1) // 0 is January
        dateStart = firstDayPreviousYear.toJSON()

        // Last day of the next year
        const lastDayNextYear = new Date(currentYear + 1, 11, 31) // 11 is December
        dateEnd = lastDayNextYear.toJSON()
      }
      store.dispatch('changeDateRange', {
        endStr: dateEnd,
        startStr: dateStart,
        isPanel: props.isPanelRight,
        id: definition.id,
        filters: listFilters,
        listFilters,
        tableName: props.tabAttributes.table_name,
        recordId
      })
    }

    function openDetails(params) {
      if (isNumber(params.event.id)) {
        props.hangleChangeRecord({
          ...params.event,
          id: Number(params.event.id)
        })
        // props.actionOption('view')
      }
    }

    function isNumber(value) {
      return !isNaN(parseFloat(value)) && isFinite(value)
    }

    function closeDetails() {
      dialogVisibleDetails.value = false
    }
    function theAction(event) {
      switch (event.srcKey) {
        case 'new':
          store.dispatch('changeTabPanelDefinition', {
            type: 'new',
            displyDefinitions: currentDisplyDefinitions.value,
            recordId: -1
          })
          store.commit('setShowPanel', {
            id: currentDisplyDefinitions.value.id,
            show: true
          })
          break
      }
    }

    return {
      // Ref
      currentResource,
      dialogVisibleDetails,
      // computeds
      isLoading,
      calendarOptions,
      currentDisplyDefinitions,
      resourceEventsList,
      groupedResourcesList,
      currentRecord,
      currenPanelResource,
      //
      esLocale,
      allLocales,
      listPlugin,
      dayGridPlugin,
      timeGridPlugin,
      currentLenguage,
      interactionPlugin,
      // Mehtods
      openDetails,
      changeRange,
      closeDetails,
      theAction,
      isNumber
    }
  }
})
</script>

<style lang="scss">
.info-definitions {
  line-height: 1.2;
  font-size: 12px;
  color: #303133;
}
.demo-app-resource{
  height: calc(100vh - 300px) !important
}
</style>

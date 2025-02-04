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
    <el-card v-loading="isLoading" :body-style="{ padding: '10px' }">
      <!-- <div class="kanban-columns-container" style="display: block;"> -->
      <div class="demo-app">
        <div class="demo-app-sidebar">
          <div class="demo-app-sidebar-section">
            <h2 style="padding-left: 10px; padding-top: 10px;">
              {{ $t('component.calendar.allEvents') }} ({{ recordsEvents.length }})
            </h2>
            <ul>
              <li
                v-for="event in recordsEvents"
                :key="event.id"
                @click="goToEventDate(event)"
              >
                <el-card
                  shadow="never"
                  class="custom-card-calendar"
                  style="padding-left: 0.5rem;"
                >
                  <b><i>{{ event.title }}</i></b>
                  <p style="font-size: 14px;">{{ event.description }}</p>
                  <p
                    v-if="!isEmptyValue(event.valid_from) && !isEmptyValue(event.valid_to)"
                    style="text-align: left; color: gray; font-size: 12px; margin: 0px; padding-bottom: 10px !important"
                  >
                    {{
                      translateDate({
                        value: event.valid_from,
                        format: event.valid_to.length > 10 ? 'short' : 'onlyDate',
                      }) +
                        ' ~ ' +
                        translateDate({
                          value: event.valid_to,
                          format: event.valid_to.length > 10 ? 'short' : 'onlyDate',
                        })
                    }}
                  </p>
                </el-card>
              </li>
            </ul>
          </div>
        </div>
        <div class="calendar-definitions">
          <FullCalendar
            ref="calendarRef"
            :options="calendarOptions"
          >
            <template v-slot:eventContent="arg">
              <div
                @click="openDetails(arg)"
              >
                <b>{{ arg.timeText }}</b>
                <i>{{ arg.event.title }}</i>
              </div>
            </template>
          </FullCalendar>
        </div>
      </div>
      <!-- </div> -->
    </el-card>
  </span>
</template>

<script>
import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'

import store from '@/store'
import lang from '@/lang'

// Components and Mixins
import FullCalendar from '@fullcalendar/vue'
import SeeDetailsCalendar from '@/components/ADempiere/TabManager/tabDisplayDefinitions/componentPanel/seeDetailsCalendar.vue'

// Utils and Helper Methods
import esLocale from '@fullcalendar/core/locales/es'
// import enLocale from '@fullcalendar/core/locales/en'
import allLocales from '@fullcalendar/core/locales-all'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import listPlugin from '@fullcalendar/list'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'
import { createEventId } from './event-utils'
import { translateDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'CalendarDefinitions',

  components: {
    FullCalendar,
    SeeDetailsCalendar
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
    const calendarRef = ref(null)
    const timeOut = ref(null)
    // Computed
    const currenPanelCalendar = computed(() => {
      return store.getters.getCalendarPanel({
        tableName: props.tabAttributes.table_name,
        isPanel: props.isPanelRight
      })
    })

    const currentLenguage = computed(() => {
      const language = store.getters.language
      return allLocales.find(locale => locale.code.includes(language))
    })

    const recordsEvents = computed(() => {
      if (props.isPanelRight) {
        const record = store.getters.getListRecordsCalendarPanelRightDefinition({ tableName: props.tabAttributes.table_name })
        if (isEmptyValue(record)) return []
        return record.map(list => {
          return {
            ...list,
            start: parse(list.valid_from),
            end: parse(list.valid_to)
          }
        })
      }
      const record = store.getters.getListRecordsCalendarDefinition({ tableName: props.tabAttributes.table_name })
      if (isEmptyValue(record)) return []
      return record.map(list => {
        return {
          ...list,
          start: parse(list.valid_from),
          end: parse(list.valid_to)
        }
      })
    })

    const calendarOptions = computed(() => {
      return {
        plugins: [
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          listPlugin,
          resourceTimelinePlugin
        ],
        locale: currentLenguage.value,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridDay,timeGridWeek,dayGridMonth,resourceTimelineYear,listWeek'
        },
        initialView: 'dayGridMonth',
        events: recordsEvents.value,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        // select: handleDateSelect(),
        select: function(info) {
          const start = {
            [currentDisplyDefinitions.value.valid_from_column]: {
              type: 'date',
              value: info.startStr
            }
          }
          const end = {
            [currentDisplyDefinitions.value.valid_to_column]: {
              type: 'date',
              value: info.endStr
            }
          }
          const attributes = {
            ...start,
            ...end
          }
          props.actionOption('new')
          store.dispatch('changeTabPanelDefinition', {
            type: 'new',
            id: currentDisplyDefinitions.value.id,
            recordId: -1,
            additionalAttributes: attributes,
            currentAttributes: attributes
          })
        }
        // dateClick: function(info) {
        //   props.actionOption('new')
        // }
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
      if (props.isPanelRight) return store.getters.getCalendarPanelRightLoading({ tableName: props.tabAttributes.table_name })
      return store.getters.getCalendarLoading({
        tableName: props.tabAttributes.table_name
      })
    })

    const currentRecord = computed(() => {
      return store.getters.getTabCurrentRow({
        containerUuid: props.tabAttributes.containerUuid
      })
    })

    // Mehtods

    function parse(dateToParse) {
      if (isEmptyValue(dateToParse)) return ''
      const parts = dateToParse.split('T')[0].split('-')
      return `${parts[0]}-${parts[1]}-${parts[2]}`
    }

    function changeRange(params) {
      let definition = currentDisplyDefinitions.value
      if (isEmptyValue(definition)) {
        definition = store.getters.getDisplayPanelRightDefinitions({ tableName: props.tabAttributes.table_name }).currentDefinition
      }

      if (isEmptyValue(params) || isEmptyValue(definition)) return
      const { endStr, startStr } = params
      // clearTimeout(timeOut.value)
      // timeOut.value = setTimeout(() => {
      store.dispatch('changeDateCalendar', {
        endStr: parse(endStr),
        startStr: parse(startStr),
        isPanel: props.isPanelRight,
        id: definition.id,
        tableName: props.tabAttributes.table_name,
        recordId: currentRecord.value[props.tabAttributes.table_name + '_ID']
      })
    }

    const goToEventDate = (event) => {
      const calendarApi = calendarRef.value.getApi()
      if (isEmptyValue(event.valid_from)) return
      if (event.valid_from) {
        calendarApi.gotoDate(event.valid_from)
      }
    }

    const displayDefinitionFields = computed(() => {
      if (
        !isEmptyValue(displayDefinitionMetadata.value) &&
        !isEmptyValue(displayDefinitionMetadata.value.fields)
      ) {
        return displayDefinitionMetadata.value.fields
      }
      return []
    })

    const displayDefinitionMetadata = computed(() => {
      // return store.getters.getDisplayTabDefinition({
      //   id: currentDisplyDefinitions.value.id,
      //   recordId: currentResource.value.id
      // })
      return store.getters.getDisplayTabDefinition({ id: currentDisplyDefinitions.value.id })
    })

    function handleDateSelect(selectInfo) {
      if (!selectInfo) {
        return
      }
      const title = prompt(lang.t('component.calendar.titleNewEvent'))
      const calendarApi = selectInfo.view.calendar
      calendarApi.unselect() // clear date selection
      if (title) {
        calendarApi.addEvent({
          id: createEventId(),
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay
        })
      }
    }

    function openDetails(params) {
      if (isNumber(params.event.id)) {
        props.hangleChangeRecord({
          ...params.event,
          id: Number(params.event.id)
        })
        props.actionOption('view')
      }
    }

    function isNumber(value) {
      return !isNaN(parseFloat(value)) && isFinite(value)
    }

    function closeDetails() {
      dialogVisibleDetails.value = false
    }

    function handleEventClick(info) {
      props.actionOption(info)
      // store.dispatch('changeTabPanelDefinition', {
      //   type: info,
      //   id: currentDisplyDefinitions.value.id,
      //   recordId: currentResource.value.id
      // })
      // if (!isEmptyValue(displayDefinitionFields.value)) return
      // loadFields()
    }

    // function loadFields() {
    //   store.dispatch('listDisplayDefinitionFieldsMetadata', {
    //     id: currentDisplyDefinitions.value.id,
    //     recordId: currentResource.value.id
    //   })
    // }

    return {
      // Ref
      timeOut,
      calendarRef,
      currentResource,
      dialogVisibleDetails,
      // computeds
      isLoading,
      calendarOptions,
      currentDisplyDefinitions,
      recordsEvents,
      currentRecord,
      displayDefinitionFields,
      currenPanelCalendar,
      //
      esLocale,
      // enLocale,
      allLocales,
      listPlugin,
      dayGridPlugin,
      timeGridPlugin,
      currentLenguage,
      interactionPlugin,
      // Mehtods
      goToEventDate,
      translateDate,
      handleDateSelect,
      handleEventClick,
      openDetails,
      changeRange,
      closeDetails
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
.calendar-definitions{
  flex: auto;
  // flex-grow: 1;
  /* padding: 3em; */
  padding: 1em;
  .demo-app .fc {
    overflow: hidden !important;
  }
}
</style>

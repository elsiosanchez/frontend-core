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
  <div v-loading="isLoading">
    <el-drawer
      v-if="!isPanel"
      :visible.sync="showContainerInfo"
      :with-header="true"
      :before-close="showPanel"
      :size="isDrawerWidth"
      class="drawer-panel-info"
    >
      <span slot="title">
        <svg-icon icon-class="tab" style="margin-right: 10px;" />
        {{ $t('window.containerInfo.log.tab') }}
      </span>
      <panel-info
        v-if="showContainerInfo"
        :all-tabs-list="allTabsList"
        :show-container-info="showContainerInfo"
        :container-manager="containerManager"
        :current-record="currentRecordLogs"
        :is-accounting-info="isAccountingInfo"
        :default-opened-tab="defaultNameTab"
      />
    </el-drawer>
    <div class="tab-options-container-calendar">
      <advanced-tab-query
        v-if="!isPanel"
        :parent-uuid="parentUuid"
        :container-uuid="containerUuid"
        :container-manager="containerManager"
        :id-display-definition="filter.id"
        style="float: right;"
      />
      <tab-options
        v-if="!isPanel"
        :container-manager="containerManager"
        :parent-uuid="parentUuid"
        :container-uuid="containerUuid"
        :current-tab-uuid="currentTabUuid"
      />
    </div>
    <div class="demo-app">
      <div class="demo-app-sidebar">
        <div class="demo-app-sidebar-section">
          <h2 style="padding-left: 10px; padding-top: 10px;">
            {{ $t('component.calendar.allEvents') }} ({{ isPanel ? tabCurrentEvents.length : currentEvents.length }})
          </h2>
          <ul>
            <li
              v-for="event in (isPanel ? tabCurrentEvents : currentEvents)"
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
      <div class="demo-app-main">
        <FullCalendar
          ref="calendarRef"
          class="demo-app-calendar"
          :options="calendarOptions"
        >
          <template v-slot:eventContent="arg">
            <div>
              <b>{{ arg.timeText }}</b>
              <i>{{ arg.event.title }}</i>
            </div>
          </template>
        </FullCalendar>
      </div>
    </div>

    <modal-calendar
      :is-panel="isPanel"
    />
  </div>
</template>
<script>
import lang from '@/lang'
import store from '@/store'
import router from '@/router'
import {
  defineComponent,
  computed,
  ref
} from '@vue/composition-api'

import FullCalendar from '@fullcalendar/vue'
import esLocale from '@fullcalendar/core/locales/es'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import ModalCalendar from './modal.vue'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import TabOptions from '@/components/ADempiere/TabManager/TabOptions.vue'
import AdvancedTabQuery from '@/views/ADempiere/CalendarView/advancedTabQuery.vue'

// Constants
import { createEventId } from './event-utils'

// Utils and Helper Methods
import { translateDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'CalendarView',

  components: {
    FullCalendar,
    ModalCalendar,
    TabOptions,
    AdvancedTabQuery,
    PanelInfo: () => import('@/components/ADempiere/PanelInfo')
  },
  props: {
    isPanel: {
      type: Boolean,
      default: true
    },
    containerManager: {
      type: Object,
      required: false
    },
    parentUuid: {
      type: String,
      required: false
    },
    containerUuid: {
      type: String,
      required: false
    },
    currentTabUuid: {
      type: String,
      required: false
    },
    allTabsList: {
      type: Array,
      required: false
    },
    tabsList: {
      type: Array,
      default: () => []
    },
    // used only window
    isAccountingInfo: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const currentRoute = router.app._route
    const currentRecordLogs = ref({})
    const calendarRef = ref(null)
    const defaultNameTab = computed(() => {
      return store.getters.getDefaultOpenedTab
    })
    const isLoading = computed(() => {
      return store.getters.getIsLoadingTasksEvents
    })
    const currentEvents = computed(() => {
      return store.getters.getListTasksEvents
    })
    const tabCurrentEvents = computed(() => {
      return store.getters.getTabInfo
    })
    const showContainerInfo = computed(() => {
      return store.getters.getShowLogs
    })
    const isMobile = computed(() => {
      return store.state.app.device === 'mobile'
    })
    const isDrawerWidth = computed(() => {
      if (isMobile.value) {
        return '100%'
      }
      return '65%'
    })
    const calendarOptions = computed(() => {
      return {
        plugins: [
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          listPlugin
        ],
        locale: esLocale,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        initialView: 'dayGridMonth',
        events: (props.isPanel ? tabCurrentEvents.value : currentEvents.value).map(data => {
          const { id, title, description, valid_from, valid_to } = data
          return {
            id,
            description,
            title,
            start: parse(valid_from),
            end: parse(valid_to)
          }
        }),
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        select: handleDateSelect(),
        eventClick: handleEventClick
      }
    })
    /**
     * Methods
     */
    function parse(dateToParse) {
      const parts = dateToParse.split('T')[0].split('-')
      return `${parts[0]}-${parts[1]}-${parts[2]}`
    }

    const handleEventClick = (info) => {
      store.commit('setSelectedDate', {
        title: info.event.title,
        start: info.event.start,
        end: info.event.end,
        value: info.event.id,
        location: info.event.extendedProps.location,
        description: info.event.extendedProps.description
      })
      store.commit('setShowModal', true)
    }
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

    const displayDefinition = computed(() => {
      return store.getters.getDefinition
    })
    const filter = displayDefinition.value.find(display => display.display_type === 'C')

    const { query, params } = currentRoute
    const recordId = computed(() => {
      if (!isEmptyValue(query) && !isEmptyValue(query.recordId)) return query.recordId
      if (!isEmptyValue(params) && !isEmptyValue(params.recordId)) return params.recordId
      return -1
    })
    const tableName = computed(() => {
      const { currentTab } = store.getters.getContainerInfo
      if (!isEmptyValue(currentTab) && !isEmptyValue(currentTab.table_name)) return currentTab.table_name
      return ''
    })
    function searchListCalendars() {
      if (!isEmptyValue(displayDefinition.value)) {
        const filter = displayDefinition.value.find(display => display.display_type === 'C')
        let filters
        if (props.isPanel) {
          filters = [{ name: [tableName.value] + '_ID', values: recordId.value }]
          filters = JSON.stringify(filters)
        }
        store.dispatch('getListCalendars', {
          id: filter.id,
          filters,
          isPanel: props.isPanel
        })
      }
    }
    const goToEventDate = (event) => {
      const calendarApi = calendarRef.value.getApi()
      if (event.valid_from) {
        calendarApi.gotoDate(event.valid_from)
      }
    }
    function showPanel() {
      store.commit('setShowLogs', !showContainerInfo.value)
    }
    searchListCalendars()
    return {
      recordId,
      showContainerInfo,
      isDrawerWidth,
      isLoading,
      filter,
      currentEvents,
      calendarOptions,
      calendarRef,
      currentRecordLogs,
      defaultNameTab,
      tabCurrentEvents,
      handleEventClick,
      translateDate,
      goToEventDate,
      showPanel
    }
  }
})
</script>

<style lang='scss'>
.demo-app {
  display: flex !important;
  min-height: 100%;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;

  .demo-app-sidebar {
    width: 300px;
    line-height: 1.5;
    background: #eaf9ff;
    border-right: 1px solid #d3e2e8;
    h2 {
      margin: 0;
      font-size: 16px;
    }

    ul {
      overflow: auto;
      height: calc(100vh - 180px);
      padding: 0px 5px;
      margin: 0;
    }

    li {
      margin: 0.5em 0;
      padding: 0;
    }

    b { /* used for event dates/times */
      margin-right: 3px;
    }
  }

  .demo-app-main {
    flex-grow: 1;
    /* padding: 3em; */
    padding: 1em;

    .demo-app-sidebar-section {
      padding: 2em;
    }
  }

  .fc { /* the calendar root */
    /* max-width: 1100px; */
    margin: 0 auto;
    /* max-width: auto; */
    width: auto;
    height: 100% !important;
    overflow: auto;
    display: block;
  }
}

.custom-card-calendar {
  margin: 0px;
  cursor: pointer;
  padding-top: 10px;
}
.custom-card-calendar:hover {
  background-color: #eaf5fe;
  border: 1px solid #36a3f7;
}
.fc .fc-more-popover .fc-popover-body{
  overflow-y: scroll;
  height: 250px;
}
.fc-view-harness .fc-view-harness-active {
  overflow: hidden;
  height: 350px;
}
.tab-options-container-calendar {
  position: relative;
  left: 0;
  right: 0;
  z-index: 10;
  background: #ffffff;
  padding: 1rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

</style>

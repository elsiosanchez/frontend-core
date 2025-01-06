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
  <div class="demo-app">
    <div class="demo-app-sidebar">
      <!-- <div class="demo-app-sidebar-section">
        <label>
          <input
            type="checkbox"
            :checked="calendarOptions.weekends"
            @change="handleWeekendsToggle"
          />
          toggle weekends
        </label>
      </div> -->
      <div class="demo-app-sidebar-section">
        <h2 style="padding-left: 10px;padding-top: 10px;">
          {{ $t('component.calendar.allEvents') }} ({{ currentEvents.length }})
        </h2>

        <ul>
          <li v-for="event in currentEvents" :key="event.id">
            <el-card
              shadow="never"
              class="custom-card-calendar"
              :body-style="{ padding: '5px' }"
            >
              <b>
                <i>{{ '( ' + event.title + ' )' }}</i>
              </b>
              <p style="font-size: 14px;">
                {{ event.description }}
              </p>
              <p style="text-align: left;color: gray;font-size: 12px;margin: 0px;">
                {{ translateDate({
                  value: event.valid_from,
                  format: event.valid_to.length > 10 ? 'short' : 'onlyDate'
                }) }}
              </p>
            </el-card>
          </li>
        </ul>
      </div>
    </div>
    <div class="demo-app-main">
      <FullCalendar
        class="demo-app-calendar"
        :options="calendarOptions"
      >
        <template v-slot:eventContent="arg">
          <b>{{ arg.timeText }}</b>
          <i>{{ arg.event.title }}</i>
        </template>
      </FullCalendar>
    </div>
    <modal-calendar />
  </div>
</template>

<script>
import lang from '@/lang'
import store from '@/store'
import {
  defineComponent,
  computed
  // ref
} from '@vue/composition-api'

// Components and Mixins
import FullCalendar from '@fullcalendar/vue'
import esLocale from '@fullcalendar/core/locales/es'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import ModalCalendar from './modal.vue'
import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'

// Constants
import { createEventId } from './event-utils'

// Utils and Helper Methods
import { translateDate } from '@/utils/ADempiere/formatValue/dateFormat'

export default defineComponent({
  name: 'CalendarView',

  components: {
    FullCalendar,
    ModalCalendar
  },
  setup() {
    /**
     * Ref
     */
    // const currentEvents = ref([])
    /**
     * Computed
     */
    const currentEvents = computed(() => {
      return store.getters.getListTasksEvents
    })

    const calendarOptions = computed(() => {
      return {
        plugins: [
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin, // needed for dateClick
          listPlugin
        ],
        locale: esLocale,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          // to right buttons, not space
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        initialView: 'dayGridMonth',
        events: currentEvents.value.map(list => {
          const { id, title, description, valid_from, valid_to } = list
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
        // eventClick: handleEventClick(),
        eventsSet: handleEvents(),
        // dateClick: function(info) {
        //   console.log(info)
        // },
        eventClick: handleEventClick
      }
    })
    const tableName = computed(() => {
      const { currentTab } = store.getters.getContainerInfo
      if (!isEmptyValue(currentTab) && !isEmptyValue(currentTab.table_name)) return currentTab.table_name
      return ''
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
        value: info.event.extendedProps.value,
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

    // function handleEventClick(clickInfo) {
    //   if (confirm(`${lang.t('component.calendar.deleteEventConfirm')} '${clickInfo.event.title}'`)) {
    //     clickInfo.event.remove()
    //   }
    // }

    function handleEvents(events) {
      currentEvents.value = events
    }

    const displayDefinition = computed(() => {
      return store.getters.getDefinition
    })
    function searchListCalendars() {
      if (!isEmptyValue(displayDefinition.value)) {
        const filter = displayDefinition.value.find(display => display.display_type === 'C')
        store.dispatch('getListCalendars', {
          id: filter.id
        })
      }
    }
    searchListCalendars()
    return {
      // Ref
      currentEvents,
      // Computed
      calendarOptions,
      tableName,
      displayDefinition,
      // Methods
      handleDateSelect,
      handleEventClick,
      handleEvents,
      translateDate,
      searchListCalendars,
      //
      esLocale,
      listPlugin,
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin
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
    height: 100%;
    overflow: auto;
    display: block;
  }
}

.custom-card-calendar {
  margin: 0px;
  cursor: pointer;
}
.custom-card-calendar:hover {
  background-color: #eaf5fe;
  border: 1px solid #36a3f7;
}
</style>

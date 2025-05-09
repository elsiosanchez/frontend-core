/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
 * Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
 * Contributor(s): Edwin Betancourt EdwinBetanc0urt@outlook.com https://github.com/EdwinBetanc0urt
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export const DISPLAY_DEFINITION_RESOURCE = 'R'

export function parseDate(dateToParse) {
  if (isEmptyValue(dateToParse)) {
    return null
  }
  // const parts = dateToParse.split('T')
  // const dates = parts.at(0).split('-')
  // const times = parts.at(1).replace('Z', '')
  // return `${dates[0]}-${dates[1]}-${dates[2]}T` + times
  // return dateToParse.replace('Z', '')
  return dateToParse
}

/**
 * Return new events on group with start as min date child, and end as max date child
 * @param {array} resourcesList
 * @param {array} eventsList
 * @returns {array}
 */
export function addGroupEvents(resourcesList, eventsList) {
  const eventsGroups = []
  resourcesList.forEach(group => {
    const childsIds = group.children.map(child => child.id)
    // Filter events belonging to children
    const childEvents = eventsList.filter(eventItem => childsIds.includes(eventItem.resourceId))
    if (childEvents.length > 0) {
      const startDate = isEmptyValue(childEvents.map(eventItem => new Date(eventItem.start))) ? '' : childEvents.map(eventItem => new Date(eventItem.start))
      const endDate = isEmptyValue(childEvents.map(eventItem => new Date(eventItem.end))) ? '' : childEvents.map(eventItem => new Date(eventItem.end))
      const minDate = new Date(Math.min(...startDate))
      const maxDate = new Date(Math.max(...endDate))
      // Create a new event for the group
      const newEventGroup = {
        id: group.id, // Group ID
        title: group.title,
        start: minDate.toISOString(),
        end: maxDate.toISOString(),
        resourceId: group.id // Assign group ID
      }
      // Add the new event to the event array
      eventsGroups.push(newEventGroup)
    }
  })
  return eventsGroups
}

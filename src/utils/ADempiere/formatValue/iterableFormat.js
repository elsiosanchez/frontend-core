/**
 * ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
 * Copyright (C) 2018-Present E.R.P. Consultores y Asociados, C.A. www.erpya.com
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
import { getTypeOfValue, isEmptyValue } from '@/utils/ADempiere/valueUtils'

/**
 * Convert array pairs of object to literal object { key: value }
 * @param {array} array, Array to convert
 * @param {string} keyName, name from key in pairs
 * @param {string} valueName, name from value in pairs
 * @returns {object} { key: value, key2: value2 }
 */
export function convertArrayKeyValueToObject({
  array,
  keyName = 'columnName',
  valueName = 'value'
}) {
  const result = {}
  array.forEach(element => {
    result[element[keyName]] = element[valueName]
  })

  return result
}

/**
 * Convert a object to array pairs
 * @param {object} object, object to convert
 * @param {string} nameKey, name from key in pairs
 * @param {string} nameValue, name from value in pairs
 * @returns {array} [ { nameKey: key, nameValue: value } ]
 */
export function convertObjectToKeyValue({
  object,
  keyName = 'columnName',
  valueName = 'value'
}) {
  if (isEmptyValue(object)) {
    return []
  }
  return Object.keys(object).map(key => {
    const returnPairs = {}
    returnPairs[keyName] = key

    let val = object[key]
    if (getTypeOfValue(val) === 'OBJECT') {
      val = val.value
    }
    returnPairs[valueName] = val
    return returnPairs
  })
}

/**
 * Return key_value_key2_value_2
 * @param {object} object
 * @param {string} separathor
 * @returns {string}
 */
export function convertObjectToString({
  object = {},
  separathor = ''
}) {
  if (isEmptyValue(object)) {
    return separathor
  }

  let str = ''
  Object.keys(key => {
    str += separathor + key + object[key]
  })

  return str
}

/**
 * Detect if is same size of lenth
 * @param {array} arrayA
 * @param {arrayB} arrayB
 * @returns {boolean}
 */
export function isSameSize(arrayA, arrayB) {
  if (isEmptyValue(arrayA) && isEmptyValue(arrayB)) {
    return true
  }
  if (isEmptyValue(arrayA)) {
    return isEmptyValue(arrayB)
  }
  if (isEmptyValue(arrayB)) {
    return isEmptyValue(arrayA)
  }
  return arrayA.length === arrayB.length
}

/**
 * Convert map of pairs to literal object
 * @param {object} object
 * @returns {map}
 */
export function convertObjectToHasMap({
  object = {}
}) {
  return new Map(
    Object.entries(object)
  )
}

/**
 * Convert map of pairs to literal object
 * @param {map} hasMapToConvert
 * @returns {object} { key: value, key2: value2 }
 */
export function convertHasMapToObject({ map }) {
  return Object.fromEntries(map)
  // const result = {}
  // map.forEach((value, key) => {
  //   result[key] = value
  // })
  // return result
}

/**
 * Merge multiple arrays with objects
 * @param {String} key unique value to compare
 * @param {Array} arrays ideterminate params as arrays
 * @returns sigle array without repeat items
 */
export function mergeArrays(key = 'uuid', ...arrays) {
  const uniqueKeys = new Set()
  const mergedArray = []

  // Function to add elements of an array to the mergedArray if they are not already included.
  function addUniqueItemsFromArray(array) {
    if (!Array.isArray(array)) {
      // Ensures that it is an array
      return
    }
    for (const item of array) {
      // Use the dynamic key
      if (item?.[key] && !uniqueKeys.has(item[key])) {
        mergedArray.push(item)
        uniqueKeys.add(item[key])
      }
    }
  }

  // Adds elements from all provided arrays (filters out invalid arrays)
  arrays.filter(Array.isArray).forEach(addUniqueItemsFromArray)

  return mergedArray
}

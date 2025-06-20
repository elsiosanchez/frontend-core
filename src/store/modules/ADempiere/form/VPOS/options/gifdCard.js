// ADempiere-Vue (Frontend) for ADempiere ERP & CRM Smart Business Solution
// Copyright (C) 2023-Present E.R.P. Consultores y Asociados, C.A.
// Contributor(s): Elsio Sanchez elsiosanchez15@outlook.com https://github.com/elsiosanchez
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// import lang from '@/lang'
// API Request Methods
import {
  getValidGiftCard
} from '@/api/ADempiere/form/VPOS'
// Utils and Helper Methods
// import { isEmptyValue } from '@/utils/ADempiere/valueUtils.js'
import { showMessage } from '@/utils/ADempiere/notification'

const gifdCard = {
  currentGiftCard: {}
}

export default {
  state: gifdCard,
  mutations: {
    setCurrentGiftCard(state, gifdCard) {
      state.currentGiftCard = gifdCard
    }
  },
  /**
   * Gift Card
   */
  actions: {
    findGiftCard({
      getters,
      commit
    }, searchValue) {
      return new Promise(resolve => {
        const currentPos = getters.getVPOS
        getValidGiftCard({
          posId: currentPos.id,
          searchValue
        })
          .then(response => {
            commit('setCurrentGiftCard', response)
            resolve(response)
          })
          .catch(error => {
            console.warn(`error: ${error.message}. Code: ${error.code}.`)
            commit('setCurrentGiftCard', {})

            showMessage({
              type: 'error',
              message: error.message,
              showClose: true
            })
            resolve({})
          })
          .finally(() => {
            resolve({})
          })
      })
    }
  },
  getters: {
    getGiftCardSearch: (state) => {
      return state.currentGiftCard
    }
  }
}

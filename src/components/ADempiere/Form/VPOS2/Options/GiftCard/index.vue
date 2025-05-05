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
  <el-main
    class="product-list-content"
  >
    <el-form
      label-position="top"
      label-width="10px"
      @submit.native.prevent="notSubmitForm"
    >
      <el-form-item
        :label="$t('form.productInfo.codeProduct')"
        style="width: 100%"
      >
        <el-autocomplete
          v-model="searchProduct"
          style="width: 100%"
          popper-class="my-autocomplete"
          :fetch-suggestions="querySearch"
          :placeholder="$t('quickAccess.searchWithEnter')"
          @select="handleSelect"
        >
          <template slot-scope="{ item }">
            <div class="header" style="margin: 0px">
              <b> {{ item.product.value }} - {{ item.product.name }} </b>
            </div>
            <div style="margin: 0px">
              <div style="float: left;width: 70%;margin: 0px">
                <p style="overflow: hidden;text-overflow: ellipsis;text-align: inherit;margin: 0px">
                  {{ item.product.upc }} <br>
                  {{ item.product.description }}
                </p>
              </div>
              <div style="width: 30%;float: right;margin: 0px">
                <p style="overflow: hidden;text-overflow: ellipsis;text-align: end;margin: 0px">
                  {{ formatQuantity({ value: item.remaining_quantity }) }}
                </p>
              </div>
            </div>
          </template>
        </el-autocomplete>
      </el-form-item>
    </el-form>

    <span class="table-pos-dialogo">
      <el-table
        :data="giftCardLines"
        :empty-text="$t('quickAccess.searchWithEnter')"
        border
        fit
        highlight-current-row
        @row-click="selectLine"
        @row-dblclick="exitLine"
        @current-change="currentLine"
      >
        <el-table-column
          header-align="center"
          prop="product.value"
          :label="$t('form.productInfo.code')"
          width="80"
        />

        <el-table-column
          header-align="center"
          prop="product.name"
          :label="$t('form.pos.tableProduct.product')"
          width="300px"
        />

        <el-table-column
          header-align="center"
          prop="quantity"
          :label="$t('form.pos.tableProduct.quantity')"
          align="right"
        >
          <template slot-scope="scope">
            <edit-qty-entered
              v-if="scope.row.isEditQty"
              :qty="convertToNumber(scope.row.quantity_entered)"
              :handle-change="updateQuantity"
            />
            <span v-else>
              <p style="margin: 0px !important;">
                {{ formatQuantity({ value: scope.row.quantity_entered }) }}
              </p>
            </span>
          </template>
        </el-table-column>

        <el-table-column
          header-align="center"
          prop="uom.uom.name"
          :label="$t('form.pos.tableProduct.uom')"
        />

        <!-- <el-table-column
          header-align="center"
          prop="quantity"
          :label="$t('form.pos.tableProduct.movementQuantity')"
          align="right"
        >
          <template slot-scope="scope">
            <p style="margin: 0px !important;">
              {{ formatQuantity({ value: scope.row.movement_quantity }) }}
            </p>
          </template>
        </el-table-column> -->

        <el-table-column
          :label="$t('form.pos.tableProduct.options')"
          align="center"
          header-align="center"
          width="120px"
        >
          <template slot-scope="scope">
            <p style="margin: 0px !important;">
              <shipping-line-info
                :info-line="scope.row"
              />
              <el-button
                size="mini"
                type="text"
                style="margin-left: 2px;font-size: 12px;padding: 0px 5px;color: #ff4949;"
                :disabled="scope.row.isLoading"
                @click="deleteLine(scope.row)"
              >
                <i v-if="!scope.row.isLoading" class="el-icon-delete" />
                <i v-else class="el-icon-loading" />
              </el-button>
            </p>
          </template>
        </el-table-column>
      </el-table>
    </span>
  </el-main>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'
import store from '@/store'

// // Components and Mixins
import shippingLineInfo from '@/components/ADempiere/Form/VPOS2/Options/GiftCard/lineInfo.vue'
import editQtyEntered from '@/components/ADempiere/Form/VPOS2/MainOrder/OptionLine/editLine/editQtyEntered.vue'

// Utils and Helper Methods
import { convertToNumber, formatQuantity } from '@/utils/ADempiere/formatValue/numberFormat'
import { isEmptyValue } from '@/utils/ADempiere'

export default defineComponent({
  name: 'GiftCard',
  components: {
    shippingLineInfo,
    editQtyEntered
  },
  setup() {
    const currentGiftCard = computed(() => {
      return store.getters.getCurrentGiftCard
    })
    const searchProduct = ref('')
    const line = ref({})

    const giftCardLines = computed(() => {
      return currentGiftCard.value.gift_card_lines
    })

    const listproduct = computed(() => {
      return subtractQuantities(store.getters.getListOrderLines, giftCardLines.value)
    })

    // // Methods

    function subtractQuantities(orderLines, giftCardLines) {
      const linesMap = new Map(giftCardLines.map(({ order_line_id, movement_quantity }) => [order_line_id, parseFloat(movement_quantity)]))
      return orderLines
        .map(orderLine => {
          const quantityOrdered = parseFloat(orderLine.quantity_ordered)
          const movementQuantity = linesMap.get(orderLine.id) || 0
          const remainingQuantity = (quantityOrdered - movementQuantity).toFixed(2)
          return { ...orderLine, remaining_quantity: remainingQuantity }
        })
        .filter(({ remaining_quantity }) => parseFloat(remaining_quantity) > 0)
    }

    // /**
    //  * Query Search
    //  */
    function querySearch(queryString, callback) {
      var results = queryString ? listproduct.value.filter(productFilter(queryString)) : listproduct.value
      callback(results)
    }

    function productFilter(queryString) {
      return (link) => {
        const search = queryString.toLowerCase()
        return link.product.value.toLowerCase().includes(search) || link.product.name.toLowerCase().includes(search) || link.product.upc.toLowerCase().includes(search)
      }
    }

    function handleSelect(item) {
      let quantityEntered = 1
      const isProductinTable = giftCardLines.value.find(line => line.product.id === item.product.id)
      if (!isEmptyValue(isProductinTable) && !isEmptyValue(isProductinTable.quantity_entered)) {
        quantityEntered = convertToNumber(isProductinTable.quantity_entered) + 1
      }
      const {
        id,
        total_amount_with_tax
      } = item
      store.dispatch('newGiftCardLine', {
        quantityEntered, // quantity_ordered,
        amount: total_amount_with_tax,
        giftCardId: currentGiftCard.value.id,
        orderLineId: id
      })
    }

    function selectLine(row, column, event) {
      const { property } = column
      if (property === 'quantity') {
        row.isEditQty = true
      }
    }

    function exitLine(row, column, event) {
      const { property } = column
      if (property === 'quantity') {
        row.isEditQty = false
      }
    }

    function updateQuantity(quantity) {
      store.dispatch('updateGiftCardLine', {
        lineId: line.value.id,
        giftCardId: currentGiftCard.value.id,
        quantityEntered: quantity
      })
    }

    function currentLine(currentRow, oldCurrentRow) {
      line.value = currentRow
    }

    function deleteLine(line) {
      line.isLoading = true
      store.dispatch('removeGiftCardLine', {
        lineId: line.id,
        giftCardId: currentGiftCard.value.id
      })
        .then(() => {
          line.isLoading = false
        })
    }

    return {
      // Ref
      searchProduct,
      // Computed
      listproduct,
      giftCardLines,
      currentGiftCard,
      // Methods
      exitLine,
      selectLine,
      deleteLine,
      querySearch,
      currentLine,
      handleSelect,
      productFilter,
      updateQuantity,
      convertToNumber,
      formatQuantity
    }
  }
})
</script>

<style lang="scss">
.product-list-content {
  padding-top: 0px;
}
.el-autocomplete-suggestion li {
  line-height: 20px;
}
.table-pos-dialogo {
  height: 100%;
  overflow: auto;
  .el-table {
    height: calc(80vh - 330px) !important;
    overflow: hidden !important;
  }
  .el-table .el-table__cell {
    padding: 0px !important;
    line-height: 1.5 !important;
  }
  .el-table .success-row {
    background: #e8f4ff;
  }
  .el-table .cell {
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    line-height: 1.5 !important;
  }
  .el-table .cell:hover {
    border: 1px solid blue;
    overflow: hidden;
  }
  .el-table th.el-table__cell > .cell{
    padding-left: 5px !important;
    padding-right: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }
}
</style>

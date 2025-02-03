<template>
  <div>
    <div :style="textContainerStyle">
      <p style="margin: 0px;">{{ displayedText }}</p>
    </div>
    <el-button
      v-if="isTruncated"
      type="text"
      style="padding-top: 0px !important;margin-left: 1px !important;"
      @click="toggleText"
    >
      {{ buttonText }}
    </el-button>
  </div>
</template>

<script>

import { defineComponent, computed, ref } from '@vue/composition-api'

import lang from '@/lang'

// Utils and Helper Methods
import { isEmptyValue } from '@/utils/ADempiere/valueUtils'

export default defineComponent({
  name: 'TextTruncation',

  props: {
    fullText: {
      type: String,
      required: false
    },
    maxWords: {
      type: Number,
      default: 30 // Número de palabras para truncar
    },
    maxLines: {
      type: Number,
      default: 2 // Número de líneas a mostrar
    }
  },

  setup(props) {
    // Ref
    const isExpanded = ref(false)

    // Computed
    const displayedText = computed(() => {
      if (isEmptyValue(props.fullText)) return ''
      return isExpanded.value ? props.fullText : truncateText(props.fullText)
    })
    const buttonText = computed(() => isExpanded.value ? lang.t('component.displayDefinition.seeLess') : lang.t('component.displayDefinition.seeMore'))
    const isTruncated = computed(() => {
      if (isEmptyValue(props.fullText)) return false
      return props.fullText.split(' ').length > props.maxWords
    })
    const textContainerStyle = computed(() => ({
      maxHeight: isExpanded.value ? 'none' : `${props.maxLines * 1.2}em`, // Ajusta la altura máxima para mostrar el número de líneas
      overflow: 'hidden'
    }))

    // Methods
    const toggleText = () => {
      isExpanded.value = !isExpanded.value
    }
    const truncateText = (text) => {
      if (!isTruncated.value) return text
      return text.split(' ').slice(0, props.maxWords).join(' ') + '...  '
    }
    return {
      // Ref
      isExpanded,
      // Computed
      displayedText,
      buttonText,
      isTruncated,
      textContainerStyle,
      // Methods
      toggleText,
      truncateText
    }
  }
})
</script>

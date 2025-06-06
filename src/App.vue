<template>
  <div class="app-container">
    <el-row v-if="isShow && showEnvironmentBar" :class="environmentClass" class="environment-bar">
      <el-col :span="23">
        <p style="text-align: center;margin: 0px;">
          {{ environmentMessage }}
        </p>
      </el-col>
      <el-col :span="1">
        <b
          style="color: red;cursor: pointer;"
          @click="isShow = false"
        >
          <i class="el-icon-close" />
        </b>
      </el-col>
    </el-row>
    <div id="app">
      <modal-idle
        v-if="isSession && isIdle"
        :is-idle="isIdle"
      />
      <router-view />
    </div>
  </div>
</template>

<script>
// components and mixins
import ModalIdle from '@/components/ADempiere/ModalIdle'

export default {
  name: 'App',

  components: { ModalIdle },

  data() {
    return {
      isShow: true
    }
  },

  computed: {
    showEnvironmentBar() {
      return ['qa', 'dev'].includes(process.env.VUE_APP_GENERAL_SERVICE_TYPE)
    },
    environmentClass() {
      return {
        'env-qa': process.env.VUE_APP_GENERAL_SERVICE_TYPE === 'qa',
        'env-dev': process.env.VUE_APP_GENERAL_SERVICE_TYPE === 'dev'
      }
    },
    environmentMessage() {
      return process.env.VUE_APP_GENERAL_SERVICE_TYPE === 'dev'
        ? this.$t('dev')
        : this.$t('qa')
    },
    isIdle() {
      return this.$store.state.idleVue.isIdle
    },
    isSession() {
      return this.$store.getters['user/getIsSession']
    },
    getRole() {
      return this.$store.getters['user/getRole']
    },
    getResourceName() {
      if (this.isEmptyValue(this.getRole) && this.isEmptyValue(this.getRole.client)) {
        return ''
      }
      return this.$store.getters['user/getRole'].client.logo
    },
    defaultImageLogo() {
      return require('@/image/ADempiere/logo.jpg')
    },
    nameSystem() {
      const { name } = this.$store.getters['user/getSystem']
      if (!this.isEmptyValue(name)) {
        return name
      }
      return 'ADempiere'
    }
  },

  async mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.getWindowWidth)
      window.addEventListener('resize', this.getWindowHeight)

      this.getWindowWidth()
      this.getWindowHeight()
    })
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.getWindowWidth)
    window.removeEventListener('resize', this.getWindowHeight)
  },

  methods: {
    getWindowWidth(event) {
      this.$store.dispatch('setWidth', document.documentElement.clientWidth)
    },
    getWindowHeight(event) {
      this.$store.dispatch('setHeight', document.documentElement.clientHeight)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0px
}
.environment-bar {
  width: 100%;
  padding: 10px 0;
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
  &.env-qa {
    background-color: #FFEB3B;
    color: #000000;
    border-bottom: 2px solid #FFC107;
  }
  &.env-dev {
    background-color: #FF8940;
    color: #FFFFFF;
    border-bottom: 2px solid #f8701c;
  }
}
#app {
  flex-grow: 1;
  overflow: auto;
  position: relative;
}
</style>

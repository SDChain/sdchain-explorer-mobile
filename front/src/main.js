import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueI18n from 'vue-i18n'
import {Lang} from './lang'
import axios from './common/axios'
import config from './config'
import {Message} from 'iview'
import VueClipboard from 'vue-clipboard2'
import 'iview/dist/styles/iview.css'
import './assets/css/main.less'
Vue.config.productionTip = false
Vue.use(VueI18n)
Vue.use(VueClipboard)
Vue.prototype.$Message = Message
Vue.prototype.$axios = axios
Vue.prototype.$config = config

const i18n = new VueI18n({
  locale: localStorage.Lang ||'en',
  messages:{
    ...Lang
  }
})

Vue.mixin({
  methods: {
    getTradeType(type) {
      return type == 'Payment'
              ? this.$t('common.payment')
              : type == 'OfferCreate'
              ? this.$t('common.offerCreate')
              : type == 'OfferCancel'
              ? this.$t('common.offerCancel')
              : type == 'AccountSet'
              ? this.$t('common.accountSet')
              : type == 'TrustSet'
              ? this.$t('common.trustSet')
              : type == 'MultiPayment'
              ? this.$t('common.multiPayment')
              : this.$t('common.other')
    }
  }
})

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')

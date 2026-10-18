import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vue2-smart-datatable/styles.css'
import './styles/app.css'
import App from './App.vue'
import router from './router'

Vue.use(Vuetify)
Vue.config.productionTip = false

new Vue({
  router,
  vuetify: new Vuetify({
    theme: {
      themes: {
        light: {
          primary: '#3f51b5',
          secondary: '#546e7a',
          success: '#16794b',
          error: '#b42318',
          background: '#f5f7fb',
        },
      },
    },
  }),
  render: (createElement) => createElement(App),
}).$mount('#app')

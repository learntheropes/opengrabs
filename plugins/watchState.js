import jwt_decode from "jwt-decode";

export default async ({ app, $auth, $axios }) => {
  if ($auth.$state.loggedIn) {
    const cookies = $auth.$storage.getCookies()
    const lang = cookies.i18n_lang
    const auth = cookies['auth._token.auth0']
    const token = auth.replace('Bearer ', '')
    const jwt = jwt_decode(token)
    const logins_count = jwt['https://opengrabs.com/logins_count']
    if (logins_count === 1) {
      await app.$user.create(lang)
      await $axios.post('/api/user/management/lang', { lang }, {
        headers: { 'Authorization': auth }
      })
    }
  }

  // wait that bug is fixed https://github.com/nuxt-community/auth-module/issues/156#issuecomment-751308223
  // $auth.$storage.watchState('loggedIn', newValue => {
  //   if (newValue) {
  //     console.log('User signed in:', newValue)
  //   }
  // })
  }
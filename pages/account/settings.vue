<template>
  <section class="section container">
    <div class="columns is-centered">
      <div class="column is-one-third">
        <h2 class="title is-2">{{ data.name }}</h2>
        <div class="field">
          <label class="label">{{ $t('communicationEmail') }}</label>
          <div class="control">
            <input v-model="email" class="input" type="email" :readonly="readOnly" />
          </div>
          <p :class="emailClass">{{ emailMessage }}</p>
        </div >
        <b-field :label="$t('communicationLanguage')" :type="languageType" :message="languageMessage">
          <b-select v-model="selectedLenguage" :placeholder="$t('selectLanguage')" expanded>
            <option v-for="lang in emailLanguages" :key="lang.slug" :value="lang.slug">
              {{ lang.name }}
            </option>
          </b-select>
        </b-field>
        <div class="field">
          <div class="control">
            <button class="button is-link" @click="updateProfile">{{ $t('update') }}</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AccountSettings',
  async asyncData({ app }) {
    const { data } = await app.$axios.get(`https://${process.env.AUTH0_TENANT}.us.auth0.com/userinfo`)
    if (data.sub.split('|')[0] === 'vkontakte') data.name = `${data.given_name} ${data.family_name}`.replaceAll('-', ' ')
    const email = data.email
    const readOnly = email
    const user = await app.$db.user.get(data.sub)
    const emailLanguages = [
      {slug: 'EN', name: 'English'},
      {slug: 'ES', name: 'Spanish'},
      {slug: 'PT', name: 'Portuguese'},
      {slug: 'RU', name: 'Russian'}
    ]
    let selectedLenguage = null
    if (user.selected_lenguage) {
      selectedLenguage = user.selected_lenguage
    }
    return { data, email, emailLanguages, selectedLenguage, readOnly }
  },
  data: () => ({
    languageType: null,
    languageError: false,
    emailError: null,
    emailClass: "help"
  }),
  computed: {
    emailMessage() {
      if (this.emailError === 'Field required') return this.$t('requiredField')
      else return null
    },
    languageMessage() {
       if (this.languageError === 'Field required') return this.$t('requiredField')
      else return null      
    }
  },
  async mounted() {
    const strategy = this.$store.$auth.user.sub.split('|')[0]

    let user
    switch (strategy) {
    case 'facebook':
        user = {
            email: this.$store.$auth.user.email,
            name: this.$store.$auth.user.name,
            hash: null
        }
        break
    case 'vkontakte':
        user = {
            email: this.$store.$auth.user.email,
            name: `${this.$store.$auth.user.given_name} ${this.$store.$auth.user.family_name}`.replaceAll('-', ' '),
            hash: null                           
        }
        break
    }

    const { data: { hash }} = await this.$axios.get(`/api/crypto/sha256/${user.email}`)
    user.hash = hash

    this.$Tawk.$updateChatUser(user)

    const attribute = {
        'user-sub': this.$store.$auth.user.sub
    }
    // this.$Tawk.$setAttribute(attribute)
  },
  methods: {
    validateEmail() {
      if (!this.email) {
        this.emailError = 'Field required'
        this.emailClass = 'help is-danger'
        return false
      }
      return true
    },
    validateLanguage() {
      if (!this.selectedLenguage) {
        this.languageType = 'is-danger'
        this.languageError = 'Field required'
        return false
      }
      return true
    },
    updateProfile() {
      this.emailMessage = null
      this.emailClass = "help"
      const validEmail = this.validateEmail()
      this.languageType = null
      this.languageError = false
      const validLanguage = this.validateLanguage()
      if (validEmail && validLanguage) {
        this.$db.user.update({
          sub: this.data.sub,
          name: this.data.name,
          email: this.email,
          selected_lenguage: this.selectedLenguage
        })
      }
    }
  }
}
</script>

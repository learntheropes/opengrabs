<template>
  <section class="section container">
    <div class="columns is-centered">
      <div class="column is-one-third">
        <h2 class="title is-2">{{ data.name }}</h2>
        <div class="field">
          <label class="label">Communication Email</label>
          <div class="control">
            <input v-model="email" class="input" type="email" :readonly="readOnly" />
          </div>
        </div >
        <b-field label="Communication Language">
          <b-select v-model="selectedLenguage" placeholder="Select a language for the email communication" expanded>
            <option v-for="lang in emailLanguages" :key="lang.slug" :value="lang.slug">
              {{ lang.name }}
            </option>
          </b-select>
        </b-field>
        <div class="field">
          <div class="control">
            <button class="button is-link" @click="updateProfile">Update</button>
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
    if (data.sub.split('|')[0] === 'vkontakte') data.name = `${data.given_name} ${data.family_name}`.replace('-', ' ')
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
  async mounted() {
    const strategy = this.$store.$auth.user.sub.split('|')[0]

    let user
    switch (strategy) {
    case 'facebook':
        user = {
            email: this.$store.$auth.user.email,
            name: this.$store.$auth.user.name,
            // hash: null
        }
        break
    case 'vkontakte':
        user = {
            email: this.$store.$auth.user.email,
            name: `${this.$store.$auth.user.given_name} ${this.$store.$auth.user.family_name}`.replace('-', ' '),
            // hash: null                           
        }
        break
    }

    const { data: { hash }} = await this.$axios.get(`/api/crypto/sha256/${user.email}`)
    // user.hash = hash

    this.$Tawk.$updateChatUser(user)

    const attribute = {
        'user-sub': this.$store.$auth.user.sub
    }
    this.$Tawk.$setAttribute(attribute)
  },
  methods: {
    updateProfile() {
      this.$db.user.update({
        sub: this.data.sub,
        name: this.data.name,
        email: this.email,
        selected_lenguage: this.selectedLenguage
      })
    }
  }
}
</script>
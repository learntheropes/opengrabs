<template>
  <section class="section container">
    <div class="columns">
      <div class="column is-half">
        <div class="box">
          <div class="content">
            <p>Grab id: {{ ref }}</p>
            <p>Buyer: {{ grab.buyer.name }}</p>
            <p>Traveler: {{ grab.traveler.name }}</p>
            <p>Delivery date: {{ $moment(grab.delivery.date).fromNow() }} [{{ $utils.momentDate(grab.delivery.date) }}]</p>
            <p>Booked {{ $moment(grab.booked_at).fromNow() }}</p>
          </div>
          <b-field>
            <div class="buttons">
              <a v-if="isBookedAndBuyer" class="button is-primary" :href="'/account/pay/'+ref+'/'">Pay</a>
              <button v-if="isDisputable" class="button is-primary" @click="dispute">Dispute</button>
              <button v-if="isPaidAndTraveler" class="button is-primary" @click="bought">Mark as bought</button>
              <button v-if="isBoughtAndTraveler" class="button is-primary" @click="delivered">Mark as delivered</button>
              <button v-if="isDeliveredAndBuyer" class="button is-primary" @click="release">Release</button>
              <button v-if="isReleasedAndTraveler" class="button is-primary" :href="'/account/withdraw/'+ref+'/'">Withdraw</button>
            </div>
          </b-field>
        </div>
      </div>
      <div class="column is-half">
        <div v-if="isChatable" class="box">
          <b-field>
            <b-input v-model="message" maxlength="400" type="textarea"></b-input>
          </b-field>
          <b-field>
            <button class="button is-primary" @click="postMessage">Post chat message</button>
          </b-field>
          <div v-for="(msg, index) in messages" :key="index" class="content">
            <div v-if="msg.user_sub === me" class="notification">
              <span class="has-text-weight-semibold has-text-grey-light">Me </span>,<br>
              <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
              <p>{{ msg.content }}</p>
            </div>
            <div v-else class="notification has-text-right">
              <p>
                <span class="has-text-weight-semibold has-text-grey-light">{{ msg.name }} </span>,<br>
                <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
              </p>
              <p>{{ msg.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'GrabByRef',
  async asyncData({ app, params: { ref } }) {
    const grab = await app.$db.grabs.get(ref)
    const messages = await app.$db.messages.filter(ref)
    return { ref, grab, messages }
  },
  data() {
    return {
      message: null,
    }
  },
  computed: {
    me() {
      return this.$store.state.auth.user.sub
    },
    isChatable() {
      return (
        this.grab.status !== 'published' &&
        this.grab.status !== 'released' &&
        this.grab.status !== 'withdrawn'
      )
    },
    isDisputable() {
      return (
        this.grab.status !== 'published' &&
        this.grab.status !== 'released' &&
        this.grab.status !== 'withdrawn' &&
        this.grab.status !== 'disputed'
      )
    },
    isBookedAndBuyer() {
      return this.grab.status === 'booked' && this.me === this.grab.buyer.sub
    },
    isPaidAndTraveler() {
      return this.grab.status === 'paid' && this.me === this.grab.traveler.sub
    },
    isBoughtAndTraveler() {
      return this.grab.status === 'bought' && this.me === this.grab.traveler.sub
    },
    isDeliveredAndBuyer() {
      return this.grab.status === 'delivered' && this.me === this.grab.buyer.sub
    },
    isReleasedAndTraveler() {
      return (
        this.grab.status === 'released' && this.me === this.grab.traveler.sub
      )
    },
  },
  created() {
    setInterval(async () => {
      const messages = await this.$db.messages.filter(this.ref)
      this.messages = messages
    }, 1000 * 60 * 1)
  },
  methods: {
    getName() {
      if (this.$store.state.auth.user.sub.split('|')[0] === 'vkontakte') {
        return `${this.$store.state.auth.user.given_name} ${this.$store.state.auth.user.family_name}`.replace('-', ' ')
      } else {
        return this.$store.state.auth.user.name
      }
    },
    async postMessage() {
      const props = {
        posted_at: new Date().toISOString(),
        content: this.message,
        grab_id: this.ref,
        user_sub: this.$store.state.auth.user.sub,
        name: this.getName(),
      }
      await this.$db.messages.create({ props })
      const messages = await this.$db.messages.filter(this.ref)
      this.messages = messages
      this.message = null
    },
    async dispute() {
      await this.$grab.dispute({ ref: this.ref })
      this.grab = await this.$db.grabs.get(this.ref)
    },
    async bought() {
      await this.$grab.bought({ ref: this.ref })
      this.grab = await this.$db.grabs.get(this.ref)
    },
    async delivered() {
      await this.$grab.delivered({ ref: this.ref })
      this.grab = await this.$db.grabs.get(this.ref)
    },
    async release() {
      await this.$grab.release({ ref: this.ref })
      this.grab = await this.$db.grabs.get(this.ref)
    },
  },
}
</script>
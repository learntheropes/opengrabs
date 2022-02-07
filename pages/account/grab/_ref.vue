<template>
  <section class="section container">
    <div v-if="isBuyerOrTraveler" class="columns">
      <div class="column is-half">
        <h1 class="title">{{ $t('grab') }} {{ ref }}</h1>
        <div class="box">
          <div class="content">
            <p v-if="grab.buyer">{{ $t('buyer') }}: {{ grab.buyer.name }}</p>
            <p v-if="grab.traveler">{{ $t('traveler') }}: {{ grab.traveler.name }}</p>
            <p>{{ $t('product') }}: <a :href="grab.shop.url" target="_blank">{{ grab.shop.slug.replace(/-/g,' ') || grab.shop.title }}</a></p>
            <p>{{ $t('price') }}: {{ grab.shop.price.total.toFixed(2) }} {{ grab.shop.currency }}</p>
            <p v-if="grab.delivery">{{ $t('deliveryDate') }}: {{ $moment(grab.delivery.date).fromNow() }} [{{ $utils.momentDate(grab.delivery.date) }}]</p>
            <p v-if="grab.published_at">{{ $t('publishedAt') }} {{ $moment(grab.published_at).fromNow() }}</p>
            <p v-if="grab.booked_at">{{ $t('bookedAt') }} {{ $moment(grab.booked_at).fromNow() }}</p>
            <p v-if="grab.paid_at">{{ $t('paidAt') }} {{ $moment(grab.paid_at).fromNow() }}</p>
            <p v-if="grab.bought_at">{{ $t('boughtAt') }} {{ $moment(grab.bought_at).fromNow() }}</p>
            <p v-if="grab.delivered_at">{{ $t('deliveredAt') }} {{ $moment(grab.delivered_at).fromNow() }}</p>
            <p v-if="grab.released_at">{{ $t('releasedAt') }} {{ $moment(grab.released_at).fromNow() }}</p>
            <p v-if="grab.withdrawn_at">{{ $t('withdrawnAt') }} {{ $moment(grab.withdrawn_at).fromNow() }}</p>
            <p v-if="grab.refunded_at">{{ $t('refundedAt') }} {{ $moment(grab.refunded_at).fromNow() }}</p>
          </div>
          <b-field>
            <div class="buttons">
              <a v-if="isBookedAndBuyer" class="button is-primary" :href="'/account/pay/'+ref+'/'">{{ $t('pay') }}</a>
              <button v-if="isDisputable" class="button is-primary" @click="dispute">{{ $t('dispute') }}</button>
              <button v-if="isPaidAndTraveler" class="button is-primary" @click="bought">{{ $t('markAsBought') }}</button>
              <button v-if="isBoughtAndTraveler" class="button is-primary" @click="delivered">{{ $t('markAsDelivered') }}</button>
              <button v-if="isDeliveredAndBuyer" class="button is-primary" @click="release">{{ $t('release') }}</button>
              <button v-if="isReleasedAndTraveler" class="button is-primary" :href="'/account/withdraw/'+ref+'/'">{{ $t('withdraw') }}</button>
            </div>
          </b-field>
          <div v-if="isRatingPossible">
            <h5 class="title is-5">{{ $t('leaveAReviewFor') }} {{ partnerUsername }}</h5>
            <b-rate v-model="rate" :custom-text="$t('rating')"></b-rate>
            <b-field :label="$t('review')">
              <b-input v-model="review" maxlength="400" type="textarea"></b-input>
            </b-field>
            <b-field>
              <button class="button is-primary" @click="postReview">{{ $t('postReview') }}</button>
            </b-field>
          </div>
        </div>
      </div>
      <div class="column is-half">
        <div v-if="isChatable" class="box">
          <b-field :type="postType" :message="postMessage">
            <b-input v-model="message" maxlength="400" type="textarea"></b-input>
          </b-field>
          <b-field>
            <button class="button is-primary" @click="postChatMessage">{{ $t('postChatMessage') }}</button>
          </b-field>
          <div v-for="(msg, index) in messages" :key="index" class="content">
            <div v-if="msg.user_sub === 'admin|0'" class="notification has-text-centered is-primary">
              <span class="has-text-weight-semibold has-text-grey-light">{{ $t('admin') }} </span>,<br>
              <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
              <p v-if="msg.content === 'published'">{{ $t('statusPublished') }}</p>
              <p v-if="msg.content === 'removed'">{{ $t('statusRemoved') }}</p>
              <p v-if="msg.content === 'booked'">{{ $t('statusBooked') }}</p>
              <p v-if="msg.content === 'disputed'">{{ $t('statusDisputed') }}</p>
              <p v-if="msg.content === 'paid'">{{ $t('statusPaid') }}</p>
              <p v-if="msg.content === 'bought'">{{ $t('statusBought') }}</p>
              <p v-if="msg.content === 'delivered'">{{ $t('statusDelivered') }}</p>
              <p v-if="msg.content === 'released'">{{ $t('statusReleased') }}</p>
              <p v-if="msg.content === 'withdrawn'">{{ $t('statusWithdrawn') }}</p>
              <p v-if="msg.content === 'refunded'">{{ $t('statusRefunded') }}</p>       
            </div>
            <div else-if="msg.user_sub.split('|')[0] === 'admin'" class="notification has-text-centered is-primary">
              <span class="has-text-weight-semibold has-text-grey-light">{{ $t('admin') }} </span>,<br>
              <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
              <p>{{ msg.content }}</p>
            </div>
            <div v-if="msg.user_sub === me" class="notification">
              <span class="has-text-weight-semibold has-text-grey-light">{{ $t('me') }} </span>,<br>
              <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
              <p>{{ msg.content }}</p>
            </div>
            <div v-else class="notification has-text-right">
              <p>
                <span class="has-text-weight-semibold has-text-grey-light">{{ msg.user_username }} </span>,<br>
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
  name: 'GrabRef',
  async asyncData({ app, params: { ref }}) {
    const [isBuyerOrTraveler, grab, messages] = await Promise.all([
      app.$db.isBuyerOrTraveler(ref),
      app.$db.grabs.get(ref),
      app.$db.messages.filter(ref)
    ])
    return { ref, isBuyerOrTraveler, grab, messages }
  },
  data: () => ({
    message: null,
    postType: null,
    postError: false,
    rate: null,
    review: null
  }),
  computed: {
    postMessage() {
      if (this.postError === 'Field required') return this.$t('requiredField')
      else return null 
    },
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
      return this.grab.status === 'released' && this.me === this.grab.traveler.sub
    },
    isRatingPossible() {
      return this.grab.status === 'released' || this.grab.status === 'refunded'
    },
    partnerUsername() {
      if (this.$store.state.auth.user.sub === this.grab.buyer.sub) return this.grab.traveler.username
      else if (this.$store.state.auth.user.sub === this.grab.traveler.sub) return this.grab.buyer.username
      else return null    
    }
  },
  created() {
    setInterval(async () => {
      const messages = await this.$db.messages.filter(this.ref)
      this.messages = messages
    }, 1000 * 60 * 1)
  },
  methods: {
    getUsername() {
      if (this.$store.state.auth.user.sub === this.grab.buyer.sub) return this.grab.buyer.username
      else if (this.$store.state.auth.user.sub === this.grab.traveler.sub) return this.grab.traveler.username
    },
    validatePost() {
      if (!this.message) {
        this.postType = 'is-danger'
        this.postError = 'Field required'
        return false
      }
      return true
    },
    async postChatMessage() {
      this.postType = null
      this.postError = false
      const validPost = this.validatePost()
      if (validPost) {
        const props = {
          posted_at: new Date().toISOString(),
          content: this.message,
          grab_id: this.ref,
          user_sub: this.$store.state.auth.user.sub,
          user_username: this.getUsername(),
        }
        await this.$db.messages.create({ props })
        const messages = await this.$db.messages.filter(this.ref)
        this.messages = messages
        this.message = null
      }
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
    async postReview() {
      const props = {
        posted_at: new Date().toISOString(),
        grab_id: this.ref,
        username: this.partnerUsername,
        reviewer_username: this.getUsername(),
        rate: this.rate,
        review: this.review
      }
      await this.$reviews.create({ props })
    }
  },
}
</script>
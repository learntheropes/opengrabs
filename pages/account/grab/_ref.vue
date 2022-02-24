<template>
  <section class="section container">
    <h1 class="title">{{ $t('grab') }} {{ ref }}</h1>
    <div v-if="isBuyerOrTraveler" class="columns">
      <div class="column is-half">
        <div class="block">
          <div class="content">
            <p v-if="grab.buyer">{{ $t('buyer') }}: <nuxt-link :to="localePath({ name: 'user-username', params: { username: grab.buyer.username }})">{{ grab.buyer.username }}</nuxt-link></p>
            <p v-if="grab.traveler">{{ $t('traveler') }}: <nuxt-link :to="localePath({ name: 'user-username', params: { username: grab.traveler.username }})">{{ grab.traveler.username }}</nuxt-link></p>
            <p>{{ $t('product') }}: <a :href="grab.shop.url" target="_blank">{{ grab.shop.slug.replace(/-/g,' ') || grab.shop.title }}</a></p>
            <p>{{ $t('price') }}: {{ grab.shop.price.total.toFixed(2) }} {{ grab.shop.currency }}</p>
            <p v-if="grab.delivery">{{ $t('deliveryDate') }}: {{ $moment(grab.delivery.date).fromNow() }} [{{ $utils.momentDate(grab.delivery.date) }}]</p>
            <p v-if="grab.published_at">{{ $t('publishedAt') }} {{ $moment(grab.published_at).fromNow() }}</p>
            <p v-if="grab.booked_at">{{ $t('bookedAt') }} {{ $moment(grab.booked_at).fromNow() }}</p>
            <p v-if="grab.disputed_at">{{ $t('disputedAt') }} {{ $moment(grab.disputed_at).fromNow() }}</p>
            <p v-if="grab.paid_at">{{ $t('paidAt') }} {{ $moment(grab.paid_at).fromNow() }}</p>
            <p v-if="grab.bought_at">{{ $t('boughtAt') }} {{ $moment(grab.bought_at).fromNow() }}</p>
            <p v-if="grab.delivered_at">{{ $t('deliveredAt') }} {{ $moment(grab.delivered_at).fromNow() }}</p>
            <p v-if="grab.released_at">{{ $t('releasedAt') }} {{ $moment(grab.released_at).fromNow() }}</p>
            <p v-if="grab.withdrawn_at">{{ $t('withdrawnAt') }} {{ $moment(grab.withdrawn_at).fromNow() }}</p>
            <p v-if="grab.refunded_at">{{ $t('refundedAt') }} {{ $moment(grab.refunded_at).fromNow() }}</p>
          </div>
          <b-field>
            <div class="buttons">
              <nuxt-link v-if="isBookedAndBuyer" class="button is-primary is-outlined" :to="localePath({ name: 'account-pay-ref', params: { ref }})">{{ $t('pay') }}</nuxt-link>
              <button v-if="isDisputable" :class="disputeButtonClass" @click="dispute">{{ $t('dispute') }}</button>
              <button v-if="isPaidAndTraveler" :class="boughtButtonClass" @click="bought">{{ $t('markAsBought') }}</button>
              <button v-if="isBoughtAndTraveler" :class="deliveredButtonClass" @click="delivered">{{ $t('markAsDelivered') }}</button>
              <button v-if="isDeliveredAndBuyer" :class="releaseButtonClass" @click="release">{{ $t('release') }}</button>
              <nuxt-link v-if="isReleasedAndTraveler" class="button is-primary is-outlined" :to="localePath({ name: 'account-withdraw-ref', params: { ref }})">{{ $t('withdraw') }}</nuxt-link>
            </div>
          </b-field>
          <div v-if="isRatingPossible">
            <h5 class="title is-5">{{ $t('leaveFeedbackFor') }} {{ partnerUsername }}</h5>
            <b-rate v-model="rate" :custom-text="$t('rating')"></b-rate>
            <b-field :label="$t('feedback')">
              <b-input v-model="feedback" maxlength="400" type="textarea"></b-input>
            </b-field>
            <b-field>
              <button :class="feedbackButtonClass" @click="postFeedback">{{ $t('postFeedback') }}</button>
            </b-field>
          </div>
        </div>
      </div>
      <div class="column is-half">
        <div v-if="isChatable" class="box">
          <b-field :type="postType" :message="postMessage">
            <b-input v-model="message" maxlength="400" type="textarea"></b-input>
          </b-field>
          <div v-if="attachments && attachments.length" class="columns is-multiline is-mobile">
            <div v-for="(attachment, i) in attachments" :key="i"  class="column is-narrow">
              {{attachment.name}}
            </div>
          </div>
          <b-field grouped group-multiline>
            <p v-if="attachments.length" class="control">
              <button class="button is-text" @click="fileReset">{{$t('resetAttachments')}}</button>
            </p>
            <p class="control">
              <input ref="fileInput" style="display:none" type="file" multiple="multiple" accept="image/jpeg,image/jpg,image/png,application/pdf" @change="onFileSelected">
              <a class="button" @click="$refs.fileInput.click()">{{$t('uploadAttachments')}}</a>
            </p>
            <p class="control">
              <button :class="chatButtonClass" @click="postChatMessage">{{ $t('postChatMessage') }}</button>
            </p>
          </b-field>
          <div v-for="(msg, index) in messages" :key="index" class="content">
            <div v-if="msg.user_sub === 'admin|0'" class="notification has-text-centered is-primary is-light">
              <p><span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span></p>
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
            <div v-if="msg.user_sub.split('|')[0] === 'admin' && msg.user_sub.split('|')[1] !== '0'" class="notification has-text-centered is-primary is-light">
              <p>
                <span class="has-text-weight-semibold has-text-grey-light">{{ $t('admin') }} </span><br>
                <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
              </p>
              <p class="has-new-line">{{ msg.content }}</p>
              <div v-if="msg.attachments && msg.attachments.length" class="columns is-multiline is-mobile is-centered">
                <div v-for="(attachment, i) in msg.attachments" :key="'a'+i"  class="column is-narrow">
                  <figure class="image" style="width: 128px;">
                    <img :src="attachment.preview" @click="activateModal(attachment.modal)">
                  </figure> 
                </div>
              </div>
            </div>
            <div v-if="msg.user_sub === me" class="notification has-text-right">
              <p>
                <span class="has-text-weight-semibold has-text-grey-light">{{ $t('me') }} </span><br>
                <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
              </p>
              <p class="has-new-line">{{ msg.content }}</p>
              <nav v-if="msg.attachments && msg.attachments.length" class="level">
                <div class="level-left"></div>
                <div class="level-right">
                  <div class="level-item">
                    <div class="columns is-multiline is-mobile">
                      <div v-for="(attachment, i) in msg.attachments" :key="'b'+i"  class="column is-narrow">
                        <figure class="image" style="width: 128px;">
                          <img :src="attachment.preview" @click="activateModal(attachment.modal)">
                        </figure> 
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
            <div v-if="msg.user_sub !== me && msg.user_sub.split('|')[0] !== 'admin'" class="notification">
              <p>
                <span class="has-text-weight-semibold has-text-grey-light">{{ msg.user_username }} </span><br>
                <span class="is-italic has-text-grey-light">{{ $moment(msg.posted_at).fromNow() }}</span>
              </p>
              <p class="has-new-line">{{ msg.content }}</p>
              <div v-if="msg.attachments && msg.attachments.length" class="columns is-multiline is-mobile">
                <div v-for="(attachment, i) in msg.attachments" :key="'c'+i"  class="column is-narrow">
                  <figure class="image" style="width: 128px;">
                    <img :src="attachment.preview" @click="activateModal(attachment.modal)">
                  </figure> 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <b-modal :active.sync="isAttachmentModalActive">
      <p class="image">
        <img :alt="$t('attachmentExpired')" :src="modalAttachment">
      </p>
    </b-modal>
  </section>
</template>

<script>
import uniqueString from 'unique-string'
import axios from "axios"
export default {
  name: 'GrabRef',
  async asyncData({ app, modalWidth, params: { ref }}) {
    const [isBuyerOrTraveler, grab, messages] = await Promise.all([
      app.$db.isBuyerOrTraveler(ref),
      app.$db.grabs.get(ref),
      app.$db.messages.filter(ref, modalWidth)
    ])
    return { ref, isBuyerOrTraveler, modalWidth, grab, messages }
  },
  data: () => ({
    disputeButtonClass: 'button is-primary is-outlined',
    boughtButtonClass: 'button is-primary is-outlined',
    deliveredButtonClass: 'button is-primary is-outlined',
    releaseButtonClass: 'button is-primary is-outlined',
    chatButtonClass: 'button is-primary is-outlined',
    feedbackButtonClass: 'button is-primary is-outlined',
    message: null,
    attachments: [],
    public_ids: [],
    postType: null,
    postError: false,
    rate: null,
    feedback: null,
    isAttachmentModalActive: false,
    modalAttachment: null,
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
      if (!this.message && !this.attachments.length) {
        this.postType = 'is-danger'
        this.postError = 'Field required'
        return false
      }
      return true
    },
    fileReset() {
      this.$refs.fileInput.value = ""
      this.attachments = []
    },    
    onFileSelected(event) {
      this.attachments = Array.from(event.target.files)
    },
    async postChatMessage() {
      this.postType = null
      this.postError = false
      const validPost = this.validatePost()
      if (validPost) {
        this.chatButtonClass = 'button is-primary is-outlined is-loading'
        if (this.attachments.length) {
          for (const attachment of this.attachments) {
            const fd = new FormData()
            const name = uniqueString()
            const extension = attachment.name.split('.')[1]
            fd.append('fileName', `${name}.${extension}`)
            fd.append('file', attachment)
            fd.append('publicKey',process.env.IMAGEKIT_PUBLIC_KEY)
            fd.append('folder', `${process.env.BTC_CHAIN}/tickets`)
            fd.append('overwriteFile', false)
            fd.append('tags', `${this.ref},${this.me}`)
            fd.append('isPrivateFile', true)
            const { data: { signature, expire, token }} = await this.$axios.post('/api/image/signature', {})
            fd.append('expire', expire)
            fd.append('token', token)
            fd.append('signature', signature)
            const { data: { filePath }} = await axios.post('https://upload.imagekit.io/api/v1/files/upload', fd) 
            this.public_ids.push({ path: filePath })
          }      
        }
        const props = {
          posted_at: new Date().toISOString(),
          content: this.message,
          attachments: this.public_ids,
          grab_id: this.ref,
          user_sub: this.me,
          user_username: this.getUsername(),
        }
        await this.$db.messages.create({ props })
        this.messages = await this.$db.messages.filter(this.ref, this.modalWidth)
        this.message = null
        this.attachments = []
        this.public_ids = []
        this.chatButtonClass = 'button is-primary is-outlined'
      }
    },
    activateModal (attachment) {
      this.isAttachmentModalActive = true
      this.modalAttachment = attachment
    },
    async dispute() {
      this.disputeButtonClass = 'button is-primary is-outlined is-loading'
      await this.$grab.dispute({ ref: this.ref })
      this.disputeButtonClass = 'button is-primary is-outlined'
      this.$buefy.toast.open({
        duration: 3000,
        message: this.$t('toastGrabDisputed'),
        position: 'is-bottom',
        type: 'is-primary'
      })
      this.grab = await this.$db.grabs.get(this.ref)
    },
    async bought() {
      this.boughtButtonClass = 'button is-primary is-outlined is-loading'
      await this.$grab.bought({ ref: this.ref })
      this.boughtButtonClass = 'button is-primary is-outlined'
      this.$buefy.toast.open({
        duration: 3000,
        message: this.$t('toastGrabBought'),
        position: 'is-bottom',
        type: 'is-primary'
      })
      this.grab = await this.$db.grabs.get(this.ref)
    },
    async delivered() {
      this.deliveredButtonClass = 'button is-primary is-outlined is-loading'
      await this.$grab.delivered({ ref: this.ref })
      this.deliveredButtonClass = 'button is-primary is-outlined'
      this.$buefy.toast.open({
        duration: 3000,
        message: this.$t('toastGrabDelivered'),
        position: 'is-bottom',
        type: 'is-primary'
      })
      this.grab = await this.$db.grabs.get(this.ref)
    },
    async release() {
      this.releaseButtonClass = 'button is-primary is-outlined is-loading'
      await this.$grab.release({ ref: this.ref })
      this.releaseButtonClass = 'button is-primary is-outlined'
      this.$buefy.toast.open({
        duration: 3000,
        message: this.$t('toastGrabReleased'),
        position: 'is-bottom',
        type: 'is-primary'
      })
      this.grab = await this.$db.grabs.get(this.ref)
    },
    async postFeedback() {
      this.feedbackButtonClass = 'button is-primary is-outlined is-loading'
      const props = {
        posted_at: new Date().toISOString(),
        grab_id: this.ref,
        username: this.partnerUsername,
        autor: this.getUsername(),
        rate: this.rate,
        content: this.feedback
      }
      await this.$feedback.create({ props })
      this.feedbackButtonClass = 'button is-primary is-outlined'
      this.$buefy.toast.open({
        duration: 3000,
        message: this.$t('toastFeedbackPosted'),
        position: 'is-bottom',
        type: 'is-primary'
      })
    }
  },
}
</script>

<style scoped>
.has-new-line {
  white-space: pre-wrap;
}
</style>
<template>
  <section class="section container">
    <h1 class="title">{{ $t('tickets') }}</h1>
    <b-field :type="subjectType" :message="subjectMessage">
      <b-input v-model="subject" :placeholder="$t('subjectPlaceholder')" expanded></b-input>
    </b-field>
    <b-field :type="contentType" :message="contentMessage">
      <b-input v-model="content" :placeholder="$t('contentPlaceholder')" maxlength="400" type="textarea"></b-input>
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
        <button :class="ticketButtonClass" @click="openNewTicket">{{ $t('openNewTicket') }}</button>
      </p>
    </b-field>
    <b-table v-if="tickets.length" :data="tickets">
      <template>
        <b-table-column v-slot="props" :label="$t('summary')">
          {{ props.row.subject }}
        </b-table-column>
        <b-table-column v-slot="props" :label="$t('createdAt')">
          {{ $moment(props.row.created_at).fromNow() }}
        </b-table-column>
        <b-table-column v-slot="props" :label="$t('updatedAt')">
          {{ $moment(props.row.updated_at).fromNow() }}
        </b-table-column>
        <b-table-column v-slot="props">
          <nuxt-link :to="localePath({ name: 'account-tickets-ref', params: { ref: props.row.ref }})">
            {{ $t('view') }}
          </nuxt-link>
        </b-table-column>
      </template>
    </b-table>
  </section>
</template>

<script>
import uniqueString from 'unique-string'
import axios from 'axios'
export default {
  name: 'Tickets',
  middleware: 'auth', 
  async asyncData({ app }) {
    const tickets = await app.$tickets.filter()
    return { tickets }
  },
  data: () => ({
    ticketButtonClass: 'button is-primary is-outlined',
    subject: null,
    subjectType: null,
    subjectError: false,
    content: null,
    contentType: null,
    contentError: false,
    attachments: [],
    public_ids: [],
  }),
  head() {
    return {
      title: `${this.$t('seo.tickets')} ${this.ref}`
    }
  },
  computed: {
    subjectMessage() {
      if (this.subjectError === 'Field required') return this.$t('requiredField')
      else return null 
    },
    contentMessage() {
      if (this.contentError === 'Field required') return this.$t('requiredField')
      else return null 
    },
  },
  methods: {
    fileReset() {
      this.$refs.fileInput.value = ""
      this.attachments = []
    },  
    onFileSelected(event) {
      this.attachments = Array.from(event.target.files)
    },
    validateSubject() {
      if (!this.subject) {
        this.subjectType = 'is-danger'
        this.subjectError = 'Field required'
        return false
      }
      return true
    }, 
    validateContent() {
      if (!this.content) {
        this.contentType = 'is-danger'
        this.contentError = 'Field required'
        return false
      }
      return true
    },
    async openNewTicket() {
      this.subjectType = null
      this.subjectError = false
      this.contentType = null
      this.contentError = false
      const validSubject = this.validateSubject()
      const validContent = this.validateContent()
      if (validSubject && validContent) {
        this.ticketButtonClass = 'button is-primary is-outlined is-loading'
        const ticket = {
          admin: null,
          status: 'open',
          language: this.$i18n.locale,
          subject: this.subject,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        const { id } = await this.$tickets.create(ticket)
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
            fd.append('tags', `${id},${this.email}`)
            fd.append('isPrivateFile', true)
            const { data: { signature, expire, token }} = await this.$axios.post('/api/image/signature', {})
            fd.append('expire', expire)
            fd.append('token', token)
            fd.append('signature', signature)
            const { data: { filePath }} = await axios.post('https://upload.imagekit.io/api/v1/files/upload', fd) 
            this.public_ids.push({ path: filePath })
          } 
        }
        const message = {
          content: this.content,
          attachments: this.public_ids,
        }
        await this.$tickets.messages.create(id, message)
        await this.$tickets.filter()
        this.subject = null
        this.content = null
        this.$refs.fileInput.value = ""
        this.attachments = []
        this.ticketButtonClass = 'button is-primary is-outlined'
        this.$buefy.toast.open({
          duration: 3000,
          message: this.$t('toastTicketCreated'),
          position: 'is-bottom',
          type: 'is-primary'
        })
      }
    }
  }  
}
</script>
<template>
    <section v-if="isAdmin" class="section">
        <div class="columns">
            <div class="column is-narrow">
                <admin-side-bar />
            </div>
            <div class="column">
                <h1 class="title">Feedback by username</h1>
                <b-field label="Charge ID">
                    <b-input v-model="username" />
                </b-field>
                <b-button @click="search" class="button">Search</b-button>
                <div v-if="response">
                    <h1 class="title">{{ username }}</h1>
                    <p class="subtitle is-3"><b-rate v-model="average" size="is-large" disabled></b-rate></p>
                    <div v-if="feedback.length === 0">No feedback yet</div>
                    <div v-for="fb in feedback" v-else :key="fb.grab_id" class="block">
                        <p class="title is-3">Feedback by {{fb.reviewer_username}} Published {{ $moment(fb.posted_at).fromNow() }}</p>
                        <p class="subtitle is-5"><b-rate v-model="fb.rate" disabled></b-rate></p>
                        <p>{{ fb.content }}</p>
                        <button @click="remove(fb.ref)" class="button">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>


<script>
export default {
    nuxtI18n: false,
    layout: 'admin',
    middleware: 'auth',
    async asyncData({ app }) {
        const isAdmin = await app.$admin.isAdmin()
        return { isAdmin }
    },
    data: () => ({
        username: null,
        average: null,
        feedback: null,
        response: false
    }),
    methods: {
        async search() {
            const { data: feedback } = await this.$axios.get(`/api/admin/feedback/get/${this.username}`)
            const sum = feedback.reduce(function (previousValue, currentValue) {
                return previousValue + currentValue.rate
            }, 0)
            this.average = sum / feedback.length
            this.feedback = feedback
            this.response = true
        },
        async remove (ref) {
            await this.$axios.post(`/api/admin/feedback/remove/${ref}`)
            const { data: feedback } = await this.$axios.get(`/api/admin/feedback/get/${this.username}`)
            const sum = feedback.reduce(function (previousValue, currentValue) {
                return previousValue + currentValue.rate
            }, 0)
            this.average = sum / feedback.length
            this.feedback = feedback            
        }
    }
}
</script>

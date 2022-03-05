<template>
    <section class="section">
        <div class="columns is-multiline">
            <div v-for="travel of travels" :key="travel.ref" class="column is-full-mobile is-one-third-tablet is-one-third-desktop is-one-quarter-widescreen is-one-quarter-fullhd">
                <div class="card card-equal-height">
                    <account-travels-card-content :travel="travel" />
                    <footer class="card-footer">
                        <a href="#" :class="removeButtonClass" @click="remove(travel.ref)">{{ $t('remove') }}</a>
                    </footer>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'TravelsExpired',
    props: {
        travels: {
            type: Array,
            default: () => [],
        },
    },
    data: () => ({
        removeButtonClass: 'card-footer-item'
    }),
    methods: {
        async remove(ref) {
            this.removeButtonClass = 'card-footer-item disabled'
            await this.$travel.remove(ref)
            const expired = await this.$db.account.travels.filter('expired')
            this.$store.commit('account/travels/setExpired', expired)
            this.$store.commit('account/travels/setInitiated', true)
            this.$store.commit('travels/setInitiated', false)
            this.removeButtonClass = 'card-footer-item'
            this.$buefy.toast.open({
                duration: 3000,
                message: this.$t('toastTravelRemoved'),
                position: 'is-bottom',
                type: 'is-primary'
            })  
        } 
    }
}
</script>

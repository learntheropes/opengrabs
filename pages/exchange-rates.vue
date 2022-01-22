<template>
    <section class="section container">
        <div class="columns is-centered">
            <div class="column is-one-third">
                <b-table :data="data">
                    <template>
                        <b-table-column v-slot="props" label="CURRENCY">
                            {{ props.row.currency }}
                        </b-table-column>
                        <b-table-column  v-slot="props" label="BUY" numeric>
                            {{ props.row.buy.toFixed(2) }}
                        </b-table-column>
                        <b-table-column v-slot="props" label="SELL" numeric>
                            {{ props.row.sell.toFixed(2) }}
                        </b-table-column>
                    </template>
                </b-table>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    auth: false,
    name: 'ExchangeRates',
    async asyncData({ app }) {
        const { data } = await app.$axios.get('/api/btc/rates/USD,EUR,GBP')
        return { data }
    }
}
</script>
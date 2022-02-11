module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
  extends: ['@nuxtjs', 'plugin:nuxt/recommended', 'prettier'],
  plugins: [],
  // add your custom rules here
  rules: {
    // https://eslint.vuejs.org/rules/no-lone-template.html
    "vue/no-lone-template": ["error", { "ignoreAccessible": false }],
    // https://stackoverflow.com/questions/70346829/eslint-vue-multiword-components/70348541
    'vue/multi-word-component-names': 0, // disable this rule just for views
    'no-console': 'off',
    // https://stackoverflow.com/questions/52254313/identifier-is-not-a-camel-case
    "camelcase": ["error", {"properties": "never"}],
    "camelcase": ["error", {"allow": [
      "selected_lenguage",
      "email_languages",
      "exchange_rate",
      "order_id",
      "callback_url",
      "auto_settle",
      "grab_buyer_id",
      "posted_at",
      "grab_id",
      "user_sub",
      "max_delivery_date",
      "delivery_date",
      "checkout_id",
      "btc_amount",
      "missing_amt",
      "travel_date",
      "origin_country",
      "destination_country",
      "destination_city",
      "published_at",
      "given_name",
      "family_name",
      "email_verified",
      "jwt_decode",
      "logins_count",
      "user_username",
      "destination_photo"
    ]}],
  },
}

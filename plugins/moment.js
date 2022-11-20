export default ({ app }) => {
  const { $moment, i18n } = app
  $moment.locale(i18n.locale)

  i18n.onBeforeLanguageSwitch = (_oldLocale, newLocale) => {
  $moment.locale(newLocale)
  }
}
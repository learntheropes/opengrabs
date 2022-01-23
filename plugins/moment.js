export default ({ app }) => {
    console.log(app)
    const { $moment, i18n } = app;
    $moment.locale(i18n.locale);
  
    app.i18n.onLanguageSwitched = (_oldLocale, newLocale) => {
      $moment.locale(newLocale);
    };
  };
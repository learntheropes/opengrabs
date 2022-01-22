export default ({ $moment }, inject) => {
  const utils = {
    round: (value, decimalPlaces) => {
      // https://stackoverflow.com/questions/6134039/format-number-to-always-show-2-decimal-places
      return Number(Math.round(parseFloat(value + 'e' + decimalPlaces)) + 'e-' + decimalPlaces)
    },
    momentDate: (time) => {
      return time && $moment(time).format('MMMM Do YYYY');
    },
  }
  inject('utils', utils)
}
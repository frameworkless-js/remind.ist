// assets/js/app.js
import flatpickr from 'flatpickr'

const init = () => {
  const pickers = document.querySelectorAll('.flatpickr')

  for (const el of pickers) {
    flatpickr(el, {
      minDate: new Date()
    })
  }
}

init()

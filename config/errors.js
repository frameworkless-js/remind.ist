const errors = {

  not_found: {
    code: 404
  },

  __fallback: {
    code: 500
  }

}

module.exports = error => errors[error.message] || errors.__fallback

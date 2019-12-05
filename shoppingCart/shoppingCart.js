const dropInContainer = document.getElementById('dropIn-container')
const shoppingCart = document.getElementById('shopping-cart')
let ref
function launchDropIn() {
  dropInContainer.className = 'flex'
  shoppingCart.className = 'none'
  ref = Math.random().toString(36).substring(7)
}
(async function () {
  const amount = {
    currency: 'EUR',
    value: 501
  }
  let paymentMethods = await fetch(`${window.origin}/payment-methods`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount,
      countryCode: 'NL'
    })
  })
  paymentMethods = await paymentMethods.json()
  const originKey = (() => {
    if (window.origin === 'http://localhost:8082') {
      return 'pub.v2.8115532860023116.aHR0cDovL2xvY2FsaG9zdDo4MDgy.tm_BCb0ekshyP1rn4GtET9aJXI9u1IXyCFdVlVGNl7M'
    }
    if (window.location.protocol === 'https:') {
      return 'pub.v2.8115532860023116.aHR0cHM6Ly9hZHllbi10ZWNoLXN1cHBvcnQtdGVzdC5oZXJva3VhcHAuY29t.nsfo4nXAfr-EevBzoSuqn6kTei30JbqNgBR7e13hJ78'
    } else {
      return 'pub.v2.8115532860023116.aHR0cDovL2FkeWVuLXRlY2gtc3VwcG9ydC10ZXN0Lmhlcm9rdWFwcC5jb20.iazTShtWpP1wZF1npI-22Ehxv8d0jcWooieaAvGc_rs'
    }
  })()
  console.log('originKey', originKey)
  const configuration = {
    locale: 'en-NL',
    environment: 'test',
    originKey,
    paymentMethodsResponse: paymentMethods.response
  }
  const checkout = new AdyenCheckout(configuration)
  const dropin = checkout
  .create('dropin', {
    onSubmit: async (state, dropin) => {
      let { paymentMethod } = state.data
      const returnUrl = `${window.origin}/redirect?ref=${ref}`
      let payment = await fetch(`${window.origin}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentMethod,
          amount,
          ref,
          returnUrl
        })
      })
      payment = await payment.json()
      if (payment.payment.action && payment.payment.action.type === 'redirect') {
        await fetch(`${window.origin}/payments/${ref}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentData: payment.payment.paymentData,
            details: payment.payment.details
          })
        })
        window.location.href = payment.payment.action.url
      } else {
        window.location.href = encodeURI(`${returnUrl}&resultCode=${payment.payment.resultCode}`)
      }
    }
  })
  .mount('#dropin')
})()

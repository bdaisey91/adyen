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
  let paymentMethods = await fetch('http://localhost:8082/payment-methods', {
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
  const configuration = {
    locale: 'en-NL',
    environment: 'test',
    originKey: 'pub.v2.8115532860023116.aHR0cDovL2xvY2FsaG9zdDo4MDgy.tm_BCb0ekshyP1rn4GtET9aJXI9u1IXyCFdVlVGNl7M',
    paymentMethodsResponse: paymentMethods.response
  }
  const checkout = new AdyenCheckout(configuration)
  const dropin = checkout
  .create('dropin', {
    onSubmit: async (state, dropin) => {
      let { paymentMethod } = state.data
      const returnUrl = `http://localhost:8082/redirect?ref=${ref}`
      let payment = await fetch('http://localhost:8082/payment', {
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
        await fetch(`http://localhost:8082/payments/${ref}`, {
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

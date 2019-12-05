(async function () {
  const message = document.getElementById('message')
  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) == variable) {
          return decodeURIComponent(pair[1]);
      }
    }
  }
  const ref = getQueryVariable('ref')
  const resultCode = getQueryVariable('resultCode')
  const payload = getQueryVariable('payload')
  if (!payload) {
    message.innerHTML = resultCode
  } else {
    let paymentData = await fetch(`http://localhost:8082/payments/${ref}`)
    paymentData = await paymentData.json()
    const details = {}
    paymentData.payment.details.forEach(({ key }) => {
      details[key] = getQueryVariable(key)
    })
    let paymentDetails = await fetch(`http://localhost:8082/payments/${ref}/details`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        details,
        paymentData: paymentData.payment.paymentData
      })
    })
    paymentDetails = await paymentDetails.json()
    message.innerHTML = paymentDetails.details.resultCode
  }
})()

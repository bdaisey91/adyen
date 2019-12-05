const path = require('path')
const express = require('express')
const { Client, Config, CheckoutAPI } = require('@adyen/api-library')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
const config = new Config()
config.apiKey = 'AQEyhmfxKYLObRNKw0m/n3Q5qf3VaY9UCJ14XWZE03G/k2NFisuRs7z7KhB9kBC+ZOWG3q8QwV1bDb7kfNy1WIxIIkxgBw==-hnpaLteUaomL+AiAKScqhOXXIVxcffCR6g3/Am12qL0=-KD7vvs.M(R)^k6B{'
config.merchantAccount = 'AdyenRecruitmentCOM'
const client = new Client({ config })
client.setEnvironment("TEST")
const checkout = new CheckoutAPI(client)

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './shoppingCart/index.html'))
})

app.get('/shoppingCart.js', (req, res) => {
  res.sendFile(path.join(__dirname, './shoppingCart/shoppingCart.js'))
})

app.get('/redirect', (req,res) => {
  res.sendFile(path.join(__dirname, './redirect/index.html'))
})

app.get('/redirect.js', (req,res) => {
  res.sendFile(path.join(__dirname, './redirect/index.js'))
})

app.post('/payment', async (req,res) => {
  try {
    const payment = await checkout.payments({
      amount: {
        currency: req.body.amount.currency,
        value: req.body.amount.value
      },
      shopperIP: '172.114.64.173',
      paymentMethod: req.body.paymentMethod,
      reference: req.body.ref,
      merchantAccount: config.merchantAccount,
      returnUrl: req.body.returnUrl
    })
    return res.send({
      payment
    })
  } catch (error) {
    return res.status(500).send({ error: 'An Error Occurred.' })
  }
})

app.post('/payment-methods', async (req, res) => {
  try {
    const paymentsResponse = await checkout.paymentMethods({
      amount: {
        currency: req.body.amount.currency,
        value: req.body.amount.value
      },
      countryCode: 'NL',
      channel: 'Web',
      merchantAccount: config.merchantAccount
    })
    return res.send({ response: paymentsResponse })
  } catch (error) {
    return res.status(500).send({ error: 'An Error Occurred.' })
  }
})

const payments = {}
app.post('/payments/:paymentId', (req,res) => {
  payments[req.params.paymentId] = {
    paymentData: req.body.paymentData,
    details: req.body.details
  }
  return res.send({status: "Success!"})
})

app.get('/payments/:paymentId', (req,res) => {
  return res.send({payment: payments[req.params.paymentId]})
})

app.post('/payments/:paymentId/details', async (req,res) => {
  try {
    const details = await checkout.paymentsDetails({
      details: req.body.details,
      paymentData: req.body.paymentData
    })
    delete payments[req.params.paymentId]
    return res.send({
      details
    })
  } catch (error) {
    return res.status(500).send({ error: 'An Error Occurred.' })
  }
})

const PORT = (process.env.NODE_ENV === 'dev') ? 8082 : 80
app.listen(PORT, () => console.log(`Listening On Port ${PORT}`))

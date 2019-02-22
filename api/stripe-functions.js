/* Server Side -- Stripe API calls */
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const UTILS = require('../utils/format-numbers.js');

function getAllProductsAndPlans() {
  return Promise.all(
    [
      stripe.products.list({}),
      stripe.plans.list({})
    ]
  ).then(stripeData => {
    var products = stripeData[0].data;
    var plans = stripeData[1].data; 

    plans = plans.map(plan => {
      amount = UTILS.formatUSD(plan.amount)
      return {...plan, amount};
    });

    products.forEach(product => {
      const filteredPlans = plans.filter(plan => {
        return plan.product === product.id;
      });

      product.plans = filteredPlans;
    });

    return products;
  });
}


function createProduct(requestBody) {
  return stripe.products.create({
    name: requestBody.productName,
    type: 'service'
  });
}


function createPlan(requestBody) {
  return stripe.plans.create({
    nickname: requestBody.planName,
    amount: UTILS.formatStripeAmount(requestBody.planAmount),
    interval: requestBody.planInterval,
    interval_count: parseInt(requestBody.planIntervalNumber),
    product: requestBody.productId,
    currency: 'USD'
  });
}


function createCustomerAndSubscription(requestBody) {
  return stripe.customers.create({
    source: requestBody.stripeToken,
    email: requestBody.customerEmail
  }).then(customer => {
    stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          plan: requestBody.planId
        }
      ]
    });
  })
}


module.exports = {
  getAllProductsAndPlans,
  createProduct,
  createPlan,
  createCustomerAndSubscription
};

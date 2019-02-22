function formatUSD(stripeAmount) {
  return `$${(stripeAmount / 100).toFixed(2)}`;
}

function formatStripeAmount(USDString) {
  return parseFloat(USDString) * 100;
}

module.exports = {
  formatUSD,
  formatStripeAmount
};
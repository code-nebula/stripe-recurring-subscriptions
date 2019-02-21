require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');

const app = express();
const port = 3000;
const router = express.Router();

var stripe = require('stripe')(process.env.STRIPE_API_KEY);

/* Set up Express to serve HTML files using "res.render" with help of Nunjucks */
app.set('view engine', 'html');
app.engine('html', nunjucks.render);
nunjucks.configure('views', { noCache: true });

app.use(express.static(__dirname));
app.use('/styles', express.static('styles'));
app.use(bodyParser());
app.use('/', router);


/* Place all routes here */
router.get('/', (req, res) => {
  Promise.all([stripe.products.list({}), stripe.plans.list({})]).then((stripeData) => {
    var products = stripeData[0].data;
    var plans = stripeData[1].data;

    products.forEach(product => {
      var filteredPlans = plans.filter((plan) => {
        return plan.product === product.id;
      });
      product.plans = filteredPlans;
    });

    res.render('adminView.html', {products: products});
  });
});

/* Create Product */
router.get('/createProduct', (req, res) => {
  res.render('createProduct.html');
});

router.post('/createProduct', (req, res) => {
  stripe.products.create({
    name: req.body.productName,
    type: 'service',
  }, function(err, product) {
    res.render('createProduct.html', {success: true});
  });
});


/* Create Plan */
router.post('/createPlan', (req, res) => {
  console.log(`Req.body`, req.body);
  res.render('createPlan.html', {productId: req.body.productId, productName: req.body.productName});
});

router.post('/createPlanForReal', (req, res) => {
  console.log(`Req.body`, req.body);
  stripe.plans.create({
    nickname: req.body.planName,
    amount: parseInt(req.body.planPrice),
    interval: req.body.planInterval,
    interval_count: parseInt(req.body.planIntervalNumber),
    product: req.body.productId,
    currency: 'USD'
  }, function (err, product) {
    if (err) {
      console.log('Error', err);
    } else {
      res.render('createPlan.html', {success: true});
    }
  });
});

router.get('/customerView', (req, res) => {
  Promise.all([stripe.products.list({}), stripe.plans.list({})]).then((stripeData) => {
    var products = stripeData[0].data;
    var plans = stripeData[1].data;

    products.forEach(product => {
      var filteredPlans = plans.filter((plan) => {
        return plan.product === product.id;
      });
      product.plans = filteredPlans;
    });

    products = products.filter(product => {
      return product.plans.length > 0;
    })

    res.render('customerView.html', {products: products});
  });
});


router.post('/signUp', (req, res) => {
  var product = {
    id: req.body.productId
  };

  var plan = {
    id: req.body.planId,
    name: req.body.planName,
    amount: req.body.planAmount
  }

  res.render('signUp.html', {product: product, plan: plan});
});


/* Start listening on specified port */
app.listen(port, () => {
  console.info('Example app listening on port', port)
});
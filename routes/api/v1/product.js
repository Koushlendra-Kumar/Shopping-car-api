const express = require('express');
const productHandler = require('../../../handlers/productHandler');

const router = express.Router();

/* GET products list */
router.get('/', productHandler.products_list);

/* POST add new product */
router.post('/create', productHandler.create_product_post);

/* GET individual product */
router.get('/:id', productHandler.individual_product_get);

/** POST update individual product */
router.post('/:id', productHandler.update_product_post);

/** GET delete individual product */
router.get('/:id/delete', productHandler.delete_product);

module.exports = router;

import { Router } from 'express';
import { addProduct, getProducts, getProduct, countProducts, updateProduct, deleteProduct } from '../controllers/products.js';
import { isAuthenticated, hasPermission } from '../middlewares/auth.js';
import { productImageUpload } from '../middlewares/uploads.js';

const productRouter = Router();

productRouter.get('/products/count', countProducts)
productRouter.post('/products', isAuthenticated, hasPermission('add_products'), productImageUpload.single('image'), addProduct);
productRouter.get('/products', getProducts);
productRouter.get('/products/:id', getProduct)
productRouter.patch('/products/:id', isAuthenticated, hasPermission('update_product'), productImageUpload.single('image'), updateProduct);
productRouter.delete('/products/:id', isAuthenticated, hasPermission('delete_product'), deleteProduct);

export default productRouter;
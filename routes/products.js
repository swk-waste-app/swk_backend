import { Router } from 'express';
import { addProduct, getProducts, getProduct, countProducts, updateProduct, deleteProduct } from '../controllers/products.js';
import { isAuthenticated, hasPermission } from '../middlewares/auth.js';
import { productImageUpload } from '../middlewares/uploads.js';

const productRouter = Router();

productRouter.get('/count', countProducts)
productRouter.post('/', isAuthenticated, hasPermission('add_products'), productImageUpload.single('image'), addProduct);
productRouter.get('/', getProducts);
productRouter.get('/:id', getProduct)
productRouter.patch('/:id', isAuthenticated, hasPermission('update_product'), productImageUpload.single('image'), updateProduct);
productRouter.delete('/:id', isAuthenticated, hasPermission('delete_product'), deleteProduct);

export default productRouter;
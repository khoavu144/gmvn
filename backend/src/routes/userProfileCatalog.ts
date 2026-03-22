import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { userProfileCatalogController } from '../controllers/userProfileCatalogController';

const router = Router();

router.use(authenticate);

router.get('/catalog', userProfileCatalogController.getCatalog);
router.get('/me', userProfileCatalogController.getMe);
router.put('/me', userProfileCatalogController.putMe);

export default router;

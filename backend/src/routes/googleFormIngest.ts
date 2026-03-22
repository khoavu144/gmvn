import { Router } from 'express';
import { postGoogleFormIngest } from '../controllers/googleFormIngestController';

const router = Router();

router.post('/ingest', postGoogleFormIngest);

export default router;

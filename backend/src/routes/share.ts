import { Router } from 'express';
import {
    getAthleteShareImage,
    getAthleteSharePage,
    getCoachShareImage,
    getCoachSharePage,
} from '../controllers/shareController';

const router = Router();

router.get('/coach/:identifier/og.png', getCoachShareImage);
router.get('/coach/:identifier', getCoachSharePage);
router.get('/athlete/:identifier/og.png', getAthleteShareImage);
router.get('/athlete/:identifier', getAthleteSharePage);

export default router;

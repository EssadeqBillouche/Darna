import { Router } from 'express';
import BienController from '../controllers/BienController';
import BienRepository from '../../persistence/repositories/BienRepository';
import BienService from '../../business/services/BienService';

const router = Router();

const bienRepository = new BienRepository();
const bienService = new BienService(bienRepository);
const bienController = new BienController(bienService);

router.post('/', bienController.create);
router.get('/', bienController.findAll);
router.get('/:id', bienController.findById);
router.patch('/:id', bienController.update);
router.delete('/:id', bienController.remove);

export default router;

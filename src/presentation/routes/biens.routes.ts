import express from 'express';
import BienRepository from '../../persistence/repositories/BienRepository';
import { BienService } from '../../business/services/BienService';
import { BienController } from '../controllers/BienController';

const router = express.Router();

const repository = new BienRepository();
const service = new BienService(repository);
const controller = new BienController(service);

router.get('/', controller.list.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.patch('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

export default router;

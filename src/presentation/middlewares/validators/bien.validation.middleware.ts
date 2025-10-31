import { body, ValidationChain } from 'express-validator';
import { PropertyType, PropertyStatus } from '../../../business/types/Bien';

export class BienValidator {
  private _ownerId = 'ownerId';
  private _title = 'title';
  private _description = 'description';
  private _price = 'price';
  private _currency = 'currency';
  private _type = 'type';
  private _status = 'status';
  private _location = 'location';
  private _characteristics = 'characteristics';
  private _yearBuilt = 'yearBuilt';
  private _area = 'area';
  private _media = 'media';

  public createValidation(): ValidationChain[] {
    return [
      body(this._ownerId).notEmpty().withMessage('ownerId is required'),
      body(this._title).notEmpty().withMessage('title is required'),
      body(this._price)
        .notEmpty().withMessage('price is required')
        .isFloat({ gt: 0 }).withMessage('price must be a positive number'),
      body(this._currency).optional().isString(),
      body(this._type)
        .notEmpty().withMessage('type is required')
        .isIn(Object.values(PropertyType)).withMessage(`type must be one of ${Object.values(PropertyType).join(', ')}`),
      body(this._status).optional().isIn(Object.values(PropertyStatus)).withMessage('invalid status'),

      // location object
      body(`${this._location}.address`).notEmpty().withMessage('location.address is required'),
      body(`${this._location}.city`).notEmpty().withMessage('location.city is required'),
      body(`${this._location}.state`).optional().isString(),
      body(`${this._location}.postalCode`).optional().isString(),
      body(`${this._location}.coordinates.latitude`).optional().isFloat().withMessage('latitude must be a number'),
      body(`${this._location}.coordinates.longitude`).optional().isFloat().withMessage('longitude must be a number'),

      // characteristics
      body(`${this._characteristics}.roomNumber`).optional().isInt({ min: 0 }).withMessage('roomNumber must be an integer >= 0'),
      body(`${this._characteristics}.bedRoom`).optional().isInt({ min: 0 }).withMessage('bedRoom must be an integer >= 0'),
      body(`${this._characteristics}.toilet`).optional().isInt({ min: 0 }).withMessage('toilet must be an integer >= 0'),
      body(`${this._characteristics}.levels`).optional().isInt({ min: 0 }).withMessage('levels must be an integer >= 0'),
      body(`${this._characteristics}.hasPool`).optional().isBoolean(),
      body(`${this._characteristics}.hasGarden`).optional().isBoolean(),

      body(this._yearBuilt).optional().isInt({ min: 0 }).withMessage('yearBuilt must be an integer'),
      body(this._area).optional().isFloat({ gt: 0 }).withMessage('area must be a positive number'),
      body(this._media).optional().isArray().withMessage('media must be an array of strings'),
    ];
  }

  public updateValidation(): ValidationChain[] {
    // all fields optional for update; reuse most checks
    return [
      body(this._ownerId).optional().notEmpty().withMessage('ownerId cannot be empty'),
      body(this._title).optional().notEmpty().withMessage('title cannot be empty'),
      body(this._price).optional().isFloat({ gt: 0 }).withMessage('price must be a positive number'),
      body(this._currency).optional().isString(),
      body(this._type).optional().isIn(Object.values(PropertyType)).withMessage('invalid type'),
      body(this._status).optional().isIn(Object.values(PropertyStatus)).withMessage('invalid status'),

      body(`${this._location}.address`).optional().notEmpty(),
      body(`${this._location}.city`).optional().notEmpty(),
      body(`${this._location}.state`).optional().isString(),
      body(`${this._location}.postalCode`).optional().isString(),
      body(`${this._location}.coordinates.latitude`).optional().isFloat(),
      body(`${this._location}.coordinates.longitude`).optional().isFloat(),

      body(`${this._characteristics}.roomNumber`).optional().isInt({ min: 0 }),
      body(`${this._characteristics}.bedRoom`).optional().isInt({ min: 0 }),
      body(`${this._characteristics}.toilet`).optional().isInt({ min: 0 }),
      body(`${this._characteristics}.levels`).optional().isInt({ min: 0 }),
      body(`${this._characteristics}.hasPool`).optional().isBoolean(),
      body(`${this._characteristics}.hasGarden`).optional().isBoolean(),

      body(this._yearBuilt).optional().isInt({ min: 0 }),
      body(this._area).optional().isFloat({ gt: 0 }),
      body(this._media).optional().isArray(),
    ];
  }
}

export default new BienValidator();

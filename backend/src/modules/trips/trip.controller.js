const tripService = require('./trip.service');
const { success, created } = require('../../utils/response');

const list = async (req, res, next) => {
  try {
    const trips = await tripService.list(req.query);
    success(res, trips);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const trip = await tripService.getById(req.params.id);
    success(res, trip);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const trip = await tripService.create(req.body, req.user.id);
    created(res, trip);
  } catch (err) { next(err); }
};

const dispatch = async (req, res, next) => {
  try {
    const trip = await tripService.dispatch(req.params.id);
    success(res, trip, 'Trip dispatched');
  } catch (err) { next(err); }
};

const complete = async (req, res, next) => {
  try {
    const trip = await tripService.complete(req.params.id, req.body);
    success(res, trip, 'Trip completed');
  } catch (err) { next(err); }
};

const cancel = async (req, res, next) => {
  try {
    const trip = await tripService.cancel(req.params.id);
    success(res, trip, 'Trip cancelled');
  } catch (err) { next(err); }
};

module.exports = { list, getOne, create, dispatch, complete, cancel };

const dashboardService = require('./dashboard.service');
const { success } = require('../../utils/response');

const getKPIs = async (req, res, next) => {
  try {
    const kpis = await dashboardService.getKPIs();
    success(res, kpis, 'Dashboard KPIs');
  } catch (err) { next(err); }
};

module.exports = { getKPIs };

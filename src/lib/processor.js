const _ = require('lodash');
const async = require('async');
const logger = require('./log')('[processor]');

module.exports = {
  createRunner(options) {
    logger.debug(`run: ${JSON.stringify(options)}`);
    const self = this;
    return function processorRunner(callback) {
      async.mapLimit(
         self._batchTasks(options),
         options.concurrency || 1,
         self._getRunner(options),
         function runTask(error, results) {
           if (error) {
             logger.debug('error: ', error);
           } else {
             logger.debug('results: ', results);
           }
           callback(error, results);
         }
      );
    };
  },
  _getRunner(options) {
    const runnerImpl = require('./runners/' + options.module);
    return runnerImpl.createRunner(options.moduleOptions);
  },
  _batchTasks(options) {
    if (!options.tasks) {
      return [''];
    }
    if (options.mode === 'single') {
      return [].concat(options.tasks);
    }
    const numberOfBatches = options.tasks.length / options.concurrency;
    return _.chain(options.tasks).groupBy(
      (element, index) => Math.floor(index / numberOfBatches)
    ).toArray().value();
  },
};

const nodeController = require('../lib/node-controller');
const processController = require('../lib/process-controller');
const path = require('path');

describe('NodeController', function () {
  describe('_nodeIdToProcessMapper', function () {
    beforeEach(function () {
      const baseDir = global.wallaby ? global.wallaby.localProjectDir : path.resolve(process.cwd());
      this.processors = [
        {
          name: 'cucumber',
          parallelism: 2,
          processor: {
            source: {
              directory: path.resolve(baseDir, 'src', 'spec', 'test-files'),
              'pattern': '**/*.*',
            },
          },
        },
        {
          name: 'package-tests',
          parallelism: 3,
          processor: {
            source: {
              list: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
            },
          },
        },
        {
          name: 'mocha',
          parallelism: 1,
          processor: {
            source: {
              list: ['h', 'i', 'j', 'k', 'l', 'm', 'n'],
            },
          },
        },
      ];
    });
    it('returns the process name based on the current node id', function () {
      spyOn(processController, 'run');

      nodeController.run({processes: this.processors, nodeId: 0, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].name).toEqual(this.processors[0].name);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 1, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].name).toEqual(this.processors[0].name);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 2, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].name).toEqual(this.processors[1].name);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 3, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].name).toEqual(this.processors[1].name);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 4, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].name).toEqual(this.processors[1].name);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 5, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].name).toEqual(this.processors[2].name);
    });
    it('provides the tasks based on the source strategy, the node id and the parallelism', function () {
      spyOn(processController, 'run');
      nodeController.run({processes: this.processors, nodeId: 0, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].processor.tasks).toEqual(['four-spec.js', 'six-spec.js', 'two-spec.js']);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 1, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].processor.tasks).toEqual(['five-spec.js', 'one-spec.js', 'three-spec.js']);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 2, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].processor.tasks).toEqual(['c', 'f']);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 3, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].processor.tasks).toEqual(['b', 'e']);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 4, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].processor.tasks).toEqual(['a', 'd', 'g']);

      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: 5, totalNodes: 6});
      expect(processController.run.calls.argsFor(0)[0].processor.tasks).toEqual(['h', 'i', 'j', 'k', 'l', 'm', 'n']);
    });
    it('resolves environment variables for nodeId and totalNodes', function () {
      spyOn(processController, 'run');
      process.env.TOTAL_NODES = '6';
      process.env.NODE_ID = '2';
      processController.run.calls.reset();
      nodeController.run({processes: this.processors, nodeId: '$NODE_ID', totalNodes: '$TOTAL_NODES'});
      expect(processController.run.calls.argsFor(0)[0].processor.tasks).toEqual(['c', 'f']);
    });
  });

  describe('run', function () {
    it('runs all tasks that are assigned to the node', function (done) {
      const processes = [
        {
          name: 'cucumber',
          parallelism: 1,
          processor: {
            module: 'noop-runner',
            source: {
              list: [],
            },
          },
        },
        {
          name: 'mocha',
          parallelism: 1,
          processor: {
            module: 'noop-runner',
            source: {
              list: [],
            },
          },
        },
      ];

      spyOn(processController, 'run').and.callThrough();

      nodeController.run(
        {
          processes,
          nodeId: 0,
          totalNodes: 1,
        },
        function onComplete() {
          expect(processController.run.calls.count()).toBe(2);
          done();
        }
      );
    });
  });
});

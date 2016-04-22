const execRunner = require('../lib/runners/exec-runner');
const childProcess = require('child_process');
const stream = require('stream');

describe('Exec Runner', function () {
  describe('createRunner', function () {
    it('flattens task arrays into the command line using a comma separator by default', function () {
      spyOn(childProcess, 'exec').and.returnValue(getProcessStub());
      execRunner.createRunner({
        command: 'command $TASKS',
      })(['task-one', 'task-two']);
      expect(childProcess.exec).toHaveBeenCalledWith(
        'command task-one,task-two',
        undefined,
        jasmine.any(Function)
      );
    });
    it('flattens task arrays into the command line using a the provided separator', function () {
      spyOn(childProcess, 'exec').and.returnValue(getProcessStub());
      execRunner.createRunner({
        command: 'command $TASKS',
        separator: '#',
      })(['task-one', 'task-two', 'task-three']);
      expect(childProcess.exec).toHaveBeenCalledWith(
        'command task-one#task-two#task-three',
        undefined,
        jasmine.any(Function)
      );
    });
    it('creates a command from a single string', function () {
      spyOn(childProcess, 'exec').and.returnValue(getProcessStub());
      execRunner.createRunner({
        command: 'command $TASKS',
      })('single-task');
      expect(childProcess.exec).toHaveBeenCalledWith(
        'command single-task',
        undefined,
        jasmine.any(Function)
      );
    });
    it('delegates errors up the callbacks chain', function () {
      spyOn(childProcess, 'exec').and.returnValue(getProcessStub());
      const callbackChain = jasmine.createSpy();
      execRunner.createRunner({command: 'command'})(null, callbackChain);
      const execCallback = childProcess.exec.calls.argsFor(0)[2];

      execCallback('error', null);

      expect(callbackChain).toHaveBeenCalledWith('error', null);
    });
    it('delegates results up the callbacks chain', function () {
      spyOn(childProcess, 'exec').and.returnValue(getProcessStub());
      const callbackChain = jasmine.createSpy();
      execRunner.createRunner({command: 'command'})(null, callbackChain);
      const execCallback = childProcess.exec.calls.argsFor(0)[2];

      execCallback(null, 'results');

      expect(callbackChain).toHaveBeenCalledWith(null, 'results');
    });
  });

  function getProcessStub() {
    return {
      stdout: new stream.Writable(),
      stderr: new stream.Writable(),
      stdin: new stream.Readable(),
    };
  }
});

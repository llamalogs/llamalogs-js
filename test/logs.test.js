var assert = require('assert');
import {LlamaLogs} from '../src/index'
import LogAggregator from '../src/logAggregator'

describe('Init function', function () {
    it('should set the account key and graph name', function () {
      LlamaLogs.init({accountKey: "123", graphName: "456"})
      const log = LlamaLogs.log({sender: "blah", receiver: "rec"})
      const {logList, statList} = LogAggregator.collectMessages()
      const stringLogs = JSON.stringify(logList)
      const expectedString = `[{"sender":"blah","receiver":"rec","count":1,"errorCount":0,"message":"","errorMessage":"","graph":"456","account":"123","initialMessageCount":1}]`
      assert.equal(stringLogs, expectedString);
    });
});
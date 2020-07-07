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

      LlamaLogs.init({accountKey: "", graphName: ""})
    });

    it('should disable the client once set', function () {
      LlamaLogs.init({disabled: true})
      const log = LlamaLogs.log({sender: "blah", receiver: "rec", accountKey: "123", graphName: "456"})
      const {logList, statList} = LogAggregator.collectMessages()
      const stringLogs = JSON.stringify(logList)
      const expectedString = `[]`
      assert.equal(stringLogs, expectedString);

      LlamaLogs.init({accountKey: "", graphName: "", disabled: false})
    });
});

describe('Log function', function () {
  it('should save a basic log', function () {
      const log = LlamaLogs.log({sender: "blah", receiver: "rec", message: "", accountKey: "123", graphName: "456"})
      const {logList, statList} = LogAggregator.collectMessages()
      const stringLogs = JSON.stringify(logList)
      const expectedString = `[{"sender":"blah","receiver":"rec","count":1,"errorCount":0,"message":"","errorMessage":"","graph":"456","account":"123","initialMessageCount":1}]`
      assert.equal(stringLogs, expectedString);
  })

  it('should save multiple logs', function () {
    LlamaLogs.log({sender: "blah", receiver: "rec", message: "", accountKey: "123", graphName: "456"})
    LlamaLogs.log({sender: "blah", receiver: "rec", message: "hi", accountKey: "123", graphName: "456"})
    LlamaLogs.log({sender: "other", receiver: "rec", message: "otherMessage", accountKey: "123", graphName: "456"})
    LlamaLogs.log({sender: "other", receiver: "rec", message: "errored out", isError: true, accountKey: "123", graphName: "456"})
    const {logList, statList} = LogAggregator.collectMessages()
    const stringLogs = JSON.stringify(logList)
    const expectedString = `[{"sender":"blah","receiver":"rec","count":2,"errorCount":0,"message":"hi","errorMessage":"","graph":"456","account":"123","initialMessageCount":2},{"sender":"other","receiver":"rec","count":2,"errorCount":1,"message":"otherMessage","errorMessage":"errored out","graph":"456","account":"123","initialMessageCount":2}]`
    assert.equal(stringLogs, expectedString);
  })  

  it('should handle null message', function () {
    LlamaLogs.log({sender: "other", receiver: "rec", message: null, accountKey: "123", graphName: "456"})
    LlamaLogs.log({sender: "other", receiver: "rec", message: null, isError: true, accountKey: "123", graphName: "456"})
    const {logList, statList} = LogAggregator.collectMessages()
    const stringLogs = JSON.stringify(logList)
    const expectedString = `[{"sender":"other","receiver":"rec","count":2,"errorCount":1,"message":"","errorMessage":"","graph":"456","account":"123","initialMessageCount":2}]`
    assert.equal(stringLogs, expectedString);
  })  
})
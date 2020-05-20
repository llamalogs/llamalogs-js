import LogAggregator from './logAggregator'

import Log from './interfaces/log.interface'
import ReturnLog from './interfaces/returnLog.interface'
import Stat from './interfaces/stat.interface'

let globalAccountKey: string = ''
let globalGraphName: string = ''

class LlamaLogs {
	static init(options) {
		let {accountKey = '', graphName = ''} = options
		try {
			globalAccountKey = accountKey.toString()
			globalGraphName = graphName.toString()
		} catch (e) {
			console.error(`LlamaLogs Error: Init function; ${e}`)
		}
	}

	static pointStat(params) {
		try {
			LlamaLogs.stat({...params, type: 'point'})
		} catch (e) {
			console.error(`LlamaLogs Error: pointStat function; ${e}`)
		}
	}

	static avgStat(params) {
		try {
			LlamaLogs.stat({...params, type: 'average'})
		} catch (e) {
			console.error(`LlamaLogs Error: avgStat function; ${e}`)
		}
	}

	static maxStat(params) {
		try {
			LlamaLogs.stat({...params, type: 'max'})
		} catch (e) {
			console.error(`LlamaLogs Error: maxStat function; ${e}`)
		}
	}
	
	static log(params, returnParams = {}) {
		try {
			LlamaLogs.processLog(params, returnParams)
		} catch (e) {
			console.error(`LlamaLogs Error: Log function; ${e}`)
		}
	}
	
	static async forceSend() {
		try {
			await LogAggregator.sendMessages()
		} catch (e) {
			console.error(`LlamaLogs Error: forceSend function; ${e}`)
		}
	}
	
	private static stat(params) {
		const {component, type, name, value, graphName, accountKey} = params
		if (!component || !type || !name || !value) throw new Error('missing required param')
		
		const startTimestamp = Date.now()
		
		const message: Stat = {
				component: component.toString(),
				timestamp: startTimestamp,
				name: name.toString(),
				value: Number(value),
				type: type.toString(),
				account: (accountKey || globalAccountKey || -1).toString(),
				graph: (graphName || globalGraphName).toString()
			}

		LogAggregator.addStat(message)
	}

	private static processLog(params, returnParams = {}): ReturnLog {
		const startTimestamp = Date.now()
		const fullParams = {...returnParams, ...params}
		const {sender, receiver, s, r, log, graphName, accountKey, error, initialMessage, startTime} = fullParams
		
		if (!sender || !receiver) throw new Error('missing sender or receiver param')
		if (!(graphName || globalGraphName)) throw new Error('missing graphName param')
		if (!(accountKey || globalAccountKey)) throw new Error('missing accountKey param')
		if (!(log || '').toString) throw new Error('log param must have toString method')
		
		const message: Log = {
			sender: (s || sender || 'emptySender').toString(),
			receiver: (r || receiver || 'emptyReceiver').toString(),
			log: (log || '').toString(),
			error: (error && true) || false,

			timestamp: startTimestamp,
			initialMessage: true,
			account: (accountKey || globalAccountKey || -1).toString(),
			graph: (graphName || globalGraphName).toString(),
			elapsed: undefined
		}

		if (initialMessage !== undefined) {
			message.initialMessage = initialMessage
		}
		if (startTime !== undefined) {
			message.elapsed = startTimestamp - startTime
		}

		LogAggregator.addMessage(message)

		const returnData: ReturnLog = {
			sender: receiver,
			receiver: sender,
			initialMessage: false,
			startTime: startTimestamp,
			accountKey: message.account,
			graphName: message.graph
		}

		return returnData
	}
}

export {LlamaLogs, LlamaLogs as LLL}
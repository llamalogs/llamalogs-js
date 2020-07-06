import LogAggregator from './logAggregator'

import Log from './interfaces/log.interface'
import ReturnLog from './interfaces/returnLog.interface'
import Stat from './interfaces/stat.interface'

let globalAccountKey: string = ''
let globalGraphName: string = ''

export class LlamaLogs {
	static isDevEnv: boolean = false;
	static isDisabled: boolean = false;

	static init(options) {
		let {accountKey = '', graphName = '', isDevEnv = false, disabled = false} = options
		try {
			globalAccountKey = accountKey.toString()
			globalGraphName = graphName.toString()
			LlamaLogs.isDevEnv = isDevEnv
			LlamaLogs.isDisabled = disabled
		} catch (e) {
			console.error(`LlamaLogs Error: Init function; ${e}`)
		}
	}

	static pointStat(params) {
		try {
			if (LlamaLogs.isDisabled) return
			LlamaLogs.stat({...params, type: 'point'})
		} catch (e) {
			console.error(`LlamaLogs Error: pointStat function; ${e}`)
		}
	}

	static avgStat(params) {
		try {
			if (LlamaLogs.isDisabled) return
			LlamaLogs.stat({...params, type: 'average'})
		} catch (e) {
			console.error(`LlamaLogs Error: avgStat function; ${e}`)
		}
	}

	static maxStat(params) {
		try {
			if (LlamaLogs.isDisabled) return
			LlamaLogs.stat({...params, type: 'max'})
		} catch (e) {
			console.error(`LlamaLogs Error: maxStat function; ${e}`)
		}
	}
	
	static log(params, returnParams = {}) {
		try {
			if (LlamaLogs.isDisabled) return
			LlamaLogs.processLog(params, returnParams)
		} catch (e) {
			console.error(`LlamaLogs Error: Log function; ${e}`)
		}
	}
	
	static async forceSend() {
		try {
			if (LlamaLogs.isDisabled) return
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
		const {sender, receiver, s, r, message, graphName, accountKey, isError, initialMessage, startTime} = fullParams

		if (!sender || !receiver) throw new Error('missing sender or receiver param')
		if (!(graphName || globalGraphName)) throw new Error('missing graphName param')
		if (!(accountKey || globalAccountKey)) throw new Error('missing accountKey param')
		if (!(message || '').toString) throw new Error('log param must have toString method')
		
		const newMessage: Log = {
			sender: (s || sender || 'emptySender').toString(),
			receiver: (r || receiver || 'emptyReceiver').toString(),
			message: (message || '').toString(),
			isError: (isError && true) || false,

			timestamp: startTimestamp,
			initialMessage: true,
			account: (accountKey || globalAccountKey || -1).toString(),
			graph: (graphName || globalGraphName).toString(),
			elapsed: undefined
		}

		if (initialMessage !== undefined) {
			newMessage.initialMessage = initialMessage
		}
		if (startTime !== undefined) {
			newMessage.elapsed = startTimestamp - startTime
		}

		LogAggregator.addMessage(newMessage)

		const returnData: ReturnLog = {
			sender: receiver,
			receiver: sender,
			initialMessage: false,
			startTime: startTimestamp,
			accountKey: newMessage.account,
			graphName: newMessage.graph
		}

		return returnData
	}
}
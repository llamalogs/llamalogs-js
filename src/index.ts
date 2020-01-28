import LogAggregator from './logAggregator'

let globalAccountKey: string = ''
let globalGraphName: string = ''

class LlamaLogs {
	static init(options) {
		const {accountKey = '', graphName = ''} = options
		globalAccountKey = accountKey
		globalGraphName = graphName
	}

	static pointStat(params) {
		LlamaLogs.stat({...params, type: 'point'})
	}

	static avgStat(params) {
		LlamaLogs.stat({...params, type: 'average'})
	}

	static maxStat(params) {
		LlamaLogs.stat({...params, type: 'max'})
	}

	private static stat(params) {
		const {component, type, name, value, graphName, accountKey} = params
		if (!component || !type || !name || !value) return
		
		const startTimestamp = Date.now()
		
		const message = {
				component,
				timestamp: startTimestamp,
				name,
				value,
				type,
				account: accountKey || globalAccountKey,
				graph: graphName || globalGraphName
			}

		LogAggregator.addStat(message)
	}

	static log(params, returnParams = {}) {
		const startTimestamp = Date.now()
		const fullParams = {...returnParams, ...params}
		const {sender, receiver, log, graphName, accountKey, error, initialMessage, startTime} = fullParams
		if (!sender || !receiver) return
		if (!(graphName || globalGraphName)) return

		const message: any = {
			sender,
			receiver,
			timestamp: startTimestamp,
			log: log || '',
			initialMessage: true,
			account: accountKey || globalAccountKey || -1,
			graph: graphName || globalGraphName,
			error: error || false
		}

		if (initialMessage !== undefined) {
			message.initialMessage = initialMessage
		}
		if (startTime !== undefined) {
			message.elapsed = startTimestamp - startTimestamp
		}

		LogAggregator.addMessage(message)

		const returnData = {
			sender: receiver,
			receiver: sender,
			initialMessage: false,
			startTime: startTimestamp,
			account: accountKey || globalAccountKey || -1,
			graph: graphName || globalGraphName
		}

		return returnData
	}

	static async forceSend() {
		await LogAggregator.sendMessages()
	}
}

export {LlamaLogs, LlamaLogs as LLL}
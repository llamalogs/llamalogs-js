import LlamaProxy from './llamaProxy'
import Log from './interfaces/log.interface'
import Stat from './interfaces/stat.interface'
import {LlamaLogs} from './index'

let aggregateLogs = {}
let aggregateStats = {}

let timeoutClear = null
let lastSendTime = 0

export default class LogAggregator {
	static startSending() {
		LogAggregator.setNewTimeout()
	}
	
	// using a system of repeating timeouts so that process
	// is not kept alive by a LlamaLogs interval
	static addTime() {
		if(timeoutClear) {
			// if its time to resend, 5 sec added on end
			// using shorter period if in dev
			const defaultOneMinPoll = LlamaLogs.isDevEnv ? 5000 : 54500

			if (lastSendTime < Date.now() - defaultOneMinPoll) return
			clearTimeout(timeoutClear)
			LogAggregator.setNewTimeout()
		} else {
			LogAggregator.setNewTimeout()
		}
	}

	static setNewTimeout() {
		timeoutClear = setTimeout(() => {
			timeoutClear = null
			this.sendMessages()
		}, 5000)
	}

	static collectMessages() {
		lastSendTime = Date.now()
        const currentAggLogs = aggregateLogs
        aggregateLogs = {}
        const currentAggStats = aggregateStats
		aggregateStats = {}
		
		const isDev = LlamaLogs.isDevEnv
		if (isDev) console.log('sending messages')

		// turning into array of aggregates
		const logList = []
		Object.keys(currentAggLogs).forEach(sender => {
			Object.keys(currentAggLogs[sender]).forEach(receiver => {
				logList.push({
					sender, 
					receiver,
					count: currentAggLogs[sender][receiver].total,
					errorCount: currentAggLogs[sender][receiver].errors,
					message: currentAggLogs[sender][receiver].message,
					errorMessage: currentAggLogs[sender][receiver].errorMessage,
					graph: currentAggLogs[sender][receiver].graph || 'noGraph',
					account: currentAggLogs[sender][receiver].account,
					initialMessageCount: currentAggLogs[sender][receiver].initialMessageCount
				})
			})
		})

		if(isDev) {
			console.log('messages')
			console.log(logList)
		}	

		const statList = []
		Object.keys(currentAggStats).forEach(component => {
			Object.keys(currentAggStats[component]).forEach(name => {
				const ob = currentAggStats[component][name]
				ob.clientTimestamp = ob.timestamp
				statList.push(ob)
			})
		})

		if(isDev) {
			console.log('stats')
			console.log(statList)
		}

		return {logList, statList}
	}
    
    static async sendMessages() {
		const {logList, statList} =  LogAggregator.collectMessages()
        await LlamaProxy.sendMessages(logList, statList)
    }

	static addStat(message: Stat) {
		LogAggregator.addTime()

		if (message.type === "point") {
			aggregateStats[message.component] = aggregateStats[message.component] || {}
			aggregateStats[message.component][message.name] = message
		}

		if (message.type === 'average') {
			LogAggregator.addStatAvg(message)
		}

		if (message.type === 'max') {
			LogAggregator.addStatMax(message)
		}
	}

	static addStatAvg(message: Stat) {		
		aggregateStats[message.component] = aggregateStats[message.component] || {}
		if (!aggregateStats[message.component][message.name]) {
			aggregateStats[message.component][message.name] = message
			message.count = 1
			return
		}
		const existing = aggregateStats[message.component][message.name]
		const value = existing.value
		const newTotal = value + message.value
		existing.value = newTotal
		existing.count = existing.count + 1
	}

	static addStatMax(message: Stat) {		
		aggregateStats[message.component] = aggregateStats[message.component] || {}
		if (!aggregateStats[message.component][message.name]) {
			aggregateStats[message.component][message.name] = message
			return
		}
		const existing = aggregateStats[message.component][message.name]
		const value = existing.value
		if (message.value < value) return
		existing.value = message.value
	}

	// static addStatUniq() {
		// some sort of method to identify how many unique values have been sent in 
		// with the component name
	// }

	static addMessage(message: Log) {
		LogAggregator.addTime()
		
		aggregateLogs[message.sender] = aggregateLogs[message.sender] || {}
		aggregateLogs[message.sender][message.receiver] = aggregateLogs[message.sender][message.receiver] || LogAggregator.initAggregateObject(message) 
		const aggObj = aggregateLogs[message.sender][message.receiver]

		if (message.isError) aggObj.errors++
		// averaging in new elapsed time
		if (message.elapsed) {
			const prevAmount = aggObj.elapsed * aggObj.elapsedCount
			aggObj.elapsed = (prevAmount + message.elapsed) / (aggObj.elapsedCount + 1)
			aggObj.elapsedCount = aggObj.elapsedCount + 1
		}
		if (message.initialMessage) {
			aggObj.initialMessageCount++
		}

		aggObj.total++
		if (!aggObj.log && !message.isError) aggObj.message = message.message.toString()
		if (!aggObj.errorLog && message.isError) aggObj.errorMessage = message.message.toString()

		return aggregateLogs
	}	

	private static initAggregateObject(message: Log) {
		return {
			sender: message.sender,
			receiver: message.receiver,
			account: message.account,
			total: 0,
			errors: 0,
			elapsed: 0,
			elapsedCount: 0,
			message: '',
			errorMessage: '',
			initialMessageCount: 0,
			graph: message.graph
		}
	}
}
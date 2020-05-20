const bent = require('bent')

const isDev = false
const url = isDev ? 'http://localhost:4000/' : 'https://llamalogs.com/'

export default class LlamaProxy {
    static async sendMessages(aggregateLogs, aggregateStats) {
		// turning into array of aggregates
		const logList = []
		Object.keys(aggregateLogs).forEach(sender => {
			Object.keys(aggregateLogs[sender]).forEach(receiver => {
				logList.push({
					sender, 
					receiver,
					count: aggregateLogs[sender][receiver].total,
					errorCount: aggregateLogs[sender][receiver].errors,
					log: aggregateLogs[sender][receiver].log,
					errorLog: aggregateLogs[sender][receiver].errorLog,
					clientTimestamp: Date.now(),
					graph: aggregateLogs[sender][receiver].graph || 'noGraph',
					account: aggregateLogs[sender][receiver].account,
					initialMessageCount: aggregateLogs[sender][receiver].initialMessageCount
				})
			})
		})

		if(isDev) {
			console.log('messages')
			console.log(logList)
		}	
		
		if (logList.length) {
			const post = bent(url, 'POST', 'json', 200);
			try {
				await post('api/timelogs', {time_logs: logList})
			} catch (e) {
				console.log(`LlamaLogs Error; contacting llama logs server; ${e}`)
			}
		}

		const statList = []
		Object.keys(aggregateStats).forEach(component => {
			Object.keys(aggregateStats[component]).forEach(name => {
				const ob = aggregateStats[component][name]
				ob.clientTimestamp = ob.timestamp
				statList.push(ob)
			})
		})

		if(isDev) {
			console.log('stats')
			console.log(statList)
		}

		if (statList.length) {
			const post = bent(url, 'POST', 'json', 200);
			try {
				await post('api/timestats', {time_stats: statList})
			} catch (e) {
				console.log(`LlamaLogs Error; contacting llama logs server; ${e}`)
			}
		}
	}
}
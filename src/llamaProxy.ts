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
					message: aggregateLogs[sender][receiver].message,
					errorMessage: aggregateLogs[sender][receiver].errorMessage,
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

		if (logList.length || statList.length) {
			let account_key = ''
			if (logList.length) account_key = logList[0].account
			if (statList.length) account_key = statList[0].account

			const post = bent(url, 'POST', 'json', 200);
			try {
				await post('api/v0/timedata', {account_key, time_logs: logList, time_stats: statList})
			} catch (e) {
				console.log(`LlamaLogs Error; contacting llama logs server; ${e}`)
			}
		}
	}
}
const bent = require('bent')
import {LlamaLogs} from './index'

export default class LlamaProxy {
    static async sendMessages(logList, statList) {
		if (logList.length || statList.length) {
			let account_key = ''
			if (logList.length) account_key = logList[0].account
			if (statList.length) account_key = statList[0].account

			const isDev = LlamaLogs.isDevEnv
			const url = isDev ? 'http://localhost:4000/' : 'https://llamalogs.com/'
			
			const post = bent(url, 'POST', 'json', 200);
			try {
				await post('api/v0/timedata', {account_key, time_logs: logList, time_stats: statList})
				if(isDev) { console.log('send data') }
			} catch (e) {
				console.log(`LlamaLogs Error; contacting llama logs server; ${e}`)
			}
		}
	}
}
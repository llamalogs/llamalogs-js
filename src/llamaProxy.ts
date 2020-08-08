const axios = require('axios').default;
import {LlamaLogs} from './index'

export default class LlamaProxy {
    static async sendMessages(logList, statList) {
		if (logList.length || statList.length) {
			let account_key = ''
			if (logList.length) account_key = logList[0].account
			if (statList.length) account_key = statList[0].account

			const isDev = LlamaLogs.isDevEnv
			const url = isDev ? 'http://localhost:4000/' : 'https://llamalogs.com/'

			if (isDev) {
				console.log("loglist")
				console.log(logList)
			}

			try { 
				await new Promise((resolve, reject) => {
					axios({
						method: 'post',
						timeout: 5000,
						url: `${url}api/v0/timedata`,
						data: {account_key, time_logs: logList, time_stats: statList}
					  })
					  .then(() => resolve())
					  .catch((e) => reject(e))
				})
			} catch (e) {
				console.log(`LlamaLogs Error; contacting llama logs server; ${e}`)
			}
		}
	}
}
#!/usr/bin/env node

/**
 * Unified Database Reset Script
 *
 * Intelligently resets databases for both Preview and Production environments
 * Can be run locally, in GitHub Actions, or manually
 */

const https = require('https')

// Environment URLs with fallbacks
const ENVIRONMENTS = {
	preview: [
		'https://react-demo-preview.vercel.app/api/users/admin/reset',
		'https://react-demo-git-main.vercel.app/api/users/admin/reset',
	],
	production: [
		'https://server-ljy4cbion-davids-projects-8b1113d6.vercel.app/api/users/admin/reset',
		'https://react-demo-server.vercel.app/api/users/admin/reset',
	],
}

class DatabaseReset {
	constructor(options = {}) {
		this.verbose = options.verbose || process.env.VERBOSE === 'true'
		this.timeout = options.timeout || 30000
	}

	log(message, level = 'info') {
		const timestamp = new Date().toISOString()
		const emoji = {
			info: '📋',
			success: '✅',
			warning: '⚠️',
			error: '❌',
			debug: '🔍',
		}

		console.log(`${emoji[level]} [${timestamp}] ${message}`)
	}

	async makeApiCall(url, retries = 2) {
		return new Promise((resolve, reject) => {
			const request = https.request(
				url,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'User-Agent': 'DatabaseReset/1.0',
					},
					timeout: this.timeout,
				},
				(response) => {
					let data = ''

					response.on('data', (chunk) => {
						data += chunk
					})

					response.on('end', () => {
						const result = {
							statusCode: response.statusCode,
							body: data,
							url: url,
						}

						try {
							result.json = JSON.parse(data)
						} catch (e) {
							result.json = null
						}

						resolve(result)
					})
				}
			)

			request.on('error', (error) => {
				if (retries > 0) {
					this.log(`Retrying ${url} (${retries} attempts left)`, 'warning')
					setTimeout(() => {
						this.makeApiCall(url, retries - 1)
							.then(resolve)
							.catch(reject)
					}, 1000)
				} else {
					reject(new Error(`Network error for ${url}: ${error.message}`))
				}
			})

			request.on('timeout', () => {
				request.destroy()
				reject(new Error(`Timeout for ${url}`))
			})

			request.end()
		})
	}

	async resetEnvironment(environmentName) {
		const urls = ENVIRONMENTS[environmentName]
		if (!urls) {
			throw new Error(`Unknown environment: ${environmentName}`)
		}

		this.log(`🔄 Resetting ${environmentName} database...`)

		for (const url of urls) {
			try {
				this.log(`🌐 Trying: ${url}`, 'debug')

				const result = await this.makeApiCall(url)

				if (result.statusCode >= 200 && result.statusCode < 300) {
					this.log(
						`✅ ${environmentName} database reset successful!`,
						'success'
					)
					this.log(`📊 Response: ${result.body}`, 'debug')

					return {
						success: true,
						environment: environmentName,
						url: url,
						response: result.json || result.body,
						statusCode: result.statusCode,
					}
				} else {
					this.log(`HTTP ${result.statusCode} from ${url}`, 'warning')
					if (this.verbose) {
						this.log(`Response: ${result.body}`, 'debug')
					}
				}
			} catch (error) {
				this.log(`Failed ${url}: ${error.message}`, 'warning')
			}
		}

		// If we get here, all URLs failed
		const isProduction = environmentName === 'production'

		this.log(`⚠️ All ${environmentName} URLs failed`, 'warning')

		if (isProduction) {
			this.log(
				'💡 Production API might not be deployed or accessible',
				'warning'
			)
		} else {
			this.log('💡 Preview environment might be in memory mode', 'warning')
		}

		return {
			success: false,
			environment: environmentName,
			error: 'All URLs failed',
			urls: urls,
		}
	}

	async resetAll(environments = ['preview', 'production']) {
		this.log(`🚀 Starting database reset for: ${environments.join(', ')}`)

		const results = {}

		for (const env of environments) {
			try {
				results[env] = await this.resetEnvironment(env)
			} catch (error) {
				results[env] = {
					success: false,
					environment: env,
					error: error.message,
				}
				this.log(`❌ ${env} reset failed: ${error.message}`, 'error')
			}
		}

		// Summary
		this.log('📊 Reset Summary:', 'info')
		for (const [env, result] of Object.entries(results)) {
			const status = result.success ? '✅ Success' : '❌ Failed'
			this.log(`  ${env}: ${status}`, 'info')
		}

		return results
	}
}

// CLI interface
if (require.main === module) {
	const args = process.argv.slice(2)
	const environment = args[0] || 'all'
	const verbose = args.includes('--verbose') || args.includes('-v')

	const resetter = new DatabaseReset({ verbose })

	async function main() {
		try {
			let results

			if (environment === 'all') {
				results = await resetter.resetAll()
			} else if (ENVIRONMENTS[environment]) {
				const result = await resetter.resetEnvironment(environment)
				results = { [environment]: result }
			} else {
				console.error(`❌ Unknown environment: ${environment}`)
				console.error(
					`💡 Available: ${Object.keys(ENVIRONMENTS).join(', ')}, all`
				)
				process.exit(1)
			}

			// Exit with error if any environment failed
			const hasFailures = Object.values(results).some((r) => !r.success)
			process.exit(hasFailures ? 1 : 0)
		} catch (error) {
			console.error(`❌ Script failed: ${error.message}`)
			process.exit(1)
		}
	}

	main()
}

module.exports = { DatabaseReset, ENVIRONMENTS }

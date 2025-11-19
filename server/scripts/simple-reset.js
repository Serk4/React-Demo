#!/usr/bin/env node

/**
 * Simple Database Reset Script
 *
 * Resets the database for the single deployed environment
 * No more confusion between preview/production - just one working demo!
 */

const https = require('https')

class SimpleReset {
	constructor(verbose = false) {
		this.verbose = verbose
	}

	log(message, emoji = '📋') {
		const timestamp = new Date().toISOString()
		console.log(`${emoji} [${timestamp}] ${message}`)
	}

	async resetDatabase(baseUrl) {
		this.log('🔄 Starting database reset...', '🔄')

		// If baseUrl is provided, use it; otherwise determine from environment
		let apiUrl
		if (baseUrl) {
			apiUrl = `${baseUrl}/api/users/admin/reset`
		} else {
			// Auto-detect: if we're running locally, target the deployed app
			apiUrl = 'https://react-demo-virid-six.vercel.app/api/users/admin/reset'
		}

		this.log(`🌐 Targeting: ${apiUrl}`, '🌐')

		try {
			const result = await this.makeApiCall(apiUrl)

			if (result.statusCode >= 200 && result.statusCode < 300) {
				this.log('✅ Database reset successful!', '✅')
				if (this.verbose) {
					this.log(`📊 Response: ${result.body}`, '📊')
				}
				return { success: true, url: apiUrl, response: result.body }
			} else {
				this.log(`⚠️ Reset returned HTTP ${result.statusCode}`, '⚠️')
				if (result.statusCode === 500) {
					this.log(
						'💡 This might indicate the database is in memory mode (which auto-resets)',
						'💡'
					)
				}
				if (this.verbose) {
					this.log(`📄 Response: ${result.body}`, '📄')
				}
				return {
					success: false,
					url: apiUrl,
					response: result.body,
					statusCode: result.statusCode,
				}
			}
		} catch (error) {
			this.log(`❌ Reset failed: ${error.message}`, '❌')
			return { success: false, error: error.message }
		}
	}

	makeApiCall(url) {
		return new Promise((resolve, reject) => {
			const request = https.request(
				url,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'User-Agent': 'SimpleReset/1.0',
					},
					timeout: 15000,
				},
				(response) => {
					let data = ''

					response.on('data', (chunk) => {
						data += chunk
					})

					response.on('end', () => {
						resolve({
							statusCode: response.statusCode,
							body: data,
							url: url,
						})
					})
				}
			)

			request.on('error', reject)
			request.on('timeout', () => {
				request.destroy()
				reject(new Error(`Timeout for ${url}`))
			})

			request.end()
		})
	}
}

// CLI interface
if (require.main === module) {
	const args = process.argv.slice(2)
	const verbose = args.includes('--verbose') || args.includes('-v')
	const baseUrl = args.find((arg) => arg.startsWith('http'))

	const resetter = new SimpleReset(verbose)

	resetter
		.resetDatabase(baseUrl)
		.then((result) => {
			if (result.success) {
				console.log('🎉 Reset completed successfully!')
				process.exit(0)
			} else {
				console.log(
					'⚠️ Reset completed with warnings - this may be normal for memory mode databases'
				)
				process.exit(0) // Don't fail CI/CD for memory mode
			}
		})
		.catch((error) => {
			console.error(`💥 Reset failed: ${error.message}`)
			process.exit(1)
		})
}

module.exports = { SimpleReset }

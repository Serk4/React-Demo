#!/usr/bin/env node

/**
 * Reset Preview Database Script
 *
 * This script resets the Preview database by making an API call to the deployed Preview environment.
 * This is safer than trying to connect directly to the production database from local environment.
 */

const https = require('https')

async function resetPreviewDatabase() {
	console.log('🔄 Resetting Preview database via API...')

	// Try different possible Preview URLs
	const previewUrls = [
		'https://react-demo-git-docs-mysql-documentation-cleanup-serks-projects-ec13c0f4.vercel.app',
		'https://react-demo-preview.vercel.app',
		'https://react-demo-git-main.vercel.app',
	]

	for (const baseUrl of previewUrls) {
		try {
			console.log(`🌐 Trying: ${baseUrl}/api/admin/reset`)

			const result = await makeApiCall(`${baseUrl}/api/admin/reset`)
			console.log('✅ Preview database reset successfully!')
			console.log('📊 Result:', result)
			return
		} catch (error) {
			console.log(`❌ Failed with ${baseUrl}: ${error.message}`)
		}
	}

	console.error('💥 Could not reset preview database - all URLs failed')
	console.log(
		'💡 You can also visit the Preview app and use the admin panel manually'
	)
}

function makeApiCall(url) {
	return new Promise((resolve, reject) => {
		const request = https.request(
			url,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			},
			(response) => {
				let data = ''

				response.on('data', (chunk) => {
					data += chunk
				})

				response.on('end', () => {
					if (response.statusCode >= 200 && response.statusCode < 300) {
						try {
							resolve(JSON.parse(data))
						} catch (e) {
							resolve(data)
						}
					} else {
						reject(new Error(`HTTP ${response.statusCode}: ${data}`))
					}
				})
			}
		)

		request.on('error', (error) => {
			reject(error)
		})

		request.end()
	})
}

// Run if executed directly
if (require.main === module) {
	resetPreviewDatabase()
		.then(() => {
			console.log('🎉 Script completed')
			process.exit(0)
		})
		.catch((error) => {
			console.error('💥 Script failed:', error.message)
			process.exit(1)
		})
}

module.exports = { resetPreviewDatabase }

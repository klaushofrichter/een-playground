import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
import {
  loginToApplication,
  logoutFromApplication,
  getLastPartOfUrl,
  clickNavButton,
  MAX_TEST_TIMEOUT
} from './utils'
import { APP_NAME } from '../src/constants.js'

// Load environment variables from .env file
dotenv.config()

let loggedBaseURL = false // Flag to ensure baseURL is logged only once
let basePath = ''

test.describe('Sensors Page - Refresh Buttons', () => {
  test.beforeEach(async ({ page }) => {
    // Log Base URL and Proxy URL once before the first test runs
    if (!loggedBaseURL) {
      const baseURL = page.context()._options.baseURL
      const configuredProxyUrl = process.env.VITE_AUTH_PROXY_URL || 'http://127.0.0.1:3333' // Default logic
      const redirectUri = process.env.VITE_REDIRECT_URI || 'http://127.0.0.1:3333'
      basePath = getLastPartOfUrl(baseURL)
      if (baseURL) {
        console.log(`\n🚀 Running tests against Service at URL: ${baseURL}`)
        console.log(`🔒 Using Auth Proxy URL: ${configuredProxyUrl}`)
        console.log(`🔒 Using Redirect URI: ${redirectUri}`)
        console.log(`📂 Using basePath: ${basePath}\n`)
      }
      loggedBaseURL = true // Set flag so it doesn't log again
    }
  })

  test('should navigate to sensors page and verify refresh buttons work', async ({ page }) => {
    console.log(`\n▶️ Running Test: ${test.info().title}\n`)
    console.log('🔍 Starting sensors refresh buttons test')
    test.setTimeout(MAX_TEST_TIMEOUT)

    // Login before the test
    await loginToApplication(page, basePath)

    // Navigate to the Sensors page
    console.log('🧭 Navigating to Sensors page')
    const sensorsNavButton = page.getByRole('link', { name: 'Sensors' }).first()
    await sensorsNavButton.click()
    
    // Verify we're on the sensors page by checking for the main heading
    await expect(page.getByText('Sensor Management')).toBeVisible({ timeout: 10000 })
    console.log('✅ Successfully navigated to Sensors page')

    // Test Gateway Refresh first
    console.log('🔍 Testing Refresh Gateways functionality')
    const refreshGatewaysButton = page.getByRole('button', { name: 'Refresh Gateways' })
    await expect(refreshGatewaysButton).toBeVisible({ timeout: 10000 })
    console.log('✅ Refresh Gateways button is visible')

    // Click the "Refresh Gateways" button
    console.log('👆 Clicking Refresh Gateways button')
    await refreshGatewaysButton.click()
    
    // Wait for the button to show loading state and then return to normal
    await expect(page.getByRole('button', { name: 'Loading...' })).toBeVisible({ timeout: 5000 })
    console.log('⏳ Refresh Gateways loading state detected')
    
    // Wait for loading to complete (button text returns to "Refresh Gateways")
    await expect(refreshGatewaysButton).toBeVisible({ timeout: 15000 })
    console.log('✅ Refresh Gateways completed successfully')

    // Verify gateway section is still present
    await expect(page.getByRole('heading', { name: 'Sensor Gateways' })).toBeVisible()
    console.log('✅ Sensor Gateways section remains visible after refresh')

    // Test Sensor Refresh second (only if gateways succeeded)
    console.log('🔍 Testing Refresh Sensors functionality')
    const refreshSensorsButton = page.getByRole('button', { name: 'Refresh Sensors' })
    await expect(refreshSensorsButton).toBeVisible({ timeout: 10000 })
    console.log('✅ Refresh Sensors button is visible')

    // Click the "Refresh Sensors" button
    console.log('👆 Clicking Refresh Sensors button')
    await refreshSensorsButton.click()
    
    // Wait for the button to show loading state and then return to normal
    await expect(page.getByRole('button', { name: 'Loading...', exact: false })).toBeVisible({ timeout: 5000 })
    console.log('⏳ Refresh Sensors loading state detected')
    
    // Wait for loading to complete (button text returns to "Refresh Sensors")
    await expect(refreshSensorsButton).toBeVisible({ timeout: 15000 })
    console.log('✅ Refresh Sensors completed successfully')

    // Verify sensor section is still present using more specific selector
    await expect(page.getByRole('heading', { name: 'Sensor Devices' })).toBeVisible()
    console.log('✅ Sensor Devices section remains visible after refresh')

    // Final verification that both sections are working
    await expect(page.getByText('Sensor Management')).toBeVisible()
    console.log('✅ Both refresh operations completed successfully')

    // Logout to clean up
    await logoutFromApplication(page, false, true)
    console.log('✅ Sensors refresh buttons test completed successfully')
  })
}) 
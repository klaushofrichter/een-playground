import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
import {
  loginToApplication,
  logoutFromApplication,
  getLastPartOfUrl,
  MAX_TEST_TIMEOUT
} from './utils'
import { APP_NAME } from '../src/constants.js'

// Load environment variables from .env file
dotenv.config()

let loggedBaseURL = false // Flag to ensure baseURL is logged only once
let basePath = ''

test.describe('Cameras Page - Refresh Button', () => {
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

  test('should navigate to cameras page and verify refresh button works', async ({ page }) => {
    console.log(`\n▶️ Running Test: ${test.info().title}\n`)
    console.log('🔍 Starting cameras refresh button test')
    test.setTimeout(MAX_TEST_TIMEOUT)

    // Login before the test
    await loginToApplication(page, basePath)

    // Navigate to the Cameras page
    console.log('🧭 Navigating to Cameras page')
    const camerasNavButton = page.getByRole('link', { name: 'Cameras' }).first()
    await camerasNavButton.click()
    
    // Verify we're on the cameras page by checking for the main heading
    await expect(page.getByText('Camera Management')).toBeVisible({ timeout: 10000 })
    console.log('✅ Successfully navigated to Cameras page')

    // Test Camera Refresh functionality
    console.log('🔍 Testing Refresh Cameras functionality')
    const refreshCamerasButton = page.getByRole('button', { name: 'Refresh Cameras' })
    await expect(refreshCamerasButton).toBeVisible({ timeout: 10000 })
    console.log('✅ Refresh Cameras button is visible')

    // Click the "Refresh Cameras" button
    console.log('👆 Clicking Refresh Cameras button')
    await refreshCamerasButton.click()
    
    // Wait for the button to show loading state and then return to normal
    await expect(page.getByRole('button', { name: 'Loading...' })).toBeVisible({ timeout: 5000 })
    console.log('⏳ Refresh Cameras loading state detected')
    
    // Wait for loading to complete (button text returns to "Refresh Cameras")
    await expect(refreshCamerasButton).toBeVisible({ timeout: 15000 })
    console.log('✅ Refresh Cameras completed successfully')

    // Verify camera section is still present
    await expect(page.getByRole('heading', { name: 'Camera Devices' })).toBeVisible()
    console.log('✅ Camera Devices section remains visible after refresh')

    // Verify the page is still functional
    await expect(page.getByText('Camera Management')).toBeVisible()
    console.log('✅ Camera page refresh operation completed successfully')

    // Logout to clean up
    await logoutFromApplication(page, false, true)
    console.log('✅ Cameras refresh button test completed successfully')
  })
}) 
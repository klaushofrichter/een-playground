import { useAuthStore } from '../stores/auth'
import securityService from './security'

/**
 * Camera Service for interacting with EEN Camera APIs
 */
class CameraService {
  /**
   * Get a list of cameras
   * @param {Object} [options] - Query options
   * @param {Array<string>} [options.include] - Fields to include in response
   * @param {Array<string>} [options.sort] - Sorting options
   * @param {string} [options.pageToken] - Page token for pagination
   * @param {number} [options.pageSize] - Number of results per page
   * @returns {Promise<Object>} Paginated list of cameras
   * @throws {Error} If the request fails
   */
  async listCameras(options = {}) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    try {
      const queryParams = new URLSearchParams()
      
      // Add include parameters if provided
      if (options.include?.length) {
        queryParams.append('include', options.include.join(','))
      }
      if (options.sort?.length) {
        queryParams.append('sort', options.sort.join(','))
      }
      if (options.pageToken) {
        queryParams.append('pageToken', options.pageToken)
      }
      if (typeof options.pageSize === 'number') {
        queryParams.append('pageSize', options.pageSize.toString())
      }
      
      const requestUrl = `${authStore.baseUrl}/api/v3.0/cameras${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      
      // Validate URL scheme
      if (!securityService.validateUrlScheme(requestUrl)) {
        throw new Error('Invalid request URL scheme')
      }
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch cameras: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[CameraService] Error fetching cameras:', error)
      throw error
    }
  }

  /**
   * Get camera details by ID
   * @param {string} cameraId - The ID of the camera to fetch
   * @returns {Promise<Object>} Camera details
   * @throws {Error} If the request fails or camera is not found
   */
  async getCameraById(cameraId) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!cameraId) {
      throw new Error('Camera ID is required')
    }

    try {
      const requestUrl = `${authStore.baseUrl}/api/v3.0/cameras/${cameraId}`
      
      // Validate URL scheme
      if (!securityService.validateUrlScheme(requestUrl)) {
        throw new Error('Invalid request URL scheme')
      }
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Camera not found: ${cameraId}`)
        }
        throw new Error(`Failed to fetch camera: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[CameraService] Error fetching camera:', error)
      throw error
    }
  }
}

// Create and export a singleton instance
export const cameraService = new CameraService()

// Export the class for testing or multiple instances if needed
export { CameraService } 
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Camera Management
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage your Eagle Eye Networks camera devices
          </p>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-700">
          <div class="px-4 py-5 sm:p-6">
            <div class="grid grid-cols-1 gap-6">
              <!-- Controls Section -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">Camera Devices</h4>
                  <button
                    @click="loadCameras"
                    :disabled="camerasLoading"
                    class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ camerasLoading ? 'Loading...' : 'Refresh Cameras' }}
                  </button>
                </div>

                <!-- Error Display -->
                <div v-if="camerasError" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p class="text-sm text-red-700 dark:text-red-400">{{ camerasError }}</p>
                </div>

                <!-- Cameras Loading State -->
                <div v-if="camerasLoading && !cameras.length" class="text-center py-8">
                  <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-primary-600 bg-primary-100 dark:bg-primary-900 dark:text-primary-400">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading cameras...
                  </div>
                </div>

                <!-- Cameras Grid -->
                <div v-else-if="cameras.length > 0" class="space-y-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Found {{ cameras.length }} camera device{{ cameras.length !== 1 ? 's' : '' }}
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                      v-for="camera in cameras"
                      :key="camera.id"
                      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                          <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-2">
                            {{ camera.name || 'Unnamed Camera' }}
                          </h5>
                          <div class="space-y-1">
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                              <strong>ID:</strong> {{ camera.id }}
                            </p>
                            <p v-if="camera.status" class="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Status:</strong>
                              <span :class="getStatusColor(camera.status)">
                                {{ getStatusIndicator(camera.status) + ' ' + (typeof camera.status === 'object' ? camera.status.connectionStatus || JSON.stringify(camera.status) : camera.status) }}
                              </span>
                            </p>
                            <p v-if="camera.type" class="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Type:</strong> {{ camera.type }}
                            </p>
                            <p v-if="camera.location" class="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Location:</strong> {{ camera.location }}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Camera Actions -->
                      <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div class="flex space-x-2">
                          <button
                            type="button"
                            @click.stop="openModal(camera)"
                            class="w-full text-xs px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            View Details & Live Image
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No Cameras Found -->
                <div v-else class="text-center py-8">
                  <div class="text-gray-500 dark:text-gray-400">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No cameras found</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      No camera devices are currently available in your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Camera Detail & Live Image Modal -->
      <div
        v-if="showModal && selectedCamera"
        class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 px-4"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Camera Details & Live Image
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Camera Details -->
            <div class="space-y-3">
              <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Camera Information</h4>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedCamera.name || 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">ID</label>
                <p class="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">{{ selectedCamera.id }}</p>
              </div>
              <div v-if="selectedCamera.status">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p class="mt-1 text-sm" :class="getStatusColor(selectedCamera.status)">{{ typeof selectedCamera.status === 'object' ? selectedCamera.status.connectionStatus || JSON.stringify(selectedCamera.status) : selectedCamera.status }}</p>
              </div>
              <div v-if="selectedCamera.type">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedCamera.type }}</p>
              </div>
              <div v-if="selectedCamera.location">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedCamera.location }}</p>
              </div>
              <div v-if="selectedCamera.isOnline !== undefined">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Connection</label>
                <p class="mt-1 text-sm" :class="selectedCamera.isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                  {{ selectedCamera.isOnline ? 'Online' : 'Offline' }}
                </p>
              </div>
            </div>

            <!-- Live Image -->
            <div class="space-y-3">
              <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Live Image</h4>
              
              <!-- Loading State -->
              <div v-if="loadingImage" class="text-center py-8">
                <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-primary-600 bg-primary-100 dark:bg-primary-900 dark:text-primary-400">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading live image...
                </div>
              </div>

              <!-- Error Display -->
              <div v-else-if="imageError" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p class="text-sm text-red-700 dark:text-red-400">{{ imageError }}</p>
              </div>

              <!-- Camera Image -->
              <div v-else-if="cameraImage" class="text-center">
                <div class="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <img
                    :src="cameraImage"
                    :alt="selectedCamera.name || 'Camera Image'"
                    class="w-full h-auto"
                    style="max-height: 400px; object-fit: contain;"
                  />
                </div>
                <p v-if="imageTimestamp" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Captured: {{ formatTimestamp(imageTimestamp) }}
                </p>
              </div>

              <!-- No Image Available -->
              <div v-else class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">No live image available</p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { cameraService } from '../services/cameras'
import { mediaService } from '../services/media'

// Router for navigation
const router = useRouter()
// Auth store for potential future use
// eslint-disable-next-line no-unused-vars
const authStore = useAuthStore()

// Reactive data
const cameras = ref([])
const camerasLoading = ref(false)
const camerasError = ref('')
const selectedCamera = ref(null)
const showModal = ref(false)
const loadingImage = ref(false)
const cameraImage = ref(null)
const imageTimestamp = ref(null)
const imageError = ref('')

// Load cameras from the API
const loadCameras = async () => {
  camerasLoading.value = true
  camerasError.value = ''
  cameras.value = []

  try {
    // Get camera devices with status information
    const camerasResponse = await cameraService.listCameras({
      include: ['status'],
      sort: ['+name']
    })
    cameras.value = camerasResponse.results || []
  } catch (err) {
    console.error('Error loading cameras:', err)
    camerasError.value = err.message || 'Failed to load camera devices'
  } finally {
    camerasLoading.value = false
  }
}

// Get status color class based on camera status
const getStatusColor = (status) => {
  if (!status) return 'text-gray-500 dark:text-gray-400'
  
  // Handle status as object (e.g., { "connectionStatus": "online" })
  let statusText = ''
  if (typeof status === 'object') {
    statusText = status.connectionStatus || JSON.stringify(status)
  } else if (typeof status === 'string') {
    statusText = status
  } else {
    return 'text-gray-500 dark:text-gray-400'
  }
  
  const lowerStatus = statusText.toLowerCase()
  if (lowerStatus.includes('online') || lowerStatus.includes('active')) {
    return 'text-green-600 dark:text-green-400'
  } else if (lowerStatus.includes('offline') || lowerStatus.includes('inactive')) {
    return 'text-red-600 dark:text-red-400'
  } else if (lowerStatus.includes('warning') || lowerStatus.includes('issue')) {
    return 'text-yellow-600 dark:text-yellow-400'
  }
  return 'text-gray-600 dark:text-gray-400'
}

// Get status indicator emoji based on camera status
const getStatusIndicator = (status) => {
  if (!status) return '⚪'
  
  // Handle status as object (e.g., { "connectionStatus": "online" })
  let statusText = ''
  if (typeof status === 'object') {
    statusText = status.connectionStatus || JSON.stringify(status)
  } else if (typeof status === 'string') {
    statusText = status
  } else {
    return '⚪'
  }
  
  const lowerStatus = statusText.toLowerCase()
  if (lowerStatus.includes('online') || lowerStatus.includes('active')) {
    return '🟢'
  } else if (lowerStatus.includes('offline') || lowerStatus.includes('inactive')) {
    return '🔴'
  } else if (lowerStatus.includes('warning') || lowerStatus.includes('issue')) {
    return '🟡'
  }
  return '⚪'
}

// Open modal with camera details and live image
const openModal = async (camera) => {
  selectedCamera.value = camera
  showModal.value = true
  
  // Load the live image when opening modal
  await loadLiveImage(camera.id)
}

// Close modal and reset image data
const closeModal = () => {
  showModal.value = false
  selectedCamera.value = null
  cameraImage.value = null
  imageTimestamp.value = null
  imageError.value = ''
}

// Load live image for the camera
const loadLiveImage = async (cameraId) => {
  loadingImage.value = true
  imageError.value = ''
  cameraImage.value = null
  imageTimestamp.value = null

  try {
    const imageResult = await mediaService.getLiveImage(cameraId)
    if (imageResult.image) {
      cameraImage.value = imageResult.image
      imageTimestamp.value = imageResult.timestamp
    } else {
      imageError.value = 'Failed to load live image'
    }
  } catch (err) {
    console.error('Error loading live image:', err)
    imageError.value = err.message || 'Failed to load live image'
  } finally {
    loadingImage.value = false
  }
}

// Format timestamp for display
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown'
  try {
    const date = new Date(timestamp)
    return date.toLocaleString()
  } catch (err) {
    return timestamp
  }
}

// Load cameras when component is mounted
onMounted(() => {
  loadCameras()
})
</script> 
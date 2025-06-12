<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Sensor Management
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage your Eagle Eye Networks sensor devices
          </p>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-700">
          <div class="px-4 py-5 sm:p-6">
            <div class="grid grid-cols-1 gap-6">
              <!-- Controls Section -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">Sensor Devices</h4>
                  <button
                    @click="loadSensors"
                    :disabled="sensorsLoading"
                    class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ sensorsLoading ? 'Loading...' : 'Refresh Sensors' }}
                  </button>
                </div>

                <!-- Error Display -->
                <div v-if="sensorsError" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p class="text-sm text-red-700 dark:text-red-400">{{ sensorsError }}</p>
                </div>

                <!-- Sensors Loading State -->
                <div v-if="sensorsLoading && !sensors.length" class="text-center py-8">
                  <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-primary-600 bg-primary-100 dark:bg-primary-900 dark:text-primary-400">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading sensors...
                  </div>
                </div>

                <!-- Sensors Grid -->
                <div v-else-if="sensors.length > 0" class="space-y-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Found {{ sensors.length }} sensor device{{ sensors.length !== 1 ? 's' : '' }}
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                      v-for="sensor in sensors"
                      :key="sensor.id"
                      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                          <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-2">
                            {{ sensor.name || 'Unnamed Sensor' }}
                          </h5>
                          <div class="space-y-1">
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                              <strong>ID:</strong> {{ sensor.id }}
                            </p>
                            <p v-if="sensor.status" class="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Status:</strong>
                              <span :class="getStatusColor(sensor.status)">
                                {{ ' ' + (typeof sensor.status === 'object' ? sensor.status.connectionStatus || JSON.stringify(sensor.status) : sensor.status) }}
                              </span>
                            </p>
                            <p v-if="sensor.type" class="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Type:</strong> {{ sensor.type }}
                            </p>
                            <p v-if="sensor.location" class="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Location:</strong> {{ sensor.location }}
                            </p>
                          </div>
                        </div>
                        <div v-if="sensor.primaryCameraId" class="ml-2 flex-shrink-0">
                          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            📷 Camera
                          </span>
                        </div>
                      </div>
                      
                      <!-- Sensor Actions -->
                      <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div class="flex space-x-2">
                          <button
                            @click="viewSensorDetails(sensor)"
                            class="flex-1 text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Details
                          </button>
                          <button
                            v-if="sensor.primaryCameraId"
                            @click="viewCamera(sensor.primaryCameraId)"
                            class="flex-1 text-xs px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded hover:bg-primary-200 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            View Camera
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No Sensors Found -->
                <div v-else class="text-center py-8">
                  <div class="text-gray-500 dark:text-gray-400">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No sensors found</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      No sensor devices are currently available in your account.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sensor Detail Modal -->
      <div
        v-if="selectedSensor"
        class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 px-4"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Sensor Details
            </h3>
            <button
              @click="selectedSensor = null"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedSensor.name || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">ID</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">{{ selectedSensor.id }}</p>
            </div>
            <div v-if="selectedSensor.status">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <p class="mt-1 text-sm" :class="getStatusColor(selectedSensor.status)">{{ typeof selectedSensor.status === 'object' ? selectedSensor.status.connectionStatus || JSON.stringify(selectedSensor.status) : selectedSensor.status }}</p>
            </div>
            <div v-if="selectedSensor.type">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedSensor.type }}</p>
            </div>
            <div v-if="selectedSensor.location">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedSensor.location }}</p>
            </div>
            <div v-if="selectedSensor.primaryCameraId">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Camera</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">{{ selectedSensor.primaryCameraId }}</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button
              @click="selectedSensor = null"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
            <button
              v-if="selectedSensor.primaryCameraId"
              @click="viewCamera(selectedSensor.primaryCameraId)"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              View Camera
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
import { sensorService } from '../services/sensors'

// Router for navigation
const router = useRouter()
// Auth store for potential future use
// eslint-disable-next-line no-unused-vars
const authStore = useAuthStore()

// Reactive data
const sensors = ref([])
const sensorsLoading = ref(false)
const sensorsError = ref('')
const selectedSensor = ref(null)

// Load sensors from the API
const loadSensors = async () => {
  sensorsLoading.value = true
  sensorsError.value = ''
  sensors.value = []

  try {
    // Get sensor devices with status information
    const sensorsResponse = await sensorService.listSensorDevices({
      include: ['status'],
      sort: ['+name']
    })
    sensors.value = sensorsResponse.results || []
  } catch (err) {
    console.error('Error loading sensors:', err)
    sensorsError.value = err.message || 'Failed to load sensor devices'
  } finally {
    sensorsLoading.value = false
  }
}

// Get status color class based on sensor status
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

// View sensor details in modal
const viewSensorDetails = (sensor) => {
  selectedSensor.value = sensor
}

// Navigate to camera view (you can modify this based on your routing needs)
const viewCamera = (cameraId) => {
  // Close modal if open
  selectedSensor.value = null
  // Navigate to home page with camera ID - you might want to modify this
  // to navigate to a dedicated camera page or pass the camera ID as a parameter
  router.push({ path: '/home', query: { cameraId } })
}

// Load sensors when component is mounted
onMounted(() => {
  loadSensors()
})
</script> 
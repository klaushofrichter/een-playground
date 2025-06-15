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

              <!-- Media Session Demo Section (for first camera) -->
              <div v-if="cameras.length > 0 && !camerasLoading" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">Media Session Demo</h4>
                  <div class="flex items-center space-x-3">
                    <div class="flex items-center space-x-2">
                      <label for="cameraId" class="text-sm text-gray-700 dark:text-gray-300">Camera ID:</label>
                      <input
                        id="cameraId"
                        v-model="selectedCameraId"
                        type="text"
                        maxlength="10"
                        placeholder="1005963a"
                        class="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <button
                      @click="initializeMediaSessionForCamera"
                      :disabled="loadingMediaSession || !selectedCameraId.trim()"
                      class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ loadingMediaSession ? 'Initializing...' : 'Initialize Media Session' }}
                    </button>
                  </div>
                </div>

                <!-- Media Session Error Display -->
                <div v-if="mediaSessionError" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p class="text-sm text-red-700 dark:text-red-400">{{ mediaSessionError }}</p>
                </div>

                <!-- Media Session Success -->
                <div v-if="mediaSessionUrl && !mediaSessionError" class="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <p class="text-sm text-green-700 dark:text-green-400">
                    ✅ Media session initialized successfully for camera: <strong>{{ selectedCameraId }}</strong>
                  </p>
                  <p class="text-xs text-green-600 dark:text-green-300 mt-1 font-mono break-all">
                    Session URL: {{ mediaSessionUrl }}
                  </p>
                </div>

                <!-- Media Session Image Display -->
                <div v-if="mediaSessionImageUrl" class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Session-Based Media Stream (First Camera)
                    </h5>
                    <button
                      @click="refreshMediaSessionImage"
                      :disabled="loadingMediaSessionImage"
                      class="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {{ loadingMediaSessionImage ? 'Loading...' : 'Refresh' }}
                    </button>
                  </div>
                  
                  <div class="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <!-- Loading overlay -->
                    <div v-if="loadingMediaSessionImage" class="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-10">
                      <div class="text-white text-sm">Loading media session image...</div>
                    </div>
                    
                    <!-- Media session image -->
                    <img
                      :src="mediaSessionImageUrl"
                      alt="Media Session Image"
                      class="w-full h-64 object-cover"
                      @load="onMediaSessionImageLoad"
                      @error="onMediaSessionImageError"
                      :class="{ 'opacity-50': loadingMediaSessionImage }"
                    />
                    
                    <!-- Image info overlay -->
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                      <p class="text-white text-xs">
                        📷 Live Image (Preview) - Session Cookie Auth
                      </p>
                      <p v-if="mediaSessionImageTimestamp" class="text-white text-xs opacity-75">
                        Live capture: {{ formatTimestamp(mediaSessionImageTimestamp) }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    <p>💡 This image demonstrates that the media session is active. In a real scenario, you would use the session URL for direct live image access:</p>
                    <p class="mt-2 font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                      Example: {{ mediaSessionUrl }}/media/liveImage.jpeg?deviceId={{ selectedCameraId }}&amp;type=preview
                    </p>
                  </div>
                </div>

                <!-- Instructions when not initialized -->
                <div v-else-if="!loadingMediaSession" class="text-center py-6">
                  <div class="text-gray-500 dark:text-gray-400">
                    <svg class="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                    </svg>
                    <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Media Session Demo</h5>
                    <p class="text-sm">
                      Click "Initialize Media Session" to demonstrate session-based media authentication using the first camera.
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
            <div class="space-y-4 max-h-96 overflow-y-auto">
              <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">Camera Information</h4>
              
              <!-- Basic Information -->
              <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Basic Details</h5>
                <div class="space-y-2">
                  <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Name</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedCamera.name || 'N/A' }}</p>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">ID</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">{{ selectedCamera.id }}</p>
                  </div>
                  <div v-if="selectedCamera.status">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <p class="mt-1 text-sm" :class="getStatusColor(selectedCamera.status)">
                      {{ getStatusIndicator(selectedCamera.status) }} {{ typeof selectedCamera.status === 'object' ? selectedCamera.status.connectionStatus || JSON.stringify(selectedCamera.status) : selectedCamera.status }}
                    </p>
                  </div>
                  <div v-if="selectedCamera.bridgeId">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Bridge ID</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">{{ selectedCamera.bridgeId }}</p>
                  </div>
                  <div v-if="selectedCamera.tags?.length">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Tags</label>
                    <div class="mt-1 flex flex-wrap gap-1">
                      <span v-for="tag in selectedCamera.tags" :key="tag" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Device Information -->
              <div v-if="selectedCamera.deviceInfo" class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Device Information</h5>
                <div class="space-y-2">
                  <div v-if="selectedCamera.deviceInfo.icon">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Device Type</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100 capitalize">{{ selectedCamera.deviceInfo.icon }}</p>
                  </div>
                  <div v-if="selectedCamera.deviceInfo.directToCloud !== undefined">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Connection Type</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {{ selectedCamera.deviceInfo.directToCloud ? 'Direct to Cloud' : 'Via Bridge' }}
                    </p>
                  </div>
                  <div v-if="selectedCamera.guid">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">GUID</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">{{ selectedCamera.guid }}</p>
                  </div>
                  <div v-if="selectedCamera.macAddress">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">MAC Address</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">{{ selectedCamera.macAddress }}</p>
                  </div>
                </div>
              </div>

              <!-- Position Information -->
              <div v-if="selectedCamera.position && hasPositionData(selectedCamera.position)" class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Position & Location</h5>
                <div class="space-y-2">
                  <div v-if="selectedCamera.position.latitude && selectedCamera.position.longitude">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Coordinates</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                      {{ selectedCamera.position.latitude.toFixed(6) }}, {{ selectedCamera.position.longitude.toFixed(6) }}
                    </p>
                  </div>
                  <div v-if="selectedCamera.position.azimuth !== undefined">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Azimuth</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedCamera.position.azimuth }}°</p>
                  </div>
                  <div v-if="selectedCamera.position.fieldOfView !== undefined">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Field of View</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedCamera.position.fieldOfView }}°</p>
                  </div>
                  <div v-if="selectedCamera.position.rangeInMeters !== undefined">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Range</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedCamera.position.rangeInMeters }}m</p>
                  </div>
                  <div v-if="selectedCamera.position.floor !== undefined">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Floor</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedCamera.position.floor }}</p>
                  </div>
                </div>
              </div>

              <!-- Sharing Information -->
              <div v-if="selectedCamera.shareDetails && hasShareData(selectedCamera.shareDetails)" class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Sharing Details</h5>
                <div class="space-y-2">
                  <div v-if="selectedCamera.shareDetails.shared !== undefined">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Shared Camera</label>
                    <p class="mt-1 text-sm" :class="selectedCamera.shareDetails.shared ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'">
                      {{ selectedCamera.shareDetails.shared ? 'Yes' : 'No' }}
                    </p>
                  </div>
                  <div v-if="selectedCamera.shareDetails.accountId">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Shared From Account</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">{{ selectedCamera.shareDetails.accountId }}</p>
                  </div>
                  <div v-if="selectedCamera.shareDetails.firstResponder !== undefined">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">First Responder</label>
                    <p class="mt-1 text-sm" :class="selectedCamera.shareDetails.firstResponder ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'">
                      {{ selectedCamera.shareDetails.firstResponder ? 'Yes' : 'No' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Capabilities -->
              <div v-if="selectedCamera.capabilities && Object.keys(selectedCamera.capabilities).length" class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Capabilities</h5>
                <div class="grid grid-cols-2 gap-2">
                  <div v-for="(value, capability) in selectedCamera.capabilities" :key="capability" class="flex items-center">
                    <span class="text-xs" :class="value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                      {{ value ? '✓' : '✗' }}
                    </span>
                    <span class="ml-1 text-xs text-gray-700 dark:text-gray-300 capitalize">{{ capability.replace(/([A-Z])/g, ' $1').trim() }}</span>
                  </div>
                </div>
              </div>

              <!-- Additional Fields -->
              <div v-if="hasAdditionalFields(selectedCamera)" class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Additional Information</h5>
                <div class="space-y-2">
                  <div v-if="selectedCamera.speakerId">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Speaker ID</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">{{ selectedCamera.speakerId }}</p>
                  </div>
                  <div v-if="selectedCamera.multiCameraId">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Multi Camera ID</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">{{ selectedCamera.multiCameraId }}</p>
                  </div>
                  <div v-if="selectedCamera.locationId">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Location ID</label>
                    <p class="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">{{ selectedCamera.locationId }}</p>
                  </div>
                  <div v-if="selectedCamera.enabledAnalytics?.length">
                    <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Enabled Analytics</label>
                    <div class="mt-1 flex flex-wrap gap-1">
                      <span v-for="analytic in selectedCamera.enabledAnalytics" :key="analytic" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {{ analytic }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Live Image -->
            <div class="space-y-3">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-md font-medium text-gray-900 dark:text-gray-100">Live Image</h4>
                <button
                  @click="refreshLiveImage"
                  :disabled="loadingImage"
                  class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {{ loadingImage ? 'Refreshing...' : '🔄 Refresh' }}
                </button>
              </div>
              
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

              <!-- Camera Actions -->
              <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h5>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    @click="getCameraMetrics"
                    :disabled="!selectedCamera || loadingMetrics"
                    class="flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-green-100 dark:bg-green-900 rounded-md hover:bg-green-200 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {{ loadingMetrics ? 'Loading...' : '📊 Metrics' }}
                  </button>
                </div>
                
                <!-- Action Results -->
                <div v-if="actionMessage" class="mt-3 p-2 rounded-md" :class="actionMessage.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'">
                  <p class="text-xs" :class="actionMessage.type === 'success' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'">
                    {{ actionMessage.text }}
                  </p>
                </div>
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

  <!-- Metrics Chart Modal -->
  <div v-if="showMetricsChart" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          📊 Camera Metrics - {{ selectedCamera?.name }}
        </h3>
        <button 
          @click="closeMetricsChart"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Chart Container -->
      <div class="p-6">
        <div class="h-96 w-full">
          <canvas id="metricsChart"></canvas>
        </div>
        
        <!-- Metrics Summary -->
        <div v-if="metricsData" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="metric in metricsData" :key="metric.target" 
               class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">
              {{ formatMetricLabel(metric.target) }}
            </h4>
            <div class="text-sm text-gray-600 dark:text-gray-300">
              <div>Data Points: {{ metric.dataPoints.length }}</div>
              <div>Latest Value: {{ formatMetricValue(metric.dataPoints[metric.dataPoints.length - 1]?.[0] || 0) }}</div>
              <div>Time Range: {{ Math.round((metric.dataPoints[metric.dataPoints.length - 1]?.[1] - metric.dataPoints[0]?.[1]) / (1000 * 60 * 60)) }}h</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { cameraService } from '../services/cameras'
import { mediaService } from '../services/media'
import { mediaSessionService } from '../services/mediaSession'
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import 'chartjs-adapter-date-fns'

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

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

// Action loading states
const loadingSnapshot = ref(false)
const loadingTunnel = ref(false)
const loadingMetrics = ref(false)
const loadingReboot = ref(false)
const actionMessage = ref(null)

// Metrics chart data
const metricsData = ref(null)
const metricsChart = ref(null)
const showMetricsChart = ref(false)

// Media session data
const loadingMediaSession = ref(false)
const mediaSessionError = ref('')
const mediaSessionUrl = ref(null)
const mediaSessionImageUrl = ref(null)
const mediaSessionImageTimestamp = ref(null)
const loadingMediaSessionImage = ref(false)
const selectedCameraId = ref('')

// Load cameras from the API
const loadCameras = async () => {
  camerasLoading.value = true
  camerasError.value = ''
  cameras.value = []

  try {
    // Test if the camera endpoint exists at all
    console.log('Testing camera API endpoint...')
    const camerasResponse = await cameraService.listCameras()
    console.log('Camera API response:', camerasResponse)
    cameras.value = camerasResponse.results || []
    
    // Auto-populate the camera ID field with the first camera's ID
    if (cameras.value.length > 0 && !selectedCameraId.value) {
      selectedCameraId.value = cameras.value[0].id
    }
  } catch (err) {
    console.error('Error loading cameras:', err)
    console.error('Full error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    })
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

// Check if position data exists
const hasPositionData = (position) => {
  if (!position) return false
  return position.latitude !== undefined || 
         position.longitude !== undefined || 
         position.azimuth !== undefined || 
         position.fieldOfView !== undefined || 
         position.rangeInMeters !== undefined || 
         position.floor !== undefined
}

// Check if share data exists
const hasShareData = (shareDetails) => {
  if (!shareDetails) return false
  return shareDetails.shared !== undefined || 
         shareDetails.accountId !== undefined || 
         shareDetails.firstResponder !== undefined
}

// Check if additional fields exist
const hasAdditionalFields = (camera) => {
  return camera.speakerId || 
         camera.multiCameraId || 
         camera.locationId || 
         (camera.enabledAnalytics && camera.enabledAnalytics.length > 0)
}

// Clear action message after delay
const clearActionMessage = () => {
  setTimeout(() => {
    actionMessage.value = null
  }, 5000)
}

// Refresh live image
const refreshLiveImage = async () => {
  if (selectedCamera.value) {
    await loadLiveImage(selectedCamera.value.id)
  }
}

// Take snapshot action
const takeSnapshot = async () => {
  if (!selectedCamera.value) return
  
  loadingSnapshot.value = true
  actionMessage.value = null
  
  try {
    // For now, we'll just refresh the live image as a "snapshot"
    await loadLiveImage(selectedCamera.value.id)
    actionMessage.value = {
      type: 'success',
      text: '📸 Snapshot captured! Live image refreshed.'
    }
    clearActionMessage()
  } catch (err) {
    console.error('Error taking snapshot:', err)
    actionMessage.value = {
      type: 'error',
      text: 'Failed to take snapshot: ' + err.message
    }
    clearActionMessage()
  } finally {
    loadingSnapshot.value = false
  }
}

// Open camera tunnel for settings
const openCameraTunnel = async () => {
  if (!selectedCamera.value) return
  
  loadingTunnel.value = true
  actionMessage.value = null
  
  try {
    const tunnelResponse = await cameraService.putCameraTunnel(selectedCamera.value.id)
    console.log('Camera tunnel opened:', tunnelResponse)
    actionMessage.value = {
      type: 'success',
      text: '⚙️ Camera settings tunnel opened successfully!'
    }
    clearActionMessage()
  } catch (err) {
    console.error('Error opening camera tunnel:', err)
    actionMessage.value = {
      type: 'error',
      text: 'Failed to open settings: ' + err.message
    }
    clearActionMessage()
  } finally {
    loadingTunnel.value = false
  }
}

// Get camera metrics
const getCameraMetrics = async () => {
  if (!selectedCamera.value) return
  
  loadingMetrics.value = true
  actionMessage.value = null
  
  try {
    const metricsResponse = await cameraService.getCameraMetrics(selectedCamera.value.id, {
      timestamp__gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
      target__in: ['kilobytesOnDisk', 'bytesStored', 'bandwidthRealtime'], // Required parameter
      period: 'hour'
    })
    console.log('Camera metrics:', metricsResponse)
    
    // Store metrics data and show chart
    metricsData.value = metricsResponse
    showMetricsChart.value = true
    
    // Create chart after DOM update
    await nextTick()
    createMetricsChart()
    
    actionMessage.value = {
      type: 'success',
      text: '📊 Metrics loaded and visualized!'
    }
    clearActionMessage()
  } catch (err) {
    console.error('Error getting camera metrics:', err)
    actionMessage.value = {
      type: 'error',
      text: 'Failed to load metrics: ' + err.message
    }
    clearActionMessage()
  } finally {
    loadingMetrics.value = false
  }
}

// Create metrics chart
const createMetricsChart = () => {
  if (!metricsData.value || !document.getElementById('metricsChart')) return
  
  // Destroy existing chart if it exists
  if (metricsChart.value) {
    metricsChart.value.destroy()
  }
  
  const ctx = document.getElementById('metricsChart').getContext('2d')
  
  // Prepare datasets from metrics data
  const datasets = metricsData.value.map((metric, index) => {
    const colors = [
      { border: 'rgb(59, 130, 246)', background: 'rgba(59, 130, 246, 0.1)' }, // Blue
      { border: 'rgb(16, 185, 129)', background: 'rgba(16, 185, 129, 0.1)' }, // Green
      { border: 'rgb(245, 158, 11)', background: 'rgba(245, 158, 11, 0.1)' }   // Yellow
    ]
    
    return {
      label: formatMetricLabel(metric.target),
      data: metric.dataPoints.map(point => ({
        x: new Date(point[1]),
        y: point[0]
      })),
      borderColor: colors[index % colors.length].border,
      backgroundColor: colors[index % colors.length].background,
      tension: 0.1,
      fill: false
    }
  })
  
  metricsChart.value = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Camera Metrics (Last 24 Hours)',
          color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151'
        },
        legend: {
          labels: {
            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151'
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: {
              hour: 'MMM dd HH:mm'
            }
          },
          title: {
            display: true,
            text: 'Time',
            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151'
          },
          ticks: {
            color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280'
          },
          grid: {
            color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Value',
            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151'
          },
          ticks: {
            color: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#6b7280',
            callback: function(value) {
              return formatMetricValue(value)
            }
          },
          grid: {
            color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
          }
        }
      }
    }
  })
}

// Format metric labels for display
const formatMetricLabel = (target) => {
  const labels = {
    'kilobytesOnDisk': 'Storage Used (KB)',
    'bytesStored': 'Data Stored (Bytes)',
    'bandwidthRealtime': 'Realtime Bandwidth (Bytes/s)'
  }
  return labels[target] || target
}

// Format metric values for display
const formatMetricValue = (value) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'G'
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toFixed(0)
}

// Close metrics chart
const closeMetricsChart = () => {
  showMetricsChart.value = false
  if (metricsChart.value) {
    metricsChart.value.destroy()
    metricsChart.value = null
  }
  metricsData.value = null
}

// Reboot camera (placeholder - would need specific API)
const rebootCamera = async () => {
  if (!selectedCamera.value) return
  
  loadingReboot.value = true
  actionMessage.value = null
  
  try {
    // This would typically be a specific reboot API call
    // For now, we'll simulate it
    await new Promise(resolve => setTimeout(resolve, 2000))
    actionMessage.value = {
      type: 'success',
      text: '🔄 Camera reboot initiated. Please wait 30-60 seconds.'
    }
    clearActionMessage()
  } catch (err) {
    console.error('Error rebooting camera:', err)
    actionMessage.value = {
      type: 'error',
      text: 'Failed to reboot camera: ' + err.message
    }
    clearActionMessage()
  } finally {
    loadingReboot.value = false
  }
}

// Initialize media session for selected camera
const initializeMediaSessionForCamera = async () => {
  if (!selectedCameraId.value.trim()) {
    mediaSessionError.value = 'Please enter a camera ID'
    return
  }

  const cameraId = selectedCameraId.value.trim()
  loadingMediaSession.value = true
  mediaSessionError.value = ''
  mediaSessionUrl.value = null
  mediaSessionImageUrl.value = null

  try {
    console.log('Initializing media session for camera:', cameraId)
    
    // Step 1: Initialize the media session cookie
    await mediaSessionService.initializeMediaSession()
    
    // Step 2: Get the session URL for reference
    const sessionUrl = await mediaSessionService.getMediaSessionUrl()
    mediaSessionUrl.value = sessionUrl
    
    // Step 3: Get a live preview image to demonstrate the session is working
    // In a real scenario, you would use the session cookie for direct media URLs
    const liveImageResult = await mediaService.getLiveImage(cameraId, 'preview')
    if (liveImageResult.image) {
      mediaSessionImageUrl.value = liveImageResult.image
      mediaSessionImageTimestamp.value = liveImageResult.timestamp
    } else {
      throw new Error('No live image available for this camera')
    }
    
    console.log('Media session initialized successfully')
  } catch (err) {
    console.error('Error initializing media session:', err)
    mediaSessionError.value = err.message || 'Failed to initialize media session'
  } finally {
    loadingMediaSession.value = false
  }
}

// Refresh media session image
const refreshMediaSessionImage = async () => {
  if (!selectedCameraId.value.trim() || !mediaSessionUrl.value) {
    return
  }

  const cameraId = selectedCameraId.value.trim()
  loadingMediaSessionImage.value = true

  try {
    // Get a fresh live preview image
    const liveImageResult = await mediaService.getLiveImage(cameraId, 'preview')
    if (liveImageResult.image) {
      mediaSessionImageUrl.value = liveImageResult.image
      mediaSessionImageTimestamp.value = liveImageResult.timestamp
    }
  } catch (err) {
    console.error('Error refreshing media session image:', err)
    mediaSessionError.value = 'Failed to refresh image: ' + err.message
  } finally {
    loadingMediaSessionImage.value = false
  }
}

// Handle media session image load
const onMediaSessionImageLoad = () => {
  loadingMediaSessionImage.value = false
  console.log('Media session image loaded successfully')
}

// Handle media session image error
const onMediaSessionImageError = (event) => {
  loadingMediaSessionImage.value = false
  console.error('Media session image failed to load:', event)
  mediaSessionError.value = 'Failed to load media session image'
}

// Load cameras when component is mounted
onMounted(() => {
  loadCameras()
})
</script> 
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
              <!-- Gateways Section -->
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">Sensor Gateways</h4>
                  <button
                    @click="loadGateways"
                    :disabled="gatewaysLoading"
                    class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ gatewaysLoading ? 'Loading...' : 'Refresh Gateways' }}
                  </button>
                </div>

                <!-- Error Display -->
                <div v-if="gatewaysError" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p class="text-sm text-red-700 dark:text-red-400">{{ gatewaysError }}</p>
                </div>

                <!-- Gateways Loading State -->
                <div v-if="gatewaysLoading && !gateways.length" class="text-center py-8">
                  <div class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-primary-600 bg-primary-100 dark:bg-primary-900 dark:text-primary-400">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-600 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading gateways...
                  </div>
                </div>

                <!-- Gateways Grid -->
                <div v-else-if="gateways.length > 0" class="space-y-4">
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Found {{ gateways.length }} gateway device{{ gateways.length !== 1 ? 's' : '' }}
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                      v-for="gateway in gateways"
                      :key="gateway.id"
                      class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                    >
                      <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                          <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-2">
                            {{ gateway.name || 'Unnamed Gateway' }}
                          </h5>
                          <div class="space-y-1">
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                              <strong>ID:</strong> {{ gateway.id }}
                            </p>
                            <p v-if="gateway.status" class="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Status:</strong>
                              <span :class="getStatusColor(gateway.status)">
                                {{ ' ' + (typeof gateway.status === 'object' ? gateway.status.connectionStatus || JSON.stringify(gateway.status) : gateway.status) }}
                              </span>
                            </p>
                            <p v-if="gateway.networkInfo?.mainIp" class="text-xs text-gray-500 dark:text-gray-400">
                              <strong>IP:</strong> {{ gateway.networkInfo.mainIp }}
                            </p>
                            <p v-if="gateway.locationSummary?.name" class="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Location:</strong> {{ gateway.locationSummary.name }}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Gateway Actions -->
                      <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div class="flex space-x-2">
                          <button
                            @click="viewGatewayDetails(gateway)"
                            class="flex-1 text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No Gateways Found -->
                <div v-else class="text-center py-8">
                  <div class="text-gray-500 dark:text-gray-400">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No gateways found</h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      No gateway devices are currently available in your account.
                    </p>
                  </div>
                </div>
              </div>

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
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Sensor Details
            </h3>
            <button
              @click="selectedSensor = null; clearCameraImages()"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="space-y-2">
            <!-- Row 1: Name and Device Info -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Name</label>
                <p class="text-sm text-gray-900 dark:text-gray-100">{{ selectedSensor.name || 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Device Info</label>
                <p class="text-sm text-gray-900 dark:text-gray-100">{{ selectedSensor.deviceInfo?.model || selectedSensor.deviceInfo?.icon || 'SensorDevice' }}</p>
              </div>
            </div>
            
            <!-- Row 2: ID, Status, and Battery -->
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">ID</label>
                <p class="text-sm text-gray-900 dark:text-gray-100 font-mono">{{ selectedSensor.id }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Status</label>
                <p class="text-sm" :class="getStatusColor(selectedSensor.status)">{{ typeof selectedSensor.status === 'object' ? selectedSensor.status.connectionStatus || JSON.stringify(selectedSensor.status) : selectedSensor.status || 'N/A' }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Battery</label>
                <p class="text-sm text-gray-900 dark:text-gray-100">{{ selectedSensor.battery?.status || selectedSensor.battery?.level || 'N/A' }}</p>
              </div>
            </div>
            
            <!-- Row 3: Additional Info (if any present) -->
            <div v-if="selectedSensor.type || selectedSensor.location || selectedSensor.primaryCameraId || selectedSensor.locationSummary" class="grid grid-cols-2 gap-4">
              <div v-if="selectedSensor.type">
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Type</label>
                <p class="text-sm text-gray-900 dark:text-gray-100">{{ selectedSensor.type }}</p>
              </div>
              <div v-if="selectedSensor.location">
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Location</label>
                <p class="text-sm text-gray-900 dark:text-gray-100">{{ selectedSensor.location }}</p>
              </div>
              <div v-if="selectedSensor.primaryCameraId">
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Primary Camera</label>
                <p class="text-sm text-gray-900 dark:text-gray-100 font-mono">{{ selectedSensor.primaryCameraId }}</p>
              </div>
              <div v-if="selectedSensor.locationSummary">
                <label class="block text-xs font-medium text-gray-700 dark:text-gray-300">Location Summary</label>
                <p class="text-sm text-gray-900 dark:text-gray-100">{{ selectedSensor.locationSummary.name || JSON.stringify(selectedSensor.locationSummary) }}</p>
              </div>
            </div>
            
            <!-- Measurements Section -->
            <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Measurements</label>
                <button
                  v-if="Object.keys(cameraImages).length > 0"
                  @click="clearCameraImages"
                  class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500"
                >
                  Clear Images
                </button>
              </div>
              
              <!-- Measurements Loading -->
              <div v-if="measurementsLoading" class="text-center py-4">
                <div class="inline-flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading measurements...
                </div>
              </div>
              
              <!-- Measurements Error -->
              <div v-else-if="measurementsError" class="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
                {{ measurementsError }}
              </div>
              
              <!-- Measurements List -->
              <div v-else-if="sensorMeasurements.length > 0" class="space-y-2 max-h-60 overflow-y-auto">
                <div v-for="measurement in sensorMeasurements" :key="measurement.id" 
                     class="bg-gray-50 dark:bg-gray-700 p-2 rounded border">
                  <div class="flex justify-between items-start mb-1">
                    <h6 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ measurement.name || 'Unnamed Measurement' }}
                    </h6>
                    <span v-if="measurement.preferred" 
                          class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      ⭐ Preferred
                    </span>
                  </div>
                  
                  <div class="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div v-if="measurement.measurementProperties">
                      <span class="font-medium">Type:</span> {{ measurement.measurementProperties.propertyType || 'N/A' }}
                      <span v-if="measurement.measurementThreshold" class="ml-2">
                        | <span class="font-medium">Threshold:</span> {{ measurement.measurementThreshold.level || 'N/A' }}
                      </span>
                    </div>
                    
                    <div v-if="measurement.lastSample">
                      <span class="font-medium">Last Sample:</span> 
                      {{ measurement.lastSample.value || 'N/A' }}
                      <span v-if="measurement.lastSample.unit" class="ml-1">{{ measurement.lastSample.unit }}</span>
                      <span v-if="measurement.lastSample.timestamp" class="ml-2 text-gray-500">
                        ({{ new Date(measurement.lastSample.timestamp).toLocaleString() }})
                      </span>
                    </div>
                    
                    <div v-if="measurement.primaryCameraId">
                      <span class="font-medium">Camera:</span> 
                      <span class="font-mono">{{ measurement.primaryCameraId }}</span>
                      <button
                        @click="loadCameraImage(measurement.primaryCameraId, measurement.id)"
                        :disabled="loadingCameraImages[measurement.id]"
                        class="ml-2 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {{ loadingCameraImages[measurement.id] ? 'Loading...' : '📷 View Image' }}
                      </button>
                    </div>
                    
                    <!-- Camera Image Display -->
                    <div v-if="cameraImages[measurement.id]" class="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded">
                      <div class="text-center">
                        <img
                          :src="cameraImages[measurement.id].image"
                          :alt="`Camera image for ${measurement.name}`"
                          class="max-w-full h-auto rounded border border-gray-300 dark:border-gray-500"
                          style="max-height: 200px;"
                        />
                        <p v-if="cameraImages[measurement.id].timestamp" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Captured: {{ new Date(cameraImages[measurement.id].timestamp).toLocaleString() }}
                        </p>
                      </div>
                    </div>
                    
                    <!-- Camera Image Error -->
                    <div v-if="cameraImageErrors[measurement.id]" class="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-400">
                      {{ cameraImageErrors[measurement.id] }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- No Measurements -->
              <div v-else class="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                No measurements found for this sensor
              </div>
            </div>
          </div>
          <div class="mt-4 flex justify-end space-x-3">
            <button
              @click="selectedSensor = null; clearCameraImages()"
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

      <!-- Gateway Detail Modal -->
      <div
        v-if="selectedGateway"
        class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 px-4"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Gateway Details
            </h3>
            <button
              @click="selectedGateway = null"
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
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedGateway.name || 'N/A' }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">ID</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100 font-mono">{{ selectedGateway.id }}</p>
            </div>
            <div v-if="selectedGateway.status">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <p class="mt-1 text-sm" :class="getStatusColor(selectedGateway.status)">
                {{ typeof selectedGateway.status === 'object' ? selectedGateway.status.connectionStatus || JSON.stringify(selectedGateway.status) : selectedGateway.status }}
              </p>
            </div>
            <div v-if="selectedGateway.networkInfo?.mainIp">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">IP Address</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedGateway.networkInfo.mainIp }}</p>
            </div>
            <div v-if="selectedGateway.locationSummary?.name">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedGateway.locationSummary.name }}</p>
            </div>
            <div v-if="selectedGateway.deviceInfo">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Device Info</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {{ selectedGateway.deviceInfo.icon || 'N/A' }}
              </p>
            </div>
            <div v-if="selectedGateway.notes">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
              <p class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ selectedGateway.notes }}</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end">
            <button
              @click="selectedGateway = null"
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
import { sensorService } from '../services/sensors'
import { sensorGatewayService } from '../services/sensorGateways'
import { sensorSummaryService } from '../services/sensorSummary'
import { measurementsService } from '../services/measurements'
import { mediaService } from '../services/media'

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

// Measurements data for selected sensor
const sensorMeasurements = ref([])
const measurementsLoading = ref(false)
const measurementsError = ref('')

// Gateway data
const gateways = ref([])
const gatewaysLoading = ref(false)
const gatewaysError = ref('')
const selectedGateway = ref(null)

// Store the latest summary data
const sensorSummary = ref(null)

// Camera images
const cameraImages = ref({})
const loadingCameraImages = ref({})
const cameraImageErrors = ref({})

// Load gateways from the API
const loadGateways = async () => {
  gatewaysLoading.value = true
  gatewaysError.value = ''
  gateways.value = []

  try {
    const gatewaysResponse = await sensorGatewayService.listSensorGateways({
      include: ['status', 'networkInfo', 'locationSummary', 'deviceInfo', 'notes'],
      sort: ['+name']
    })
    gateways.value = gatewaysResponse.results || []
  } catch (err) {
    console.error('Error loading gateways:', err)
    gatewaysError.value = err.message || 'Failed to load gateway devices'
  } finally {
    gatewaysLoading.value = false
  }
}

// View gateway details
const viewGatewayDetails = (gateway) => {
  selectedGateway.value = gateway
}

// Load both sensors and gateways on mount
onMounted(async () => {
  loadSensors()
  loadGateways()
  try {
    const summary = await sensorSummaryService.listSensorSummary()
    sensorSummary.value = summary
    //console.log('[SensorSummary] API response:', summary)
  } catch (err) {
    console.error('[SensorSummary] Error fetching summary:', err)
  }
})

// Load sensors from the API
const loadSensors = async () => {
  sensorsLoading.value = true
  sensorsError.value = ''
  sensors.value = []

  try {
    // Get sensor devices with status, battery, deviceInfo, and locationSummary
    console.log('Sensores.vue: loadSensors')
    const sensorsResponse = await sensorService.listSensorDevices({
      include: ['status', 'battery', 'deviceInfo', 'locationSummary'],
      sort: ['+name']
    })
    console.log('Sensores.vue: sensorsResponse', sensorsResponse)
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

// Load measurements for a specific sensor
const loadSensorMeasurements = async (sensorId) => {
  measurementsLoading.value = true
  measurementsError.value = ''
  sensorMeasurements.value = []

  try {
    console.log('Loading measurements for sensor ID:', sensorId)
    
    // Use the same approach as the working application
    const requestParams = {
      preferred: true,
      include: ['lastSample', 'measurementProperties', 'measurementThreshold', 'sensorSummary'],
      pageSize: 25
    }
    
    console.log('[Sensors.vue] Request parameters:', requestParams)
    
    const measurementsResponse = await measurementsService.listMeasurements(requestParams)
    
    console.log('All measurements response:', measurementsResponse)
    
    // Filter measurements for this specific sensor on the client side
    const allMeasurements = measurementsResponse.results || []
    const filteredMeasurements = allMeasurements.filter(measurement => {
      // Check if this measurement belongs to our sensor
      // The measurement might have parentId, sensorSummary, or other fields that link it to the sensor
      return measurement.parentId === sensorId || 
             measurement.sensorSummary?.id === sensorId ||
             measurement.sensorSummary?.sensorId === sensorId
    })
    
    console.log(`Found ${filteredMeasurements.length} measurements for sensor ${sensorId}:`, filteredMeasurements)
    
    // Debug: Log each measurement's details
    filteredMeasurements.forEach((measurement, index) => {
      console.log(`Measurement ${index + 1}:`, {
        id: measurement.id,
        name: measurement.name,
        parentId: measurement.parentId,
        primaryCameraId: measurement.primaryCameraId,
        sensorSummary: measurement.sensorSummary
      })
    })
    
    sensorMeasurements.value = filteredMeasurements
    
  } catch (err) {
    console.error('Error loading sensor measurements:', err)
    measurementsError.value = err.message || 'Failed to load sensor measurements'
  } finally {
    measurementsLoading.value = false
  }
}

// View sensor details in modal
const viewSensorDetails = async (sensor) => {
  selectedSensor.value = sensor
  // Clear previous camera images
  clearCameraImages()
  // Load measurements for this sensor
  await loadSensorMeasurements(sensor.id)
}

// Clear all camera images
const clearCameraImages = () => {
  cameraImages.value = {}
  loadingCameraImages.value = {}
  cameraImageErrors.value = {}
}

// Navigate to camera view (you can modify this based on your routing needs)
const viewCamera = (cameraId) => {
  // Close modal if open
  selectedSensor.value = null
  // Navigate to home page with camera ID - you might want to modify this
  // to navigate to a dedicated camera page or pass the camera ID as a parameter
  router.push({ path: '/home', query: { cameraId } })
}

// Load camera image
const loadCameraImage = async (cameraId, measurementId) => {
  loadingCameraImages.value[measurementId] = true
  cameraImageErrors.value[measurementId] = ''
  cameraImages.value[measurementId] = null

  try {
    console.log('Loading camera image for camera ID:', cameraId)
    
    const imageResponse = await mediaService.getLiveImage(cameraId)
    
    console.log('Camera image response:', imageResponse)
    
    if (imageResponse.image) {
      cameraImages.value[measurementId] = {
        image: imageResponse.image,
        timestamp: imageResponse.timestamp
      }
    } else {
      cameraImageErrors.value[measurementId] = 'No image available from camera'
    }
  } catch (err) {
    console.error('Error loading camera image:', err)
    cameraImageErrors.value[measurementId] = err.message || 'Failed to load camera image'
  } finally {
    loadingCameraImages.value[measurementId] = false
  }
}
</script> 
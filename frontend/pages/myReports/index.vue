<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white border-b shadow-sm">
            <div class="px-4 py-4 mx-auto max-w-4xl sm:px-6">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <NuxtLink to="/"
                            class="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                            <i class="fas fa-arrow-left"></i>
                            <span>กลับหน้าหลัก</span>
                        </NuxtLink>
                    </div>
                    <h1 class="text-xl font-bold text-gray-800">
                        <i class="mr-2 text-blue-600 fas fa-flag"></i>My Reports
                    </h1>
                </div>
            </div>
        </div>

        <div class="px-4 py-6 mx-auto max-w-4xl sm:px-6">
            <!-- New Report Form -->
            <div class="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500">
                    <h2 class="text-lg font-semibold text-white">
                        <i class="mr-2 fas fa-plus-circle"></i>แจ้งเหตุการณ์ใหม่
                    </h2>
                </div>
                <div class="px-6 py-5 space-y-4">
                    <!-- Row 1: IncidentType + Title -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block mb-1 text-sm font-medium text-gray-700">ประเภทเหตุการณ์ <span
                                    class="text-red-500">*</span></label>
                            <select v-model="form.incidentType"
                                class="w-full px-3 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">-- เลือกประเภท --</option>
                                <option value="DRIVER">คนขับ</option>
                                <option value="PASSENGER">ผู้โดยสาร</option>
                                <option value="ROUTE">เส้นทาง</option>
                                <option value="BOOKING">การจอง</option>
                                <option value="SYSTEM">ระบบ</option>
                                <option value="OTHER">อื่นๆ</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 text-sm font-medium text-gray-700">หัวข้อ <span
                                    class="text-red-500">*</span></label>
                            <input v-model="form.title" type="text" placeholder="สรุปปัญหาสั้นๆ"
                                class="w-full px-3 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>

                    <!-- Row 2: Priority -->
                    <div>
                        <label class="block mb-1 text-sm font-medium text-gray-700">ระดับความสำคัญ</label>
                        <div class="flex flex-wrap gap-2">
                            <button v-for="p in priorityOptions" :key="p.value" @click="form.priority = p.value"
                                type="button"
                                class="px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer"
                                :class="form.priority === p.value
                                    ? p.activeClass
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'">
                                <i class="mr-1 fas" :class="p.icon"></i>{{ p.label }}
                            </button>
                        </div>
                    </div>

                    <!-- Row 3: Description -->
                    <div>
                        <label class="block mb-1 text-sm font-medium text-gray-700">รายละเอียด <span
                                class="text-red-500">*</span></label>
                        <textarea v-model="form.description" rows="3" placeholder="อธิบายเหตุการณ์โดยละเอียด..."
                            class="w-full px-3 py-2 transition border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>

                    <!-- Row 4: Image Upload -->
                    <div>
                        <label class="block mb-1 text-sm font-medium text-gray-700">
                            <i class="fas fa-camera mr-1 text-gray-400"></i>ภาพประกอบ (ไม่บังคับ)
                        </label>
                        <div class="flex items-start gap-4">
                            <label
                                class="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                                <div v-if="!imagePreview" class="text-center text-gray-400">
                                    <i class="fas fa-cloud-arrow-up text-2xl mb-1"></i>
                                    <p class="text-xs">เลือกรูป</p>
                                </div>
                                <img v-else :src="imagePreview" class="w-full h-full object-cover rounded-lg" />
                                <input type="file" accept="image/*" class="hidden" @change="onImageSelected" />
                            </label>
                            <div v-if="imagePreview" class="flex flex-col gap-2">
                                <p class="text-xs text-gray-500">{{ imageFile?.name }}</p>
                                <button @click="removeImage"
                                    class="text-xs text-red-500 hover:text-red-700 cursor-pointer">
                                    <i class="fas fa-trash-can mr-1"></i>ลบรูป
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Row 5: Map -->
                    <div>
                        <label class="block mb-1 text-sm font-medium text-gray-700">
                            <i class="fas fa-map-marker-alt mr-1 text-red-400"></i>ตำแหน่งเหตุการณ์ <span class="text-red-500">*</span>
                        </label>
                        <p class="text-xs text-gray-400 mb-2">คลิกบนแผนที่เพื่อปักหมุดตำแหน่ง</p>
                        <div ref="mapContainer"
                            class="w-full h-64 rounded-xl border border-gray-200 overflow-hidden bg-gray-100">
                        </div>
                        <div v-if="form.location" class="mt-2 flex items-center gap-2">
                            <span class="text-xs text-gray-500">
                                <i class="fas fa-location-dot text-red-400 mr-1"></i>
                                {{ form.location.lat.toFixed(6) }}, {{ form.location.lng.toFixed(6) }}
                            </span>
                            <button @click="clearLocation"
                                class="text-xs text-red-500 hover:text-red-700 cursor-pointer">
                                <i class="fas fa-xmark mr-1"></i>ลบตำแหน่ง
                            </button>
                        </div>
                    </div>

                    <!-- Submit -->
                    <div class="flex justify-end">
                        <button @click="submitReport" :disabled="isSubmitting"
                            class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer">
                            <i class="fas fa-paper-plane" v-if="!isSubmitting"></i>
                            <i class="fas fa-spinner fa-spin" v-else></i>
                            {{ isSubmitting ? 'กำลังส่ง...' : 'ส่งรายงาน' }}
                        </button>
                    </div>
                    <div v-if="submitError" class="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                        <i class="fas fa-exclamation-circle mr-1"></i>{{ submitError }}
                    </div>
                    <div v-if="submitSuccess"
                        class="p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">
                        <i class="fas fa-check-circle mr-1"></i>ส่งรายงานเรียบร้อยแล้ว!
                    </div>
                </div>
            </div>

            <!-- My Reports List -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 class="text-lg font-semibold text-gray-800">
                        <i class="fas fa-list mr-2 text-blue-500"></i>รายงานของฉัน
                    </h2>
                    <span class="text-sm text-gray-500">{{ reports.length }} รายการ</span>
                </div>

                <div v-if="isLoading" class="p-8 text-center text-gray-500">
                    <i class="fas fa-spinner fa-spin text-2xl"></i>
                    <p class="mt-2">กำลังโหลดข้อมูล...</p>
                </div>

                <div v-else-if="!reports.length" class="p-12 text-center text-gray-400">
                    <i class="fas fa-inbox text-4xl mb-3"></i>
                    <p>ยังไม่มีรายงาน</p>
                </div>

                <div v-else class="divide-y divide-gray-100">
                    <div v-for="r in reports" :key="r.id"
                        class="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1 flex-wrap">
                                    <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                                        :class="typeBadge(r.incidentType)">
                                        <i class="mr-1 fas" :class="typeIcon(r.incidentType)"></i>
                                        {{ typeLabel(r.incidentType) }}
                                    </span>
                                    <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                                        :class="priorityBadge(r.priority)">
                                        <i class="mr-1 fas" :class="priorityIcon(r.priority)"></i>
                                        {{ r.priority }}
                                    </span>
                                    <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
                                        :class="statusBadge(r.status)">
                                        <i class="mr-1 fas" :class="statusIcon(r.status)"></i>
                                        {{ statusLabel(r.status) }}
                                    </span>
                                </div>
                                <h3 class="font-medium text-gray-900 truncate">{{ r.title }}</h3>
                                <p class="text-sm text-gray-500 line-clamp-2 mt-1">{{ r.description }}</p>

                                <!-- Image -->
                                <div v-if="r.imageUrl" class="mt-2">
                                    <img :src="r.imageUrl" alt="ภาพประกอบ"
                                        class="w-32 h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition"
                                        @click="openLightbox(r.imageUrl)" />
                                </div>

                                <!-- Location -->
                                <div v-if="r.location" class="mt-2">
                                    <span class="text-xs text-gray-400">
                                        <i class="fas fa-location-dot text-red-400 mr-1"></i>
                                        {{ r.location.lat?.toFixed(4) }}, {{ r.location.lng?.toFixed(4) }}
                                        <span v-if="r.location.address" class="ml-1">{{ r.location.address }}</span>
                                    </span>
                                </div>

                                <!-- Admin Note -->
                                <div v-if="r.adminNote"
                                    class="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                                    <p class="text-xs font-medium text-blue-600 mb-1">
                                        <i class="fas fa-comment-dots mr-1"></i>หมายเหตุจากแอดมิน
                                    </p>
                                    <p class="text-sm text-blue-800">{{ r.adminNote }}</p>
                                </div>
                            </div>
                            <div class="text-right shrink-0">
                                <p class="text-xs text-gray-400">{{ formatDate(r.createdAt) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Image Lightbox -->
        <div v-if="lightboxUrl"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            @click.self="lightboxUrl = null">
            <div class="relative max-w-3xl max-h-[90vh]">
                <button @click="lightboxUrl = null"
                    class="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 cursor-pointer transition">
                    <i class="fas fa-xmark"></i>
                </button>
                <img :src="lightboxUrl" class="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCookie, useRuntimeConfig } from '#app'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'

dayjs.locale('th')
dayjs.extend(buddhistEra)

definePageMeta({ middleware: ['auth'] })

useHead({
    title: 'My Reports - PaiNamNae',
    link: [{ rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' }]
})

const config = useRuntimeConfig()
const isLoading = ref(false)
const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(false)
const reports = ref([])
const lightboxUrl = ref(null)

// Image
const imageFile = ref(null)
const imagePreview = ref(null)

// Map
const mapContainer = ref(null)
let map = null
let marker = null

const GMAPS_CB = '__initReportMap__'

const form = ref({
    incidentType: '',
    priority: 'MEDIUM',
    title: '',
    description: '',
    location: null,
})

const priorityOptions = [
    { value: 'LOW', label: 'ต่ำ', icon: 'fa-circle-down', activeClass: 'bg-green-100 text-green-700 border-green-400' },
    { value: 'MEDIUM', label: 'ปานกลาง', icon: 'fa-circle-minus', activeClass: 'bg-yellow-100 text-yellow-700 border-yellow-400' },
    { value: 'HIGH', label: 'สูง', icon: 'fa-circle-up', activeClass: 'bg-orange-100 text-orange-700 border-orange-400' },
    { value: 'CRITICAL', label: 'วิกฤต', icon: 'fa-circle-exclamation', activeClass: 'bg-red-100 text-red-700 border-red-400' },
]

function getToken() {
    return useCookie('token').value || (process.client ? localStorage.getItem('token') : '')
}

// ─── Image ───
function onImageSelected(e) {
    const file = e.target.files?.[0]
    if (!file) return
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
}
function removeImage() {
    imageFile.value = null
    imagePreview.value = null
}

// ─── Map ───
function loadGoogleMaps() {
    if (typeof google !== 'undefined' && google.maps) {
        initMap()
        return
    }
    if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
        // Script already loading, just set callback
        window[GMAPS_CB] = initMap
        return
    }
    window[GMAPS_CB] = initMap
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.public.googleMapsApiKey}&callback=${GMAPS_CB}`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
}

function initMap() {
    if (!mapContainer.value) return
    const center = { lat: 13.7563, lng: 100.5018 } // Bangkok
    map = new google.maps.Map(mapContainer.value, {
        center,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        ],
    })

    marker = new google.maps.Marker({
        map,
        draggable: true,
        visible: false,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#EF4444',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 3,
        },
    })

    map.addListener('click', (e) => {
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() }
        marker.setPosition(pos)
        marker.setVisible(true)
        form.value.location = pos
    })

    marker.addListener('dragend', (e) => {
        form.value.location = { lat: e.latLng.lat(), lng: e.latLng.lng() }
    })
}

function clearLocation() {
    form.value.location = null
    if (marker) marker.setVisible(false)
}

function openLightbox(url) {
    lightboxUrl.value = url
}

// ─── API ───
async function fetchReports() {
    isLoading.value = true
    try {
        const token = getToken()
        const res = await fetch(`${config.public.apiBase}reports/me`, {
            headers: {
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        })
        const body = await res.json()
        if (!res.ok) throw new Error(body?.message || 'Failed to fetch reports')
        reports.value = Array.isArray(body?.data) ? body.data : []
    } catch (err) {
        console.error(err)
    } finally {
        isLoading.value = false
    }
}

async function submitReport() {
    submitError.value = ''
    submitSuccess.value = false

    if (!form.value.incidentType || !form.value.title || !form.value.description) {
        submitError.value = 'กรุณากรอกข้อมูลให้ครบทุกช่อง (ประเภท, หัวข้อ, รายละเอียด)'
        return
    }
    if (!form.value.location) {
        submitError.value = 'กรุณาปักหมุดตำแหน่งเหตุการณ์บนแผนที่'
        return
    }

    isSubmitting.value = true
    try {
        const token = getToken()

        const fd = new FormData()
        fd.append('incidentType', form.value.incidentType)
        fd.append('priority', form.value.priority || 'MEDIUM')
        fd.append('title', form.value.title)
        fd.append('description', form.value.description)

        if (form.value.location) {
            fd.append('location', JSON.stringify(form.value.location))
        }
        if (imageFile.value) {
            fd.append('image', imageFile.value)
        }

        const res = await fetch(`${config.public.apiBase}reports`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: fd,
        })
        const body = await res.json()
        if (!res.ok) throw new Error(body?.message || 'Failed to create report')

        submitSuccess.value = true
        form.value = { incidentType: '', priority: 'MEDIUM', title: '', description: '', location: null }
        removeImage()
        clearLocation()
        await fetchReports()
        setTimeout(() => { submitSuccess.value = false }, 3000)
    } catch (err) {
        submitError.value = err.message
    } finally {
        isSubmitting.value = false
    }
}

function formatDate(iso) {
    if (!iso) return '-'
    return dayjs(iso).format('D MMM BBBB HH:mm')
}

// ─── Badge helpers ───
function statusBadge(s) {
    if (s === 'PENDING') return 'bg-amber-100 text-amber-700'
    if (s === 'IN_PROGRESS') return 'bg-blue-100 text-blue-700'
    if (s === 'RESOLVED') return 'bg-green-100 text-green-700'
    if (s === 'REJECTED') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
}
function statusIcon(s) {
    if (s === 'PENDING') return 'fa-hourglass-half'
    if (s === 'IN_PROGRESS') return 'fa-spinner'
    if (s === 'RESOLVED') return 'fa-circle-check'
    if (s === 'REJECTED') return 'fa-circle-xmark'
    return 'fa-circle'
}
function statusLabel(s) {
    if (s === 'PENDING') return 'รอดำเนินการ'
    if (s === 'IN_PROGRESS') return 'กำลังดำเนินการ'
    if (s === 'RESOLVED') return 'แก้ไขแล้ว'
    if (s === 'REJECTED') return 'ปฏิเสธ'
    return s
}

function typeBadge(t) {
    if (t === 'DRIVER') return 'bg-orange-100 text-orange-700'
    if (t === 'PASSENGER') return 'bg-blue-100 text-blue-700'
    if (t === 'ROUTE') return 'bg-emerald-100 text-emerald-700'
    if (t === 'BOOKING') return 'bg-purple-100 text-purple-700'
    if (t === 'SYSTEM') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
}
function typeIcon(t) {
    if (t === 'DRIVER') return 'fa-id-card'
    if (t === 'PASSENGER') return 'fa-user'
    if (t === 'ROUTE') return 'fa-route'
    if (t === 'BOOKING') return 'fa-calendar-check'
    if (t === 'SYSTEM') return 'fa-gear'
    return 'fa-circle-question'
}
function typeLabel(t) {
    if (t === 'DRIVER') return 'คนขับ'
    if (t === 'PASSENGER') return 'ผู้โดยสาร'
    if (t === 'ROUTE') return 'เส้นทาง'
    if (t === 'BOOKING') return 'การจอง'
    if (t === 'SYSTEM') return 'ระบบ'
    return 'อื่นๆ'
}

function priorityBadge(p) {
    if (p === 'LOW') return 'bg-green-100 text-green-700'
    if (p === 'MEDIUM') return 'bg-yellow-100 text-yellow-700'
    if (p === 'HIGH') return 'bg-orange-100 text-orange-700'
    if (p === 'CRITICAL') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
}
function priorityIcon(p) {
    if (p === 'LOW') return 'fa-circle-down'
    if (p === 'MEDIUM') return 'fa-circle-minus'
    if (p === 'HIGH') return 'fa-circle-up'
    if (p === 'CRITICAL') return 'fa-circle-exclamation'
    return 'fa-circle'
}

onMounted(() => {
    fetchReports()
    if (process.client) {
        loadGoogleMaps()
    }
})

onUnmounted(() => {
    if (window[GMAPS_CB]) delete window[GMAPS_CB]
})
</script>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>

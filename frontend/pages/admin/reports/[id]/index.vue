<template>
    <div>
        <AdminHeader />
        <AdminSidebar />

        <main id="main-content" class="main-content mt-16 ml-0 lg:ml-[280px] p-6">
            <div class="mx-auto max-w-4xl">
                <!-- Back -->
                <div class="mb-6">
                    <NuxtLink to="/admin/reports"
                        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                        <i class="fas fa-arrow-left"></i> กลับรายการรายงาน
                    </NuxtLink>
                </div>

                <div v-if="isLoading" class="p-8 text-center text-gray-500">
                    <i class="fas fa-spinner fa-spin text-2xl"></i>
                    <p class="mt-2">กำลังโหลดข้อมูล...</p>
                </div>

                <div v-else-if="loadError" class="p-8 text-center text-red-600">{{ loadError }}</div>

                <div v-else-if="report" class="space-y-6">
                    <!-- Report Info Card -->
                    <div class="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                        <div
                            class="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-between">
                            <h1 class="text-lg font-semibold text-white">
                                <i class="fas fa-flag mr-2"></i>รายละเอียดรายงาน
                            </h1>
                            <span
                                class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-white/20 text-white">
                                {{ report.id }}
                            </span>
                        </div>

                        <div class="px-6 py-5 space-y-4">
                            <!-- Reporter + Date -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs font-medium text-gray-500 uppercase">ผู้แจ้ง</label>
                                    <p class="mt-1 text-gray-900 font-medium">
                                        {{ report.user?.firstName }} {{ report.user?.lastName }}
                                    </p>
                                    <p class="text-sm text-gray-500">{{ report.user?.email }}</p>
                                    <p v-if="report.user?.phoneNumber" class="text-sm text-gray-500">
                                        <i class="fas fa-phone mr-1"></i>{{ report.user.phoneNumber }}
                                    </p>
                                </div>
                                <div>
                                    <label class="text-xs font-medium text-gray-500 uppercase">วันที่แจ้ง</label>
                                    <p class="mt-1 text-gray-900">{{ formatDate(report.createdAt) }}</p>
                                    <label
                                        class="text-xs font-medium text-gray-500 uppercase mt-2 block">อัปเดตล่าสุด</label>
                                    <p class="mt-1 text-gray-900">{{ formatDate(report.updatedAt) }}</p>
                                </div>
                            </div>

                            <hr class="border-gray-200" />

                            <!-- IncidentType, Priority, Status -->
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label class="text-xs font-medium text-gray-500 uppercase">ประเภทเหตุการณ์</label>
                                    <div class="mt-1">
                                        <span
                                            class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
                                            :class="typeBadge(report.incidentType)">
                                            <i class="mr-1 fas" :class="typeIcon(report.incidentType)"></i>
                                            {{ typeLabel(report.incidentType) }}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label class="text-xs font-medium text-gray-500 uppercase">ระดับความสำคัญ</label>
                                    <div class="mt-1">
                                        <span
                                            class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
                                            :class="priorityBadge(report.priority)">
                                            <i class="mr-1 fas" :class="priorityIcon(report.priority)"></i>
                                            {{ report.priority }}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label
                                        class="text-xs font-medium text-gray-500 uppercase">สถานะปัจจุบัน</label>
                                    <div class="mt-1">
                                        <span
                                            class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full"
                                            :class="statusBadge(report.status)">
                                            <i class="mr-1 fas" :class="statusIcon(report.status)"></i>
                                            {{ statusLabel(report.status) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <hr class="border-gray-200" />

                            <!-- Title & Description -->
                            <div>
                                <label class="text-xs font-medium text-gray-500 uppercase">หัวข้อ</label>
                                <p class="mt-1 text-gray-900 font-medium text-lg">{{ report.title }}</p>
                            </div>
                            <div>
                                <label class="text-xs font-medium text-gray-500 uppercase">รายละเอียด</label>
                                <p class="mt-1 text-gray-700 whitespace-pre-wrap leading-relaxed">{{
                                    report.description }}</p>
                            </div>

                            <!-- Image -->
                            <div v-if="report.imageUrl">
                                <label class="text-xs font-medium text-gray-500 uppercase">ภาพประกอบ</label>
                                <div class="mt-2">
                                    <img :src="report.imageUrl" alt="ภาพประกอบ"
                                        class="max-w-sm rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:opacity-80 transition"
                                        @click="lightboxUrl = report.imageUrl" />
                                </div>
                            </div>

                            <!-- Location -->
                            <div v-if="report.location">
                                <label class="text-xs font-medium text-gray-500 uppercase">ตำแหน่งเหตุการณ์</label>
                                <p class="mt-1 text-sm text-gray-600">
                                    <i class="fas fa-location-dot text-red-400 mr-1"></i>
                                    {{ report.location.lat?.toFixed(6) }}, {{ report.location.lng?.toFixed(6) }}
                                    <span v-if="report.location.address" class="ml-1 text-gray-500">({{
                                        report.location.address }})</span>
                                </p>
                                <div ref="detailMapContainer"
                                    class="mt-2 w-full h-48 rounded-xl border border-gray-200 overflow-hidden bg-gray-100">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Admin Action Card -->
                    <div class="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
                        <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                            <h2 class="text-lg font-semibold text-white">
                                <i class="fas fa-pen-to-square mr-2"></i>อัปเดตสถานะ
                            </h2>
                        </div>
                        <div class="px-6 py-5 space-y-4">
                            <div>
                                <label class="block mb-1 text-sm font-medium text-gray-700">สถานะ</label>
                                <select v-model="editForm.status"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                                    <option value="PENDING">PENDING — รอดำเนินการ</option>
                                    <option value="IN_PROGRESS">IN_PROGRESS — กำลังดำเนินการ</option>
                                    <option value="RESOLVED">RESOLVED — แก้ไขแล้ว</option>
                                    <option value="REJECTED">REJECTED — ปฏิเสธ</option>
                                </select>
                            </div>
                            <div>
                                <label class="block mb-1 text-sm font-medium text-gray-700">หมายเหตุจากแอดมิน</label>
                                <textarea v-model="editForm.adminNote" rows="3"
                                    placeholder="เขียนหมายเหตุถึงผู้แจ้ง (ผู้แจ้งจะเห็นข้อความนี้)"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"></textarea>
                            </div>
                            <div class="flex items-center justify-end gap-3">
                                <NuxtLink to="/admin/reports"
                                    class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                    ยกเลิก
                                </NuxtLink>
                                <button @click="saveReport" :disabled="isSaving"
                                    class="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer">
                                    <i class="fas fa-save" v-if="!isSaving"></i>
                                    <i class="fas fa-spinner fa-spin" v-else></i>
                                    {{ isSaving ? 'กำลังบันทึก...' : 'บันทึก' }}
                                </button>
                            </div>
                            <div v-if="saveError"
                                class="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                                <i class="fas fa-exclamation-circle mr-1"></i>{{ saveError }}
                            </div>
                            <div v-if="saveSuccess"
                                class="p-3 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200">
                                <i class="fas fa-check-circle mr-1"></i>บันทึกเรียบร้อย!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <div id="overlay" class="fixed inset-0 z-40 hidden bg-black bg-opacity-50 lg:hidden"
            @click="closeMobileSidebar"></div>

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
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useCookie, useRuntimeConfig, useRoute } from '#app'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import AdminHeader from '~/components/admin/AdminHeader.vue'
import AdminSidebar from '~/components/admin/AdminSidebar.vue'
import { useToast } from '~/composables/useToast'

dayjs.locale('th')
dayjs.extend(buddhistEra)

definePageMeta({ middleware: ['admin-auth'] })

const { toast } = useToast()
const config = useRuntimeConfig()
const route = useRoute()
const reportId = route.params.id

const isLoading = ref(false)
const loadError = ref('')
const isSaving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const report = ref(null)
const editForm = ref({ status: '', adminNote: '' })
const lightboxUrl = ref(null)
const detailMapContainer = ref(null)

const GMAPS_CB = '__initDetailMap__'

function getToken() {
    return useCookie('token').value || (process.client ? localStorage.getItem('token') : '')
}

async function fetchReport() {
    isLoading.value = true
    loadError.value = ''
    try {
        const token = getToken()
        const res = await fetch(`${config.public.apiBase}reports/admin/${reportId}`, {
            headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        })
        const body = await res.json()
        if (!res.ok) throw new Error(body?.message || `Failed: ${res.status}`)
        report.value = body?.data
        editForm.value = {
            status: body?.data?.status || 'PENDING',
            adminNote: body?.data?.adminNote || '',
        }
        // Load map if there's location data
        if (report.value?.location && process.client) {
            await nextTick()
            loadGoogleMaps()
        }
    } catch (err) {
        console.error(err)
        loadError.value = err?.message || 'ไม่สามารถโหลดข้อมูลได้'
    } finally {
        isLoading.value = false
    }
}

async function saveReport() {
    isSaving.value = true
    saveError.value = ''
    saveSuccess.value = false
    try {
        const token = getToken()
        const res = await fetch(`${config.public.apiBase}reports/admin/${reportId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(editForm.value),
        })
        const body = await res.json()
        if (!res.ok) throw new Error(body?.message || 'Failed to update')
        report.value = body?.data
        saveSuccess.value = true
        toast.success('บันทึกเรียบร้อย', 'อัปเดตสถานะรายงานแล้ว')
        setTimeout(() => { saveSuccess.value = false }, 3000)
    } catch (err) {
        saveError.value = err.message
        toast.error('เกิดข้อผิดพลาด', err.message)
    } finally {
        isSaving.value = false
    }
}

// ─── Google Maps (read-only for detail view) ───
function loadGoogleMaps() {
    // Already loaded — init immediately
    if (typeof google !== 'undefined' && google.maps) {
        setTimeout(initDetailMap, 100)
        return
    }
    // Script tag exists but not loaded yet — poll until ready
    if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
        waitForGoogleMaps()
        return
    }
    // Load fresh
    window[GMAPS_CB] = initDetailMap
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.public.googleMapsApiKey}&callback=${GMAPS_CB}`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
}

function waitForGoogleMaps(retries = 50) {
    if (typeof google !== 'undefined' && google.maps) {
        initDetailMap()
        return
    }
    if (retries > 0) {
        setTimeout(() => waitForGoogleMaps(retries - 1), 200)
    }
}

function initDetailMap() {
    if (!detailMapContainer.value || !report.value?.location) return
    if (typeof google === 'undefined' || !google.maps) return
    const pos = { lat: report.value.location.lat, lng: report.value.location.lng }
    const map = new google.maps.Map(detailMapContainer.value, {
        center: pos,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
    })
    new google.maps.Marker({
        position: pos,
        map,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#EF4444',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 3,
        },
    })
}

function formatDate(iso) {
    if (!iso) return '-'
    return dayjs(iso).format('D MMMM BBBB HH:mm')
}

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

useHead({
    title: 'Report Detail - Admin',
    link: [{ rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' }]
})

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar')
    const overlay = document.getElementById('overlay')
    if (!sidebar || !overlay) return
    sidebar.classList.remove('mobile-open')
    overlay.classList.add('hidden')
}
function defineGlobalScripts() {
    window.toggleSidebar = function () {
        const sidebar = document.getElementById('sidebar')
        const mainContent = document.getElementById('main-content')
        const toggleIcon = document.getElementById('toggle-icon')
        if (!sidebar || !mainContent || !toggleIcon) return
        sidebar.classList.toggle('collapsed')
        if (sidebar.classList.contains('collapsed')) {
            mainContent.style.marginLeft = '80px'
            toggleIcon.classList.replace('fa-chevron-left', 'fa-chevron-right')
        } else {
            mainContent.style.marginLeft = '280px'
            toggleIcon.classList.replace('fa-chevron-right', 'fa-chevron-left')
        }
    }
    window.toggleMobileSidebar = function () {
        const sidebar = document.getElementById('sidebar')
        const overlay = document.getElementById('overlay')
        if (!sidebar || !overlay) return
        sidebar.classList.toggle('mobile-open')
        overlay.classList.toggle('hidden')
    }
    window.__adminResizeHandler__ = function () {
        const sidebar = document.getElementById('sidebar')
        const mainContent = document.getElementById('main-content')
        const overlay = document.getElementById('overlay')
        if (!sidebar || !mainContent || !overlay) return
        if (window.innerWidth >= 1024) {
            sidebar.classList.remove('mobile-open')
            overlay.classList.add('hidden')
            mainContent.style.marginLeft = sidebar.classList.contains('collapsed') ? '80px' : '280px'
        } else { mainContent.style.marginLeft = '0' }
    }
    window.addEventListener('resize', window.__adminResizeHandler__)
}
function cleanupGlobalScripts() {
    window.removeEventListener('resize', window.__adminResizeHandler__ || (() => { }))
    delete window.toggleSidebar
    delete window.toggleMobileSidebar
    delete window.__adminResizeHandler__
}

onMounted(() => {
    defineGlobalScripts()
    if (typeof window.__adminResizeHandler__ === 'function') window.__adminResizeHandler__()
    fetchReport()
})
onUnmounted(() => {
    cleanupGlobalScripts()
    if (window[GMAPS_CB]) delete window[GMAPS_CB]
})
</script>

<style>
.sidebar { transition: width 0.3s ease; }
.sidebar.collapsed { width: 80px; }
.sidebar:not(.collapsed) { width: 280px; }
.sidebar-item { transition: all 0.3s ease; }
.sidebar-item:hover { background-color: rgba(59, 130, 246, 0.05); }
.sidebar.collapsed .sidebar-text { display: none; }
.sidebar.collapsed .sidebar-item { justify-content: center; }
.main-content { transition: margin-left 0.3s ease; }
@media (max-width: 768px) {
    .sidebar { position: fixed; z-index: 1000; transform: translateX(-100%); }
    .sidebar.mobile-open { transform: translateX(0); }
    .main-content { margin-left: 0 !important; }
}
</style>

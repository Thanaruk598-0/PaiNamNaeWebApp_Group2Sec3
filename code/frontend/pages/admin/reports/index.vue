<template>
    <div>
        <AdminHeader />
        <AdminSidebar />

        <!-- Main Content -->
        <main id="main-content" class="main-content mt-16 ml-0 lg:ml-[280px] p-6">
            <div class="mx-auto max-w-8xl">
                <!-- Title + Controls -->
                <div class="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
                    <h1 class="text-2xl font-semibold text-gray-800">
                        <i class="fas fa-flag mr-2 text-orange-500"></i>Report Management
                    </h1>
                    <div class="flex items-center gap-2">
                        <input v-model.trim="filters.q" @keyup.enter="applyFilters" type="text"
                            placeholder="ค้นหา : หัวข้อ / ผู้แจ้ง / อีเมล"
                            class="max-w-full px-3 py-2 border border-gray-300 rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button @click="applyFilters"
                            class="px-4 py-2 text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700">
                            ค้นหา
                        </button>
                    </div>
                </div>

                <!-- Filters -->
                <div class="mb-4 bg-white border border-gray-300 rounded-lg shadow-sm">
                    <div class="grid grid-cols-1 gap-3 px-4 py-4 sm:px-6 lg:grid-cols-5">
                        <div>
                            <label class="block mb-1 text-xs font-medium text-gray-600">สถานะ</label>
                            <select v-model="filters.status"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500">
                                <option value="">ทั้งหมด</option>
                                <option value="PENDING">PENDING</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="RESOLVED">RESOLVED</option>
                                <option value="REJECTED">REJECTED</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 text-xs font-medium text-gray-600">ประเภทเหตุการณ์</label>
                            <select v-model="filters.incidentType"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500">
                                <option value="">ทั้งหมด</option>
                                <option value="SAFETY">🔴 ความปลอดภัย</option>
                                <option value="TRIP_ISSUE">🟠 ปัญหาระหว่างเดินทาง</option>
                                <option value="BEHAVIOR">🟡 พฤติกรรม</option>
                                <option value="PROPERTY">🔵 ทรัพย์สิน</option>
                                <option value="TECHNICAL">⚙️ เทคนิค</option>
                                <option value="OTHER">อื่นๆ</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 text-xs font-medium text-gray-600">ระดับความสำคัญ</label>
                            <select v-model="filters.priority"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500">
                                <option value="">ทั้งหมด</option>
                                <option value="LOW">LOW</option>
                                <option value="MEDIUM">MEDIUM</option>
                                <option value="HIGH">HIGH</option>
                                <option value="CRITICAL">CRITICAL</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1 text-xs font-medium text-gray-600">เรียงตาม</label>
                            <select v-model="filters.sort"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500">
                                <option value="">(ค่าเริ่มต้น)</option>
                                <option value="createdAt:desc">วันที่ ล่าสุด</option>
                                <option value="createdAt:asc">วันที่ เก่าสุด</option>
                                <option value="priority:desc">ความสำคัญ สูง→ต่ำ</option>
                                <option value="priority:asc">ความสำคัญ ต่ำ→สูง</option>
                                <option value="status:asc">สถานะ A-Z</option>
                                <option value="status:desc">สถานะ Z-A</option>
                            </select>
                        </div>
                        <div class="flex items-end justify-end gap-2">
                            <button @click="clearFilters"
                                class="px-3 py-2 text-gray-700 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                                ล้างตัวกรอง
                            </button>
                            <button @click="applyFilters"
                                class="px-4 py-2 text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700">
                                ใช้ตัวกรอง
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Table Card -->
                <div class="bg-white border border-gray-300 rounded-lg shadow-sm">
                    <div class="flex items-center justify-between px-4 py-4 border-b border-gray-200 sm:px-6">
                        <div class="text-sm text-gray-600">
                            หน้าที่ {{ pagination.page }} / {{ totalPages }} • ทั้งหมด {{ pagination.total }} รายงาน
                        </div>
                    </div>

                    <div v-if="isLoading" class="p-8 text-center text-gray-500">กำลังโหลดข้อมูล...</div>
                    <div v-else-if="loadError" class="p-8 text-center text-red-600">{{ loadError }}</div>

                    <div v-else class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">ผู้แจ้ง
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">ผู้ถูกแจ้ง
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">ความสำคัญ
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">ประเภท
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">หัวข้อ
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">สถานะ
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">วันที่แจ้ง
                                    </th>
                                    <th class="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">การกระทำ
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                <tr v-for="r in pagedReports" :key="r.id" class="transition-opacity hover:bg-gray-50">
                                    <td class="px-4 py-3">
                                        <div class="font-medium text-gray-900">{{ r.user?.firstName }} {{
                                            r.user?.lastName }}</div>
                                        <div class="text-xs text-gray-500">{{ r.user?.email || '-' }}</div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <template v-if="getReportedUser(r)">
                                            <div class="font-medium text-gray-900">{{ getReportedUser(r).firstName }} {{ getReportedUser(r).lastName }}</div>
                                            <div class="text-xs text-gray-500">{{ getReportedUser(r).email || '-' }}</div>
                                            <div v-if="getReportedUser(r).phoneNumber" class="text-xs text-gray-500">
                                                <i class="fas fa-phone mr-1"></i>{{ getReportedUser(r).phoneNumber || '-' }}
                                            </div>
                                        </template>
                                        <span v-else class="text-gray-400">-</span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span
                                            class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                                            :class="priorityBadge(r.priority)">
                                            <i class="mr-1 fas" :class="priorityIcon(r.priority)"></i>
                                            {{ r.priority }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span
                                            class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                                            :class="typeBadge(r.incidentType)">
                                            <i class="mr-1 fas" :class="typeIcon(r.incidentType)"></i>
                                            {{ typeLabel(r.incidentType) }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="font-medium text-gray-900 max-w-xs truncate">{{ r.title }}</div>
                                        <div class="text-xs text-gray-500 max-w-xs truncate">{{ r.description }}</div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span
                                            class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full"
                                            :class="statusBadge(r.status)">
                                            <i class="mr-1 fas" :class="statusIcon(r.status)"></i>
                                            {{ r.status }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-700">{{ formatDate(r.createdAt) }}</td>
                                    <td class="px-4 py-3">
                                        <button @click="onViewReport(r)"
                                            class="p-2 text-gray-500 transition-colors cursor-pointer hover:text-emerald-600"
                                            title="ดู/แก้ไข">
                                            <i class="text-lg fa-regular fa-eye"></i>
                                        </button>
                                        <button @click="askDelete(r)"
                                            class="p-2 text-gray-500 transition-colors cursor-pointer hover:text-red-600"
                                            title="ลบ">
                                            <i class="text-lg fa-regular fa-trash-can"></i>
                                        </button>
                                    </td>
                                </tr>
                                <tr v-if="!pagedReports.length">
                                    <td colspan="8" class="px-4 py-10 text-center text-gray-500">ไม่มีข้อมูลรายงาน</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div
                        class="flex flex-col gap-3 px-4 py-4 border-t border-gray-200 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">Limit:</span>
                            <select v-model.number="pagination.limit" @change="applyFilters"
                                class="px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500">
                                <option :value="10">10</option>
                                <option :value="20">20</option>
                                <option :value="50">50</option>
                            </select>
                        </div>
                        <nav class="flex items-center gap-1">
                            <button class="px-3 py-2 text-sm border rounded-md disabled:opacity-50"
                                :disabled="pagination.page <= 1 || isLoading"
                                @click="changePage(pagination.page - 1)">Previous</button>
                            <template v-for="(p, idx) in pageButtons" :key="`p-${idx}-${p}`">
                                <span v-if="p === '…'" class="px-2 text-sm text-gray-500">…</span>
                                <button v-else class="px-3 py-2 text-sm border rounded-md"
                                    :class="p === pagination.page ? 'bg-blue-50 text-blue-600 border-blue-200' : 'hover:bg-gray-50'"
                                    :disabled="isLoading" @click="changePage(p)">{{ p }}</button>
                            </template>
                            <button class="px-3 py-2 text-sm border rounded-md disabled:opacity-50"
                                :disabled="pagination.page >= totalPages || isLoading"
                                @click="changePage(pagination.page + 1)">Next</button>
                        </nav>
                    </div>
                </div>
            </div>
        </main>

        <!-- Mobile Overlay -->
        <div id="overlay" class="fixed inset-0 z-40 hidden bg-black bg-opacity-50 lg:hidden"
            @click="closeMobileSidebar"></div>

        <!-- Confirm Delete Modal -->
        <ConfirmModal :show="showDelete" :title="`ลบรายงาน${deletingReport?.id ? ' : ' + deletingReport.id : ''}`"
            message="การลบนี้เป็นการลบถาวร ข้อมูลทั้งหมดจะถูกลบและไม่สามารถกู้คืนได้ คุณต้องการดำเนินการต่อหรือไม่?"
            confirmText="ลบถาวร" cancelText="ยกเลิก" variant="danger" @confirm="confirmDelete"
            @cancel="cancelDelete" />
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useCookie, useRuntimeConfig } from '#app'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import AdminHeader from '~/components/admin/AdminHeader.vue'
import AdminSidebar from '~/components/admin/AdminSidebar.vue'
import { useToast } from '~/composables/useToast'
import ConfirmModal from '~/components/ConfirmModal.vue'

dayjs.locale('th')
dayjs.extend(buddhistEra)

definePageMeta({ middleware: ['admin-auth'] })

const { toast } = useToast()
const config = useRuntimeConfig()

const isLoading = ref(false)
const loadError = ref('')
const reportsAll = ref([])

const pagination = reactive({ page: 1, limit: 20, total: 0, totalPages: 1 })
const filters = reactive({ q: '', status: '', incidentType: '', priority: '', sort: '' })

function getToken() {
    return useCookie('token').value || (process.client ? localStorage.getItem('token') : '')
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

function typeBadge(t) {
    if (t === 'SAFETY') return 'bg-red-100 text-red-700'
    if (t === 'TRIP_ISSUE') return 'bg-orange-100 text-orange-700'
    if (t === 'BEHAVIOR') return 'bg-yellow-100 text-yellow-700'
    if (t === 'PROPERTY') return 'bg-blue-100 text-blue-700'
    if (t === 'TECHNICAL') return 'bg-purple-100 text-purple-700'
    return 'bg-gray-100 text-gray-700'
}
function typeIcon(t) {
    if (t === 'SAFETY') return 'fa-shield-halved'
    if (t === 'TRIP_ISSUE') return 'fa-car-burst'
    if (t === 'BEHAVIOR') return 'fa-user-slash'
    if (t === 'PROPERTY') return 'fa-box-open'
    if (t === 'TECHNICAL') return 'fa-gear'
    return 'fa-circle-question'
}
function typeLabel(t) {
    if (t === 'SAFETY') return 'ความปลอดภัย'
    if (t === 'TRIP_ISSUE') return 'ปัญหาระหว่างเดินทาง'
    if (t === 'BEHAVIOR') return 'พฤติกรรม'
    if (t === 'PROPERTY') return 'ทรัพย์สิน'
    if (t === 'TECHNICAL') return 'เทคนิค'
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

function getReportedUser(r) {
    if (!r.booking) return null
    // ถ้าผู้แจ้ง = ผู้โดยสาร → ผู้ถูกแจ้ง = คนขับ
    if (r.userId === r.booking.passengerId) {
        return r.booking.route?.driver || null
    }
    // ถ้าผู้แจ้ง = คนขับ → ผู้ถูกแจ้ง = ผู้โดยสาร
    return r.booking.passenger || null
}

function formatDate(iso) {
    if (!iso) return '-'
    return dayjs(iso).format('D MMM BBBB HH:mm')
}

/* --- Client-side filtering/sorting --- */
const filteredSorted = computed(() => {
    let list = [...(reportsAll.value || [])]
    const q = (filters.q || '').toLowerCase().trim()
    if (q) {
        list = list.filter(r => {
            const fields = [r?.title, r?.description, r?.user?.firstName, r?.user?.lastName, r?.user?.email]
            return fields.some(v => (v || '').toString().toLowerCase().includes(q))
        })
    }
    if (filters.status) list = list.filter(r => r?.status === filters.status)
    if (filters.incidentType) list = list.filter(r => r?.incidentType === filters.incidentType)
    if (filters.priority) list = list.filter(r => r?.priority === filters.priority)

    const [by, order] = (filters.sort || '').split(':')
    if (by && ['asc', 'desc'].includes(order)) {
        list.sort((a, b) => {
            const va = a?.[by], vb = b?.[by]
            if (va == null && vb == null) return 0
            if (va == null) return order === 'asc' ? 1 : -1
            if (vb == null) return order === 'asc' ? -1 : 1
            if (va < vb) return order === 'asc' ? -1 : 1
            if (va > vb) return order === 'asc' ? 1 : -1
            return 0
        })
    }
    return list
})

const totalPages = computed(() => Math.max(1, Math.ceil((filteredSorted.value.length || 0) / (pagination.limit || 20))))
const pageButtons = computed(() => {
    const total = totalPages.value
    const current = pagination.page
    if (!total || total < 1) return []
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
    const set = new Set([1, total, current])
    if (current - 1 > 1) set.add(current - 1)
    if (current + 1 < total) set.add(current + 1)
    const pages = Array.from(set).sort((a, b) => a - b)
    const out = []
    for (let i = 0; i < pages.length; i++) {
        if (i > 0 && pages[i] - pages[i - 1] > 1) out.push('…')
        out.push(pages[i])
    }
    return out
})
const pagedReports = computed(() => {
    const start = (pagination.page - 1) * pagination.limit
    const end = start + pagination.limit
    const slice = filteredSorted.value.slice(start, end)
    pagination.total = filteredSorted.value.length
    pagination.totalPages = totalPages.value
    return slice
})

/* --- Fetch --- */
async function fetchReports() {
    isLoading.value = true
    loadError.value = ''
    try {
        const token = getToken()
        const res = await fetch(`${config.public.apiBase}reports/admin`, {
            headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            credentials: 'include'
        })
        const body = await res.json()
        if (!res.ok) throw new Error(body?.message || `Request failed: ${res.status}`)
        reportsAll.value = Array.isArray(body?.data) ? body.data : []
        pagination.page = 1
    } catch (err) {
        console.error(err)
        loadError.value = err?.message || 'ไม่สามารถโหลดข้อมูลได้'
        toast.error('เกิดข้อผิดพลาด', loadError.value)
        reportsAll.value = []
    } finally {
        isLoading.value = false
    }
}

function changePage(next) { if (next < 1 || next > totalPages.value) return; pagination.page = next }
function applyFilters() { pagination.page = 1 }
function clearFilters() {
    filters.q = ''; filters.status = ''; filters.incidentType = ''; filters.priority = ''; filters.sort = ''
    pagination.page = 1
}

function onViewReport(r) {
    navigateTo(`/admin/reports/${r.id}`)
}

/* --- Delete --- */
const showDelete = ref(false)
const deletingReport = ref(null)
function askDelete(r) { deletingReport.value = r; showDelete.value = true }
function cancelDelete() { showDelete.value = false; deletingReport.value = null }

async function confirmDelete() {
    if (!deletingReport.value) return
    const r = deletingReport.value
    try {
        const token = getToken()
        const res = await fetch(`${config.public.apiBase}reports/admin/${r.id}`, {
            method: 'DELETE',
            headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            credentials: 'include'
        })
        const body = await res.json()
        if (!res.ok) throw new Error(body?.message || 'Failed to delete')
        toast.success('ลบรายงานเรียบร้อย', `"${r.title}" ถูกลบถาวรแล้ว`)
        cancelDelete()
        const currentPage = pagination.page
        await fetchReports()
        if (currentPage > totalPages.value) changePage(totalPages.value)
        else changePage(currentPage)
    } catch (err) {
        console.error(err)
        toast.error('ลบไม่สำเร็จ', err?.message || 'ไม่สามารถลบได้')
    }
}

/* --- Sidebar scripts --- */
useHead({
    title: 'Report Management - Admin',
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
        } else {
            mainContent.style.marginLeft = '0'
        }
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
    fetchReports()
})
onUnmounted(() => { cleanupGlobalScripts() })
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
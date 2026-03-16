<template>
  <!-- Modal Overlay -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 sm:p-6"
        @click.self="close"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-[440px] overflow-hidden flex flex-col transform transition-all">
          <!-- Premium Header -->
          <div class="relative px-6 py-5 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700"></div>
            <!-- Decorative circle -->
            <div class="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div class="absolute top-8 right-8 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            
            <div class="relative flex items-center justify-between">
              <div class="flex items-center gap-3.5">
                <div class="w-11 h-11 bg-white/20 backdrop-blur-md rounded-xl shadow-inner flex items-center justify-center border border-white/20">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-white drop-shadow-sm">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-white font-bold text-lg tracking-wide drop-shadow-sm">เอกสารการชำระเงิน</h3>
                  <p class="text-blue-100/90 text-xs font-medium tracking-wider">PAYMENT DOCUMENTS</p>
                </div>
              </div>
              <button @click="close" class="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-white transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 md:p-7 bg-white">
            <!-- Trip Info -->
            <div v-if="trip" class="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-sky-400"></div>
              <p class="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">รายละเอียดเส้นทาง</p>
              <p class="font-bold text-slate-800 text-[15px] leading-tight flex items-center gap-2">
                {{ trip.origin }}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-slate-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
                {{ trip.destination }}
              </p>
              <div class="flex items-center gap-2 mt-2 text-xs font-medium text-slate-500">
                <span class="bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200">{{ trip.date }}</span>
                <span class="bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200">{{ trip.seats }} ที่นั่ง</span>
                <span class="bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200 text-blue-600 font-bold bg-blue-50/50">{{ trip.price.toLocaleString() }} ฿</span>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="isLoading" class="flex flex-col items-center py-10 gap-4">
              <div class="relative w-12 h-12">
                <div class="absolute inset-0 rounded-full border-[3px] border-slate-100"></div>
                <div class="absolute inset-0 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin"></div>
              </div>
              <p class="text-sm font-medium text-slate-500 animate-pulse">กำลังเตรียมเอกสาร...</p>
            </div>

            <!-- Error -->
            <div v-else-if="error" class="py-8 text-center bg-red-50/50 rounded-2xl border border-red-100">
              <div class="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-3 text-red-500 border border-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p class="text-sm font-bold text-red-600">{{ error }}</p>
            </div>

            <!-- Document list -->
            <div v-else-if="documents.length > 0" class="space-y-4">
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span class="w-4 h-[1px] bg-slate-200"></span>
                รายการเอกสารดาวน์โหลด
                <span class="flex-1 h-[1px] bg-slate-200"></span>
              </p>

              <div
                v-for="doc in documents"
                :key="doc.id"
                class="relative flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 group"
              >
                <!-- Icon background blob -->
                <div :class="[
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 shadow-inner border',
                  doc.type === 'RECEIPT_VOUCHER' ? 'bg-blue-50 border-blue-100/50 text-blue-600' : 'bg-sky-50 border-sky-100/50 text-sky-600'
                ]">
                  <svg v-if="doc.type === 'RECEIPT_VOUCHER'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 14.25h6m-6-3h6m-6-3h6m-6-3h6M10.125 21v-3.75c0-.621-.504-1.125-1.125-1.125H5.625c-.621 0-1.125.504-1.125 1.125V21" /> 
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p class="text-[15px] font-bold text-slate-800 leading-tight truncate group-hover:text-blue-700 transition-colors">
                    {{ doc.type === 'RECEIPT_VOUCHER' ? 'ใบสำคัญรับเงิน' : 'ใบกำกับภาษีแบบย่อ' }}
                  </p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{{ doc.documentNumber }}</span>
                  </div>
                  <p class="text-[11px] text-slate-400 mt-1.5">สร้างเมื่อ: <span class="text-slate-500">{{ formatDate(doc.issuedAt) }}</span></p>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 flex-shrink-0">
                  <button
                    @click="openDocument(doc)"
                    :disabled="actionLoadingId === doc.id + '_view'"
                    class="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-slate-500 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    title="ดูเอกสาร"
                  >
                    <svg v-if="actionLoadingId === doc.id + '_view'" class="animate-spin w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    @click="downloadDocument(doc)"
                    :disabled="actionLoadingId === doc.id + '_dl'"
                    class="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 text-slate-500 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    title="ดาวน์โหลด"
                  >
                    <svg v-if="actionLoadingId === doc.id + '_dl'" class="animate-spin w-4 h-4 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- No docs yet -->
            <div v-else class="py-12 px-6 text-center bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-slate-300">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p class="text-[15px] font-bold text-slate-700">อยู่ระหว่างเตรียมเอกสาร</p>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">กรุณารอสักครู่ เอกสารจะพร้อมให้ดาวน์โหลด<br/>เมื่อการชำระเงินได้รับการยืนยันสมบูรณ์</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              @click="regenerate"
              :disabled="isRegenerating || isLoading"
              class="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 shadow-sm rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              <svg v-if="isRegenerating" class="animate-spin w-4 h-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              {{ isRegenerating ? 'กำลังสร้าง...' : 'สร้างเอกสารใหม่' }}
            </button>
            <button
              @click="close"
              class="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 shadow-sm rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  trip: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue'])

const { $api } = useNuxtApp()

const isVisible = ref(props.modelValue)
const isLoading = ref(false)
const isRegenerating = ref(false)
const error = ref(null)
const documents = ref([])
const actionLoadingId = ref(null)

watch(() => props.modelValue, (val) => {
  isVisible.value = val
  if (val && props.trip?.paymentId) {
    fetchDocuments()
  }
})

function close() {
  isVisible.value = false
  emit('update:modelValue', false)
}

async function fetchDocuments() {
  if (!props.trip?.paymentId) return
  isLoading.value = true
  error.value = null
  documents.value = []
  try {
    const data = await $api(`/payments/${props.trip.paymentId}/documents`)
    documents.value = Array.isArray(data) ? data : (data?.data || [])
  } catch (e) {
    error.value = 'ไม่สามารถโหลดเอกสารได้'
  } finally {
    isLoading.value = false
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function fetchPdfBlob(endpoint) {
  const base = useRuntimeConfig().public.apiBase
  const token = useCookie('token').value
  const url = `${base.replace(/\/$/, '')}${endpoint}`
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!response.ok) throw new Error('ดาวน์โหลดไม่สำเร็จ')
  return await response.blob()
}

async function openDocument(doc) {
  const endpoint = doc.type === 'RECEIPT_VOUCHER'
    ? `/payments/${props.trip.paymentId}/receipt-voucher`
    : `/payments/${props.trip.paymentId}/short-tax-invoice`
  actionLoadingId.value = doc.id + '_view'
  try {
    const blob = await fetchPdfBlob(endpoint)
    const url = window.URL.createObjectURL(blob)
    window.open(url, '_blank')
  } catch (e) {
    alert('ไม่สามารถเปิดเอกสารได้')
  } finally {
    actionLoadingId.value = null
  }
}

async function downloadDocument(doc) {
  const endpoint = doc.type === 'RECEIPT_VOUCHER'
    ? `/payments/${props.trip.paymentId}/receipt-voucher`
    : `/payments/${props.trip.paymentId}/short-tax-invoice`
  const filename = doc.type === 'RECEIPT_VOUCHER' ? 'receipt-voucher.pdf' : 'short-tax-invoice.pdf'
  actionLoadingId.value = doc.id + '_dl'
  try {
    const blob = await fetchPdfBlob(endpoint)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (e) {
    alert('ไม่สามารถดาวน์โหลดเอกสารได้')
  } finally {
    actionLoadingId.value = null
  }
}

async function regenerate() {
  if (!props.trip?.paymentId) return
  isRegenerating.value = true
  error.value = null
  try {
    await $api(`/payments/${props.trip.paymentId}/regenerate`, { method: 'POST' })
    await fetchDocuments()
  } catch (e) {
    error.value = 'สร้างเอกสารใหม่ไม่สำเร็จ กรุณาลองอีกครั้ง'
  } finally {
    isRegenerating.value = false
  }
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .bg-white,
.modal-fade-leave-to .bg-white {
  transform: scale(0.95) translateY(10px);
}
</style>

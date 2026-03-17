<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="close"
      >
        <div class="w-full max-w-[480px] bg-white rounded-3xl shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">ชำระค่าโดยสาร</p>
              <h3 class="text-xl font-bold text-gray-900">
                {{ headerTitle }}
              </h3>
            </div>
            <button
              type="button"
              class="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              @click="close"
              aria-label="ปิด"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5">
            <!-- Summary card -->
            <div class="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-slate-500">ผู้รับเงิน</p>
                  <p class="mt-0.5 text-base font-bold text-slate-800 truncate">{{ receiverLabel }}</p>
                </div>
                <div class="text-right shrink-0">
                  <p class="text-sm font-semibold text-slate-500">ยอดชำระ</p>
                  <p class="mt-0.5 text-2xl font-extrabold text-blue-600 leading-none">
                    {{ amountLabel }}
                    <span class="text-base font-bold text-slate-500">บาท</span>
                  </p>
                </div>
              </div>
              <div class="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <span class="inline-flex items-center px-2 py-1 rounded-full bg-white border border-slate-100">
                  {{ trip?.origin }} → {{ trip?.destination }}
                </span>
              </div>
            </div>

            <!-- Step 1: choose method -->
            <div v-if="step === 1" class="mt-5">
              <p class="text-base font-semibold text-gray-800">เลือกวิธีชำระเงิน</p>

              <div class="mt-3 space-y-3">
                <button
                  type="button"
                  class="w-full rounded-2xl border p-4 text-left hover:bg-gray-50 transition"
                  :class="method === 'BANK_TRANSFER' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'"
                  @click="method = 'BANK_TRANSFER'"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-lg font-bold text-gray-900">โอนเงิน</p>
                      <p class="text-sm text-gray-600 leading-snug">สแกน/ดู QR หรือโอนเข้าบัญชี แล้วอัปโหลดสลิป</p>
                    </div>
                    <span class="text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">แนะนำ</span>
                  </div>
                </button>

                <button
                  type="button"
                  class="w-full rounded-2xl border p-4 text-left hover:bg-gray-50 transition"
                  :class="method === 'CASH' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'"
                  @click="method = 'CASH'"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-lg font-bold text-gray-900">เงินสด</p>
                      <p class="text-sm text-gray-600 leading-snug">ชำระเงินสดกับคนขับ</p>
                    </div>
                  </div>
                </button>
              </div>

              <div v-if="method === 'BANK_TRANSFER'" class="mt-4">
                <div class="flex items-center justify-between">
                  <p class="text-base font-bold text-slate-800">ช่องทางรับเงินของคนขับ</p>
                  <p class="text-sm text-slate-500">เลือกโอนช่องทางใดก็ได้</p>
                </div>
                <div v-if="isLoadingMethods" class="mt-2 text-sm text-gray-500">กำลังโหลด…</div>
                <div v-else class="mt-3 space-y-3">
                  <div
                    v-if="driverMethods.promptPayId"
                    class="rounded-2xl border border-gray-200 p-4 bg-white"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="text-xs font-semibold text-gray-500 tracking-wide">PROMPTPAY ID</p>
                        <p class="mt-1 font-extrabold text-gray-900 text-lg leading-none">
                          {{ driverMethods.promptPayId }}
                        </p>
                        <p class="mt-1 text-sm text-slate-500">
                          ชื่อผู้รับเงิน: <span class="font-semibold text-slate-700">{{ driverMethods.ownerName || receiverLabel }}</span>
                        </p>
                      </div>
                      <div class="shrink-0 text-sm font-bold text-gray-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                        PROMPTPAY
                      </div>
                    </div>
                  </div>

                <div
                  v-if="driverMethods.promptPayQrUrl"
                    class="rounded-2xl border border-gray-200 p-4 bg-white"
                >
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <p class="text-xs font-semibold text-gray-500 tracking-wide">QR CODE</p>
                        <p class="mt-0.5 text-sm text-slate-500">สแกนเพื่อโอนเงิน</p>
                      </div>
                      <a
                        :href="driverMethods.promptPayQrUrl"
                        target="_blank"
                        rel="noopener"
                        class="shrink-0 inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-slate-100 border border-slate-100"
                      >
                        เปิดเต็มจอ
                      </a>
                    </div>
                    <div v-if="!isPdf(driverMethods.promptPayQrUrl)" class="mt-3 rounded-xl overflow-hidden border border-gray-100 bg-white">
                      <img :src="driverMethods.promptPayQrUrl" class="w-full h-44 object-contain bg-white" alt="promptpay qr" />
                    </div>
                    <a
                      v-else
                      :href="driverMethods.promptPayQrUrl"
                      target="_blank"
                      rel="noopener"
                      class="mt-3 inline-flex items-center justify-center w-full px-4 py-3 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100"
                    >
                      เปิดไฟล์ QR (PDF)
                    </a>
                </div>

                  <div
                    v-for="acc in driverMethods.bankAccounts"
                    :key="acc.id"
                    class="rounded-2xl border border-gray-200 p-4 flex items-center gap-3 bg-white"
                  >
                    <div class="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center"
                      :style="{ backgroundColor: bankColor(acc.bankCode) }"
                    >
                      <img
                        v-if="!logoFailed[acc.bankCode]"
                        :src="bankLogoUrl(acc.bankCode)"
                        class="w-10 h-10 object-contain"
                        :alt="bankLabel(acc.bankCode, acc.customBankName)"
                        @error="() => { logoFailed[acc.bankCode] = true }"
                      />
                      <span v-else class="text-xs font-bold text-white">{{ bankBadge(acc.bankCode) }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-base font-bold text-gray-900 truncate leading-tight">
                        {{ bankLabel(acc.bankCode, acc.customBankName) }}
                      </p>
                      <p class="mt-1 text-sm text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span class="font-bold text-slate-700 tracking-wide">{{ acc.accountNumber }}</span>
                        <span v-if="driverMethods.ownerName" class="text-gray-300">•</span>
                        <span v-if="driverMethods.ownerName" class="truncate">{{ driverMethods.ownerName }}</span>
                      </p>
                    </div>
                  </div>

                  <div
                    v-if="!driverMethods.promptPayId && driverMethods.bankAccounts.length === 0"
                    class="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3"
                  >
                    คนขับยังไม่ได้ตั้งค่าช่องทางรับเงิน
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: upload slip -->
            <div v-else-if="step === 2" class="mt-5">
              <p class="text-base font-semibold text-gray-800">แนบหลักฐานการโอน</p>
              <p class="mt-1 text-sm text-gray-500">อัปโหลดสลิปหรือภาพหน้าจอยืนยันการโอนเงิน</p>

              <div class="mt-4">
                <label
                  class="block w-full rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/30 p-6 text-center cursor-pointer hover:bg-blue-50 transition"
                >
                  <input class="hidden" type="file" accept="image/*,application/pdf" @change="onSlipSelected" />
                  <div class="mx-auto w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                    <svg class="w-7 h-7 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16V4m0 12l-3-3m3 3l3-3M4 20h16" />
                    </svg>
                  </div>
                  <p class="mt-3 text-base font-semibold text-slate-700">คลิกหรือลากไฟล์มาวาง</p>
                  <p class="text-sm text-slate-500">JPG, PNG, PDF · สูงสุด 10 MB</p>
                </label>

                <p v-if="slipError" class="mt-2 text-sm text-red-600">{{ slipError }}</p>

                <div v-if="slipPreviewUrl" class="mt-4 rounded-2xl overflow-hidden border border-gray-200">
                  <img :src="slipPreviewUrl" class="w-full h-48 object-cover" alt="slip preview" />
                </div>
              </div>
            </div>

            <!-- Step 3: confirm -->
            <div v-else class="mt-5">
              <div class="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="text-base font-bold text-slate-800">สรุปรายการชำระเงิน</p>
                  <p class="text-sm text-slate-500 mt-1">
                    วิธีชำระ: {{ method === 'CASH' ? 'เงินสด' : 'โอนเงิน' }}
                  </p>
                </div>
              </div>

              <div v-if="method === 'BANK_TRANSFER'" class="mt-4">
                <p class="text-sm font-semibold text-gray-800">หลักฐานการโอน</p>
                <div v-if="slipPreviewUrl" class="mt-2 rounded-2xl overflow-hidden border border-gray-200">
                  <img :src="slipPreviewUrl" class="w-full h-44 object-cover" alt="slip preview" />
                </div>
              </div>

              <div class="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
                เมื่อส่งแล้วระบบจะให้คนขับตรวจสอบข้อมูลให้ถูกต้องก่อนกด “ยืนยันการชำระเงิน”
              </div>
            </div>
          </div>

          <!-- Footer buttons -->
          <div class="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
            <button
              type="button"
              class="flex-1 px-4 py-3 rounded-2xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
              @click="onBack"
              :disabled="isSubmitting"
            >
              {{ step === 1 ? 'ยกเลิก' : 'ย้อนกลับ' }}
            </button>
            <button
              type="button"
              class="flex-1 px-4 py-3 rounded-2xl font-semibold text-white transition"
              :class="canNext ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'"
              @click="onNext"
              :disabled="!canNext || isSubmitting"
            >
              {{ primaryLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch, reactive } from 'vue'
import { useToast } from '~/composables/useToast'
import { getBankLogoUrl } from '~/utils/bankAssets'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  trip: { type: Object, default: null }, // expects { id, origin, destination, price, seats, driver? }
})
const emit = defineEmits(['update:modelValue', 'success'])

const { $api } = useNuxtApp()
const { toast } = useToast()

const step = ref(1)
const method = ref('BANK_TRANSFER') // BANK_TRANSFER | CASH
const isLoadingMethods = ref(false)
const driverMethods = ref({ ownerName: null, promptPayId: null, promptPayQrUrl: null, bankAccounts: [] })

const slipFile = ref(null)
const slipPreviewUrl = ref('')
const slipError = ref('')
const isSubmitting = ref(false)

const logoFailed = reactive({})

const receiverLabel = computed(() => (props.trip?.driver?.name ? props.trip.driver.name : 'คนขับ'))
const amountLabel = computed(() => Number(props.trip?.price || 0).toLocaleString())

const headerTitle = computed(() => {
  if (step.value === 1) return 'ข้อมูลการชำระเงิน'
  if (step.value === 2) return 'แนบหลักฐานการโอน'
  return 'ยืนยันและส่ง'
})

const primaryLabel = computed(() => {
  if (isSubmitting.value) return 'กำลังส่ง...'
  if (step.value === 1) return method.value === 'CASH' ? 'ต่อไป' : 'ชำระเงิน'
  if (step.value === 2) return 'ตรวจสอบ'
  return 'ส่งหลักฐาน'
})

const canNext = computed(() => {
  if (step.value === 1) return true
  if (step.value === 2) return method.value === 'CASH' ? true : !!slipFile.value
  return true
})

async function fetchDriverMethods() {
  if (!props.trip?.id) return
  isLoadingMethods.value = true
  try {
    const data = await $api(`/payments/booking/${props.trip.id}`)
    driverMethods.value = data?.driverPaymentMethods || { ownerName: null, promptPayId: null, promptPayQrUrl: null, bankAccounts: [] }
  } catch (e) {
    driverMethods.value = { ownerName: null, promptPayId: null, promptPayQrUrl: null, bankAccounts: [] }
  } finally {
    isLoadingMethods.value = false
  }
}

function resetState() {
  step.value = 1
  method.value = 'BANK_TRANSFER'
  driverMethods.value = { ownerName: null, promptPayId: null, promptPayQrUrl: null, bankAccounts: [] }
  slipFile.value = null
  slipError.value = ''
  if (slipPreviewUrl.value) URL.revokeObjectURL(slipPreviewUrl.value)
  slipPreviewUrl.value = ''
}

function close() {
  emit('update:modelValue', false)
}

function onBack() {
  if (step.value === 1) {
    close()
    return
  }
  step.value = Math.max(1, step.value - 1)
}

async function onNext() {
  if (step.value === 1) {
    if (method.value === 'CASH') {
      step.value = 3
      return
    }
    step.value = 2
    return
  }

  if (step.value === 2) {
    if (method.value === 'BANK_TRANSFER' && !slipFile.value) {
      slipError.value = 'กรุณาอัปโหลดสลิป'
      return
    }
    step.value = 3
    return
  }

  // submit
  await submit()
}

function onSlipSelected(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    slipError.value = 'ไฟล์มีขนาดเกิน 10MB'
    slipFile.value = null
    return
  }
  slipError.value = ''
  slipFile.value = file
  if (slipPreviewUrl.value) URL.revokeObjectURL(slipPreviewUrl.value)
  slipPreviewUrl.value = file.type === 'application/pdf' ? '' : URL.createObjectURL(file)
}

async function submit() {
  if (!props.trip?.id) return
  isSubmitting.value = true
  try {
    const bookingId = props.trip.id
    if (method.value === 'CASH') {
      await $api(`/payments/booking/${bookingId}/cash`, { method: 'POST' })
    } else {
      const formData = new FormData()
      formData.append('method', 'BANK_TRANSFER')
      formData.append('slip', slipFile.value)
      await $fetch(`${useRuntimeConfig().public.apiBase}payments/booking/${bookingId}/slip`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${useCookie('token').value || ''}`,
        },
      })
    }

    toast.success('ส่งข้อมูลการชำระเงินเรียบร้อยแล้ว')
    emit('success')
    close()
  } catch (err) {
    toast.error('เกิดข้อผิดพลาด', err?.statusMessage || err?.data?.message || 'ไม่สามารถส่งข้อมูลได้')
  } finally {
    isSubmitting.value = false
  }
}

function bankLabel(bankCode, customName) {
  return customName || bankCode || '-'
}

function bankLogoUrl(bankCode) {
  return getBankLogoUrl(bankCode)
}

function bankBadge(bankCode) {
  return (bankCode || 'BANK').slice(0, 3).toUpperCase()
}

function bankColor(bankCode) {
  switch (bankCode) {
    case 'KBANK': return '#16A34A'
    case 'SCB': return '#4C1D95'
    case 'BBL': return '#2563EB'
    case 'KTB': return '#1D4ED8'
    case 'BAY': return '#CA8A04'
    case 'TTB': return '#1E3A8A'
    case 'GSB': return '#E11D48'
    case 'BAAC': return '#15803D'
    default: return '#6B7280'
  }
}

function isPdf(url) {
  return /\.pdf(\?|$)/i.test(String(url || ''))
}

watch(
  () => props.modelValue,
  async (v) => {
    if (v) {
      resetState()
      await fetchDriverMethods()
    }
  }
)

onBeforeUnmount(() => {
  if (slipPreviewUrl.value) URL.revokeObjectURL(slipPreviewUrl.value)
})
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
  transform: scale(0.96) translateY(8px);
}
</style>


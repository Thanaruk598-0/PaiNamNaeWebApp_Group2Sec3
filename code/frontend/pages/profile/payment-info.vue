<template>
    <div>
        <div class="flex items-center justify-center py-8">
            <div class="flex bg-white rounded-lg shadow-lg overflow-hidden max-w-6xl w-full mx-4 border border-gray-300">

                <ProfileSidebar />

                <main class="flex-1 p-8">
                    <div class="mb-8 text-center">
                        <div class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-blue-600 rounded-full">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8c-1.657 0-3 1.343-3 3v1H8a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2v-4a2 2 0 00-2-2h-1v-1c0-1.657-1.343-3-3-3z" />
                            </svg>
                        </div>
                        <h1 class="mb-2 text-3xl font-bold text-gray-800">ข้อมูลการรับเงิน</h1>
                        <p class="max-w-md mx-auto text-gray-600">
                            จัดการช่องทางการรับเงินจากผู้โดยสาร
                        </p>
                    </div>

                    <div class="space-y-6">
                        <!-- PromptPay -->
                        <div class="p-6 bg-white border border-gray-300 shadow rounded-xl">
                            <div class="flex items-center justify-between gap-4">
                                <div class="min-w-0">
                                    <h2 class="text-lg font-semibold text-gray-900">PromptPay</h2>
                                    <p class="mt-1 text-sm text-gray-500">ระบุเบอร์โทร/เลขบัตร/เลขประจำตัวผู้เสียภาษี</p>
                                </div>
                            </div>

                            <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <input v-model="promptPayId" type="text" placeholder="ระบุช่องทาง QR code ชำระเงิน"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <button type="button" @click="savePromptPay" :disabled="isSavingPromptPay"
                                    class="inline-flex items-center justify-center px-6 py-3 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed">
                                    <svg v-if="isSavingPromptPay" class="w-5 h-5 mr-2 -ml-1 text-white animate-spin"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg>
                                    บันทึก
                                </button>
                            </div>
                            <div v-if="ownerName" class="mt-2 text-sm text-gray-600">
                                ชื่อผู้รับเงิน: <span class="font-semibold text-gray-800">{{ ownerName }}</span>
                            </div>

                            <div class="mt-4 pt-4 border-t border-gray-200">
                                <div class="flex items-center justify-between gap-3">
                                    <div>
                                        <div class="text-sm font-semibold text-gray-900">QR Code (ไฟล์)</div>
                                        <div class="text-xs text-gray-500">JPG, PNG, PDF · สูงสุด 10 MB</div>
                                    </div>
                                    <label class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 cursor-pointer">
                                        เลือกไฟล์
                                        <input class="hidden" type="file" accept="image/*,application/pdf" @change="onQrSelected" />
                                    </label>
                                </div>

                                <p v-if="qrError" class="mt-2 text-xs text-red-600">{{ qrError }}</p>

                                <div v-if="qrPreviewUrl" class="mt-3 rounded-xl overflow-hidden border border-gray-200">
                                    <img :src="qrPreviewUrl" class="w-full h-44 object-contain bg-white" alt="promptpay qr preview" />
                                </div>
                                <div v-else-if="promptPayQrUrl" class="mt-3">
                                    <div v-if="!isPdfUrl(promptPayQrUrl)" class="rounded-xl overflow-hidden border border-gray-200">
                                        <img :src="promptPayQrUrl" class="w-full h-44 object-contain bg-white" alt="promptpay qr" />
                                    </div>
                                    <a v-else :href="promptPayQrUrl" target="_blank" rel="noopener"
                                        class="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100">
                                        เปิดไฟล์ QR (PDF)
                                    </a>
                                </div>

                                <div class="mt-3 flex items-center gap-3">
                                    <button type="button" @click="uploadPromptPayQr" :disabled="isUploadingQr || !qrFile"
                                        class="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed">
                                        {{ isUploadingQr ? 'กำลังอัปโหลด...' : 'อัปโหลด QR' }}
                                    </button>
                                    <button v-if="qrFile" type="button" @click="clearQrSelection" :disabled="isUploadingQr"
                                        class="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed">
                                        ยกเลิกไฟล์
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Bank accounts -->
                        <div class="p-6 bg-white border border-gray-300 shadow rounded-xl">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h2 class="text-lg font-semibold text-gray-900">บัญชีธนาคาร</h2>
                                    <p class="mt-1 text-sm text-gray-500">สามารถเพิ่มได้หลายบัญชี</p>
                                </div>
                                <button type="button" @click="openAddModal"
                                    class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100">
                                    <span class="text-lg leading-none">+</span>
                                    เพิ่มบัญชี
                                </button>
                            </div>

                            <div v-if="isLoading" class="mt-4 text-sm text-gray-500">กำลังโหลดข้อมูล...</div>

                            <div v-else class="mt-4">
                                <div v-if="bankAccounts.length === 0"
                                    class="p-4 text-sm text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
                                    ยังไม่มีบัญชีธนาคาร
                                </div>

                                <ul v-else class="space-y-3">
                                    <li v-for="acc in bankAccounts" :key="acc.id"
                                        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div class="flex items-center gap-3 min-w-0">
                                            <div class="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-gray-200"
                                                :style="{ backgroundColor: bankColor(acc.bankCode) }">
                                                <img
                                                    v-if="!logoFailed[acc.bankCode]"
                                                    :src="bankLogoUrl(acc.bankCode)"
                                                    class="w-10 h-10 object-contain"
                                                    :alt="bankLabel(acc.bankCode, acc.customBankName)"
                                                    @error="() => { logoFailed[acc.bankCode] = true }"
                                                />
                                                <span v-else class="text-sm font-semibold text-white">
                                                    {{ bankBadge(acc.bankCode) }}
                                                </span>
                                            </div>
                                            <div class="min-w-0">
                                                <div class="font-medium text-gray-900 truncate">
                                                    {{ bankLabel(acc.bankCode, acc.customBankName) }}
                                                </div>
                                                <div class="text-sm text-gray-500">
                                                    {{ acc.accountNumber }}
                                                    <span v-if="ownerName" class="text-gray-400">·</span>
                                                    <span v-if="ownerName">{{ ownerName }}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="flex items-center gap-2 shrink-0">
                                            <button type="button" @click="openEditModal(acc)"
                                                class="p-2 text-gray-500 rounded hover:bg-gray-100 hover:text-gray-700"
                                                title="แก้ไข">
                                                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M11 5h2m-1 0v14m-7 0h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                            <button type="button" @click="deleteAccount(acc)"
                                                class="p-2 text-gray-500 rounded hover:bg-gray-100 hover:text-red-600"
                                                title="ลบ">
                                                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m3-3h8m-9 3h10" />
                                                </svg>
                                            </button>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div class="absolute inset-0 bg-black/40" @click="closeModal"></div>

            <div class="relative w-full max-w-xl bg-white rounded-2xl shadow-xl">
                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-900">
                        {{ editingId ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีธนาคาร' }}
                    </h3>
                    <button type="button" class="p-2 text-gray-500 rounded hover:bg-gray-100" @click="closeModal"
                        aria-label="ปิด">
                        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div class="px-6 py-5 space-y-4">
                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-700">ธนาคาร</label>

                        <!-- Custom dropdown similar to screenshot -->
                        <div class="relative">
                            <button type="button" @click="toggleBankDropdown"
                                class="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <span class="text-gray-700">
                                    {{ selectedBank ? selectedBank.name : 'เลือกธนาคาร' }}
                                </span>
                                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <div v-if="isBankDropdownOpen"
                                class="absolute z-50 w-full mt-2 overflow-hidden bg-white border border-gray-200 rounded-xl shadow-lg">
                                <div class="max-h-64 overflow-y-auto">
                                    <button v-for="b in banks" :key="b.code" type="button" @click="selectBank(b)"
                                        class="flex items-center w-full gap-3 px-4 py-3 text-left hover:bg-gray-50">
                                        <div class="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border border-gray-200"
                                            :style="{ backgroundColor: bankColor(b.code) }">
                                            <img
                                                v-if="!logoFailed[b.code]"
                                                :src="bankLogoUrl(b.code)"
                                                class="w-8 h-8 object-contain"
                                                :alt="b.name"
                                                @error="() => { logoFailed[b.code] = true }"
                                            />
                                            <span v-else class="text-[10px] font-semibold text-white">{{ b.badge }}</span>
                                        </div>
                                        <span class="text-sm font-medium text-gray-800">{{ b.name }}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-700">เลขที่บัญชี</label>
                        <input v-model="accountNumber" type="text" inputmode="numeric"
                            @input="accountNumber = accountNumber.replace(/\D/g, '')"
                            placeholder="ระบุเลขบัญชีธนาคาร (ตัวเลขเท่านั้น)"
                            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                        <label class="block mb-2 text-sm font-medium text-gray-700">ชื่อบัญชี</label>
                        <input v-model="accountName" type="text" placeholder="ชื่อ-นามสกุล ตามโปรไฟล์"
                            readonly
                            class="w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-700 focus:outline-none" />
                        <p class="mt-1 text-xs text-gray-500">ระบบจะใช้ชื่อจากโปรไฟล์ของคุณอัตโนมัติ</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 border-t border-gray-200">
                    <button type="button" class="px-6 py-4 text-gray-700 hover:bg-gray-50" @click="closeModal">
                        ยกเลิก
                    </button>
                    <button type="button" @click="submitBankAccount" :disabled="isSavingBank"
                        class="px-6 py-4 font-medium text-blue-700 hover:bg-blue-50 disabled:text-blue-300 disabled:cursor-not-allowed">
                        {{ editingId ? 'บันทึก' : 'เพิ่มบัญชี' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, watch } from 'vue'
import ProfileSidebar from '~/components/ProfileSidebar.vue'
import { useToast } from '~/composables/useToast'
import { getBankLogoUrl } from '~/utils/bankAssets'

definePageMeta({
    middleware: 'auth',
})

const { $api } = useNuxtApp()
const { toast } = useToast()

const isLoading = ref(false)
const isSavingPromptPay = ref(false)
const isSavingBank = ref(false)
const isUploadingQr = ref(false)

const promptPayId = ref('')
const promptPayQrUrl = ref('')
const ownerName = ref('')
const bankAccounts = ref([])

const qrFile = ref(null)
const qrPreviewUrl = ref('')
const qrError = ref('')

const isModalOpen = ref(false)
const editingId = ref(null)

const isBankDropdownOpen = ref(false)
const selectedBank = ref(null)
const accountNumber = ref('')
const accountName = ref('')

watch(accountNumber, (newVal) => {
    if (newVal) {
        accountNumber.value = newVal.replace(/\D/g, '')
    }
})

const banks = [
    { code: 'KTB', name: 'ธนาคารกรุงไทย', badge: 'KTB', color: '#1D4ED8' },
    { code: 'SCB', name: 'ธนาคารไทยพาณิชย์', badge: 'SCB', color: '#4C1D95' },
    { code: 'BBL', name: 'ธนาคารกรุงเทพ', badge: 'BBL', color: '#2563EB' },
    { code: 'KBANK', name: 'ธนาคารกสิกรไทย', badge: 'K+', color: '#16A34A' },
    { code: 'BAY', name: 'ธนาคารกรุงศรีอยุธยา', badge: 'BAY', color: '#CA8A04' },
    { code: 'TTB', name: 'ธนาคารทหารไทยธนชาต', badge: 'ttb', color: '#1E3A8A' },
    { code: 'GSB', name: 'ธนาคารออมสิน', badge: 'GSB', color: '#E11D48' },
    { code: 'BAAC', name: 'ธนาคารเพื่อการเกษตรฯ', badge: 'BAAC', color: '#15803D' },
]

const fetchPaymentInfo = async () => {
    isLoading.value = true
    try {
        const data = await $api('/payment-methods/me')
        ownerName.value = data?.ownerName || ''
        promptPayId.value = data?.promptPayId || ''
        promptPayQrUrl.value = data?.promptPayQrUrl || ''
        bankAccounts.value = Array.isArray(data?.bankAccounts) ? data.bankAccounts : []
    } catch (err) {
        toast.error('เกิดข้อผิดพลาด', err.data?.message || 'ไม่สามารถดึงข้อมูลการรับเงินได้')
    } finally {
        isLoading.value = false
    }
}

const savePromptPay = async () => {
    isSavingPromptPay.value = true
    try {
        await $api('/payment-methods/promptpay', {
            method: 'PUT',
            body: { promptPayId: (promptPayId.value || '').trim() },
        })
        toast.success('บันทึกสำเร็จ', 'อัปเดต PromptPay เรียบร้อยแล้ว')
    } catch (err) {
        toast.error('เกิดข้อผิดพลาด', err.data?.message || 'ไม่สามารถบันทึก PromptPay ได้')
    } finally {
        isSavingPromptPay.value = false
    }
}

const clearQrSelection = () => {
    qrFile.value = null
    qrError.value = ''
    if (qrPreviewUrl.value) URL.revokeObjectURL(qrPreviewUrl.value)
    qrPreviewUrl.value = ''
}

const onQrSelected = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
        qrError.value = 'ไฟล์มีขนาดเกิน 10MB'
        clearQrSelection()
        return
    }
    const ok = file.type.startsWith('image/') || file.type === 'application/pdf'
    if (!ok) {
        qrError.value = 'รองรับเฉพาะไฟล์รูปภาพหรือ PDF'
        clearQrSelection()
        return
    }
    qrError.value = ''
    qrFile.value = file
    if (qrPreviewUrl.value) URL.revokeObjectURL(qrPreviewUrl.value)
    qrPreviewUrl.value = file.type === 'application/pdf' ? '' : URL.createObjectURL(file)
}

const uploadPromptPayQr = async () => {
    if (!qrFile.value) return
    isUploadingQr.value = true
    try {
        const formData = new FormData()
        formData.append('qr', qrFile.value)
        const data = await $fetch(`${useRuntimeConfig().public.apiBase}payment-methods/promptpay-qr`, {
            method: 'PUT',
            body: formData,
            headers: {
                Authorization: `Bearer ${useCookie('token').value || ''}`,
            },
        })
        promptPayQrUrl.value = data?.promptPayQrUrl || data?.data?.promptPayQrUrl || ''
        toast.success('อัปโหลดสำเร็จ', 'อัปโหลดไฟล์ QR เรียบร้อยแล้ว')
        clearQrSelection()
        await fetchPaymentInfo()
    } catch (err) {
        toast.error('เกิดข้อผิดพลาด', err?.statusMessage || err?.data?.message || 'ไม่สามารถอัปโหลดไฟล์ QR ได้')
    } finally {
        isUploadingQr.value = false
    }
}

const isPdfUrl = (url) => /\.pdf(\?|$)/i.test(String(url || ''))

const openAddModal = () => {
    editingId.value = null
    selectedBank.value = null
    accountNumber.value = ''
    accountName.value = ownerName.value || ''
    isBankDropdownOpen.value = false
    isModalOpen.value = true
}

const openEditModal = (acc) => {
    editingId.value = acc.id
    selectedBank.value = banks.find(b => b.code === acc.bankCode) || {
        code: acc.bankCode,
        name: acc.customBankName || acc.bankCode,
        badge: (acc.bankCode || 'BANK').slice(0, 3).toUpperCase(),
        color: '#6B7280',
    }
    accountNumber.value = acc.accountNumber || ''
    accountName.value = ownerName.value || acc.accountName || ''
    isBankDropdownOpen.value = false
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
    isBankDropdownOpen.value = false
}

const toggleBankDropdown = () => {
    isBankDropdownOpen.value = !isBankDropdownOpen.value
}

const selectBank = (b) => {
    selectedBank.value = b
    isBankDropdownOpen.value = false
}

const submitBankAccount = async () => {
    isSavingBank.value = true
    try {
        const payload = {
            bankCode: selectedBank.value?.code || '',
            customBankName: null,
            accountNumber: (accountNumber.value || '').trim(),
            accountName: (ownerName.value || accountName.value || '').trim(),
        }

        if (editingId.value) {
            await $api(`/payment-methods/bank-accounts/${editingId.value}`, {
                method: 'PUT',
                body: payload,
            })
            toast.success('บันทึกสำเร็จ', 'แก้ไขบัญชีธนาคารเรียบร้อยแล้ว')
        } else {
            await $api('/payment-methods/bank-accounts', {
                method: 'POST',
                body: payload,
            })
            toast.success('เพิ่มสำเร็จ', 'เพิ่มบัญชีธนาคารเรียบร้อยแล้ว')
        }

        closeModal()
        await fetchPaymentInfo()
    } catch (err) {
        toast.error('เกิดข้อผิดพลาด', err.data?.message || 'ไม่สามารถบันทึกบัญชีธนาคารได้')
    } finally {
        isSavingBank.value = false
    }
}

const deleteAccount = async (acc) => {
    if (!confirm('ต้องการลบบัญชีนี้ใช่หรือไม่?')) return
    try {
        await $api(`/payment-methods/bank-accounts/${acc.id}`, { method: 'DELETE' })
        toast.success('ลบสำเร็จ', 'ลบบัญชีเรียบร้อยแล้ว')
        await fetchPaymentInfo()
    } catch (err) {
        toast.error('เกิดข้อผิดพลาด', err.data?.message || 'ไม่สามารถลบบัญชีได้')
    }
}

const bankLabel = (bankCode, customName) => {
    const b = banks.find(x => x.code === bankCode)
    return b?.name || customName || bankCode || '-'
}
const logoFailed = reactive({})

const bankLogoUrl = (bankCode) => getBankLogoUrl(bankCode)

const bankBadge = (bankCode) => {
    const b = banks.find(x => x.code === bankCode)
    return b?.badge || (bankCode || 'BANK').slice(0, 3).toUpperCase()
}
const bankColor = (bankCode) => {
    const b = banks.find(x => x.code === bankCode)
    return b?.color || '#6B7280'
}

const onClickOutside = (e) => {
    if (!isBankDropdownOpen.value) return
    const t = e.target
    const btn = t?.closest?.('button')
    const panel = t?.closest?.('.absolute.z-50')
    if (btn || panel) return
    isBankDropdownOpen.value = false
}

const onKey = (e) => {
    if (e.key === 'Escape') {
        isBankDropdownOpen.value = false
        if (isModalOpen.value) closeModal()
    }
}

onMounted(() => {
    fetchPaymentInfo()
    document.addEventListener('click', onClickOutside)
    document.addEventListener('keydown', onKey)
})

onUnmounted(() => {
    document.removeEventListener('click', onClickOutside)
    document.removeEventListener('keydown', onKey)
    if (qrPreviewUrl.value) URL.revokeObjectURL(qrPreviewUrl.value)
})
</script>


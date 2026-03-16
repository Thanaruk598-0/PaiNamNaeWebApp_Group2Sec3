<template>
  <div>
    <!-- Chat Overlay -->
    <div
      v-if="isChatOpen"
      class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="closeChat"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col h-[80vh]">
        <div class="px-4 py-3 border-b flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">
            <i class="fas fa-comment-dots mr-2 text-blue-500"></i> แชท
          </h3>
          <button @click="closeChat" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-xmark text-xl"></i>
          </button>
        </div>
        <div ref="chatContainer" class="flex-1 p-4 overflow-y-auto space-y-4 chat-container">
          <div
            v-for="msg in chatMessages"
            :key="msg.id"
            :class="[
              'flex',
              msg.senderId === user.id ? 'justify-end' : 'justify-start',
            ]"
          >
            <div
              :class="[
                'max-w-[85%]',
                'p-3 rounded-lg shadow-sm',
                msg.senderId === user.id
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none',
              ]"
            >
              <!-- Image attachment -->
              <div v-if="msg.fileUrl && msg.fileType === 'image'" class="mb-2">
                <img
                  :src="msg.fileUrl"
                  :alt="msg.fileName || 'รูปภาพ'"
                  class="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition"
                  style="max-height: 200px; object-fit: cover"
                  @click="openLightboxUrl(msg.fileUrl)"
                />
              </div>
              <!-- File attachment -->
              <div v-else-if="msg.fileUrl && msg.fileType === 'file'" class="mb-2">
                <a
                  :href="msg.fileUrl"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-2 px-3 py-2 rounded-lg transition"
                  :class="
                    msg.senderId === user.id
                      ? 'bg-blue-400/30 hover:bg-blue-400/50 text-white'
                      : 'bg-gray-300/50 hover:bg-gray-300/80 text-gray-700'
                  "
                >
                  <i class="fas fa-file-arrow-down"></i>
                  <span class="text-sm truncate max-w-[180px]">{{
                    msg.fileName || "ดาวน์โหลดไฟล์"
                  }}</span>
                </a>
              </div>
              <p v-if="msg.content" class="text-sm" style="word-break: break-word;">{{ msg.content }}</p>
              <p
                :class="[
                  'text-[10px] mt-1 text-right',
                  msg.senderId === user.id ? 'text-blue-200' : 'text-gray-500',
                ]"
              >
                {{ formatDate(msg.createdAt) }}
              </p>
            </div>
          </div>
        </div>
        <!-- File Preview -->
        <div v-if="chatFilePreview" class="px-4 py-2 border-t bg-gray-50 flex items-center gap-3">
          <img
            v-if="chatFilePreview.type === 'image'"
            :src="chatFilePreview.url"
            class="w-14 h-14 object-cover rounded-lg border border-gray-200"
          />
          <div v-else class="w-14 h-14 flex items-center justify-center bg-blue-50 rounded-lg border border-blue-200">
            <i class="fas fa-file text-blue-500 text-xl"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-700 truncate">{{ chatFilePreview.name }}</p>
            <p class="text-xs text-gray-400">
              {{ chatFilePreview.type === "image" ? "รูปภาพ" : "ไฟล์" }}
            </p>
          </div>
          <button @click="removeChatFile" class="text-gray-400 hover:text-red-500 transition">
            <i class="fas fa-xmark text-lg"></i>
          </button>
        </div>
        <div class="p-4 border-t flex items-center gap-2 bg-white">
          <!-- Attach file button -->
          <label class="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer" title="แนบรูปภาพ/ไฟล์">
            <i class="fas fa-paperclip text-lg"></i>
            <input type="file" class="hidden" ref="chatFileInput" accept="image/*" @change="onChatFileSelected" />
          </label>
          <input
            v-model="chatInput"
            @keyup.enter="sendChatMessage"
            type="text"
            placeholder="พิมพ์ข้อความ..."
            maxlength="1000"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            @click="sendChatMessage"
            :disabled="(!chatInput.trim() && !chatFile) || isSendingMessage"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <i class="fas fa-paper-plane" v-if="!isSendingMessage"></i>
            <i class="fas fa-spinner fa-spin" v-else></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Lightbox for images -->
    <div
      v-if="lightboxUrl"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click.self="lightboxUrl = null"
    >
      <div class="relative max-w-4xl max-h-[90vh]">
        <button
          @click="lightboxUrl = null"
          class="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 transition z-10"
        >
          <i class="fas fa-xmark"></i>
        </button>
        <img :src="lightboxUrl" class="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import { useRuntimeConfig, useCookie } from "#app";
import { useAuth } from "~/composables/useAuth";
import { useToast } from "~/composables/useToast";
import { io } from "socket.io-client";
import dayjs from "dayjs";
import "dayjs/locale/th";

dayjs.locale("th");

const config = useRuntimeConfig();
const { user } = useAuth();
const { toast } = useToast();

const isChatOpen = ref(false);
const chatMessages = ref([]);
const chatInput = ref("");
const isSendingMessage = ref(false);
const chatContainer = ref(null);
const chatFile = ref(null);
const chatFilePreview = ref(null);
const chatFileInput = ref(null);
const chatSocket = ref(null);
const activeReportId = ref(null);
const activeBookingId = ref(null);
const lightboxUrl = ref(null);

function getToken() {
  return useCookie("token").value || (process.client ? localStorage.getItem("token") : "");
}

function formatDate(iso) {
  if (!iso) return "";
  return dayjs(iso).format("HH:mm");
}

function initChatSocket() {
  const token = getToken();
  if (!token) return;
  if (chatSocket.value?.connected) return;

  chatSocket.value = io(config.public.apiBase.replace("/api/", ""), {
    auth: { token },
    transports: ["websocket", "polling"],
  });

  chatSocket.value.on("connect", () => {
    if (activeReportId.value) {
      chatSocket.value.emit("join_room", activeReportId.value);
    }
  });

  chatSocket.value.on("connect_error", (err) => {
    console.error("Chat connection error:", err);
  });

  chatSocket.value.on("new_message", (msg) => {
    if (activeReportId.value && msg.reportId === activeReportId.value) {
      chatMessages.value.push(msg);
      scrollToBottom();
    }
  });
}

function openLightboxUrl(url) {
  lightboxUrl.value = url;
}

const openChat = async (bookingId) => {
  activeBookingId.value = bookingId;
  isChatOpen.value = true;
  chatMessages.value = [];
  
  try {
    const token = getToken();
    const res = await fetch(`${config.public.apiBase}chat/booking/${bookingId}/init`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Failed to init chat');
    
    const reportId = body.data.reportId;
    activeReportId.value = reportId;

    initChatSocket();
    if (chatSocket.value && chatSocket.value.connected) {
      chatSocket.value.emit("join_room", reportId);
    }

    // fetch old messages
    fetchChatMessages(reportId);
    
  } catch(e) {
    console.error(e);
    toast.error('ไม่สามารถเปิดแชทได้');
    isChatOpen.value = false;
  }
};

async function fetchChatMessages(reportId) {
  try {
    const token = getToken();
    const res = await fetch(`${config.public.apiBase}chat/${reportId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const body = await res.json();
    if (body.status === "success" && body.data) {
      chatMessages.value = body.data;
      scrollToBottom();
    }
  } catch (err) {
    console.error("Fetch chat error:", err);
  }
}

function closeChat() {
  if (activeReportId.value && chatSocket.value) {
    chatSocket.value.emit("leave_room", activeReportId.value);
  }
  isChatOpen.value = false;
  activeReportId.value = null;
  activeBookingId.value = null;
}

function onChatFileSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    toast.error("ขนาดไฟล์เกิน 10MB");
    return;
  }
  chatFile.value = file;
  const isImage = file.type.startsWith("image/");
  chatFilePreview.value = {
    name: file.name,
    type: isImage ? "image" : "file",
    url: isImage ? URL.createObjectURL(file) : null,
  };
}

function removeChatFile() {
  if (chatFilePreview.value?.url) {
    URL.revokeObjectURL(chatFilePreview.value.url);
  }
  chatFile.value = null;
  chatFilePreview.value = null;
  if (chatFileInput.value) chatFileInput.value.value = "";
}

async function sendChatMessage() {
  if ((!chatInput.value.trim() && !chatFile.value) || isSendingMessage.value || !activeReportId.value) return;

  isSendingMessage.value = true;
  try {
    const token = getToken();
    const reportId = activeReportId.value;

    if (chatFile.value) {
      const fd = new FormData();
      fd.append("file", chatFile.value);
      if (chatInput.value.trim()) fd.append("content", chatInput.value);

      const res = await fetch(`${config.public.apiBase}chat/${reportId}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "อัพโหลดไม่สำเร็จ");
      
      if (!chatSocket.value?.connected) {
        chatMessages.value.push(body.data);
      }
      chatInput.value = "";
      removeChatFile();
      scrollToBottom();
    } else {
      if (chatSocket.value?.connected) {
        chatSocket.value.emit(
          "send_message",
          { reportId, content: chatInput.value },
          (response) => {
            if (response.status === "ok") {
              chatInput.value = "";
            } else {
              toast.error("ส่งข้อความไม่สำเร็จ");
            }
          }
        );
      } else {
        const res = await fetch(`${config.public.apiBase}chat/${reportId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ content: chatInput.value }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || "ส่งข้อความไม่สำเร็จ");
        chatMessages.value.push(body.data);
        chatInput.value = "";
        scrollToBottom();
      }
    }
  } catch (err) {
    console.error("Send message error:", err);
    toast.error("ส่งข้อความไม่สำเร็จ: " + err.message);
  } finally {
    isSendingMessage.value = false;
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}

function handleKey(e) {
  if (e.key === "Escape" && lightboxUrl.value) {
    lightboxUrl.value = null;
  } else if (e.key === "Escape" && isChatOpen.value) {
    closeChat();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKey);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKey);
  if (chatSocket.value) {
    chatSocket.value.disconnect();
  }
});

defineExpose({
  openChat
});
</script>

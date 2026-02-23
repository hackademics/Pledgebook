<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isOpen"
          class="upload-modal-overlay"
          @click.self="handleClose"
        >
          <Transition name="scale">
            <div
              v-if="isOpen"
              class="upload-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="upload-modal-title"
            >
              <!-- Modal Header -->
              <div class="upload-modal__header">
                <h2
                  id="upload-modal-title"
                  class="upload-modal__title"
                >
                  <Icon
                    name="heroicons:photo"
                    class="upload-modal__title-icon"
                  />
                  Upload Image to IPFS
                </h2>
                <button
                  v-if="!upload.state.value.isUploading"
                  type="button"
                  class="upload-modal__close"
                  aria-label="Close modal"
                  @click="handleClose"
                >
                  <Icon
                    name="heroicons:x-mark"
                    class="upload-modal__close-icon"
                  />
                </button>
              </div>

              <!-- Modal Body -->
              <div class="upload-modal__body">
                <!-- Step 1: Select Image (Dropzone) -->
                <div
                  v-if="!upload.hasFile.value"
                  class="upload-dropzone"
                  :class="{ 'upload-dropzone--dragover': isDragOver }"
                  @dragover.prevent="handleDragOver"
                  @dragleave.prevent="handleDragLeave"
                  @drop.prevent="handleDrop"
                  @click="openFilePicker"
                >
                  <input
                    ref="fileInputRef"
                    type="file"
                    class="upload-dropzone__input"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    @click.stop
                    @change="handleFileSelect"
                  />
                  <div class="upload-dropzone__content">
                    <div class="upload-dropzone__icon-wrapper">
                      <Icon
                        name="heroicons:cloud-arrow-up"
                        class="upload-dropzone__icon"
                      />
                    </div>
                    <h3 class="upload-dropzone__title">Drop your image here</h3>
                    <p class="upload-dropzone__description">or click to browse</p>
                    <div class="upload-dropzone__formats">
                      <span class="upload-dropzone__format">JPG</span>
                      <span class="upload-dropzone__format">PNG</span>
                      <span class="upload-dropzone__format">WebP</span>
                      <span class="upload-dropzone__format">GIF</span>
                    </div>
                    <p class="upload-dropzone__size-limit">
                      Maximum file size: {{ upload.formatBytes(upload.config.maxFileSize) }}
                    </p>
                  </div>
                </div>

                <!-- Step 2: Preview & Validation -->
                <div
                  v-else-if="!upload.isComplete.value"
                  class="upload-preview"
                >
                  <!-- Image Preview -->
                  <div class="upload-preview__image-wrapper">
                    <img
                      v-if="upload.state.value.preview"
                      :src="upload.state.value.preview"
                      :alt="upload.state.value.file?.name || 'Preview'"
                      class="upload-preview__image"
                    />
                    <div
                      v-if="upload.state.value.isValidating"
                      class="upload-preview__loading"
                    >
                      <Icon
                        name="heroicons:arrow-path"
                        class="upload-preview__loading-icon"
                      />
                      <span>Validating...</span>
                    </div>
                  </div>

                  <!-- File Info -->
                  <div class="upload-preview__info">
                    <div class="upload-preview__file-name">
                      <Icon name="heroicons:document" />
                      <span>{{ upload.state.value.file?.name }}</span>
                    </div>
                    <div class="upload-preview__details">
                      <span v-if="upload.state.value.file">
                        {{ upload.formatBytes(upload.state.value.file.size) }}
                      </span>
                      <span v-if="upload.state.value.dimensions">
                        {{ upload.state.value.dimensions.width }}×{{
                          upload.state.value.dimensions.height
                        }}px
                      </span>
                    </div>
                  </div>

                  <!-- Error State -->
                  <div
                    v-if="upload.hasError.value"
                    class="upload-preview__error"
                  >
                    <Icon
                      name="heroicons:exclamation-triangle"
                      class="upload-preview__error-icon"
                    />
                    <span>{{ upload.state.value.error }}</span>
                  </div>

                  <!-- Upload Progress -->
                  <div
                    v-if="upload.state.value.isUploading"
                    class="upload-progress"
                  >
                    <div class="upload-progress__bar-container">
                      <div
                        class="upload-progress__bar"
                        :style="{ width: `${upload.state.value.uploadProgress}%` }"
                      ></div>
                    </div>
                    <div class="upload-progress__text">
                      <Icon
                        name="heroicons:arrow-path"
                        class="upload-progress__icon"
                      />
                      <span>Uploading to IPFS... {{ upload.state.value.uploadProgress }}%</span>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div
                    v-if="!upload.state.value.isUploading"
                    class="upload-preview__actions"
                  >
                    <button
                      type="button"
                      class="btn btn--secondary"
                      @click="handleReset"
                    >
                      <Icon name="heroicons:arrow-path" />
                      Choose Different
                    </button>
                    <button
                      type="button"
                      class="btn btn--primary"
                      :disabled="!upload.canUpload.value"
                      @click="handleUpload"
                    >
                      <Icon name="heroicons:cloud-arrow-up" />
                      Upload to IPFS
                    </button>
                  </div>
                </div>

                <!-- Step 3: Success -->
                <div
                  v-else
                  class="upload-success"
                >
                  <div class="upload-success__icon-wrapper">
                    <Icon
                      name="heroicons:check-circle"
                      class="upload-success__icon"
                    />
                  </div>
                  <h3 class="upload-success__title">Successfully Uploaded!</h3>
                  <p class="upload-success__description">
                    Your image has been uploaded to IPFS and is ready to use.
                  </p>

                  <!-- Preview of uploaded image -->
                  <div class="upload-success__preview">
                    <img
                      v-if="upload.state.value.preview"
                      :src="upload.state.value.preview"
                      :alt="upload.state.value.file?.name || 'Uploaded'"
                      class="upload-success__image"
                    />
                  </div>

                  <!-- IPFS Info -->
                  <div class="upload-success__info">
                    <div
                      v-if="upload.state.value.gatewayUrl"
                      class="upload-success__info-item"
                    >
                      <span class="upload-success__info-label">Gateway URL</span>
                      <code class="upload-success__info-value upload-success__info-value--truncate">
                        {{ upload.state.value.gatewayUrl }}
                      </code>
                    </div>
                    <div class="upload-success__info-item">
                      <span class="upload-success__info-label">IPFS URL</span>
                      <code class="upload-success__info-value">{{
                        upload.state.value.ipfsUrl
                      }}</code>
                    </div>
                    <div class="upload-success__info-item">
                      <span class="upload-success__info-label">CID</span>
                      <code class="upload-success__info-value upload-success__info-value--truncate">
                        {{ upload.state.value.ipfsCid }}
                      </code>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="upload-success__actions">
                    <button
                      type="button"
                      class="btn btn--secondary"
                      @click="handleReset"
                    >
                      <Icon name="heroicons:arrow-path" />
                      Upload Another
                    </button>
                    <button
                      type="button"
                      class="btn btn--primary"
                      @click="handleConfirm"
                    >
                      <Icon name="heroicons:check" />
                      Use This Image
                    </button>
                  </div>
                </div>
              </div>

              <!-- IPFS Info Footer -->
              <div class="upload-modal__footer">
                <div class="upload-modal__footer-info">
                  <Icon
                    name="heroicons:information-circle"
                    class="upload-modal__footer-icon"
                  />
                  <span>
                    Images are stored on IPFS for permanent, decentralized access. AI verification
                    can access these images via the IPFS gateway.
                  </span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useImageUpload } from '../../composables/useImageUpload'

declare const useToast: () => {
  add: (options: { title?: string; description?: string; icon?: string; color?: string }) => void
}

// =============================================================================
// PROPS & EMITS
// =============================================================================

interface Props {
  isOpen: boolean
  campaignId?: string
}

interface Emits {
  (e: 'close'): void
  (
    e: 'upload',
    data: { ipfsUrl: string; cid: string; gatewayUrl?: string; evidenceId?: string },
  ): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// =============================================================================
// COMPOSABLES
// =============================================================================

const upload = useImageUpload({
  maxFileSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  campaignId: props.campaignId,
})

const toast = useToast()

// =============================================================================
// LOCAL STATE
// =============================================================================

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragOver = ref(false)

// =============================================================================
// METHODS
// =============================================================================

function openFilePicker(): void {
  fileInputRef.value?.click()
}

async function handleFileSelect(event: Event): Promise<void> {
  const result = await upload.handleFileInput(event)

  // Reset input value to allow selecting the same file again
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  if (!result.valid) {
    toast.add({
      title: 'Invalid File',
      description: result.error || 'Please select a valid image file.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'error',
    })
  }
}

function handleDragOver(): void {
  isDragOver.value = true
}

function handleDragLeave(): void {
  isDragOver.value = false
}

async function handleDrop(event: DragEvent): Promise<void> {
  isDragOver.value = false
  const result = await upload.handleFileInput(event)
  if (!result.valid) {
    toast.add({
      title: 'Invalid File',
      description: result.error || 'Please select a valid image file.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'error',
    })
  }
}

async function handleUpload(): Promise<void> {
  const result = await upload.upload()

  if (result.success) {
    toast.add({
      title: 'Upload Complete',
      description: 'Your image has been uploaded to IPFS.',
      icon: 'i-heroicons-check-circle',
      color: 'success',
    })
  } else {
    toast.add({
      title: 'Upload Failed',
      description: result.error || 'Please try again.',
      icon: 'i-heroicons-exclamation-circle',
      color: 'error',
    })
  }
}

function handleReset(): void {
  upload.reset()
}

function handleConfirm(): void {
  if (upload.state.value.ipfsUrl && upload.state.value.ipfsCid) {
    const payload: { ipfsUrl: string; cid: string; gatewayUrl?: string; evidenceId?: string } = {
      ipfsUrl: upload.state.value.ipfsUrl,
      cid: upload.state.value.ipfsCid,
    }
    if (upload.state.value.gatewayUrl) {
      payload.gatewayUrl = upload.state.value.gatewayUrl
    }
    if (upload.state.value.evidenceId) {
      payload.evidenceId = upload.state.value.evidenceId
    }
    emit('upload', payload)
  }
  handleClose()
}

function handleClose(): void {
  if (!upload.state.value.isUploading) {
    upload.reset()
    emit('close')
  }
}
</script>

<style scoped>
/* =============================================================================
   UPLOAD MODAL STYLES
   ============================================================================= */

/* Modal Overlay */
.upload-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

/* Modal Container */
.upload-modal {
  position: relative;
  width: 100%;
  max-width: 32rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

/* Modal Header */
.upload-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background-color: var(--surface-secondary);
  border-bottom: 1px solid var(--border-secondary);
}

.upload-modal__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.upload-modal__title-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--interactive-primary);
}

.upload-modal__close {
  padding: 0.375rem;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);
}

.upload-modal__close:hover {
  color: var(--text-primary);
  background-color: var(--surface-hover);
}

.upload-modal__close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Modal Body */
.upload-modal__body {
  padding: 1.5rem;
}

/* Dropzone */
.upload-dropzone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 16rem;
  padding: 2rem;
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-lg);
  background-color: var(--surface-secondary);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast);
}

.upload-dropzone:hover,
.upload-dropzone--dragover {
  border-color: var(--interactive-primary);
  background-color: color-mix(in oklch, var(--interactive-primary) 5%, transparent);
}

.upload-dropzone__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-dropzone__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  pointer-events: none;
}

.upload-dropzone__icon-wrapper {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: color-mix(in oklch, var(--interactive-primary) 10%, transparent);
  border-radius: var(--radius-full);
  margin-bottom: 1rem;
}

.upload-dropzone__icon {
  width: 2rem;
  height: 2rem;
  color: var(--interactive-primary);
}

.upload-dropzone__title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.upload-dropzone__description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.upload-dropzone__formats {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.upload-dropzone__format {
  padding: 0.25rem 0.5rem;
  font-size: var(--text-2xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
  background-color: var(--surface-tertiary);
  border-radius: var(--radius-sm);
}

.upload-dropzone__size-limit {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

/* Preview State */
.upload-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-preview__image-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  aspect-ratio: 16 / 9;
}

.upload-preview__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.upload-preview__loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: var(--text-sm);
}

.upload-preview__loading-icon {
  width: 1.5rem;
  height: 1.5rem;
  animation: spin 1s linear infinite;
}

.upload-preview__info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
}

.upload-preview__file-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  min-width: 0;
}

.upload-preview__file-name svg {
  width: 1rem;
  height: 1rem;
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.upload-preview__file-name span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-preview__details {
  display: flex;
  gap: 0.75rem;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.upload-preview__error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: color-mix(in oklch, var(--color-error-500) 10%, transparent);
  border: 1px solid color-mix(in oklch, var(--color-error-500) 30%, transparent);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-error-600);
}

.upload-preview__error-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.upload-preview__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

/* Upload Progress */
.upload-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-progress__bar-container {
  height: 8px;
  background-color: var(--surface-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.upload-progress__bar {
  height: 100%;
  background: linear-gradient(90deg, var(--interactive-primary), var(--color-success-500));
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.upload-progress__text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.upload-progress__icon {
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}

/* Success State */
.upload-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.upload-success__icon-wrapper {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: color-mix(in oklch, var(--color-success-500) 15%, transparent);
  border-radius: var(--radius-full);
}

.upload-success__icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--color-success-500);
}

.upload-success__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.upload-success__description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.upload-success__preview {
  width: 100%;
  max-height: 10rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.upload-success__image {
  max-width: 100%;
  max-height: 10rem;
  object-fit: contain;
}

.upload-success__info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-success__info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.625rem;
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
  text-align: left;
}

.upload-success__info-label {
  font-size: var(--text-2xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.upload-success__info-value {
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  color: var(--text-secondary);
  word-break: break-all;
}

.upload-success__info-value--truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-success__actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.upload-success__actions .btn {
  flex: 1;
}

/* Modal Footer */
.upload-modal__footer {
  padding: 0.875rem 1.25rem;
  background-color: var(--surface-secondary);
  border-top: 1px solid var(--border-secondary);
}

.upload-modal__footer-info {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  line-height: var(--leading-relaxed);
}

.upload-modal__footer-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  margin-top: 0.0625rem;
  color: var(--text-muted);
}

/* Button Styles (reuse from campaign-form) */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.btn svg {
  width: 1rem;
  height: 1rem;
}

.btn--primary {
  background-color: var(--interactive-primary);
  border: 1px solid var(--interactive-primary);
  color: var(--text-inverse);
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--interactive-primary-hover);
  border-color: var(--interactive-primary-hover);
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--secondary {
  background-color: var(--surface-secondary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
}

.btn--secondary:hover {
  background-color: var(--surface-hover);
}

/* Animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>

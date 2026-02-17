import { describe, it, expect } from 'vitest'
import { useImageUpload, formatBytes } from './useImageUpload'

describe('useImageUpload', () => {
  it('exports expected properties', () => {
    const upload = useImageUpload()
    expect(upload).toHaveProperty('state')
    expect(upload).toHaveProperty('hasFile')
    expect(upload).toHaveProperty('hasError')
    expect(upload).toHaveProperty('isReady')
    expect(upload).toHaveProperty('canUpload')
    expect(upload).toHaveProperty('isComplete')
    expect(upload).toHaveProperty('selectFile')
    expect(upload).toHaveProperty('handleFileInput')
    expect(upload).toHaveProperty('upload')
    expect(upload).toHaveProperty('reset')
    expect(upload).toHaveProperty('clearError')
  })

  it('initializes with empty state', () => {
    const { state, hasFile, hasError, isReady, canUpload, isComplete } = useImageUpload()
    expect(state.value.file).toBeNull()
    expect(state.value.preview).toBeNull()
    expect(state.value.error).toBeNull()
    expect(state.value.isUploading).toBe(false)
    expect(state.value.uploadProgress).toBe(0)
    expect(hasFile.value).toBe(false)
    expect(hasError.value).toBe(false)
    expect(isReady.value).toBe(false)
    expect(canUpload.value).toBe(false)
    expect(isComplete.value).toBe(false)
  })

  it('formatBytes formats correctly', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(5242880)).toBe('5 MB')
    expect(formatBytes(1500)).toBe('1.46 KB')
  })

  it('uses default config values', () => {
    const { config } = useImageUpload()
    expect(config.maxFileSize).toBe(5 * 1024 * 1024)
    expect(config.acceptedTypes).toContain('image/jpeg')
    expect(config.acceptedTypes).toContain('image/png')
    expect(config.acceptedTypes).toContain('image/webp')
  })

  it('allows custom config override', () => {
    const { config } = useImageUpload({
      maxFileSize: 10 * 1024 * 1024,
      acceptedTypes: ['image/png'],
    })
    expect(config.maxFileSize).toBe(10 * 1024 * 1024)
    expect(config.acceptedTypes).toEqual(['image/png'])
  })

  it('reset clears state', () => {
    const up = useImageUpload()
    up.state.value.error = 'Some error'
    up.state.value.ipfsUrl = 'ipfs://test'

    up.reset()

    expect(up.state.value.error).toBeNull()
    expect(up.state.value.ipfsUrl).toBeNull()
    expect(up.state.value.file).toBeNull()
  })

  it('clearError only clears error', () => {
    const up = useImageUpload()
    up.state.value.error = 'Some error'
    up.state.value.ipfsUrl = 'ipfs://test'

    up.clearError()

    expect(up.state.value.error).toBeNull()
    expect(up.state.value.ipfsUrl).toBe('ipfs://test')
  })

  it('upload returns error when no file selected', async () => {
    const { upload } = useImageUpload()
    const result = await upload()

    expect(result.success).toBe(false)
    expect(result.error).toBe('No file selected')
  })
})

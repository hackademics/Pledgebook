import { describe, it, expect } from 'vitest'
import { useCampaignForm, generateSlug } from './useCampaignForm'

describe('useCampaignForm', () => {
  it('generates a slug from a name', () => {
    expect(generateSlug('Hello World!')).toBe('hello-world')
  })

  it('validates required fields', () => {
    const { validateAll, form } = useCampaignForm()

    const isValid = validateAll()

    expect(isValid).toBe(false)
    expect(form.name.error).toContain('required')
    expect(form.purpose.error).toContain('required')
  })

  it('computes form progress for required fields', () => {
    const { form, formProgress } = useCampaignForm()

    form.name.value = 'My Campaign'
    form.purpose.value = 'A meaningful purpose for testing'
    form.rulesAndResolution.value = 'Rules and resolution text that is long enough'
    form.prompt.value = 'Prompt text that is long enough to pass validation'
    form.fundraisingGoal.value = '1000000'
    form.endDate.value = '2099-01-01'

    expect(formProgress.value).toBe(100)
  })

  it('normalizes form data for submission', () => {
    const { form, getFormData } = useCampaignForm()

    form.name.value = 'Campaign Name'
    form.slug.value = 'campaign-name'
    form.purpose.value = 'Purpose text long enough'
    form.rulesAndResolution.value = 'Rules and resolution long enough'
    form.prompt.value = 'Prompt text long enough to pass validation'
    form.fundraisingGoal.value = '1000000'
    form.endDate.value = '2099-01-01'
    form.startDate.value = '2098-12-01'

    const data = getFormData()

    expect(data.slug).toBe('campaign-name')
    expect(data.endDate).toBe(new Date('2099-01-01').toISOString())
    expect(data.startDate).toBe(new Date('2098-12-01').toISOString())
  })
})

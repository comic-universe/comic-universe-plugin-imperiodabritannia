import { json, options } from '../../lib/http'
export const OPTIONS = options
export async function GET() {
  return json({ name: 'Imperio da Britannia', tag: 'imperiodabritannia', version: '1.0.0', contentTypes: ['comic', 'manga'], capabilities: ['metadata', 'content'], features: { onDemandPageList: true }, languageCodes: ['pt-br'], sources: [{ id: 'imperiodabritannia', name: 'Imperio da Britannia', languageCodes: ['pt-br'], isDefault: true }] })
}

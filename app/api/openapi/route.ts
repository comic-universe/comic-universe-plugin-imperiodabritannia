import { json } from '../../lib/http'

const endpoints = ['getList', 'search', 'getDetails', 'getChapters', 'getPages', 'downloadChapter']

export async function GET() {
  const paths = Object.fromEntries(endpoints.map((name) => [
    `/api/${name}`,
    { post: { summary: name, responses: { '200': { description: 'Success' } } } }
  ]))
  return json({
    openapi: '3.0.3',
    info: { title: 'Imperio da Britannia Comic Universe Plugin', version: '1.0.0' },
    servers: [{ url: '/' }],
    paths
  })
}

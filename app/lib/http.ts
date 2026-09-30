import { NextResponse } from 'next/server'

export const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
export const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: corsHeaders })
export const options = () => new Response(null, { status: 204, headers: corsHeaders })

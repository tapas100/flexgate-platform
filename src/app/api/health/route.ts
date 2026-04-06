import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'flexgate-platform', ts: new Date().toISOString() });
}

import { GET } from '../app/api/houses/[id]/date-info/route';
import { NextRequest } from 'next/server';

async function run() {
  const req = new NextRequest('http://localhost:3000/api/houses/1093/date-info?date=2025-06-18');
  const res = await GET(req, { params: Promise.resolve({ id: '1093' }) });
  console.log(await res.json());
}
run();

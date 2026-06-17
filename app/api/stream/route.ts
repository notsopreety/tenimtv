import { NextRequest, NextResponse } from 'next/server';
import { fetchStreamUrl } from '../../utils/data-parser';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing channel ID' }, { status: 400 });
  }

  try {
    const data = await fetchStreamUrl(id);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying FootAPI stream:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

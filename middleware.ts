// Auth is handled client-side via AuthGuard component (localStorage-based).
// This middleware only exists for future server-side auth enhancement.
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
	return NextResponse.next();
}

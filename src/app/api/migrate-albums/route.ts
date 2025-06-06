import { NextResponse } from 'next/server';
import { migrateUnknownAlbums } from '../../../lib/db/migration-jobs';

export async function POST() {
  try {
    const result = await migrateUnknownAlbums();
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Migration API failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Migration failed: ${error instanceof Error ? error.message : String(error)}` 
      },
      { status: 500 }
    );
  }
}

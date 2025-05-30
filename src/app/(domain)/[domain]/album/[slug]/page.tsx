import UnifiedPage, { generateUnifiedMetadata } from '@/components/UnifiedContentPage';

export default async function Page({ params }: { params: Promise<{ domain: string; slug: string }> }) {
  return <UnifiedPage params={params} contentType="album" />;
}

export async function generateMetadata({ params }: { params: Promise<{ domain: string; slug: string }> }) {
  return generateUnifiedMetadata({ params, contentType: "album" });
}

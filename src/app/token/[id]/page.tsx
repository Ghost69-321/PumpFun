import { Header } from '@/components/layout/Header';
import { TokenDetail } from '@/components/tokens/TokenDetail';

export default async function TokenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TokenDetail tokenId={id} />
      </div>
    </main>
  );
}

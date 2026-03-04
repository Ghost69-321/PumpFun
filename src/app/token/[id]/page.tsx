import { Header } from '@/components/layout/Header';
import { TokenDetail } from '@/components/tokens/TokenDetail';

export default function TokenPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TokenDetail tokenId={params.id} />
      </div>
    </main>
  );
}

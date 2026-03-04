import { Header } from '@/components/layout/Header';
import { CreateTokenForm } from '@/components/tokens/CreateTokenForm';

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Create a New Token</h1>
        <p className="text-gray-400 mb-8">Launch your memecoin with a fair bonding curve</p>
        <CreateTokenForm />
      </div>
    </main>
  );
}

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { isValidSolanaAddress } from '@/lib/solana';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
  },
  providers: [
    CredentialsProvider({
      id: 'wallet',
      name: 'Wallet',
      credentials: {
        walletAddress: { label: 'Wallet Address', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
        message: { label: 'Message', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.walletAddress) return null;

        const { walletAddress } = credentials;

        if (!isValidSolanaAddress(walletAddress)) return null;

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { walletAddress },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              walletAddress,
              username: `user_${walletAddress.slice(0, 8)}`,
            },
          });
        }

        return {
          id: user.id,
          walletAddress: user.walletAddress ?? undefined,
          name: user.username ?? undefined,
          email: user.email ?? undefined,
          image: user.avatar ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.walletAddress = (user as { walletAddress?: string }).walletAddress;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.walletAddress = token.walletAddress as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      walletAddress?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { WebRTCProvider } from '../context/WebRTCContext';
import { ChatProvider } from '../context/ChatContext';
import Navbar from '../components/Navbar';
import '../styles/globals.css';
import { useAuth } from '../hooks/useAuth';

function Content({ Component, pageProps }) {
  const { loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="text-sm font-medium text-slate-600">Loading application...</p>
        </div>
      </div>
    );
  }
  return <Component {...pageProps} />;
}

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <SocketProvider>
        <WebRTCProvider>
          <ChatProvider>
            <Head>
              <title>SkillSwap - Exchange Skills, Learn Together</title>
              <meta name="description" content="Connect with mentors and learners worldwide through AI-powered matching, real-time chat, and video calls." />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
              <Navbar />
              <main className="mx-auto max-w-7xl px-6 py-10">
                <Content Component={Component} pageProps={pageProps} />
              </main>
            </div>
          </ChatProvider>
        </WebRTCProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

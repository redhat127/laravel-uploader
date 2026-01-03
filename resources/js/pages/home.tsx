import { Toaster } from '@/components/ui/sonner';
import { Uploader } from '@/components/uploader';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function Home() {
  const {
    props: { flashMessage },
  } = usePage<{ flashMessage?: { type: 'error' | 'success'; text: string } }>();
  useEffect(() => {
    if (flashMessage) {
      toast[flashMessage.type](flashMessage.text);
    }
  }, [flashMessage]);
  return (
    <>
      <Head>
        <title>Laravel Uploader</title>
      </Head>
      <main className="flex min-h-screen items-center justify-center p-4 px-8">
        <div className="my-8 w-full">
          <Uploader />
          <Toaster expand closeButton position="top-center" duration={5000} />
        </div>
      </main>
    </>
  );
}

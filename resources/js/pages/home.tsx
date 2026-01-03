import { Toaster } from '@/components/ui/sonner';
import { UploadedFiles } from '@/components/uploaded-files';
import { Uploader } from '@/components/uploader';
import { Upload } from '@/types/upload';
import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function Home({ uploads: { data: uploads } }: { uploads: { data: Upload[] } }) {
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
      <main className="flex min-h-screen items-center justify-center p-4 sm:px-6 lg:px-8">
        <div className="my-4 w-full space-y-4 sm:my-8">
          <Uploader />
          <UploadedFiles uploads={uploads} />
          <Toaster expand closeButton position="top-center" duration={5000} />
        </div>
      </main>
    </>
  );
}

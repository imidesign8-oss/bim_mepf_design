import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smartphone, Monitor, Mail } from 'lucide-react';



interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailHtml: string;
  subject: string;
  templateName: string;
}

export function EmailPreviewModal({
  isOpen,
  onClose,
  emailHtml,
  subject,
  templateName,
}: EmailPreviewModalProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile' | 'gmail' | 'outlook'>('desktop');

  const getViewportWidth = () => {
    switch (viewMode) {
      case 'mobile':
        return '375px';
      case 'gmail':
        return '600px';
      case 'outlook':
        return '600px';
      default:
        return '100%';
    }
  };

  const getViewportHeight = () => {
    switch (viewMode) {
      case 'mobile':
        return '812px';
      default:
        return '100%';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{templateName} - Email Preview</h2>
              <p className="text-sm text-gray-600 mt-1">Subject: {subject}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="desktop" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Desktop</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
            <TabsTrigger value="gmail" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Gmail</span>
            </TabsTrigger>
            <TabsTrigger value="outlook" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Outlook</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto bg-gray-100 p-4 rounded-lg mt-4">
            <div
              className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
              style={{
                width: getViewportWidth(),
                height: getViewportHeight(),
                maxHeight: '600px',
              }}
            >
              <iframe
                srcDoc={emailHtml}
                title="Email Preview"
                className="w-full h-full border-none"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onClose} className="bg-red-600 hover:bg-red-700">
            Ready to Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

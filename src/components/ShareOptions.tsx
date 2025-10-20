import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, FileText } from 'lucide-react';
import { CVData } from '@/lib/types';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface ShareOptionsProps {
  cvData: CVData;
}

export function ShareOptions({ cvData }: ShareOptionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareLink, setShareLink] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      
      // Load the html2pdf library
      const loadScript = (url: string) => new Promise<boolean>((res) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => res(true);
        document.head.appendChild(script);
      });
      
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
      
      // Get the CV preview element
      const element = document.getElementById('cv-preview');
      
      if (!element) {
        throw new Error('CV preview element not found');
      }
      
      // Make sure all sections are visible in the clone
      const elementClone = element.cloneNode(true) as HTMLElement;
      const hiddenSections = elementClone.querySelectorAll('.hidden, [style*="display: none"]');
      hiddenSections.forEach(section => {
        (section as HTMLElement).classList.remove('hidden');
        (section as HTMLElement).style.display = 'block';
      });
      
      // Generate a unique ID for the PDF
      const shareId = Math.random().toString(36).substring(2, 10);
      const filename = `${cvData.basicInfo.name.replace(/\s+/g, '-')}-${shareId}.pdf`;
      
      // Configure PDF options
      const opt = {
        margin: 0.5,
        filename: filename,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      // Generate the PDF as a blob
      const pdfBlob = await window.html2pdf().set(opt).from(elementClone).outputPdf('blob');
      
      // Create a FormData object to send the PDF to the server
      const formData = new FormData();
      formData.append('pdf', new File([pdfBlob], filename, { type: 'application/pdf' }));
      
      // Send the PDF to the server
      const response = await fetch('http://localhost:5000/api/share-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload PDF to server');
      }
      
      const data = await response.json();
      setShareLink(data.pdfUrl);
      
      setIsGenerating(false);
      toast.success('PDF link generated successfully');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF for sharing');
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        toast.error('Failed to copy link');
      });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Public Sharing
        </h3>
        <p className="text-xs text-muted-foreground">
          Generate a shareable PDF link for your CV
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full flex items-center gap-2 justify-center transition-all hover:bg-slate-100"
          onClick={generatePDF}
          disabled={isGenerating}
        >
          <FileText className="h-4 w-4" />
          <span>{isGenerating ? 'Generating PDF...' : 'Generate shareable PDF'}</span>
        </Button>

        {shareLink && (
          <div className="flex gap-2">
            <Input 
              value={shareLink} 
              readOnly 
              className="text-xs"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={copyToClipboard}
              className="flex-shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
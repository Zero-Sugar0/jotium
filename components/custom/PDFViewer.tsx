import { FileDown, FileText, BarChart2, Type, Hash, Image as ImageIcon } from 'lucide-react';

interface PDFViewerProps {
  pdfData: string;
  title: string;
  stats: {
    totalBlocks: number;
    headings: number;
    paragraphs: number;
    lists: number;
    tables: number;
    images: number;
    pageBreaks: number;
    estimatedPages: number;
    wordCount: number;
    characterCount: number;
  };
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfData, title, stats }) => {
  const pdfUrl = `data:application/pdf;base64,${pdfData}`;

  return (
    <figure className="my-6 w-full">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-lg bg-white dark:bg-zinc-900">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="size-5 text-zinc-500 dark:text-zinc-400" />
              <h3 className="text-base sm:text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                {title || 'Generated PDF'}
              </h3>
            </div>
            
            <a
              href={pdfUrl}
              download={`${title || 'document'}.pdf`}
              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <FileDown className="size-4" />
              <span>Download</span>
            </a>
          </div>
        </div>

        {/* PDF Iframe Preview */}
        <div className="bg-zinc-100 dark:bg-zinc-800">
          <iframe
            src={pdfUrl}
            className="w-full h-[600px] border-0"
            title={title || 'PDF Preview'}
          />
        </div>

        {/* Stats Footer */}
        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 gap-x-4 gap-y-2">
            <div className="flex items-center gap-2" title="Estimated Pages">
              <FileText className="size-3.5" />
              <span>{stats.estimatedPages} pages</span>
            </div>
            <div className="flex items-center gap-2" title="Word Count">
              <Type className="size-3.5" />
              <span>{stats.wordCount} words</span>
            </div>
            <div className="flex items-center gap-2" title="Total Blocks">
              <BarChart2 className="size-3.5" />
              <span>{stats.totalBlocks} blocks</span>
            </div>
            <div className="flex items-center gap-2" title="Headings">
              <Hash className="size-3.5" />
              <span>{stats.headings} headings</span>
            </div>
            <div className="flex items-center gap-2" title="Images">
              <ImageIcon className="size-3.5" />
              <span>{stats.images} images</span>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
};

export default PDFViewer;

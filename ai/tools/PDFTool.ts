import { FunctionDeclaration, Type } from "@google/genai";
import PDFDocument from 'pdfkit';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

// Define the path to the font data
const fontDataPath = path.join(process.cwd(), 'public', 'fonts', 'pdfkit-data');

// Define a type for font registration
interface FontRegistration {
  [key: string]: string;
}

// Register fonts
const fonts: FontRegistration = {
    'Helvetica': 'Helvetica.afm',
    'Helvetica-Bold': 'Helvetica-Bold.afm',
    'Helvetica-Oblique': 'Helvetica-Oblique.afm',
    'Helvetica-BoldOblique': 'Helvetica-BoldOblique.afm',
    'Courier': 'Courier.afm',
    'Courier-Bold': 'Courier-Bold.afm',
    'Courier-Oblique': 'Courier-Oblique.afm',
    'Courier-BoldOblique': 'Courier-BoldOblique.afm',
    'Times-Roman': 'Times-Roman.afm',
    'Times-Bold': 'Times-Bold.afm',
    'Times-Italic': 'Times-Italic.afm',
    'Times-BoldItalic': 'Times-BoldItalic.afm',
    'Symbol': 'Symbol.afm',
    'ZapfDingbats': 'ZapfDingbats.afm'
};

export class PDFTool {
  getDefinition(): FunctionDeclaration {
    return {
      name: "pdf_generator",
      description: "Generate, preview, and download PDF documents with custom styling. Supports headers, footers, page numbers, and various content types including text, tables, lists, and images.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Action to perform: 'create' (generate new PDF), 'preview' (show live preview), 'download' (trigger download)"
          },
          title: {
            type: Type.STRING,
            description: "Document title (appears in header and metadata)"
          },
          content: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  description: "Content type: 'heading', 'paragraph', 'list', 'table', 'image', 'pageBreak', 'spacer'"
                },
                text: {
                  type: Type.STRING,
                  description: "Text content for headings and paragraphs"
                },
                level: {
                  type: Type.NUMBER,
                  description: "Heading level (1-6) or list indentation level"
                },
                items: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List items or table row data"
                },
                headers: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Table headers"
                },
                rows: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  description: "Table rows data"
                },
                src: {
                  type: Type.STRING,
                  description: "Image source URL"
                },
                alt: {
                  type: Type.STRING,
                  description: "Image alt text"
                },
                style: {
                  type: Type.OBJECT,
                  description: "Custom styling options (fontSize, color, alignment, etc.)"
                },
                height: {
                  type: Type.NUMBER,
                  description: "Height for spacers or images"
                },
                width: {
                    type: Type.NUMBER,
                    description: "Width for images"
                }
              }
            },
            description: "Array of content blocks to include in the PDF"
          },
          metadata: {
            type: Type.OBJECT,
            properties: {
              author: { type: Type.STRING, description: "Document author" },
              subject: { type: Type.STRING, description: "Document subject" },
              creator: { type: Type.STRING, description: "Document creator" },
              keywords: { type: Type.STRING, description: "Document keywords (comma-separated)" }
            },
            description: "PDF metadata"
          },
          pageSettings: {
            type: Type.OBJECT,
            properties: {
              size: {
                type: Type.STRING,
                description: "Page size: 'A4', 'A3', 'A5', 'Letter', 'Legal' (default: A4)"
              },
              orientation: {
                type: Type.STRING,
                description: "Page orientation: 'portrait' or 'landscape' (default: portrait)"
              },
              margins: {
                type: Type.OBJECT,
                properties: {
                  top: { type: Type.NUMBER },
                  right: { type: Type.NUMBER },
                  bottom: { type: Type.NUMBER },
                  left: { type: Type.NUMBER }
                },
                description: "Page margins in points (default: 40 for all sides)"
              }
            },
            description: "Page layout settings"
          },
          styling: {
            type: Type.OBJECT,
            properties: {
              theme: {
                type: Type.STRING,
                description: "Color theme: 'light', 'dark', 'auto' (default: auto - matches current theme)"
              },
              fontFamily: {
                type: Type.STRING,
                description: "Font family: 'Inter', 'Times', 'Helvetica', 'Courier' (default: Inter)"
              },
              primaryColor: {
                type: Type.STRING,
                description: "Primary color hex code (default: #3b82f6)"
              },
              accentColor: {
                type: Type.STRING,
                description: "Accent color hex code (default: #10b981)"
              }
            },
            description: "Document styling options"
          },
          header: {
            type: Type.OBJECT,
            properties: {
              enabled: { type: Type.BOOLEAN, description: "Show header (default: true)" },
              showTitle: { type: Type.BOOLEAN, description: "Show document title in header" },
              showDate: { type: Type.BOOLEAN, description: "Show current date in header" },
              customText: { type: Type.STRING, description: "Custom header text" }
            },
            description: "Header configuration"
          },
          footer: {
            type: Type.OBJECT,
            properties: {
              enabled: { type: Type.BOOLEAN, description: "Show footer (default: true)" },
              showPageNumbers: { type: Type.BOOLEAN, description: "Show page numbers (default: true)" },
              customText: { type: Type.STRING, description: "Custom footer text" }
            },
            description: "Footer configuration"
          }
        },
        required: ["action", "content"]
      }
    };
  }

  async execute(args: any): Promise<any> {
    try {
      console.log(`📄 PDF Generator - ${args.action}:`, args.title || 'Untitled Document');

      const action = args.action || 'create';

      if (!args.content || !Array.isArray(args.content)) {
        throw new Error("Content array is required");
      }

      const config = this.buildConfig(args);
      const pdfBase64 = await this.generatePdf(config);

      const stats = this.calculateStats(config.content);

      return {
        success: true,
        action: action,
        config: config,
        stats: stats,
        timestamp: new Date().toISOString(),
        previewId: `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        downloadReady: action === 'create' || action === 'download',
        pdfData: pdfBase64
      };

    } catch (error: unknown) {
      console.error("❌ PDF generation failed:", error);
      return {
        success: false,
        error: `PDF generation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action || 'create'
      };
    }
  }

  private buildConfig(args: any): any {
    const processedContent = this.processContent(args.content);
    return {
      title: args.title || 'Untitled Document',
      content: processedContent,
      metadata: {
        author: args.metadata?.author || 'AI Agent',
        subject: args.metadata?.subject || args.title || 'Generated Document',
        creator: args.metadata?.creator || 'PDF Tool',
        keywords: args.metadata?.keywords || '',
        creationDate: new Date(),
        ...args.metadata
      },
      pageSettings: {
        size: args.pageSettings?.size || 'A4',
        orientation: args.pageSettings?.orientation || 'portrait',
        margins: {
          top: 40,
          right: 40,
          bottom: 40,
          left: 40,
          ...args.pageSettings?.margins
        },
        ...args.pageSettings
      },
      styling: {
        theme: args.styling?.theme || 'auto',
        fontFamily: args.styling?.fontFamily || 'Helvetica',
        primaryColor: args.styling?.primaryColor || '#3b82f6',
        accentColor: args.styling?.accentColor || '#10b981',
        ...args.styling
      },
      header: {
        enabled: true,
        showTitle: true,
        showDate: true,
        customText: '',
        ...args.header
      },
      footer: {
        enabled: true,
        showPageNumbers: true,
        customText: '',
        ...args.footer
      }
    };
  }

  private async generatePdf(config: any): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: config.pageSettings.size,
          layout: config.pageSettings.orientation,
          margins: config.pageSettings.margins,
          info: {
            Title: config.title,
            Author: config.metadata.author,
            Subject: config.metadata.subject,
            Keywords: config.metadata.keywords,
            Creator: config.metadata.creator,
            CreationDate: config.metadata.creationDate
          },
          autoFirstPage: false
        });

        // Register standard fonts by reading them into buffers first
        Object.keys(fonts).forEach(fontName => {
            const fontFile = fonts[fontName];
            const fontPath = path.join(fontDataPath, fontFile);
            if (fs.existsSync(fontPath)) {
                try {
                    const fontBuffer = fs.readFileSync(fontPath);
                    doc.registerFont(fontName, fontBuffer);
                } catch (e) {
                    console.error(`Failed to read or register font ${fontName} from ${fontPath}`, e);
                }
            } else {
                console.warn(`Font file not found at ${fontPath}, skipping registration for ${fontName}.`);
            }
        });

        const buffers: any[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers).toString('base64');
          resolve(pdfData);
        });
        doc.on('error', reject);

        // Header and Footer on each page
        doc.on('pageAdded', () => {
          if (config.header.enabled) {
            this.drawHeader(doc, config);
          }
          if (config.footer.enabled) {
            this.drawFooter(doc, config);
          }
        });

        doc.addPage();

        // Content
        for (const block of config.content) {
          await this.drawBlock(doc, block, config);
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private drawHeader(doc: PDFKit.PDFDocument, config: any) {
    const { margins } = config.pageSettings;
    doc.fontSize(8).font(config.styling.fontFamily)
       .fillColor(config.styling.primaryColor);

    if (config.header.showTitle) {
      doc.text(config.title, margins.left, margins.top / 2, { align: 'left' });
    }
    if (config.header.showDate) {
      doc.text(new Date().toLocaleDateString(), margins.left, margins.top / 2, { align: 'right' });
    }
    if (config.header.customText) {
        doc.text(config.header.customText, margins.left, margins.top / 2 + 10, { align: 'center' });
    }
    doc.moveTo(margins.left, margins.top - 10)
       .lineTo(doc.page.width - margins.right, margins.top - 10)
       .stroke(config.styling.accentColor);
    doc.y = margins.top; // Reset Y position
  }

  private drawFooter(doc: PDFKit.PDFDocument, config: any) {
    const { margins } = config.pageSettings;
    const range = doc.bufferedPageRange();
    const pageNumber = range.start + range.count -1;

    doc.fontSize(8).font(config.styling.fontFamily)
       .fillColor(config.styling.primaryColor);

    if (config.footer.showPageNumbers) {
      doc.text(`Page ${pageNumber + 1}`, margins.left, doc.page.height - margins.bottom / 2, { align: 'center' });
    }
    if (config.footer.customText) {
        doc.text(config.footer.customText, margins.left, doc.page.height - margins.bottom / 2, { align: 'left' });
    }
  }

  private async drawBlock(doc: PDFKit.PDFDocument, block: any, config: any) {
    const { margins } = config.pageSettings;
    const availableWidth = doc.page.width - margins.left - margins.right;

    const checkPageBreak = (height: number) => {
        if (doc.y + height > doc.page.height - margins.bottom) {
            doc.addPage();
        }
    };

    switch (block.type) {
      case 'heading':
        const fontSize = 20 - (block.level * 2);
        checkPageBreak(fontSize * 1.5);
        doc.fontSize(fontSize).font(config.styling.fontFamily + '-Bold').fillColor(config.styling.primaryColor)
           .text(block.text, { align: block.style?.alignment || 'left' });
        doc.moveDown(0.5);
        break;

      case 'paragraph':
        checkPageBreak(20); // Estimate
        doc.fontSize(12).font(config.styling.fontFamily).fillColor('#000')
           .text(block.text, { align: block.style?.alignment || 'left' });
        doc.moveDown();
        break;

      case 'list':
        doc.fontSize(12).font(config.styling.fontFamily).fillColor('#000');
        for (const item of block.items) {
            checkPageBreak(15);
            doc.list([item], { bulletRadius: 2, textIndent: 10 * (block.level || 1) });
        }
        doc.moveDown();
        break;

      case 'image':
        try {
          const response = await axios.get(block.src, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(response.data, 'binary');
          const imageOptions: any = {};
          if (block.width) imageOptions.width = block.width;
          if (block.height) imageOptions.height = block.height;
          checkPageBreak(block.height || 150);
          doc.image(imageBuffer, imageOptions);
          doc.moveDown();
        } catch (e) {
          console.error(`Could not fetch image from ${block.src}`, e);
          checkPageBreak(15);
          doc.fontSize(10).fillColor('red').text(`[Image not found: ${block.alt}]`);
          doc.moveDown();
        }
        break;

      case 'table':
        this.drawTable(doc, block, config);
        doc.moveDown();
        break;

      case 'spacer':
        checkPageBreak(block.height);
        doc.moveDown(block.height / 12); // moveDown is in lines, approx 12pt
        break;

      case 'pageBreak':
        doc.addPage();
        break;
    }
  }

  private drawTable(doc: PDFKit.PDFDocument, tableData: any, config: any) {
    const { headers, rows } = tableData;
    const { margins } = config.pageSettings;
    const tableTop = doc.y;
    const availableWidth = doc.page.width - margins.left - margins.right;
    const colCount = headers.length;
    const colWidth = availableWidth / colCount;
    const rowHeight = 25;

    const checkTablePageBreak = (height: number) => {
        if (doc.y + height > doc.page.height - margins.bottom) {
            doc.addPage();
            doc.y = margins.top;
            return true;
        }
        return false;
    };

    const drawRow = (rowData: string[], isHeader: boolean) => {
        const y = doc.y;
        rowData.forEach((cell, i) => {
            doc.fontSize(isHeader ? 10 : 9).font(isHeader ? config.styling.fontFamily + '-Bold' : config.styling.fontFamily)
               .fillColor(isHeader ? config.styling.primaryColor : '#000')
               .text(cell, margins.left + i * colWidth + 5, y + 7, { width: colWidth - 10, align: 'left' });
        });
        doc.y += rowHeight;
        doc.moveTo(margins.left, doc.y).lineTo(doc.page.width - margins.right, doc.y).stroke('#ccc');
    };

    // Draw Header
    if (checkTablePageBreak(rowHeight)) {
        // If header breaks, it will be drawn on the new page by the pageAdded event logic,
        // but we need to redraw the table header.
    }
    drawRow(headers, true);

    // Draw Rows
    for (const row of rows) {
        if (checkTablePageBreak(rowHeight)) {
            drawRow(headers, true); // Redraw header on new page
        }
        drawRow(row, false);
    }
  }

  private processContent(content: any[]): any[] {
    return content.map((block, index) => {
      const processedBlock = {
        id: `block_${index}_${Date.now()}`,
        type: block.type || 'paragraph',
        ...block
      };

      // Validate and set defaults based on content type
      switch (processedBlock.type) {
        case 'heading':
          processedBlock.level = Math.min(Math.max(block.level || 1, 1), 6);
          processedBlock.text = block.text || '';
          break;
        
        case 'paragraph':
          processedBlock.text = block.text || '';
          break;
        
        case 'list':
          processedBlock.items = block.items || [];
          processedBlock.level = block.level || 1;
          break;
        
        case 'table':
          processedBlock.headers = block.headers || [];
          processedBlock.rows = block.rows || [];
          break;
        
        case 'image':
          if (!block.src) console.error("Image block is missing 'src'");
          processedBlock.alt = block.alt || 'Image';
          break;
        
        case 'spacer':
          processedBlock.height = block.height || 20;
          break;
        
        case 'pageBreak':
          // No specific defaults needed
          break;
        
        default:
          processedBlock.type = 'paragraph';
          processedBlock.text = block.text || JSON.stringify(block);
      }

      return processedBlock;
    });
  }

  private calculateStats(content: any[]): any {
    const stats = {
      totalBlocks: content.length,
      headings: 0,
      paragraphs: 0,
      lists: 0,
      tables: 0,
      images: 0,
      pageBreaks: 0,
      estimatedPages: 1,
      wordCount: 0,
      characterCount: 0
    };

    let estimatedHeight = 0;
    const pageHeight = 792; // A4 height in points
    const margins = 80; // top + bottom margins
    const usableHeight = pageHeight - margins;

    content.forEach(block => {
      const text = block.text || (block.items ? block.items.join(' ') : '');
      stats.characterCount += text.length;
      stats.wordCount += text.split(/\s+/).filter(Boolean).length;

      switch (block.type) {
        case 'heading':
          stats.headings++;
          estimatedHeight += 30 + (6 - (block.level || 1)) * 5; // Estimate height
          break;
        
        case 'paragraph':
          stats.paragraphs++;
          estimatedHeight += 20 + (text.length / 50) * 12; // Estimate height based on chars
          break;
        
        case 'list':
          stats.lists++;
          estimatedHeight += 20 + (block.items?.length || 0) * 15;
          break;
        
        case 'table':
          stats.tables++;
          estimatedHeight += 30 + (block.rows?.length || 0) * 25;
          break;
        
        case 'image':
          stats.images++;
          estimatedHeight += block.height || 150;
          break;
        
        case 'pageBreak':
          stats.pageBreaks++;
          estimatedHeight = (Math.ceil(estimatedHeight / usableHeight)) * usableHeight; // Snap to next page
          break;
        
        case 'spacer':
          estimatedHeight += block.height || 20;
          break;
      }
    });

    // Calculate estimated pages based on content height
    stats.estimatedPages = Math.max(1, Math.ceil(estimatedHeight / usableHeight) + stats.pageBreaks);

    return stats;
  }
}
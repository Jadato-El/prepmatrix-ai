import mammoth from 'mammoth';

export interface ParsedDocument {
  title: string;
  content: string;
  excerpt: string;
  wordCount: number;
  type: 'pdf' | 'docx' | 'text';
}

export async function parseDocumentFile(
  fileName: string,
  buffer: Buffer
): Promise<ParsedDocument> {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  let content = '';
  let docType: 'pdf' | 'docx' | 'text' = 'text';

  if (extension === 'pdf') {
    docType = 'pdf';
    try {
      // Dynamic import to handle CJS/ESM cleanly
      const pdfParseModule = await import('pdf-parse');
      const { PDFParse } = pdfParseModule as any;
      if (PDFParse) {
        const parser = new PDFParse({ data: buffer });
        await parser.load();
        const textResult = await parser.getText();
        content = typeof textResult === 'string' ? textResult : (textResult.text || JSON.stringify(textResult));
        await parser.destroy();
      } else {
        // Fallback string extraction for PDFs
        content = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      }
    } catch (pdfErr: any) {
      console.warn('Standard PDF parsing encountered an issue, running resilient text extraction:', pdfErr.message);
      content = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    }
  } else if (extension === 'docx') {
    docType = 'docx';
    const result = await mammoth.extractRawText({ buffer });
    content = result.value;
  } else {
    // txt, md, markdown, json, csv
    docType = 'text';
    content = buffer.toString('utf-8');
  }

  // Clean excess whitespace
  cleanContent:
  content = content
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const words = content.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const cleanTitle = fileName.replace(/\.[^/.]+$/, '');
  const excerpt = content.slice(0, 240) + (content.length > 240 ? '...' : '');

  return {
    title: cleanTitle,
    content,
    excerpt,
    wordCount,
    type: docType,
  };
}

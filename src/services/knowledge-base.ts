import fs from 'fs';
import path from 'path';
import { KnowledgeDocument } from '../types';

const KB_DIR = path.join(process.cwd(), 'knowledge-base');

export class KnowledgeBase {
  private documents: KnowledgeDocument[] = [];

  async load(): Promise<void> {
    this.documents = [];

    if (!fs.existsSync(KB_DIR)) {
      fs.mkdirSync(KB_DIR, { recursive: true });
      console.log('Created knowledge-base/ directory. Add your SOPs, guidelines, and docs as .md or .txt files.');
      return;
    }

    const files = fs.readdirSync(KB_DIR).filter(
      (f) => f.endsWith('.md') || f.endsWith('.txt')
    );

    for (const file of files) {
      const content = fs.readFileSync(path.join(KB_DIR, file), 'utf-8');
      const category = this.inferCategory(file);
      this.documents.push({
        name: file,
        content,
        category,
      });
    }

    console.log(`Loaded ${this.documents.length} knowledge base documents`);
  }

  getRelevantContext(customerMessage: string): string {
    if (this.documents.length === 0) {
      return 'No knowledge base documents available.';
    }

    // For now, include all documents. In the future, this can use
    // embeddings or keyword matching to select relevant docs.
    return this.documents
      .map((doc) => `--- ${doc.name} (${doc.category}) ---\n${doc.content}`)
      .join('\n\n');
  }

  getDocumentCount(): number {
    return this.documents.length;
  }

  private inferCategory(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.includes('sop')) return 'SOP';
    if (lower.includes('guideline')) return 'Guideline';
    if (lower.includes('faq')) return 'FAQ';
    if (lower.includes('policy')) return 'Policy';
    if (lower.includes('shipping')) return 'Shipping';
    if (lower.includes('return')) return 'Returns';
    if (lower.includes('refund')) return 'Refunds';
    return 'General';
  }
}

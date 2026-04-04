/**
 * Email Template Builder Service
 * Manages drag-and-drop email templates with block-based design
 */

import { getDb } from '../db';
import { sql } from 'drizzle-orm';

export type BlockType = 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'heading' | 'paragraph';

export interface TemplateBlock {
  id: string;
  type: BlockType;
  content: {
    text?: string;
    imageUrl?: string;
    buttonText?: string;
    buttonUrl?: string;
    buttonColor?: string;
    height?: number;
    alignment?: 'left' | 'center' | 'right';
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    color?: string;
    backgroundColor?: string;
    padding?: number;
  };
  order: number;
}

export interface EmailTemplate {
  id: number;
  name: string;
  description?: string;
  subject: string;
  previewText?: string;
  blocks: TemplateBlock[];
  backgroundColor?: string;
  fontFamily?: string;
  isDefault?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new email template
 */
export async function createTemplate(
  name: string,
  subject: string,
  description?: string
): Promise<{ id: number; name: string } | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db.execute(
      sql`INSERT INTO email_templates (name, description, subject, blocks, backgroundColor, fontFamily, isDefault, createdAt, updatedAt)
          VALUES (${name}, ${description || ''}, ${subject}, ${JSON.stringify([])}, '#ffffff', 'Arial, sans-serif', 0, ${new Date().toISOString()}, ${new Date().toISOString()})`
    );

    const templateId = (result as any).lastID || (result as any).insertId;
    return { id: templateId, name };
  } catch (error) {
    console.error('[TemplateBuilder] Error creating template:', error);
    return null;
  }
}

/**
 * Get all email templates
 */
export async function getAllTemplates(): Promise<EmailTemplate[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const templates = await db.execute(
      sql`SELECT * FROM email_templates ORDER BY createdAt DESC`
    );

    return (templates as any[]).map((tpl: any) => ({
      ...tpl,
      blocks: JSON.parse(tpl.blocks || '[]'),
      createdAt: new Date(tpl.createdAt),
      updatedAt: new Date(tpl.updatedAt),
    }));
  } catch (error) {
    console.error('[TemplateBuilder] Error getting templates:', error);
    return [];
  }
}

/**
 * Get template by ID
 */
export async function getTemplateById(templateId: number): Promise<EmailTemplate | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db.execute(
      sql`SELECT * FROM email_templates WHERE id = ${templateId} LIMIT 1`
    );

    const template = (result as any[])[0];
    if (!template) return null;

    return {
      ...template,
      blocks: JSON.parse(template.blocks || '[]'),
      createdAt: new Date(template.createdAt),
      updatedAt: new Date(template.updatedAt),
    };
  } catch (error) {
    console.error('[TemplateBuilder] Error getting template:', error);
    return null;
  }
}

/**
 * Update template blocks
 */
export async function updateTemplateBlocks(templateId: number, blocks: TemplateBlock[]): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db.execute(
      sql`UPDATE email_templates 
          SET blocks = ${JSON.stringify(blocks)}, updatedAt = ${new Date().toISOString()}
          WHERE id = ${templateId}`
    );

    return true;
  } catch (error) {
    console.error('[TemplateBuilder] Error updating template blocks:', error);
    return false;
  }
}

/**
 * Add block to template
 */
export async function addBlockToTemplate(
  templateId: number,
  block: TemplateBlock
): Promise<boolean> {
  try {
    const template = await getTemplateById(templateId);
    if (!template) return false;

    const blocks = [...template.blocks, block];
    return await updateTemplateBlocks(templateId, blocks);
  } catch (error) {
    console.error('[TemplateBuilder] Error adding block:', error);
    return false;
  }
}

/**
 * Update block in template
 */
export async function updateBlockInTemplate(
  templateId: number,
  blockId: string,
  updatedBlock: Partial<TemplateBlock>
): Promise<boolean> {
  try {
    const template = await getTemplateById(templateId);
    if (!template) return false;

    const blocks = template.blocks.map((b: TemplateBlock) =>
      b.id === blockId ? { ...b, ...updatedBlock } : b
    );

    return await updateTemplateBlocks(templateId, blocks);
  } catch (error) {
    console.error('[TemplateBuilder] Error updating block:', error);
    return false;
  }
}

/**
 * Remove block from template
 */
export async function removeBlockFromTemplate(
  templateId: number,
  blockId: string
): Promise<boolean> {
  try {
    const template = await getTemplateById(templateId);
    if (!template) return false;

    const blocks = template.blocks.filter((b: TemplateBlock) => b.id !== blockId);
    return await updateTemplateBlocks(templateId, blocks);
  } catch (error) {
    console.error('[TemplateBuilder] Error removing block:', error);
    return false;
  }
}

/**
 * Reorder blocks in template
 */
export async function reorderBlocksInTemplate(
  templateId: number,
  blockIds: string[]
): Promise<boolean> {
  try {
    const template = await getTemplateById(templateId);
    if (!template) return false;

    const blockMap = new Map(template.blocks.map((b: TemplateBlock) => [b.id, b]));
    const reorderedBlocks = blockIds
      .map((id) => blockMap.get(id))
      .filter((b) => b !== undefined)
      .map((b: TemplateBlock, index: number) => ({ ...b, order: index }));

    return await updateTemplateBlocks(templateId, reorderedBlocks);
  } catch (error) {
    console.error('[TemplateBuilder] Error reordering blocks:', error);
    return false;
  }
}

/**
 * Update template metadata
 */
export async function updateTemplateMetadata(
  templateId: number,
  updates: {
    name?: string;
    subject?: string;
    description?: string;
    backgroundColor?: string;
    fontFamily?: string;
    isDefault?: boolean;
  }
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      setClauses.push('name = ?');
      values.push(updates.name);
    }
    if (updates.subject !== undefined) {
      setClauses.push('subject = ?');
      values.push(updates.subject);
    }
    if (updates.description !== undefined) {
      setClauses.push('description = ?');
      values.push(updates.description);
    }
    if (updates.backgroundColor !== undefined) {
      setClauses.push('backgroundColor = ?');
      values.push(updates.backgroundColor);
    }
    if (updates.fontFamily !== undefined) {
      setClauses.push('fontFamily = ?');
      values.push(updates.fontFamily);
    }
    if (updates.isDefault !== undefined) {
      setClauses.push('isDefault = ?');
      values.push(updates.isDefault ? 1 : 0);
    }

    setClauses.push('updatedAt = ?');
    values.push(new Date().toISOString());
    values.push(templateId);

    const query = `UPDATE email_templates SET ${setClauses.join(', ')} WHERE id = ?`;
    await db.execute(sql.raw(query));

    return true;
  } catch (error) {
    console.error('[TemplateBuilder] Error updating template metadata:', error);
    return false;
  }
}

/**
 * Delete template
 */
export async function deleteTemplate(templateId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db.execute(
      sql`DELETE FROM email_templates WHERE id = ${templateId}`
    );

    return true;
  } catch (error) {
    console.error('[TemplateBuilder] Error deleting template:', error);
    return false;
  }
}

/**
 * Render template to HTML
 */
export async function renderTemplateToHtml(templateId: number, logoUrl?: string): Promise<string> {
  try {
    const template = await getTemplateById(templateId);
    if (!template) return '';

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: ${template.fontFamily || 'Arial, sans-serif'}; margin: 0; padding: 0; }
    .email-container { max-width: 600px; margin: 0 auto; background-color: ${template.backgroundColor || '#ffffff'}; }
    .block { padding: 16px; }
    .heading { font-size: 24px; font-weight: bold; }
    .paragraph { font-size: 16px; line-height: 1.5; }
    .button { display: inline-block; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-weight: bold; }
    .divider { height: 1px; background-color: #e0e0e0; margin: 16px 0; }
    .spacer { height: 16px; }
    .image { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <div class="email-container">`;

    if (logoUrl) {
      html += `<div class="block"><img src="${logoUrl}" alt="Logo" style="max-width: 200px; height: auto;"></div>`;
    }

    for (const block of template.blocks) {
      html += renderBlockToHtml(block);
    }

    html += `
  </div>
</body>
</html>`;

    return html;
  } catch (error) {
    console.error('[TemplateBuilder] Error rendering template:', error);
    return '';
  }
}

/**
 * Render individual block to HTML
 */
function renderBlockToHtml(block: TemplateBlock): string {
  const alignment = block.content.alignment || 'left';
  const baseStyle = `text-align: ${alignment};`;

  switch (block.type) {
    case 'heading':
      return `<div class="block heading" style="${baseStyle}color: ${block.content.color || '#000000'};">${block.content.text || ''}</div>`;

    case 'paragraph':
      return `<div class="block paragraph" style="${baseStyle}color: ${block.content.color || '#333333'};">${block.content.text || ''}</div>`;

    case 'text':
      return `<div class="block" style="${baseStyle}color: ${block.content.color || '#000000'};">${block.content.text || ''}</div>`;

    case 'image':
      return `<div class="block" style="${baseStyle}"><img src="${block.content.imageUrl || ''}" alt="Image" class="image"></div>`;

    case 'button':
      return `<div class="block" style="${baseStyle}"><a href="${block.content.buttonUrl || '#'}" class="button" style="background-color: ${block.content.buttonColor || '#ED1C24'}; color: white;">${block.content.buttonText || 'Click Here'}</a></div>`;

    case 'divider':
      return `<div class="divider"></div>`;

    case 'spacer':
      return `<div class="spacer" style="height: ${block.content.height || 16}px;"></div>`;

    default:
      return '';
  }
}

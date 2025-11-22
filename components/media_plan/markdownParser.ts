

export const markdownToHtml = (markdown: string): string => {
    let processedMarkdown = markdown
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/---/g, '<hr class="my-6 border-slate-200">');

    const lines = processedMarkdown.split('\n');
    const newLines: string[] = [];
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('# ')) { newLines.push(`<h1 class="text-3xl font-extrabold text-slate-900 mb-4">${line.substring(2)}</h1>`); continue; }
        if (line.startsWith('## ')) { newLines.push(`<h2 class="text-2xl font-bold text-indigo-700 mt-8 mb-4 border-b border-slate-200 pb-2">${line.substring(3)}</h2>`); continue; }
        if (line.startsWith('### ')) { newLines.push(`<h3 class="text-xl font-semibold text-slate-800 mt-6 mb-3">${line.substring(4)}</h3>`); continue; }
        if (line.startsWith('**💡')) { newLines.push(`<p class="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-800 text-sm font-medium">${line}</p>`); continue; }

        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            if (!inTable) {
                inTable = true;
                const headerLine = lines[i];
                const separatorLine = lines[i + 1];

                if (separatorLine && separatorLine.includes('---')) {
                    // Start of a table with a header
                    newLines.push('<div class="overflow-x-auto my-4 rounded-lg border border-slate-200"><table class="w-full text-sm text-left text-slate-600">');
                    newLines.push('<thead class="text-xs text-slate-700 uppercase bg-slate-50"><tr>');
                    headerLine.split('|').slice(1, -1).forEach(h => newLines.push(`<th scope="col" class="px-4 py-3 font-bold">${h.trim()}</th>`));
                    newLines.push('</tr></thead><tbody class="divide-y divide-slate-200">');
                    i++; // Skip separator line
                } else {
                    // Table without a header (or broken markdown), treat as a normal row
                    newLines.push('<div class="overflow-x-auto my-4 rounded-lg border border-slate-200"><table class="w-full text-sm text-left text-slate-600"><tbody class="divide-y divide-slate-200">');
                    newLines.push('<tr class="bg-white hover:bg-slate-50 transition-colors">');
                    line.split('|').slice(1, -1).forEach(c => newLines.push(`<td class="px-4 py-3">${c.trim()}</td>`));
                    newLines.push('</tr>');
                }
            } else {
                // Table body row
                newLines.push('<tr class="bg-white hover:bg-slate-50 transition-colors">');
                line.split('|').slice(1, -1).forEach(c => newLines.push(`<td class="px-4 py-3">${c.trim()}</td>`));
                newLines.push('</tr>');
            }
        } else {
            if (inTable) {
                inTable = false;
                newLines.push('</tbody></table></div>');
            }
            if (line.trim() !== '') {
                newLines.push(`<p class="mb-3 text-slate-600 leading-relaxed">${line}</p>`);
            }
        }
    }

    if (inTable) {
        newLines.push('</tbody></table></div>');
    }

    return newLines.join('');
};
export const markdownToHtml = (markdown: string): string => {
    let processedMarkdown = markdown
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/---/g, '<hr class="my-6 border-gray-600">');

    const lines = processedMarkdown.split('\n');
    const newLines: string[] = [];
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('# ')) { newLines.push(`<h1 class="text-3xl font-extrabold text-white mb-4">${line.substring(2)}</h1>`); continue; }
        if (line.startsWith('## ')) { newLines.push(`<h2 class="text-2xl font-bold text-indigo-300 mt-8 mb-4 border-b border-gray-700 pb-2">${line.substring(3)}</h2>`); continue; }
        if (line.startsWith('### ')) { newLines.push(`<h3 class="text-xl font-semibold text-white mt-6 mb-3">${line.substring(4)}</h3>`); continue; }
        if (line.startsWith('**💡')) { newLines.push(`<p class="mt-4 p-4 bg-indigo-900/30 border border-indigo-700/50 rounded-lg text-indigo-200">${line}</p>`); continue; }

        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            if (!inTable) {
                inTable = true;
                const headerLine = lines[i];
                const separatorLine = lines[i + 1];

                if (separatorLine && separatorLine.includes('---')) {
                    // Start of a table with a header
                    newLines.push('<div class="overflow-x-auto my-4"><table class="w-full text-sm text-left text-gray-300">');
                    newLines.push('<thead class="text-xs text-gray-300 uppercase bg-gray-700/50"><tr>');
                    headerLine.split('|').slice(1, -1).forEach(h => newLines.push(`<th scope="col" class="px-4 py-3">${h.trim()}</th>`));
                    newLines.push('</tr></thead><tbody>');
                    i++; // Skip separator line
                } else {
                    // Table without a header (or broken markdown), treat as a normal row
                    newLines.push('<div class="overflow-x-auto my-4"><table class="w-full text-sm text-left text-gray-300"><tbody>');
                    newLines.push('<tr class="border-b border-gray-700 hover:bg-gray-700/30">');
                    line.split('|').slice(1, -1).forEach(c => newLines.push(`<td class="px-4 py-3">${c.trim()}</td>`));
                    newLines.push('</tr>');
                }
            } else {
                // Table body row
                newLines.push('<tr class="border-b border-gray-700 hover:bg-gray-700/30">');
                line.split('|').slice(1, -1).forEach(c => newLines.push(`<td class="px-4 py-3">${c.trim()}</td>`));
                newLines.push('</tr>');
            }
        } else {
            if (inTable) {
                inTable = false;
                newLines.push('</tbody></table></div>');
            }
            if (line.trim() !== '') {
                newLines.push(`<p class="mb-3 text-gray-300 leading-relaxed">${line}</p>`);
            }
        }
    }

    if (inTable) {
        newLines.push('</tbody></table></div>');
    }

    return newLines.join('');
};

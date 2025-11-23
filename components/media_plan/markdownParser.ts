
export const markdownToHtml = (markdown: string): string => {
    let processedMarkdown = markdown
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
        .replace(/---/g, '<hr class="my-8 border-slate-200">');

    const lines = processedMarkdown.split('\n');
    const newLines: string[] = [];
    let inTable = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('# ')) { 
            newLines.push(`<div class="mb-8"><h1 class="text-3xl font-extrabold text-slate-900 mb-2">${line.substring(2)}</h1><div class="h-1 w-20 bg-indigo-600 rounded-full"></div></div>`); 
            continue; 
        }
        if (line.startsWith('## ')) { 
            newLines.push(`<h2 class="text-xl font-bold text-slate-800 mt-10 mb-4 flex items-center"><span class="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>${line.substring(3)}</h2>`); 
            continue; 
        }
        if (line.startsWith('### ')) { 
            newLines.push(`<h3 class="text-lg font-bold text-slate-700 mt-6 mb-2">${line.substring(4)}</h3>`); 
            continue; 
        }
        if (line.startsWith('**💡')) { 
            newLines.push(`<div class="mt-8 p-5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-sm font-medium shadow-sm flex items-start gap-3"><span class="text-xl">💡</span><p>${line.replace('**💡', '').trim()}</p></div>`); 
            continue; 
        }
        
        // List items
        if (line.trim().startsWith('- ')) {
             newLines.push(`<li class="ml-4 list-disc marker:text-indigo-400 pl-2 mb-1">${line.substring(2)}</li>`);
             continue;
        }

        // Tables
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            if (!inTable) {
                inTable = true;
                const headerLine = lines[i];
                const separatorLine = lines[i + 1];

                if (separatorLine && separatorLine.includes('---')) {
                    newLines.push('<div class="overflow-x-auto my-6 rounded-xl border border-slate-200 shadow-sm"><table class="w-full text-sm text-left text-slate-600">');
                    newLines.push('<thead class="text-xs text-slate-500 uppercase bg-slate-50 font-bold tracking-wider"><tr>');
                    headerLine.split('|').slice(1, -1).forEach(h => newLines.push(`<th scope="col" class="px-6 py-4 whitespace-nowrap">${h.trim()}</th>`));
                    newLines.push('</tr></thead><tbody class="divide-y divide-slate-100 bg-white">');
                    i++; 
                } else {
                    newLines.push('<div class="overflow-x-auto my-6 rounded-xl border border-slate-200 shadow-sm"><table class="w-full text-sm text-left text-slate-600"><tbody class="divide-y divide-slate-100 bg-white">');
                    newLines.push('<tr class="hover:bg-slate-50 transition-colors">');
                    line.split('|').slice(1, -1).forEach(c => newLines.push(`<td class="px-6 py-4">${c.trim()}</td>`));
                    newLines.push('</tr>');
                }
            } else {
                newLines.push('<tr class="hover:bg-slate-50 transition-colors">');
                line.split('|').slice(1, -1).forEach(c => newLines.push(`<td class="px-6 py-4 border-t border-slate-100">${c.trim()}</td>`));
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

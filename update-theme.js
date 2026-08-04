const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const replace = (regex, replacement) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  };

  replace(/text-gray-/g, 'text-slate-');
  replace(/bg-zinc-900/g, 'bg-slate-950/40');
  replace(/border-white\/10/g, 'border-slate-800');
  replace(/bg-white\/5/g, 'bg-slate-900/50');
  replace(/hover:bg-white\/10/g, 'hover:bg-slate-800');
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
});

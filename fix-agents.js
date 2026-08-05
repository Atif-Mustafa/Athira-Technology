const fs = require('fs');
let code = fs.readFileSync('src/data/agents.tsx', 'utf-8');

code = code.replace(/import \{ ReactNode \} from "react";\n/g, 'import { LucideIcon } from "lucide-react";\n');
code = code.replace(/icon: ReactNode;/g, 'icon: LucideIcon;');
code = code.replace(/icon: <([A-Za-z]+) className="w-8 h-8" \/>/g, 'icon: $1');

fs.writeFileSync('src/data/agents.tsx', code);

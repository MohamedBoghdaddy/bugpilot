import json
import re
from pathlib import Path

root = Path('src')
js_files = list(root.rglob('*.js'))
print('files:', len(js_files))
for path in js_files:
    text = path.read_text(encoding='utf-8')
    orig = text

    # destructured require -> named import
    text = re.sub(
        r"^const\s+\{\s*([^}]+?)\s*\}\s*=\s*require\(['\"]([^'\"]+)['\"]\);",
        lambda m: f"import {{ {m.group(1).strip()} }} from \"{m.group(2)}\";",
        text,
        flags=re.M,
    )
    # default require -> default import
    text = re.sub(
        r"^const\s+(\w+)\s*=\s*require\(['\"]([^'\"]+)['\"]\);",
        lambda m: f"import {m.group(1)} from \"{m.group(2)}\";",
        text,
        flags=re.M,
    )

    def repl_local(m):
        p = m.group(1)
        if p.startswith('.') and not re.search(r'\.[a-zA-Z0-9]+$', p):
            p = p + '.js'
        return f'from \"{p}\";'

    text = re.sub(r"from\s+['\"]([^'\"]+)['\"];", repl_local, text)

    # module.exports -> export default or named
    def convert_exports(match):
        expr = match.group(1).strip()
        if re.match(r'^\w+$', expr):
            return f'export default {expr};'
        return f'export {expr};'

    text = re.sub(r"^module\.exports\s*=\s*([\w{}\s,]+);", convert_exports, text, flags=re.M)
    text = re.sub(
        r"^export\s+\{\s*([^}]+?)\s*\};",
        lambda m: 'export { ' + ', '.join([x.strip() for x in m.group(1).split(',') if x.strip()]) + ' };',
        text,
        flags=re.M,
    )

    if path.name == 'index.js':
        if 'import { fileURLToPath } from "url";' not in text:
            text = 'import { fileURLToPath } from "url";\n' + text
        text = text.replace(
            'dotenv.config({ path: path.join(__dirname, "..", ".env") });',
            'const __filename = fileURLToPath(import.meta.url);\nconst __dirname = path.dirname(__filename);\n\ndotenv.config({ path: path.join(__dirname, "..", ".env") });',
        )
        text = text.replace('export default { app, server, io };', 'export { app, server, io };')

    if text != orig:
        path.write_text(text, encoding='utf-8')
        print('updated', path)

pkg = Path('package.json')
text = pkg.read_text(encoding='utf-8')
if '"type"' not in text:
    data = json.loads(text)
    data['type'] = 'module'
    pkg.write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')
    print('package.json updated with type module')

// Tiny bash simulator: a virtual file system plus the commands used in class.
// ponytail: a teaching subset of bash: variables, $(...), pipes, redirects, scripts, for, if.
// No while/case/functions/arithmetic; add them when a class needs them.
const HOME = '/home/student';

const NBP_SAMPLE = '[{"table":"A","no":"202/A/NBP/2026","effectiveDate":"2026-10-16","rates":[{"currency":"bat (Tajlandia)","code":"THB","mid":0.1162},{"currency":"dolar amerykański","code":"USD","mid":3.8827},{"currency":"dolar australijski","code":"AUD","mid":2.7025},{"currency":"dolar Hongkongu","code":"HKD","mid":0.4947},{"currency":"dolar kanadyjski","code":"CAD","mid":2.7417},{"currency":"dolar nowozelandzki","code":"NZD","mid":2.2015},{"currency":"dolar singapurski","code":"SGD","mid":3.0338},{"currency":"euro","code":"EUR","mid":4.3661},{"currency":"forint (Węgry)","code":"HUF","mid":0.01202},{"currency":"frank szwajcarski","code":"CHF","mid":4.7099},{"currency":"funt szterling","code":"GBP","mid":5.1746},{"currency":"hrywna (Ukraina)","code":"UAH","mid":0.0865},{"currency":"jen (Japonia)","code":"JPY","mid":0.024574},{"currency":"korona czeska","code":"CZK","mid":0.1794},{"currency":"korona duńska","code":"DKK","mid":0.5841},{"currency":"korona islandzka","code":"ISK","mid":0.032057},{"currency":"korona norweska","code":"NOK","mid":0.4108},{"currency":"korona szwedzka","code":"SEK","mid":0.3925},{"currency":"lej rumuński","code":"RON","mid":0.8179},{"currency":"lira turecka","code":"TRY","mid":0.0783},{"currency":"nowy izraelski szekel","code":"ILS","mid":1.2557},{"currency":"peso chilijskie","code":"CLP","mid":0.003956},{"currency":"peso filipińskie","code":"PHP","mid":0.0617},{"currency":"peso meksykańskie","code":"MXN","mid":0.2112},{"currency":"rand (Republika Południowej Afryki)","code":"ZAR","mid":0.2363},{"currency":"real (Brazylia)","code":"BRL","mid":0.7615},{"currency":"ringgit (Malezja)","code":"MYR","mid":0.9512},{"currency":"rupia indonezyjska","code":"IDR","mid":0.00021565},{"currency":"rupia indyjska","code":"INR","mid":0.040883},{"currency":"won południowokoreański","code":"KRW","mid":0.002914},{"currency":"yuan renminbi (Chiny)","code":"CNY","mid":0.5806},{"currency":"SDR (MFW)","code":"XDR","mid":5.2745}]}]';

const HELP = {
  echo: 'Usage: echo [-n] [TEXT]...\nPrint TEXT to standard output.\n  -n   do not output the trailing newline',
  pwd: 'Usage: pwd\nPrint the full name of the current working directory.',
  cd: 'Usage: cd [DIR]\nChange the current directory to DIR. Without DIR, go to your home folder.\n  ..   the folder above\n  ~    your home folder\n  /    the top of the file system',
  ls: 'Usage: ls [OPTION]... [FILE]...\nList information about the FILEs (the current directory by default).\n  -a   do not ignore entries starting with .\n  -l   use a long listing format',
  mkdir: 'Usage: mkdir [OPTION]... DIRECTORY...\nCreate the DIRECTORY(ies), if they do not already exist.\n  -p   no error if existing, make parent directories as needed',
  rmdir: 'Usage: rmdir DIRECTORY...\nRemove the DIRECTORY(ies), if they are empty.',
  touch: 'Usage: touch FILE...\nUpdate the modification time of each FILE. A FILE that does not exist is created empty.',
  cat: 'Usage: cat [FILE]...\nConcatenate FILE(s) to standard output. With no FILE, read standard input.',
  cp: 'Usage: cp [OPTION]... SOURCE... DEST\nCopy SOURCE to DEST, or multiple SOURCE(s) to DIRECTORY.\n  -r   copy directories recursively',
  mv: 'Usage: mv SOURCE... DEST\nRename SOURCE to DEST, or move SOURCE(s) to DIRECTORY.',
  rm: 'Usage: rm [OPTION]... FILE...\nRemove (unlink) the FILE(s). There is no recycle bin!\n  -f   ignore nonexistent files, never prompt\n  -r   remove directories and their contents recursively',
  head: 'Usage: head [OPTION]... [FILE]\nPrint the first 10 lines of FILE to standard output.\n  -n NUM   print the first NUM lines instead of the first 10\n  -NUM     same as -n NUM',
  tail: 'Usage: tail [OPTION]... [FILE]\nPrint the last 10 lines of FILE to standard output.\n  -n NUM   output the last NUM lines\n  -n +NUM  output starting with line NUM\n  -NUM     same as -n NUM',
  wc: 'Usage: wc [OPTION]... [FILE]...\nPrint newline, word, and byte counts for each FILE.\n  -c   print the byte counts\n  -l   print the newline counts\n  -w   print the word counts',
  grep: 'Usage: grep [OPTION]... PATTERN [FILE]...\nSearch for PATTERN in each FILE.\n  -c   print only a count of matching lines per FILE\n  -i   ignore case distinctions\n  -n   print line number with output lines\n  -v   select non-matching lines',
  sort: 'Usage: sort [OPTION]... [FILE]\nWrite sorted concatenation of FILE(s) to standard output.\n  -k, --key=N              sort via the N-th field\n  -n, --numeric-sort       compare according to string numerical value\n  -r, --reverse            reverse the result of comparisons\n  -t, --field-separator=SEP  use SEP instead of blank-to-nonblank transition\n  -u, --unique             output only the first of an equal run',
  uniq: 'Usage: uniq [OPTION]... [FILE]\nFilter adjacent matching lines (so sort first!).\n  -c   prefix lines by the number of occurrences\n  -d   only print duplicate lines, one for each group',
  cut: 'Usage: cut OPTION... [FILE]\nPrint selected parts of lines from FILE to standard output.\n  -d DELIM   use DELIM instead of TAB for field delimiter\n  -f LIST    select only these fields, e.g. 1 or 1,3 or 2-4',
  history: 'Usage: history\nDisplay the list of commands you have typed.',
  nano: 'Usage: nano FILE\nA simple text editor. Ctrl+O saves, Ctrl+X exits.',
  less: 'Usage: less FILE\nShow a file one screen at a time (here: the whole file). In real less press q to quit.',
  curl: 'Usage: curl [OPTION]... URL\nTransfer data from a URL.\n  -s   silent mode\n  -o FILE  write output to FILE instead of stdout',
  jq: 'Usage: jq [-r] FILTER [FILE]\nCommand-line JSON processor. Reads FILE, or standard input.\nSupported filters: .  .field  .[0]  .[]  .rates[].mid  length  keys  "\\(.code),\\(.mid)"  and | between them\n  -r   output raw strings, not JSON texts',
  clear: 'Usage: clear\nClear the terminal screen.',
  whoami: 'Usage: whoami\nPrint the user name.',
  date: 'Usage: date [+FORMAT]\nDisplay the current time, optionally in FORMAT.\n  %F   full date, like 2026-10-18\n  %Y %m %d   year, month, day\n  %H %M %S   hour, minute, second',
  bash: 'Usage: bash SCRIPT [ARGUMENTS]...\nRun the commands in SCRIPT, one after another.',
  chmod: 'Usage: chmod MODE FILE...\nChange file permissions.\n  +x   make FILE executable, so it can be run as ./FILE\n  -x   take that away',
  test: 'Usage: test EXPRESSION   or   [ EXPRESSION ]\nExit with status 0 (true) or 1 (false). Spaces inside [ ] are required!\n  -f FILE   FILE exists and is a regular file\n  -d DIR    DIR exists and is a directory\n  -s FILE   FILE exists and is not empty\n  -z TEXT   TEXT is empty\n  -n TEXT   TEXT is not empty\n  A = B     the texts are equal (!= not equal)\n  A -eq B   the whole numbers are equal (-ne -lt -le -gt -ge)',
  seq: 'Usage: seq [FIRST [STEP]] LAST\nPrint numbers from FIRST to LAST.',
  export: 'Usage: export NAME=VALUE\nSet a variable (and pass it on to programs started from here).',
  exit: 'Usage: exit [N]\nStop a script with exit status N (0 = success).',
};
HELP['['] = HELP.test;

const lines = s => (s === '' ? [] : s.replace(/\n$/, '').split('\n'));
const unlines = a => (a.length ? a.join('\n') + '\n' : '');
const MON = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
const mdate = t => { const d = new Date(t); return `${MON[d.getMonth()]} ${String(d.getDate()).padStart(2)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const dirNode = (children = {}) => ({ type: 'dir', children, mtime: Date.now() });
const fileNode = (content = '') => ({ type: 'file', content, mtime: Date.now() });
const clone = n => JSON.parse(JSON.stringify(n));
const blue = s => `\x1b[34m${s}\x1b[0m`;

function newFs() {
  return dirNode({
    bin: dirNode(), etc: dirNode({ hostname: fileNode('cloudshell\n') }), tmp: dirNode(), usr: dirNode(),
    home: dirNode({ student: dirNode({ '.bashrc': fileNode('# ~/.bashrc: runs every time a terminal opens\nalias ll="ls -la"\n') }) }),
  });
}

// Lexer. Words are lists of parts: {t, q} with q = 'n' (unquoted), 'd' ("double"), 's' ('single' or \escaped),
// or {cmd, q} for $(...). Variables are expanded later, at run time. Returns {open: true} on an unclosed quote.
function lex(src) {
  const toks = [];
  let cur = null, i = 0;
  const word = () => (cur = cur || { parts: [] });
  const part = (t, q) => { const p = word().parts.at(-1); if (p && p.q === q && p.t !== undefined) p.t += t; else cur.parts.push({ t, q }); };
  const push = () => { if (cur) toks.push(cur); cur = null; };
  const close = j => { // j is at the '(' of $( ; returns the index just past the matching ')', or -1
    let depth = 0, q = null;
    for (; j < src.length; j++) {
      const c = src[j];
      if (q) { if (c === '\\' && q === '"') j++; else if (c === q) q = null; continue; }
      if (c === "'" || c === '"') q = c;
      else if (c === '(') depth++;
      else if (c === ')' && --depth === 0) return j + 1;
    }
    return -1;
  };
  const subst = (j, q) => { const e = close(j + 1); if (e < 0) return -1; word().parts.push({ cmd: src.slice(j + 2, e - 1), q }); return e; };
  while (i < src.length) {
    const c = src[i], c2 = src.slice(i, i + 2);
    if (c === ' ' || c === '\t' || c === '\r') { push(); i++; continue; }
    if (c === '#' && !cur) { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '\n' || c === ';') { push(); toks.push({ op: ';' }); i++; continue; }
    if (c2 === '&&' || c2 === '||' || c2 === '>>') { push(); toks.push({ op: c2 }); i += 2; continue; }
    if (c === '|' || c === '>' || c === '<') { push(); toks.push({ op: c }); i++; continue; }
    if (c === "'") { const j = src.indexOf("'", i + 1); if (j < 0) return { open: true }; part(src.slice(i + 1, j), 's'); i = j + 1; continue; }
    if (c === '"') {
      let j = i + 1;
      part('', 'd');
      while (j < src.length && src[j] !== '"') {
        if (src[j] === '\\' && '"\\$`'.includes(src[j + 1])) { part(src[j + 1], 's'); j += 2; }
        else if (src.startsWith('$(', j)) { j = subst(j, 'd'); if (j < 0) return { open: true }; }
        else part(src[j++], 'd');
      }
      if (j >= src.length) return { open: true };
      i = j + 1; continue;
    }
    if (c === '\\') { if (i + 1 >= src.length) return { open: true }; if (src[i + 1] !== '\n') part(src[i + 1], 's'); i += 2; continue; }
    if (c2 === '$(') { i = subst(i, 'n'); if (i < 0) return { open: true }; continue; }
    if (c === '~' && !cur && /^(\/|\s|$)/.test(src.slice(i + 1, i + 2))) { part(HOME, 's'); i++; continue; }
    part(c, 'n'); i++;
  }
  push();
  return { toks };
}

const plain = w => (w && !w.op && w.parts.length === 1 && w.parts[0].q === 'n' ? w.parts[0].t : null);
const REDIR = ['>', '>>', '<'];

// Parser: list of and-or chains of pipelines of commands (simple, for, if).
// Throws {incomplete: true} when more input is needed (bash shows the > prompt) or {syntax: token}.
function parse(toks) {
  let i = 0;
  const kw = w => plain(toks[i]) === w;
  const fail = () => { throw toks[i] ? { syntax: toks[i].op === ';' ? 'newline' : toks[i].op || plain(toks[i]) || '?' } : { incomplete: true }; };
  const seps = () => { while (toks[i]?.op === ';') i++; };
  const list = stops => {
    const items = [];
    seps();
    while (i < toks.length && !stops.some(kw)) {
      items.push(andOr());
      if (i < toks.length && toks[i].op !== ';') fail();
      seps();
    }
    if (stops.length && i >= toks.length) throw { incomplete: true };
    return items;
  };
  const andOr = () => {
    const node = { first: pipe(), rest: [] };
    while (toks[i]?.op === '&&' || toks[i]?.op === '||') { const op = toks[i++].op; seps(); node.rest.push({ op, pipe: pipe() }); }
    return node;
  };
  const pipe = () => { const cmds = [command()]; while (toks[i]?.op === '|') { i++; seps(); cmds.push(command()); } return cmds; };
  const redirs = node => {
    while (REDIR.includes(toks[i]?.op)) { const op = toks[i++].op; if (!toks[i] || toks[i].op) fail(); node.redirs.push({ op, word: toks[i++] }); }
    return node;
  };
  const forClause = () => {
    i++;
    const name = plain(toks[i]);
    if (!name || !/^[A-Za-z_]\w*$/.test(name)) fail();
    i++;
    let words = null;
    if (kw('in')) { i++; words = []; while (toks[i] && !toks[i].op) words.push(toks[i++]); }
    seps();
    if (!kw('do')) fail();
    i++;
    const body = list(['done']);
    i++;
    return { type: 'for', name, words, body, redirs: [] };
  };
  const ifClause = () => {
    i++;
    const cond = list(['then']);
    i++;
    const then = list(['elif', 'else', 'fi']);
    if (kw('elif')) return { type: 'if', cond, then, els: [{ first: [ifClause()], rest: [] }], redirs: [] };
    let els = null;
    if (kw('else')) { i++; els = list(['fi']); }
    i++;
    return { type: 'if', cond, then, els, redirs: [] };
  };
  const command = () => {
    if (i >= toks.length) throw { incomplete: true };
    if (kw('for')) return redirs(forClause());
    if (kw('if')) return redirs(ifClause());
    if (['then', 'do', 'done', 'fi', 'else', 'elif'].some(kw)) fail();
    const node = { type: 'simple', words: [], redirs: [] };
    while (i < toks.length && (!toks[i].op || REDIR.includes(toks[i].op))) toks[i].op ? redirs(node) : node.words.push(toks[i++]);
    if (!node.words.length && !node.redirs.length) fail();
    return node;
  };
  return list([]);
}

// Parse short flags. `valued` lists flags that take a value (e.g. 'tk' for sort -t, -k2).
function opts(args, valued = '') {
  const f = {}, rest = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (/^-\d+$/.test(a)) { f.n = a.slice(1); continue; }
    if (a.startsWith('--') && a.length > 2) { const [k, v] = a.slice(2).split('='); f[k] = v ?? true; continue; }
    if (a[0] === '-' && a.length > 1) {
      for (let j = 1; j < a.length; j++) {
        if (valued.includes(a[j])) { f[a[j]] = a.slice(j + 1) || args[++i]; break; }
        f[a[j]] = true;
      }
      continue;
    }
    rest.push(a);
  }
  return { f, rest };
}

class Shell {
  constructor(saved) {
    this.fs = saved?.fs || newFs();
    this.cwd = saved?.cwd || HOME;
    this.hist = saved?.hist || [];
    this.env = { HOME, USER: 'student', ...saved?.env };
    this.args = ['bash'];
    this.code = 0;
    this.last = null;
  }
  save() { return { fs: this.fs, cwd: this.cwd, hist: this.hist, env: this.env }; }

  abs(p) {
    if (p === '~' || p.startsWith('~/')) p = HOME + p.slice(1);
    if (!p.startsWith('/')) p = this.cwd + '/' + p;
    const out = [];
    for (const s of p.split('/')) { if (!s || s === '.') continue; if (s === '..') out.pop(); else out.push(s); }
    return '/' + out.join('/');
  }
  node(p) {
    let n = this.fs;
    for (const s of this.abs(p).split('/').filter(Boolean)) { if (n.type !== 'dir' || !n.children[s]) return null; n = n.children[s]; }
    return n;
  }
  parent(p) { const a = this.abs(p); const k = a.lastIndexOf('/'); return { dir: this.node(a.slice(0, k) || '/'), name: a.slice(k + 1) }; }
  // Short display path, like the prompt: ~/course/data
  short(p = this.cwd) { return p === HOME ? '~' : p.startsWith(HOME + '/') ? '~' + p.slice(HOME.length) : p; }
  read(p, cmd) {
    const n = this.node(p);
    if (!n) return { err: `${cmd}: ${p}: No such file or directory\n` };
    if (n.type === 'dir') return { err: `${cmd}: ${p}: Is a directory\n` };
    return { content: n.content };
  }
  write(p, content, append, cmd = 'bash') {
    const { dir, name } = this.parent(p), n = this.node(p);
    if (!dir || dir.type !== 'dir') return `${cmd}: ${p}: No such file or directory\n`;
    if (n?.type === 'dir') return `${cmd}: ${p}: Is a directory\n`;
    if (n) { n.content = append ? n.content + content : content; n.mtime = Date.now(); } else dir.children[name] = fileNode(content);
    return '';
  }
  glob(pat) {
    const k = pat.lastIndexOf('/'), base = pat.slice(k + 1);
    const n = this.node(k < 0 ? '.' : pat.slice(0, k) || '/');
    if (!n || n.type !== 'dir') return [pat];
    const re = new RegExp('^' + base.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
    const m = Object.keys(n.children).filter(x => re.test(x) && (base[0] === '.' || x[0] !== '.')).sort();
    return m.length ? m.map(x => pat.slice(0, k + 1) + x) : [pat];
  }

  // Run one line. Returns {screen: [{text, err}], stdout, clear, nano} or {open: true} if more input is needed.
  async run(line, { record = true } = {}) {
    const lx = lex(line);
    if (lx.open) return { open: true };
    let ast = null, syntax = null;
    try { ast = parse(lx.toks); } catch (e) { if (e.incomplete) return { open: true }; syntax = e.syntax; }
    if (record && line.trim()) this.hist.push(line);
    const prevCwd = this.cwd;
    this.screen = [];
    this.flags = {};
    if (syntax) this.err(`bash: syntax error near unexpected token \`${syntax}'\n`);
    else {
      try { await this.execList(ast, { stdin: '', capture: false }); }
      catch (e) { if (e.exit === undefined) throw e; this.screen.push({ text: 'exit\n' }); }
    }
    const stdout = this.screen.filter(c => !c.err).map(c => c.text).join('').replace(/\x1b\[\d+m/g, '');
    if (record) this.last = { cmd: line.trim(), stdout, prevCwd };
    return { screen: this.screen, stdout, ...this.flags };
  }

  // io = {stdin, capture, buf}: captured output goes to buf.out (pipes, redirects, $(...)), the rest to the screen.
  emit(io, text) { if (text) io.capture ? (io.buf.out += text) : this.screen.push({ text }); }
  err(text) { if (text) this.screen.push({ text, err: true }); }

  async execText(src, io) {
    const lx = lex(src);
    try { if (lx.open) throw { incomplete: true }; return await this.execList(parse(lx.toks), io); }
    catch (e) { if (e.exit !== undefined) throw e; if (!e.incomplete && !e.syntax) throw e; this.err(`bash: syntax error in: ${src}\n`); return 2; }
  }
  async execList(items, io) {
    let code = 0;
    for (const it of items) code = await this.execAndOr(it, io);
    return code;
  }
  async execAndOr(n, io) {
    let code = await this.execPipe(n.first, io);
    for (const { op, pipe } of n.rest) if ((op === '&&') === (code === 0)) code = await this.execPipe(pipe, io);
    return (this.code = code);
  }
  async execPipe(cmds, io) {
    let stdin = io.stdin, code = 0;
    for (let k = 0; k < cmds.length; k++) {
      const last = k === cmds.length - 1;
      const sub = last ? { ...io, stdin } : { stdin, capture: true, buf: { out: '' } };
      code = await this.execCommand(cmds[k], sub);
      if (!last) stdin = sub.buf.out;
    }
    return code;
  }
  async execCommand(node, io) {
    let inner = io, outFile = null;
    for (const r of node.redirs) {
      const [target] = await this.expand(r.word, false);
      if (r.op === '<') {
        const f = this.read(target, 'bash');
        if (f.err) { this.err(f.err); return 1; }
        inner = { ...inner, stdin: f.content };
      } else {
        // Like bash, > empties the file before the command runs (so `sort f > f` loses f).
        if (r.op === '>') { const e = this.write(target, '', false); if (e) { this.err(e); return 1; } }
        outFile = target;
        inner = { ...inner, capture: true, buf: { out: '' } };
      }
    }
    const code = node.type === 'for' ? await this.execFor(node, inner) : node.type === 'if' ? await this.execIf(node, inner) : await this.execSimple(node, inner);
    if (outFile) this.err(this.write(outFile, inner.buf.out, true));
    return code;
  }
  async execFor(n, io) {
    let items = this.args.slice(1), code = 0;
    if (n.words) { items = []; for (const w of n.words) items.push(...(await this.expand(w, true))); }
    for (const it of items) { this.env[n.name] = it; code = await this.execList(n.body, io); }
    return code;
  }
  async execIf(n, io) {
    if ((await this.execList(n.cond, io)) === 0) return this.execList(n.then, io);
    return n.els ? this.execList(n.els, io) : 0;
  }
  async execSimple(node, io) {
    const words = [...node.words];
    while (words.length) { // NAME=value
      const p0 = words[0].parts[0], m = p0.q === 'n' && p0.t?.match(/^([A-Za-z_]\w*)=/);
      if (!m) break;
      const w = words.shift();
      [this.env[m[1]]] = await this.expand({ parts: [{ t: p0.t.slice(m[0].length), q: 'd' }, ...w.parts.slice(1)] }, false);
    }
    const argv = [];
    for (const w of words) argv.push(...(await this.expand(w, true)));
    if (!argv.length) return this.code;
    const [name, ...args] = argv;
    let r;
    if (name.includes('/')) r = await this.runFile(name, args, io);
    else if (args.includes('--help') && HELP[name]) r = { out: HELP[name] + '\n' };
    else if (this.cmds[name]) r = (await this.cmds[name].call(this, args, io.stdin, !io.capture, io)) || {};
    else r = { err: `bash: ${name}: command not found\n`, code: 127 };
    this.err(r.err);
    this.emit(io, r.out);
    if (r.clear) { this.screen.length = 0; this.flags.clear = true; }
    if (r.nano) this.flags.nano = r.nano;
    return r.code ?? (r.err ? 1 : 0);
  }

  async expand(w, split) {
    if (w.parts.length === 1 && w.parts[0].q === 'd' && w.parts[0].t === '$@') return this.args.slice(1);
    let s = '', quoted = false, expanded = false, glob = false;
    for (const p of w.parts) {
      if (p.cmd !== undefined) {
        const io = { stdin: '', capture: true, buf: { out: '' } };
        await this.execText(p.cmd, io);
        s += io.buf.out.replace(/\n+$/, '');
        if (p.q === 'd') quoted = true; else expanded = true;
      } else if (p.q === 's') { s += p.t; quoted = true; }
      else {
        s += p.t.replace(/\$(?:\{(\w+)\}|([A-Za-z_]\w*)|([?#@*0-9]))/g, (_, a, b, c) => { if (p.q === 'n') expanded = true; return this.getVar(a || b || c); });
        if (p.q === 'd') quoted = true; else if (/[*?]/.test(p.t)) glob = true;
      }
    }
    if (!split) return [s];
    const words = expanded && !quoted ? s.split(/\s+/).filter(Boolean) : [s];
    return glob ? words.flatMap(x => this.glob(x)) : words;
  }
  getVar(n) {
    if (n === '?') return String(this.code);
    if (n === '#') return String(this.args.length - 1);
    if (n === '@' || n === '*') return this.args.slice(1).join(' ');
    if (/^\d$/.test(n)) return this.args[n] ?? '';
    if (n === 'PWD') return this.cwd;
    return this.env[n] ?? '';
  }

  async runFile(path, args, io) {
    const n = this.node(path);
    if (!n) return { err: `bash: ${path}: No such file or directory\n`, code: 127 };
    if (n.type === 'dir') return { err: `bash: ${path}: Is a directory\n`, code: 126 };
    if (!n.exec) return { err: `bash: ${path}: Permission denied\n`, code: 126 };
    return this.runScript(path, args, io);
  }
  // A script runs in its own copy of the shell: its cd and variables do not leak back.
  async runScript(path, args, io) {
    const f = this.read(path, 'bash');
    if (f.err) return { err: f.err, code: 127 };
    const lx = lex(f.content);
    let ast;
    try { if (lx.open) throw { incomplete: true }; ast = parse(lx.toks); }
    catch (e) { return { err: e.syntax ? `${path}: syntax error near unexpected token \`${e.syntax}'\n` : `${path}: syntax error: unexpected end of file (a missing quote, done or fi?)\n`, code: 2 }; }
    const saved = { env: { ...this.env }, cwd: this.cwd, args: this.args };
    this.args = [path, ...args];
    try { return { code: await this.execList(ast, io) }; }
    catch (e) { if (e.exit === undefined) throw e; return { code: e.exit }; }
    finally { Object.assign(this, saved); }
  }

  // What lesson checks see after each command.
  ctx() {
    const sh = this;
    return {
      cmd: this.last.cmd.replace(/\s+/g, ' '), out: this.last.stdout, cwd: this.short(), prevCwd: this.short(this.last.prevCwd),
      file: p => { const n = sh.node(p); return n?.type === 'file' ? n.content : null; },
      isDir: p => sh.node(p)?.type === 'dir',
      isExec: p => !!sh.node(p)?.exec,
      var: name => sh.env[name],
      run: async line => { const keep = { cwd: sh.cwd, env: { ...sh.env }, code: sh.code }; const r = await sh.run(line, { record: false }); Object.assign(sh, keep); return r.stdout; },
    };
  }
}

Shell.prototype.cmds = {
  echo(args) { const { f, rest } = opts(args); const s = (f.n ? rest : args).join(' '); return { out: f.n ? s : s + '\n' }; },
  whoami: () => ({ out: 'student\n' }),
  date(args) {
    const d = new Date(), p = x => String(x).padStart(2, '0');
    const F = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    if (args[0]?.startsWith('+')) return { out: args[0].slice(1).replace(/%([YmdHMSF%])/g, (_, k) => ({ Y: d.getFullYear(), m: p(d.getMonth() + 1), d: p(d.getDate()), H: p(d.getHours()), M: p(d.getMinutes()), S: p(d.getSeconds()), F, '%': '%' })[k]) + '\n' };
    return { out: d.toString().replace(/ \(.*\)$/, '') + '\n' };
  },
  true: () => ({ code: 0 }),
  false: () => ({ code: 1 }),
  seq(args) {
    const [a, b, c] = args.map(Number);
    const [first, step, last] = args.length === 1 ? [1, 1, a] : args.length === 2 ? [a, 1, b] : [a, b, c];
    if ([first, step, last].some(Number.isNaN) || !step) return { err: 'seq: invalid argument\n' };
    // ponytail: the only command that can make huge output from nothing; the cap keeps the browser tab responsive.
    if ((last - first) / step > 100000) return { err: 'seq: too many numbers (limit: 100000)\n' };
    const out = [];
    for (let x = first; step > 0 ? x <= last : x >= last; x += step) out.push(x);
    return { out: unlines(out) };
  },
  export(args) { for (const a of args) { const m = a.match(/^([A-Za-z_]\w*)=(.*)$/s); if (m) this.env[m[1]] = m[2]; } },
  bash(args, stdin, tty, io) { return args[0] ? this.runScript(args[0], args.slice(1), io) : { err: 'usage: bash SCRIPT.sh [ARGUMENTS]\n' }; },
  sh(args, stdin, tty, io) { return this.cmds.bash.call(this, args, stdin, tty, io); },
  chmod(args) {
    const [mode, ...files] = args;
    if (!files.length) return { err: 'chmod: missing operand\n' };
    if (!/^[0-7]{3,4}$/.test(mode) && !/^[ugoa]*[-+=][rwx]+$/.test(mode)) return { err: `chmod: invalid mode: '${mode}'\n` };
    let err = '';
    for (const p of files) {
      const n = this.node(p);
      if (!n) err += `chmod: cannot access '${p}': No such file or directory\n`;
      else if (/^\d/.test(mode)) n.exec = (parseInt(mode.at(-3), 8) & 1) === 1;
      else if (mode.includes('x')) n.exec = !mode.includes('-');
    }
    return { err };
  },
  '['(args) { return args.at(-1) === ']' ? this.cmds.test.call(this, args.slice(0, -1)) : { err: "bash: [: missing `]' (spaces matter: [ -f file ])\n", code: 2 }; },
  test(args) {
    const a = [...args], neg = a[0] === '!';
    if (neg) a.shift();
    const num = x => { if (!/^-?\d+$/.test(x)) throw `bash: [: ${x}: integer expression expected\n`; return parseInt(x); };
    let ok;
    try {
      if (a.length === 0) ok = false;
      else if (a.length === 1) ok = a[0] !== '';
      else if (a.length === 2) {
        const [op, x] = a, n = this.node(x);
        ok = { '-f': n?.type === 'file', '-d': n?.type === 'dir', '-e': !!n, '-s': n?.type === 'file' && n.content.length > 0, '-x': !!n?.exec, '-z': x === '', '-n': x !== '' }[op];
        if (ok === undefined) throw `bash: [: ${op}: unary operator expected\n`;
      } else if (a.length === 3) {
        const [x, op, y] = a;
        const ops = { '=': () => x === y, '==': () => x === y, '!=': () => x !== y, '-eq': () => num(x) === num(y), '-ne': () => num(x) !== num(y), '-gt': () => num(x) > num(y), '-lt': () => num(x) < num(y), '-ge': () => num(x) >= num(y), '-le': () => num(x) <= num(y) };
        if (!ops[op]) throw `bash: [: ${op}: binary operator expected\n`;
        ok = ops[op]();
      } else throw 'bash: [: too many arguments (put "quotes" around variables)\n';
    } catch (e) { if (typeof e !== 'string') throw e; return { err: e, code: 2 }; }
    return { code: ok !== neg ? 0 : 1 };
  },
  clear: () => ({ clear: true }),
  pwd() { return { out: this.cwd + '\n' }; },
  history() { return { out: unlines(this.hist.map((h, i) => `${String(i + 1).padStart(5)}  ${h}`)) }; },
  exit(args) { throw { exit: args[0] !== undefined ? parseInt(args[0]) || 0 : this.code }; },
  man: args => ({ err: `man: no manual pages here. Try: ${args[0] || 'ls'} --help\n` }),
  help() { return { out: 'Commands:\n  ' + Object.keys(this.cmds).filter(c => /^\w/.test(c)).sort().join(' ') + '\nOptions of a command: COMMAND --help\n' }; },

  cd(args) {
    if (args.length > 1) return { err: 'bash: cd: too many arguments\n' };
    const p = args[0] ?? HOME, n = this.node(p);
    if (!n) return { err: `bash: cd: ${p}: No such file or directory\n` };
    if (n.type !== 'dir') return { err: `bash: cd: ${p}: Not a directory\n` };
    this.cwd = this.abs(p);
  },
  ls(args, _, tty) {
    const { f, rest } = opts(args);
    const targets = rest.length ? rest : ['.'];
    let out = '', err = '';
    const row = (name, n) => {
      const shown = !tty ? name : n.type === 'dir' ? blue(name) : n.exec ? `\x1b[32m${name}\x1b[0m` : name;
      if (!f.l) return shown;
      const size = n.type === 'dir' ? 4096 : new TextEncoder().encode(n.content).length;
      return `${n.type === 'dir' ? 'drwxr-xr-x' : n.exec ? '-rwxr-xr-x' : '-rw-r--r--'} 1 student student ${String(size).padStart(5)} ${mdate(n.mtime)} ${shown}`;
    };
    const show = items => (f.l || !tty ? unlines(items) : items.length ? items.join('  ') + '\n' : '');
    const dirs = [];
    const files = [];
    for (const t of targets) {
      const n = this.node(t);
      if (!n) err += `ls: cannot access '${t}': No such file or directory\n`;
      else (n.type === 'dir' ? dirs : files).push([t, n]);
    }
    out += show(files.map(([t, n]) => row(t, n)));
    for (const [t, n] of dirs) {
      let names = Object.keys(n.children).filter(x => f.a || x[0] !== '.').sort((a, b) => a.replace(/^\./, '').localeCompare(b.replace(/^\./, '')));
      const items = names.map(x => row(x, n.children[x]));
      if (f.a) items.unshift(row('.', n), row('..', n));
      if (targets.length > 1) out += (out ? '\n' : '') + t + ':\n';
      if (f.l) out += `total ${names.length * 4}\n`;
      out += show(items);
    }
    return { out, err };
  },
  mkdir(args) {
    const { f, rest } = opts(args);
    if (!rest.length) return { err: 'mkdir: missing operand\n' };
    let err = '';
    for (const p of rest) {
      if (this.node(p)) { if (!f.p) err += `mkdir: cannot create directory '${p}': File exists\n`; continue; }
      if (f.p) {
        let n = this.fs;
        for (const s of this.abs(p).split('/').filter(Boolean)) {
          if (!n.children[s]) n.children[s] = dirNode();
          n = n.children[s];
          if (n.type !== 'dir') { err += `mkdir: cannot create directory '${p}': Not a directory\n`; break; }
        }
        continue;
      }
      const { dir, name } = this.parent(p);
      if (!dir || dir.type !== 'dir') err += `mkdir: cannot create directory '${p}': No such file or directory\n`;
      else dir.children[name] = dirNode();
    }
    return { err };
  },
  rmdir(args) {
    let err = '';
    for (const p of args) {
      const n = this.node(p), { dir, name } = this.parent(p);
      if (!n) err += `rmdir: failed to remove '${p}': No such file or directory\n`;
      else if (n.type !== 'dir') err += `rmdir: failed to remove '${p}': Not a directory\n`;
      else if (Object.keys(n.children).length) err += `rmdir: failed to remove '${p}': Directory not empty\n`;
      else delete dir.children[name];
    }
    return { err };
  },
  touch(args) {
    if (!args.length) return { err: 'touch: missing file operand\n' };
    let err = '';
    for (const p of args) {
      const n = this.node(p);
      if (n) n.mtime = Date.now(); else err += this.write(p, '', false, 'touch').replace(/^touch: (.*): No/, "touch: cannot touch '$1': No");
    }
    return { err };
  },
  cat(args, stdin) {
    if (!args.length) return { out: stdin };
    let out = '', err = '';
    for (const p of args) { const r = this.read(p, 'cat'); out += r.content ?? ''; err += r.err || ''; }
    return { out, err };
  },
  less(args, stdin) { return this.cmds.cat.call(this, args, stdin); },
  more(args, stdin) { return this.cmds.cat.call(this, args, stdin); },
  nano(args) {
    if (!args[0]) return { err: 'usage: nano FILE\n' };
    const n = this.node(args[0]), { dir } = this.parent(args[0]);
    if (n?.type === 'dir') return { err: `nano: ${args[0]}: Is a directory\n` };
    if (!dir) return { err: `nano: ${args[0]}: No such file or directory\n` };
    return { nano: this.abs(args[0]) };
  },
  cp(args) { return this.copyMove(args, 'cp'); },
  mv(args) { return this.copyMove(args, 'mv'); },
  rm(args) {
    const { f, rest } = opts(args);
    if (!rest.length) return { err: 'rm: missing operand\n' };
    let err = '';
    for (const p of rest) {
      const n = this.node(p), { dir, name } = this.parent(p);
      if (this.abs(p) === '/') err += "rm: it is dangerous to operate recursively on '/'\n";
      else if (!n) { if (!f.f) err += `rm: cannot remove '${p}': No such file or directory\n`; }
      else if (n.type === 'dir' && !f.r && !f.R) err += `rm: cannot remove '${p}': Is a directory\n`;
      else if (this.cwd === this.abs(p) || this.cwd.startsWith(this.abs(p) + '/')) err += `rm: refusing to remove '${p}': you are inside it (cd somewhere else first)\n`;
      else delete dir.children[name];
    }
    return { err };
  },

  head(args, stdin) { return this.headTail(args, stdin, 'head'); },
  tail(args, stdin) { return this.headTail(args, stdin, 'tail'); },
  wc(args, stdin) {
    const { f, rest } = opts(args);
    const all = !f.l && !f.w && !f.c;
    const count = (s, name) => [(f.l || all) && (s.match(/\n/g) || []).length, (f.w || all) && (s.match(/\S+/g) || []).length, (f.c || all) && new TextEncoder().encode(s).length, name].filter(x => x !== false && x !== undefined).join(' ');
    if (!rest.length) return { out: count(stdin) + '\n' };
    let out = '', err = '';
    for (const p of rest) { const r = this.read(p, 'wc'); if (r.err) err += r.err; else out += count(r.content, p) + '\n'; }
    return { out, err };
  },
  grep(args, stdin) {
    const { f, rest } = opts(args, 'e');
    const pat = f.e ?? rest.shift();
    if (pat === undefined) return { err: "Usage: grep [OPTION]... PATTERN [FILE]...\nTry 'grep --help' for more information.\n", code: 2 };
    let re;
    try { re = new RegExp(pat, f.i ? 'i' : ''); } catch { re = new RegExp(pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), f.i ? 'i' : ''); }
    const sources = rest.length ? rest.map(p => [p, this.read(p, 'grep')]) : [[null, { content: stdin }]];
    let out = '', err = '', found = false;
    for (const [p, r] of sources) {
      if (r.err) { err += r.err; continue; }
      const hits = lines(r.content).map((l, i) => [l, i + 1]).filter(([l]) => re.test(l) !== !!f.v);
      found = found || hits.length > 0;
      const prefix = rest.length > 1 ? p + ':' : '';
      out += f.c ? prefix + hits.length + '\n' : unlines(hits.map(([l, i]) => prefix + (f.n ? i + ':' : '') + l));
    }
    return { out, err, code: err ? 2 : found ? 0 : 1 };
  },
  sort(args, stdin) {
    const { f, rest } = opts(args, 'tk');
    const k = parseInt(f.k ?? f.key) || 0, sep = f.t ?? f['field-separator'], num = f.n || f['numeric-sort'];
    let src = stdin;
    if (rest.length) { const r = this.read(rest[0], 'sort'); if (r.err) return r; src = r.content; }
    const key = l => (k ? (sep !== undefined ? l.split(sep) : l.trim().split(/\s+/))[k - 1] ?? '' : l);
    const cmp = (a, b) => (num ? (parseFloat(key(a)) || 0) - (parseFloat(key(b)) || 0) : key(a).localeCompare(key(b), 'en')) || a.localeCompare(b, 'en');
    let out = lines(src).sort(cmp);
    if (f.r || f.reverse) out.reverse();
    if (f.u || f.unique) out = out.filter((l, i) => i === 0 || cmp(l, out[i - 1]) !== 0);
    return { out: unlines(out) };
  },
  uniq(args, stdin) {
    const { f, rest } = opts(args);
    let src = stdin;
    if (rest.length) { const r = this.read(rest[0], 'uniq'); if (r.err) return r; src = r.content; }
    const groups = [];
    for (const l of lines(src)) groups.length && groups.at(-1)[0] === l ? groups.at(-1)[1]++ : groups.push([l, 1]);
    return { out: unlines(groups.filter(g => !f.d || g[1] > 1).map(([l, n]) => (f.c ? String(n).padStart(7) + ' ' : '') + l)) };
  },
  cut(args, stdin) {
    const { f, rest } = opts(args, 'df');
    if (!f.f) return { err: 'cut: you must specify a list of fields (e.g. -f1)\n' };
    const d = f.d ?? '\t';
    if (d.length !== 1) return { err: 'cut: the delimiter must be a single character\n' };
    const want = new Set();
    for (const part of String(f.f).split(',')) {
      const [a, b] = part.split('-');
      const lo = parseInt(a) || 1, hi = part.includes('-') ? parseInt(b) || 99 : lo;
      for (let i = lo; i <= hi; i++) want.add(i);
    }
    let src = stdin;
    if (rest.length) { const r = this.read(rest[0], 'cut'); if (r.err) return r; src = r.content; }
    return { out: unlines(lines(src).map(l => (l.includes(d) ? l.split(d).filter((_, i) => want.has(i + 1)).join(d) : l))) };
  },

  async curl(args) {
    const { f, rest } = opts(args, 'oX');
    const url = rest[0];
    if (!url) return { err: "curl: try 'curl --help' for more information\n", code: 2 };
    let out, err = '';
    try {
      const r = await fetch(url);
      out = await r.text();
    } catch (e) {
      if (!url.includes('api.nbp.pl/api/exchangerates/tables')) return { err: `curl: (7) Failed to connect to ${url}\n`, code: 6 };
      out = NBP_SAMPLE;
      err = '(offline: using saved NBP data from 2026-10-16)\n';
    }
    if (f.o) { err += this.write(f.o, out, false, 'curl'); out = ''; }
    return { out, err };
  },
  jq(args, stdin) {
    const { f, rest } = opts(args);
    if (rest[1]) { const r = this.read(rest[1], 'jq'); if (r.err) return { err: r.err, code: 2 }; stdin = r.content; }
    let data;
    try { data = JSON.parse(stdin); } catch { return { err: 'jq: error: Cannot parse input as JSON (is the input empty?)\n', code: 2 }; }
    try {
      let stream = [data];
      for (const stage of splitTop(rest[0] ?? '.')) stream = stream.flatMap(v => jqStage(stage.trim(), v));
      return { out: unlines(stream.map(v => (typeof v === 'string' && f.r ? v : JSON.stringify(v, null, 2)))) };
    } catch (e) { return { err: `jq: error: ${e.message}\n`, code: 3 }; }
  },
};

Shell.prototype.headTail = function (args, stdin, name) {
  const { f, rest } = opts(args, 'n');
  let src = stdin;
  if (rest.length) { const r = this.read(rest[0], name); if (r.err) return r; src = r.content; }
  const all = lines(src), n = String(f.n ?? 10);
  if (name === 'head') return { out: unlines(all.slice(0, parseInt(n))) };
  return { out: unlines(n.startsWith('+') ? all.slice(parseInt(n) - 1) : all.slice(-parseInt(n) || all.length)) };
};

Shell.prototype.copyMove = function (args, cmd) {
  const { f, rest } = opts(args);
  if (rest.length < 2) return { err: `${cmd}: missing destination file operand\n` };
  const dest = rest.pop(), dn = this.node(dest);
  if (rest.length > 1 && dn?.type !== 'dir') return { err: `${cmd}: target '${dest}' is not a directory\n` };
  let err = '';
  for (const src of rest) {
    const sn = this.node(src);
    if (!sn) { err += `${cmd}: cannot stat '${src}': No such file or directory\n`; continue; }
    if (cmd === 'cp' && sn.type === 'dir' && !f.r && !f.R) { err += `cp: -r not specified; omitting directory '${src}'\n`; continue; }
    const target = dn?.type === 'dir' ? dest + '/' + this.parent(src).name : dest;
    const { dir, name } = this.parent(target);
    if (!dir || dir.type !== 'dir') { err += `${cmd}: cannot create '${target}': No such file or directory\n`; continue; }
    if (this.abs(target) === this.abs(src)) { err += `${cmd}: '${src}' and '${target}' are the same file\n`; continue; }
    if (sn.type === 'dir' && this.abs(target).startsWith(this.abs(src) + '/')) { err += `${cmd}: cannot copy a directory into itself\n`; continue; }
    if (dir.children[name]?.type === 'dir') { err += `${cmd}: cannot overwrite directory '${target}'\n`; continue; }
    dir.children[name] = cmd === 'cp' ? { ...clone(sn), mtime: Date.now() } : sn;
    if (cmd === 'mv') { const p = this.parent(src); delete p.dir.children[p.name]; }
  }
  return { err };
};

function splitTop(s) {
  const parts = [''];
  let q = false;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\') { parts[parts.length - 1] += s[i] + (s[i + 1] ?? ''); i++; continue; }
    if (s[i] === '"') q = !q;
    if (s[i] === '|' && !q) parts.push(''); else parts[parts.length - 1] += s[i];
  }
  return parts;
}
function jqStage(s, v) {
  if (s.startsWith('"') && s.endsWith('"')) return [s.slice(1, -1).replace(/\\\((.*?)\)/g, (_, p) => { const r = jqPath(p.trim(), v)[0]; return typeof r === 'string' ? r : JSON.stringify(r); })];
  if (s === 'keys') return [Array.isArray(v) ? v.map((_, i) => i) : Object.keys(v ?? {}).sort()];
  if (s === 'length') return [Array.isArray(v) || typeof v === 'string' ? v.length : Object.keys(v ?? {}).length];
  return jqPath(s, v);
}
function jqPath(p, v) {
  if (p === '.') return [v];
  const toks = p.match(/\.[A-Za-z_]\w*|\.?\[\d*\]/g) || [];
  if (toks.join('') !== p) throw new Error(`unsupported filter '${p}'`);
  let st = [v];
  for (const t of toks) {
    const b = t.replace(/^\./, '');
    if (b === '[]') st = st.flatMap(x => (Array.isArray(x) ? x : Object.values(x ?? {})));
    else if (b.startsWith('[')) st = st.map(x => x?.[+b.slice(1, -1)] ?? null);
    else st = st.map(x => x?.[b] ?? null);
  }
  return st;
}

if (typeof module !== 'undefined') module.exports = { Shell, HOME };

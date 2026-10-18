// Tiny bash simulator: a virtual file system plus the commands used in class.
// ponytail: a teaching subset, not real bash. No variables, no subshells, no scripts yet.
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
  jq: 'Usage: jq [-r] FILTER\nCommand-line JSON processor (simulator supports paths like .[0].rates[] ,\n.field, length, and string templates like "\\(.code),\\(.mid)").\n  -r   output raw strings, not JSON texts',
  clear: 'Usage: clear\nClear the terminal screen.',
  whoami: 'Usage: whoami\nPrint the user name.',
  date: 'Usage: date\nDisplay the current time.',
};

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

// Split a command line into words and operators. Returns {open: true} on an unclosed quote.
function tokenize(line) {
  const toks = [];
  let cur = null, i = 0;
  const push = () => { if (cur) toks.push(cur); cur = null; };
  while (i < line.length) {
    const c = line[i];
    if (c === ' ' || c === '\t') { push(); i++; continue; }
    if (c === '#' && !cur) break;
    if (c === '|' || c === ';' || c === '<') { push(); toks.push({ op: c }); i++; continue; }
    if (c === '&' && line[i + 1] === '&') { push(); toks.push({ op: '&&' }); i += 2; continue; }
    if (c === '>') { push(); const two = line[i + 1] === '>'; toks.push({ op: two ? '>>' : '>' }); i += two ? 2 : 1; continue; }
    cur = cur || { v: '', quoted: false, glob: false };
    if (c === "'") {
      const j = line.indexOf("'", i + 1);
      if (j < 0) return { open: true };
      cur.v += line.slice(i + 1, j); cur.quoted = true; i = j + 1; continue;
    }
    if (c === '"') {
      let j = i + 1, s = '';
      while (j < line.length && line[j] !== '"') { if (line[j] === '\\' && '"\\$`'.includes(line[j + 1])) j++; s += line[j++]; }
      if (j >= line.length) return { open: true };
      cur.v += s; cur.quoted = true; i = j + 1; continue;
    }
    if (c === '\\') { if (i + 1 >= line.length) return { open: true }; cur.v += line[i + 1]; i += 2; continue; }
    if (c === '~' && cur.v === '' && !cur.quoted && /^(\/|\s|$)/.test(line.slice(i + 1, i + 2))) { cur.v = HOME; i++; continue; }
    if (c === '*' || c === '?') cur.glob = true;
    cur.v += c; i++;
  }
  push();
  return { toks };
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
    this.last = null;
  }
  save() { return { fs: this.fs, cwd: this.cwd, hist: this.hist }; }

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

  // Run one line. Returns {out: text for the screen, stdout, clear, nano, open}.
  async run(line, { record = true } = {}) {
    const t = tokenize(line);
    if (t.open) return { open: true };
    if (record && line.trim()) this.hist.push(line);
    const prevCwd = this.cwd;
    let out = '', stdout = '', code = 0, extra = {};
    let group = [], skip = false;
    const flush = async () => {
      if (group.length && !skip) {
        const r = await this.pipeline(group);
        out += r.out; stdout = r.stdout; code = r.code; Object.assign(extra, r.extra);
      }
      group = [];
    };
    for (const tok of t.toks) {
      if (tok.op === ';') { await flush(); skip = false; }
      else if (tok.op === '&&') { await flush(); skip = skip || code !== 0; }
      else group.push(tok);
    }
    await flush();
    if (record) this.last = { cmd: line.trim(), stdout: stdout.replace(/\x1b\[\d+m/g, ''), prevCwd };
    return { out, stdout, ...extra };
  }

  async pipeline(toks) {
    const segs = [[]];
    for (const t of toks) t.op === '|' ? segs.push([]) : segs.at(-1).push(t);
    let stdin = '', err = '', code = 0, extra = {};
    for (let s = 0; s < segs.length; s++) {
      const words = [];
      let redir = null, input = null;
      const seg = segs[s];
      for (let i = 0; i < seg.length; i++) {
        const t = seg[i];
        if (t.op) {
          const target = seg[i + 1];
          if (!target || target.op) return { out: err + "bash: syntax error near unexpected token `newline'\n", stdout: '', code: 2, extra };
          if (t.op === '<') input = target.v; else redir = { file: target.v, append: t.op === '>>' };
          i++;
        } else words.push(...(t.glob ? this.glob(t.v) : [t.v]));
      }
      if (!words.length) { if (segs.length > 1) return { out: err + "bash: syntax error near unexpected token `|'\n", stdout: '', code: 2, extra }; continue; }
      if (input !== null) { const r = this.read(input, 'bash'); if (r.err) { err += r.err; stdin = ''; code = 1; continue; } stdin = r.content; }
      const tty = s === segs.length - 1 && !redir;
      const [name, ...args] = words;
      let r;
      if (args.includes('--help') && HELP[name]) r = { out: HELP[name] + '\n' };
      else if (this.cmds[name]) r = (await this.cmds[name].call(this, args, stdin, tty)) || {};
      else r = { err: `bash: ${name}: command not found\n`, code: 127 };
      err += r.err || '';
      code = r.code ?? (r.err ? 1 : 0);
      if (r.clear) extra.clear = true;
      if (r.nano) extra.nano = r.nano;
      stdin = r.out || '';
      if (redir) { err += this.write(redir.file, stdin, redir.append); stdin = ''; }
    }
    return { out: err + stdin, stdout: stdin, code, extra };
  }
}

Shell.prototype.cmds = {
  echo(args) { const { f, rest } = opts(args); const s = (f.n ? rest : args).join(' '); return { out: f.n ? s : s + '\n' }; },
  whoami: () => ({ out: 'student\n' }),
  date: () => ({ out: new Date().toString().replace(/ \(.*\)$/, '') + '\n' }),
  clear: () => ({ clear: true }),
  pwd() { return { out: this.cwd + '\n' }; },
  history() { return { out: unlines(this.hist.map((h, i) => `${String(i + 1).padStart(5)}  ${h}`)) }; },
  exit: () => ({ out: 'This is a practice terminal, there is nowhere to exit to. Just close the tab when you are done.\n' }),
  man: args => ({ err: `man: no manual pages here. Try: ${args[0] || 'ls'} --help\n` }),
  help() { return { out: 'Commands in this simulator:\n  ' + Object.keys(this.cmds).sort().join(' ') + '\nAdd --help to any command to see its options, e.g. sort --help\n' }; },

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
      const shown = tty && n.type === 'dir' ? blue(name) : name;
      if (!f.l) return shown;
      const size = n.type === 'dir' ? 4096 : new TextEncoder().encode(n.content).length;
      return `${n.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--'} 1 student student ${String(size).padStart(5)} ${mdate(n.mtime)} ${shown}`;
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
    if (!args[0]) return { err: 'nano: this simulator needs a file name: nano FILE\n' };
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
      if (!url.includes('api.nbp.pl')) return { err: `curl: (6) Could not reach ${url} (the browser blocks most sites; api.nbp.pl works)\n`, code: 6 };
      out = NBP_SAMPLE;
      err = '(offline: using saved NBP data from 2026-10-16)\n';
    }
    if (f.o) { err += this.write(f.o, out, false, 'curl'); out = ''; }
    return { out, err };
  },
  jq(args, stdin) {
    const { f, rest } = opts(args);
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
  if (s === 'length') return [Array.isArray(v) || typeof v === 'string' ? v.length : Object.keys(v ?? {}).length];
  return jqPath(s, v);
}
function jqPath(p, v) {
  if (p === '.') return [v];
  const toks = p.match(/\.[A-Za-z_]\w*|\.?\[\d*\]/g) || [];
  if (toks.join('') !== p) throw new Error(`this simulator does not understand '${p}' (try paths like .[0].rates[] or .code)`);
  let st = [v];
  for (const t of toks) {
    const b = t.replace(/^\./, '');
    if (b === '[]') st = st.flatMap(x => (Array.isArray(x) ? x : Object.values(x ?? {})));
    else if (b.startsWith('[')) st = st.map(x => x?.[+b.slice(1, -1)] ?? null);
    else st = st.map(x => x?.[b] ?? null);
  }
  return st;
}

if (typeof module !== 'undefined') module.exports = { Shell, HOME, tokenize };

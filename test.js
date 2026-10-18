// Plays every lesson with model answers and checks each step passes. Run: node test.js
const assert = require('assert');
const { Shell } = require('./shell.js');
const { LESSONS } = require('./lessons.js');

// One list of commands per lesson; each command must complete exactly the next step.
// A step that needs several commands lists them in an array: all but the last are setup.
const SOLUTIONS = {
  start: ['echo "Hello!"', 'whoami', 'date', 'whoami', 'clear', 'echo "I am ready"'],
  move: ['mkdir -p course/data course/notes course/results', 'pwd', 'ls', 'cd course', ['cd data', 'pwd'], 'cd ..', 'cd ~',
    ['cd /', 'ls'], 'cd', 'ls -l', 'cd course/data', 'cd ../results', ['cd', 'pwd'], 'cd ~/course/notes', 'ls -la ~'],
  files: ['cd ~/course/notes', 'touch empty.txt', 'echo "First line" > note.txt', 'cat note.txt', ['echo "Second line" >> note.txt', 'cat note.txt'],
    ['echo "Oops" > note.txt', 'cat note.txt'], 'echo "nano line" >> note.txt', 'cp note.txt copy.txt', 'mv copy.txt ../results/', 'mv empty.txt new_name.txt', 'rm new_name.txt',
    ['echo "Ada" > about_me.txt', 'echo "Data" >> about_me.txt', 'echo "pierogi" >> about_me.txt'], 'cp about_me.txt ../results', 'mv ../results/about_me.txt ../results/card.txt',
    'touch a.txt b.txt c.txt', 'rm a.txt b.txt c.txt'],
  data: [['cd ~/course/data', 'curl -s "https://api.nbp.pl/api/exchangerates/tables/a/?format=json" | jq -r \'.[0].rates[] | "\\(.code),\\(.mid),\\(.currency)"\' > rates.csv'],
    'cat rates.csv', 'head -5 rates.csv', 'wc -l rates.csv', 'grep EUR rates.csv', 'grep dolar rates.csv', 'grep -c frank rates.csv',
    'sort -t, -k2 -n rates.csv | tail -3', 'grep GBP rates.csv', 'grep korona rates.csv | wc -l', 'sort -t, -k2 -n rates.csv | head -3'],
  pipes: ['cd ~/course/data', 'cut -d, -f1 rates.csv', 'cut -d, -f3 rates.csv', 'cut -d, -f1 rates.csv | head -5', 'cut -d, -f3 rates.csv | sort',
    'grep korona rates.csv | wc -l', 'sort -t, -k2 -nr rates.csv | head -3', 'sort -t, -k2 rates.csv | head -5', "cut -d, -f3 rates.csv | cut -d' ' -f1",
    "cut -d, -f3 rates.csv | cut -d' ' -f1 | sort", "cut -d, -f3 rates.csv | cut -d' ' -f1 | sort | uniq -c", 'sort -t, -k2 -nr rates.csv | head -5 > top5.csv',
    'sort --help', 'history', 'cut -d, -f2 rates.csv | sort -n', 'sort -t, -k2 -nr rates.csv | head -1 > most_expensive.txt',
    "cut -d, -f3 rates.csv | cut -d' ' -f1 | sort | uniq | wc -l"],
  hw1: ['mkdir ~/course/homework1', 'cp ~/course/data/rates.csv ~/course/homework1/', ['cd ~/course/homework1', 'grep korona rates.csv > kronas.csv'], 'grep dolar rates.csv > dollars.csv',
    ['grep -c korona rates.csv >> answers.txt', 'grep -c dolar rates.csv >> answers.txt', 'grep EUR rates.csv | cut -d, -f2 >> answers.txt'],
    'sort -t, -k2 -n rates.csv | head -5 > cheapest5.csv', 'ls -l ~/course/homework1', 'cut -d, -f1 rates.csv | sort | uniq'],
};

const sh = new Shell();
const ctx = () => ({
  cmd: sh.last.cmd.replace(/\s+/g, ' '), out: sh.last.stdout, cwd: sh.short(), prevCwd: sh.short(sh.last.prevCwd),
  file: p => { const n = sh.node(p); return n?.type === 'file' ? n.content : null; },
  isDir: p => sh.node(p)?.type === 'dir',
  run: async line => { const cwd = sh.cwd; const r = await sh.run(line, { record: false }); sh.cwd = cwd; return r.stdout; },
});

(async () => {
  for (const L of LESSONS) {
    const sol = SOLUTIONS[L.id];
    assert.strictEqual(sol.length, L.steps.length, `${L.id}: ${sol.length} solutions for ${L.steps.length} steps`);
    for (let i = 0; i < sol.length; i++) {
      const cmds = [].concat(sol[i]);
      for (const c of cmds) await sh.run(c);
      assert.ok(await L.steps[i].check(ctx()), `${L.id} step ${i + 1} failed after: ${cmds.at(-1)}\nstdout: ${sh.last.stdout}`);
    }
    console.log(`ok  ${L.title}`);
  }
  // A few shell behaviours students rely on
  const r = async l => (await sh.run(l)).out;
  assert.strictEqual((await sh.run('echo "unclosed')).open, true);
  assert.strictEqual(await r('Ls'), 'bash: Ls: command not found\n');
  assert.strictEqual(await r('cd nowhere'), 'bash: cd: nowhere: No such file or directory\n');
  assert.strictEqual(await r('echo hi # a comment'), 'hi\n');
  assert.strictEqual(await r('cd ~/course/data && grep -c korona rates.csv'), await r('grep korona rates.csv | wc -l'));
  assert.strictEqual(await r('cd nowhere && pwd'), 'bash: cd: nowhere: No such file or directory\n');
  console.log('all good');
})().catch(e => { console.error(e.message); process.exit(1); });

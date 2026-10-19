// Plays every lesson with model answers and checks each step passes. Run: node test.js
const assert = require('assert');
const { Shell } = require('./shell.js');
const { LESSONS } = require('./lessons.js');

// One list of commands per lesson; each command must complete exactly the next step.
// A step that needs several commands lists them in an array: all but the last are setup.
// {file, text} writes a file directly, standing in for typing it in nano.
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
  vars: [['mkdir -p ~/course/data ~/course/results', 'cd ~/course/data', String.raw`curl -s "https://api.nbp.pl/api/exchangerates/tables/a/?format=json" | jq -r '.[0].rates[] | "\(.code),\(.mid),\(.currency)"' > rates.csv`], 'name="Ada"', 'echo "Hello, $name"', 'name = "Ada"', "echo 'Hello, $name'", ['rows=$(wc -l < rates.csv)', 'echo "We have $rows currencies"'],
    ['euro=$(grep EUR rates.csv | cut -d, -f2)', 'echo "1 EUR = $euro PLN"'], 'date +%F', ['cp rates.csv rates_$(date +%F).csv', 'ls'],
    ['usd=$(grep USD rates.csv | cut -d, -f2)', 'echo "1 USD = $usd PLN"'], 'grep XYZ rates.csv', 'echo $?'],
  script: [['mkdir ~/course/scripts', 'cd ~/course/scripts'],
    { file: '~/course/scripts/report.sh', text: '#!/bin/bash\n# Short report\ncd ~/course/data\necho "Currencies: $(wc -l < rates.csv)"\necho "Euro:"\ngrep EUR rates.csv\necho "Three most expensive:"\nsort -t, -k2 -nr rates.csv | head -3\n' },
    'bash report.sh', './report.sh', 'ls -l report.sh', ['chmod +x report.sh', 'ls -l report.sh'], './report.sh', 'report.sh', 'pwd', './report.sh > ~/course/results/report.txt',
    [{ file: '~/course/scripts/kronas.sh', text: '#!/bin/bash\ngrep -c korona ~/course/data/rates.csv\ngrep korona ~/course/data/rates.csv\n' }, 'chmod +x kronas.sh', './kronas.sh']],
  loops: [['cd ~/course/data', 'for code in USD EUR GBP; do echo "Currency: $code"; done'], 'for code in USD EUR GBP; do grep "^$code," rates.csv; done',
    'for code in $(cut -d, -f1 rates.csv | head -5); do echo "Code: $code"; done', 'for f in *.csv; do echo "$f has $(wc -l < $f) lines"; done',
    'for code in USD EUR CHF\ndo\n  grep "^$code," rates.csv > $code.csv\ndone'],
  if: [['cd ~/course/data', '[ -f rates.csv ] && echo "file exists"'], 'if [ -f rates.csv ]; then echo "found"; else echo "missing"; fi', 'if [ -f nothere.csv ]; then echo "found"; else echo "missing"; fi',
    ['rows=$(wc -l < rates.csv)', 'if [ $rows -gt 30 ]; then echo "big table"; fi'],
    [{ file: '~/course/scripts/get_rates.sh', text: String.raw`#!/bin/bash
out=$HOME/course/data/rates_$(date +%F).csv
curl -s "https://api.nbp.pl/api/exchangerates/tables/a/?format=json" | jq -r '.[0].rates[] | "\(.code),\(.mid),\(.currency)"' > "$out"
if [ -s "$out" ]; then
  echo "Saved $(wc -l < "$out") rates to $out"
else
  echo "Download failed"
  exit 1
fi
` }, 'cd ~/course/scripts', 'chmod +x get_rates.sh', './get_rates.sh']],
  hw2: [['mkdir ~/course/homework2', 'cd ~/course/homework2'],
    [{ file: '~/course/homework2/summary.sh', text: '#!/bin/bash\nif [ ! -f ~/course/data/rates.csv ]; then\n  echo "No rates.csv"\n  exit 1\nfi\nfor w in dolar korona frank; do\n  echo "$w: $(grep -c $w ~/course/data/rates.csv)"\n  grep $w ~/course/data/rates.csv | sort -t, -k2 -n\ndone\n' }, 'chmod +x summary.sh'],
    './summary.sh', './summary.sh > all.txt', 'ls -l ~/course/homework2'],
  args: [['cd ~/course/scripts', { file: '~/course/scripts/rate.sh', text: '#!/bin/bash\ngrep "$1" ~/course/data/rates.csv\n' }], 'chmod +x rate.sh', './rate.sh USD', ['./rate.sh CHF', './rate.sh korona'], './rate.sh',
    [{ file: '~/course/scripts/rate.sh', text: '#!/bin/bash\nrate=$(grep "^$1," ~/course/data/rates.csv | cut -d, -f2)\necho "1 $1 = $rate PLN"\n' }, './rate.sh EUR'],
    [{ file: '~/course/scripts/top.sh', text: '#!/bin/bash\nsort -t, -k2 -nr ~/course/data/rates.csv | head -n "$1"\n' }, 'chmod 755 top.sh', './top.sh 5'],
    [{ file: '~/course/scripts/rates_for.sh', text: '#!/bin/bash\nfor code in "$@"; do\n  rate=$(grep "^$code," ~/course/data/rates.csv | cut -d, -f2)\n  echo "$code: $rate"\ndone\n' }, 'chmod +x ~/course/scripts/rates_for.sh'],
    '~/course/scripts/rates_for.sh USD EUR GBP CHF',
    [{ file: '~/course/scripts/rate.sh', text: '#!/bin/bash\nif [ -z "$1" ]; then\n  echo "Usage: ./rate.sh CODE"\n  exit 1\nfi\nrate=$(grep "^$1," ~/course/data/rates.csv | cut -d, -f2)\nif [ -z "$rate" ]; then\n  echo "Unknown currency: $1"\n  exit 1\nfi\necho "1 $1 = $rate PLN"\n' }, 'cd ~/course/scripts', './rate.sh'],
    'echo $?', './rate.sh XYZ'],
};

let sh;
async function play(lessons) {
  sh = new Shell();
  for (const L of lessons) {
    const sol = SOLUTIONS[L.id];
    assert.strictEqual(sol.length, L.steps.length, `${L.id}: ${sol.length} solutions for ${L.steps.length} steps`);
    for (let i = 0; i < sol.length; i++) {
      const cmds = [].concat(sol[i]);
      for (const c of cmds) c.file ? sh.write(sh.abs(c.file), c.text) : await sh.run(c);
      assert.ok(await L.steps[i].check(sh.ctx()), `${L.id} step ${i + 1} failed after: ${cmds.at(-1)}\nstdout: ${sh.last.stdout}`);
    }
    console.log(`ok  ${L.title}`);
  }
}

(async () => {
  // Class 2 must work on its own, for students who skip class 1
  await play(LESSONS.filter(L => L.title.startsWith('2.')));
  await play(LESSONS);
  // A few shell behaviours students rely on
  const r = async l => (await sh.run(l)).screen.map(c => c.text).join('');
  assert.strictEqual((await sh.run('echo "unclosed')).open, true);
  assert.strictEqual(await r('Ls'), 'bash: Ls: command not found\n');
  assert.strictEqual(await r('cd nowhere'), 'bash: cd: nowhere: No such file or directory\n');
  assert.strictEqual(await r('echo hi # a comment'), 'hi\n');
  assert.strictEqual(await r('cd ~/course/data && grep -c korona rates.csv'), await r('grep korona rates.csv | wc -l'));
  assert.strictEqual(await r('cd nowhere && pwd'), 'bash: cd: nowhere: No such file or directory\n');
  // Scripting behaviours
  assert.strictEqual((await sh.run('for x in a b; do')).open, true);
  assert.strictEqual(await r('x=5; if [ $x -gt 3 ]; then echo big; elif [ $x -gt 1 ]; then echo mid; else echo small; fi'), 'big\n');
  assert.strictEqual(await r('x=2; if [ $x -gt 3 ]; then echo big; elif [ $x -gt 1 ]; then echo mid; else echo small; fi'), 'mid\n');
  assert.strictEqual(await r('false || echo rescued'), 'rescued\n');
  assert.strictEqual(await r('echo "a  b" | wc -c'), '5\n');
  assert.strictEqual(await r('[-f x]'), 'bash: [-f: command not found\n');
  assert.strictEqual(await r('echo done'), 'done\n');
  assert.strictEqual(await r('fi'), "bash: syntax error near unexpected token `fi'\n");
  assert.strictEqual(await r('seq 3 | sort -r | head -1'), '3\n');
  console.log('all good');
})().catch(e => { console.error(e.message); process.exit(1); });

// Lessons: each step has `do` (HTML shown to the student) and `check(c)`, run after every command.
// c = { cmd, out, cwd, prevCwd, file(path) -> content|null, isDir(path), run(line) -> stdout (silent) }
// Add a new class by appending an object to LESSONS. Code in <code> is clickable (inserts into the prompt).
const D = '~/course/data', R = D + '/rates.csv';
const n = s => (s ?? '').split('\n').filter(Boolean).length;
const is = re => c => re.test(c.cmd);
// why([token, meaning], ..., 'note'): the breakdown behind a step's ? button.
const why = (...rows) => rows.map(r => typeof r === 'string' ? `<p>${r}</p>` : `<div><code>${r[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code> ${r[1]}</div>`).join('');

const LESSONS = [
  {
    id: 'start', title: '1.1 First commands',
    intro: 'The line ending in <b>$</b> is the <b>prompt</b>. Type after it and press <b>Enter</b>. Shortcuts that save hours: <b>↑</b> brings back the previous command, <b>Tab</b> completes names, <b>Ctrl+C</b> cancels.',
    steps: [
      { do: 'Say hello: <code>echo "Hello!"</code>', check: is(/^echo\b/) },
      { do: 'Who am I? <code>whoami</code>', check: is(/^whoami$/) },
      { do: 'What time is it? <code>date</code>', check: is(/^date$/) },
      { do: 'Press <b>↑</b> twice to bring back <code>whoami</code> and run it again.', check: is(/^whoami$/) },
      { do: 'Clean the screen: <code>clear</code>', check: is(/^clear$/) },
      { do: 'Checkpoint: <code>echo "I am ready"</code>', check: c => c.out.trim() === 'I am ready' },
    ],
  },
  {
    id: 'move', title: '1.2 Where am I? Moving around',
    intro: 'A path is an address. <code>..</code> is the folder above, <code>~</code> is home, a path starting with <code>/</code> counts from the very top. Watch the <b>Explorer</b> panel: the folder you are in is highlighted.',
    steps: [
      { do: 'Create some folders to walk around in (you will understand this line in 20 minutes):<br><code>mkdir -p course/data course/notes course/results</code>', why: why(['mkdir', 'make directory: create a folder'], ['-p', 'also create missing parent folders (course), and do not complain if a folder already exists'], ['course/data course/notes ...', 'several folders at once, separated by spaces']), check: c => ['data', 'notes', 'results'].every(d => c.isDir('~/course/' + d)) },
      { do: 'Where am I? <code>pwd</code>', check: is(/^pwd$/) },
      { do: 'What is here? <code>ls</code>', check: is(/^ls$/) },
      { do: 'Go into the course folder: <code>cd course</code>', check: c => c.cwd === '~/course' },
      { do: 'Go deeper: <code>cd data</code>, then check with <code>pwd</code>', check: c => c.cwd === '~/course/data' && c.cmd === 'pwd' },
      { do: 'One level up: <code>cd ..</code>', check: c => c.cwd === '~/course' && /^cd \.\.\/?$/.test(c.cmd) },
      { do: 'Back home: <code>cd ~</code>', check: c => c.cwd === '~' },
      { do: 'The very top of the file system: <code>cd /</code> and look around with <code>ls</code>', check: c => c.cwd === '/' && c.cmd === 'ls' },
      { do: 'Plain <code>cd</code> also takes you home.', check: c => c.cwd === '~' && c.cmd === 'cd' },
      { do: 'Same files, more details: <code>ls -l</code>. Flags change how a command behaves.', why: why(['ls', 'list what is in a folder'], ['-l', 'long format: one file per line with permissions, owner, size and date']), check: is(/^ls -l\b/) },
      { do: '<b>Exercise.</b> From home, go into <b>course/data</b> with <i>one</i> command.', hint: 'Paths can have several parts separated by /', check: c => c.prevCwd === '~' && c.cwd === '~/course/data' },
      { do: '<b>Exercise.</b> From data, go to <b>course/results</b> with one command.', hint: '.. means the folder above', check: c => c.prevCwd === '~/course/data' && c.cwd === '~/course/results' },
      { do: '<b>Exercise.</b> Go back home and confirm with <code>pwd</code>.', check: c => c.cwd === '~' && c.cmd === 'pwd' },
      { do: '<b>Bonus.</b> From anywhere, jump to <b>course/notes</b> with an absolute path (starting with <code>~/</code>).', check: c => c.cwd === '~/course/notes' && /~\/|\/home/.test(c.cmd) },
      { do: '<b>Bonus.</b> Show hidden files in your home folder: <code>ls -la ~</code>. Files starting with a dot are hidden.', why: why(['-l', 'long format'], ['-a', 'all: include hidden files (names starting with a dot)'], ['-la', 'two flags glued together, same as -l -a'], ['~', 'which folder to list: your home']), check: is(/^ls -(la|al|a)\b/) },
    ],
  },
  {
    id: 'files', title: '1.3 Creating and organising files',
    intro: '<b>&gt;</b> writes to a file and <b>overwrites</b> it. <b>&gt;&gt;</b> appends at the end. <b>rm</b> has no recycle bin. Use <code>_</code> instead of spaces in file names.',
    steps: [
      { do: '<code>cd ~/course/notes</code>', check: c => c.cwd === '~/course/notes' },
      { do: 'An empty file: <code>touch empty.txt</code>', check: c => c.file('~/course/notes/empty.txt') !== null },
      { do: 'A file with content: <code>echo "First line" > note.txt</code>', check: c => c.file('~/course/notes/note.txt') === 'First line\n' },
      { do: 'Show it: <code>cat note.txt</code>', check: is(/^cat note\.txt$/) },
      { do: 'Append: <code>echo "Second line" >> note.txt</code>, then <code>cat note.txt</code>', check: c => n(c.file('~/course/notes/note.txt')) === 2 && /^cat/.test(c.cmd) },
      { do: 'Now a single &gt;: <code>echo "Oops" > note.txt</code>, then <code>cat note.txt</code>. Where did the two lines go?', check: c => c.file('~/course/notes/note.txt') === 'Oops\n' && /^cat/.test(c.cmd) },
      { do: 'Edit in the terminal: <code>nano note.txt</code>. Add a line, then <b>Ctrl+X</b>, <b>Y</b>, <b>Enter</b> to save and exit.', check: c => n(c.file('~/course/notes/note.txt')) >= 2 },
      { do: 'Copy: <code>cp note.txt copy.txt</code>', check: c => c.file('~/course/notes/copy.txt') !== null },
      { do: 'Move to another folder: <code>mv copy.txt ../results/</code>', check: c => c.file('~/course/results/copy.txt') !== null && c.file('~/course/notes/copy.txt') === null },
      { do: 'mv also renames: <code>mv empty.txt new_name.txt</code>', check: c => c.file('~/course/notes/new_name.txt') !== null && c.file('~/course/notes/empty.txt') === null },
      { do: 'Delete for good: <code>rm new_name.txt</code>', check: c => c.file('~/course/notes/new_name.txt') === null },
      { do: '<b>Exercise.</b> In course/notes create <b>about_me.txt</b> with three lines: your name, your programme, your favourite food. Use echo with &gt; and &gt;&gt;.', check: c => n(c.file('~/course/notes/about_me.txt')) === 3 },
      { do: '<b>Exercise.</b> Copy it to course/results.', check: c => c.file('~/course/results/about_me.txt') !== null },
      { do: '<b>Exercise.</b> Rename the copy to <b>card.txt</b>. Check the Explorer panel.', check: c => n(c.file('~/course/results/card.txt')) === 3 && c.file('~/course/results/about_me.txt') === null },
      { do: '<b>Bonus.</b> Create three files with one command: <code>touch a.txt b.txt c.txt</code>', check: c => ['a', 'b', 'c'].every(x => c.file(c.cwd + `/${x}.txt`) !== null) },
      { do: '<b>Bonus.</b> Delete all three with one command.', check: c => /^rm /.test(c.cmd) && ['a', 'b', 'c'].every(x => c.file(c.cwd + `/${x}.txt`) === null) },
    ],
  },
  {
    id: 'data', title: '1.4 First real data',
    intro: 'Exchange rates from the Polish National Bank (NBP). Names are in Polish: <i>dolar</i> = dollar, <i>korona</i> = krona/koruna, <i>frank</i> = franc, <i>funt</i> = pound. We will take the download command apart in a few weeks; today we just use it.',
    steps: [
      { do: 'Go to the data folder and download today\'s rates (click each line, then Enter):<br><code>cd ~/course/data</code><br><code>curl -s "https://api.nbp.pl/api/exchangerates/tables/a/?format=json" | jq -r \'.[0].rates[] | "\\(.code),\\(.mid),\\(.currency)"\' > rates.csv</code>', why: why(['curl -s "https://..."', 'download a web address; -s = silent, no progress bar'], ['|', 'pass the downloaded text to the next command'], ['jq -r \'...\'', 'pick fields out of JSON: for every rate print code,mid,currency; -r = plain text without quotes'], ['> rates.csv', 'save the result to a file instead of showing it'], 'Do not worry about the details of jq yet.'), check: c => n(c.file(R)) > 10 },
      { do: 'The whole file: <code>cat rates.csv</code>', check: is(/^cat rates\.csv$/) },
      { do: 'The first 5 rows: <code>head -5 rates.csv</code>', why: why(['head', 'show the beginning of a file'], ['-5', 'how many lines (default is 10)'], 'Its twin <code>tail</code> shows the end.'), check: is(/^head (-5|-n ?5) rates\.csv$/) },
      { do: 'How many rows? <code>wc -l rates.csv</code>', why: why(['wc', 'word count: counts lines, words and characters'], ['-l', 'lines only'], 'One line = one currency, so this counts currencies.'), check: is(/^wc -l rates\.csv$/) },
      { do: 'The euro rate: <code>grep EUR rates.csv</code>', why: why(['grep', 'print only the lines that contain some text'], ['EUR', 'the text to look for (the <i>pattern</i>). Case matters: eur finds nothing'], ['rates.csv', 'the file to search'], 'Every line with EUR <i>anywhere</i> in it is printed, whole.'), check: is(/^grep EUR rates\.csv$/) },
      { do: 'All the dollars: <code>grep dolar rates.csv</code>', why: why(['grep', 'print matching lines'], ['dolar', 'the pattern; it matches inside longer words too, so you get every dollar'], ['rates.csv', 'the file']), check: is(/^grep dolar rates\.csv$/) },
      { do: 'How many francs? <code>grep -c frank rates.csv</code>', why: why(['grep', 'search for lines'], ['-c', 'count: print how many lines match instead of the lines themselves'], ['frank', 'the pattern'], ['rates.csv', 'the file']), check: is(/^grep -c frank rates\.csv$/) },
      { do: 'A preview of pipes, the three most expensive currencies:<br><code>sort -t, -k2 -n rates.csv | tail -3</code>', why: why(['sort', 'put lines in order'], ['-t,', 'columns are separated by commas'], ['-k2', 'sort by column (key) 2, the rate'], ['-n', 'compare as numbers, not as text'], ['|', 'pipe: hand the sorted lines to the next command'], ['tail -3', 'keep the last 3 lines, i.e. the largest rates']), check: async c => c.out === await c.run(`sort -t, -k2 -n ${R} | tail -3`) },
      { do: '<b>Exercise.</b> How much is the British pound (GBP)?', check: c => /^GBP,/.test(c.out) && n(c.out) === 1 },
      { do: '<b>Exercise.</b> How many currencies have the word <i>korona</i> in their name?', check: async c => c.out.trim().split(/\s/)[0] === (await c.run(`grep -c korona ${R}`)).trim() },
      { do: '<b>Exercise.</b> Which three currencies are the cheapest?', hint: 'swap tail for head', check: async c => c.out === await c.run(`sort -t, -k2 -n ${R} | head -3`) },
    ],
  },
  {
    id: 'pipes', title: '1.5 Combining commands: pipes',
    intro: 'The <b>|</b> symbol is a conveyor belt: the output of one command goes straight into the next. Build pipelines step by step: run the first part, look at the output, only then add <b>|</b> and the next command.',
    steps: [
      { do: 'Make sure you are in the data folder: <code>cd ~/course/data</code>', check: c => c.cwd === D },
      { do: 'Codes only (column 1, separator: comma): <code>cut -d, -f1 rates.csv</code>', why: why(['cut', 'cut out columns from each line'], ['-d,', 'delimiter: columns are separated by commas'], ['-f1', 'field 1: keep only the first column'], ['rates.csv', 'the file'], 'A line like <code>USD,3.95,dolar amerykański</code> becomes <code>USD</code>.'), check: async c => c.out === await c.run(`cut -d, -f1 ${R}`) },
      { do: 'Names only: <code>cut -d, -f3 rates.csv</code>', check: async c => c.out === await c.run(`cut -d, -f3 ${R}`) },
      { do: 'Your first pipeline, five codes: <code>cut -d, -f1 rates.csv | head -5</code>', why: why(['cut -d, -f1 rates.csv', 'print the codes'], ['|', 'instead of the screen, the codes go into the next command'], ['head -5', 'keep only the first 5 of what came in'], 'head has no file name here: it reads what the pipe gives it.'), check: async c => c.out === await c.run(`cut -d, -f1 ${R} | head -5`) },
      { do: 'Names in alphabetical order: <code>cut -d, -f3 rates.csv | sort</code>', check: async c => c.out === await c.run(`cut -d, -f3 ${R} | sort`) },
      { do: 'Count the kronas another way than grep -c: <code>grep korona rates.csv | wc -l</code>', why: why(['grep korona rates.csv', 'the krona lines'], ['|', 'pass them on'], ['wc -l', 'count the lines that came in'], 'Same answer as <code>grep -c korona rates.csv</code>, but this works after any command, not only grep.'), check: is(/^grep korona rates\.csv \| wc -l$/) },
      { do: 'The three most expensive (r = reverse): <code>sort -t, -k2 -nr rates.csv | head -3</code>', why: why(['-t, -k2', 'sort by column 2, columns split by commas'], ['-nr', '-n numeric plus -r reverse: largest first'], ['head -3', 'the first 3 = the three largest']), check: async c => c.out === await c.run(`sort -t, -k2 -nr ${R} | head -3`) },
      { do: 'The classic trap: sort <i>without</i> <code>-n</code>, i.e. as text. <code>sort -t, -k2 rates.csv | head -5</code>. Are these really the cheapest?', why: why(['without -n', 'sort compares text character by character, like a dictionary'], 'As text, <code>10.5</code> comes before <code>2.1</code> because the character 1 comes before 2. Numbers need <code>-n</code>.'), check: c => /^sort -t, ?-k ?2 rates\.csv/.test(c.cmd) },
      { do: 'Build it in steps. Question: how many currencies of each kind? First word of each name:<br><code>cut -d, -f3 rates.csv | cut -d\' \' -f1</code>', why: why(['cut -d, -f3 rates.csv', 'the names, e.g. <i>korona czeska</i>'], ['|', 'pass them on'], ["cut -d' ' -f1", 'cut again, now splitting at spaces; keep word 1: <i>korona</i>'], "The space has to be in quotes, otherwise bash would swallow it."), check: async c => c.out === await c.run(`cut -d, -f3 ${R} | cut -d' ' -f1`) },
      { do: 'Press <b>↑</b> and add <code>| sort</code> at the end.', check: async c => c.out === await c.run(`cut -d, -f3 ${R} | cut -d' ' -f1 | sort`) },
      { do: 'Press <b>↑</b> again and add <code>| uniq -c</code>', why: why(['uniq', 'squash repeated neighbouring lines into one'], ['-c', 'count: put how many there were in front'], 'uniq only sees <i>neighbouring</i> repeats, which is why we sort first.'), check: async c => c.out === await c.run(`cut -d, -f3 ${R} | cut -d' ' -f1 | sort | uniq -c`) },
      { do: 'Save a pipeline\'s output to a file: <code>sort -t, -k2 -nr rates.csv | head -5 > top5.csv</code>', why: why(['sort ... | head -5', 'the five most expensive'], ['> top5.csv', 'the last command\'s output goes into a file, not to the screen']), check: c => n(c.file(D + '/top5.csv')) === 5 },
      { do: 'Help yourself: <code>sort --help</code>. Find the option that reverses the order.', check: is(/^sort --help/) },
      { do: 'Everything you typed today: <code>history</code>', check: is(/^history/) },
      { do: '<b>Data detective 1.</b> Print only the rates (column 2), sorted from smallest to largest.', check: async c => c.out === await c.run(`cut -d, -f2 ${R} | sort -n`) },
      { do: '<b>Data detective 2.</b> Save the row of the most expensive currency to <b>most_expensive.txt</b> (in the data folder).', check: async c => c.file(D + '/most_expensive.txt') === await c.run(`sort -t, -k2 -nr ${R} | head -1`) },
      { do: '<b>Data detective 3.</b> How many different kinds of currency are there?', hint: 'the uniq pipeline plus wc -l', check: async c => c.out.trim() === (await c.run(`cut -d, -f3 ${R} | cut -d' ' -f1 | sort | uniq | wc -l`)).trim() },
    ],
  },
  {
    id: 'hw1', title: '1.H Homework 1 (practice run)',
    intro: 'Practise here, then do it for real in Cloud Shell and send a screenshot of <code>ls -l ~/course/homework1</code>.',
    steps: [
      { do: 'In ~/course create a folder called <b>homework1</b>.', check: c => c.isDir('~/course/homework1') },
      { do: 'Copy <b>~/course/data/rates.csv</b> into it.', check: c => c.file('~/course/homework1/rates.csv') !== null },
      { do: 'Using grep and &gt;, save all the kronas to <b>kronas.csv</b> (in homework1).', check: async c => { const k = c.file('~/course/homework1/kronas.csv'); return !!k && k === await c.run(`grep korona ${R}`); } },
      { do: 'And all the dollars to <b>dollars.csv</b>.', check: async c => { const k = c.file('~/course/homework1/dollars.csv'); return !!k && k === await c.run(`grep dolar ${R}`); } },
      { do: 'Create <b>answers.txt</b> and append (&gt;&gt;) three lines: how many kronas, how many dollars, the euro rate.', check: c => n(c.file('~/course/homework1/answers.txt')) === 3 },
      { do: 'Using a pipeline, save the five cheapest currencies to <b>cheapest5.csv</b>.', check: async c => c.file('~/course/homework1/cheapest5.csv') === await c.run(`sort -t, -k2 -n ${R} | head -5`) },
      { do: 'Run <code>ls -l ~/course/homework1</code>', check: c => /^ls -l/.test(c.cmd) && c.out.includes('cheapest5.csv') },
      { do: '<b>Bonus.</b> Print only the currency codes, sorted alphabetically, with no duplicates.', hint: 'cut --help, sort --help', check: async c => c.out === await c.run(`cut -d, -f1 ${R} | sort -u`) },
    ],
  },
];

// ---------- Class 2: scripts ----------
// pre`...` shows a block of code students copy into nano (String.raw keeps backslashes as typed).
const pre = (s, ...v) => '<pre>' + String.raw(s, ...v).trim().replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre>';
const S = '~/course/scripts';
const today = c => c.run('date +%F').then(s => s.trim());
const GET = String.raw`curl -s "https://api.nbp.pl/api/exchangerates/tables/a/?format=json" | jq -r '.[0].rates[] | "\(.code),\(.mid),\(.currency)"'`;

LESSONS.push(
  {
    id: 'vars', title: '2.1 Variables',
    intro: 'A variable is a name for a value: <code>name="Ada"</code> stores it, <code>$name</code> reads it. <b>No spaces around =</b>. <code>$(command)</code> runs a command and puts its output in place.',
    steps: [
      { do: 'Class 2 starts from scratch, so set up the folders and data (safe to run even if you did class 1):<br><code>mkdir -p ~/course/data ~/course/results</code><br><code>cd ~/course/data</code><br><code>' + GET + ' > rates.csv</code>', why: why(['mkdir -p', 'create the folders; -p: no error if they already exist'], ['cd ~/course/data', 'go to the data folder'], ['curl ... > rates.csv', 'download today\'s rates into rates.csv (the same command as in lesson 1.4)']), check: c => c.cwd === D && n(c.file(R)) > 10 },
      { do: 'Store your name in a variable (use your own): <code>name="Ada"</code>. Nothing is printed; that is fine.', check: c => !!c.var('name') },
      { do: 'Read it back: <code>echo "Hello, $name"</code>', check: c => c.out.startsWith('Hello, ') && c.out.includes(c.var('name')) },
      { do: 'The classic mistake, spaces around =: <code>name = "Ada"</code>. Bash thinks <i>name</i> is a command.', check: c => /^name =/.test(c.cmd) },
      { do: 'Single quotes switch variables off: <code>echo \'Hello, $name\'</code>. Double quotes keep them on.', check: c => c.out === 'Hello, $name\n' },
      { do: 'Store the output of a command: <code>rows=$(wc -l < rates.csv)</code>, then <code>echo "We have $rows currencies"</code>', why: why(['rows=', 'store in a variable called rows (no spaces around =)'], ['$( ... )', 'run the command inside and use its output as the value'], ['wc -l < rates.csv', 'count lines; with &lt; wc reads the file without printing its name, so you get just the number'], ['"$rows"', 'later, read the value back']), check: async c => c.var('rows') === (await c.run(`wc -l < ${R}`)).trim() && c.out.startsWith('We have') },
      { do: 'The euro rate in a variable: <code>euro=$(grep EUR rates.csv | cut -d, -f2)</code>, then <code>echo "1 EUR = $euro PLN"</code>', why: why(['grep EUR rates.csv', 'the euro line: <code>EUR,4.27,euro</code>'], ['| cut -d, -f2', 'keep column 2: <code>4.27</code>'], ['euro=$( ... )', 'store that output in the variable euro']), check: async c => c.var('euro') === (await c.run(`grep EUR ${R} | cut -d, -f2`)).trim() && c.out.includes(c.var('euro')) },
      { do: 'Today\'s date in a form good for file names: <code>date +%F</code>', why: why(['date', 'current date and time'], ['+%F', 'a format: year-month-day, e.g. 2026-10-18. Sorts nicely and has no spaces']), check: is(/^date \+%F$/) },
      { do: 'A dated copy, so tomorrow\'s download does not overwrite today\'s: <code>cp rates.csv rates_$(date +%F).csv</code>, then <code>ls</code>', why: why(['cp rates.csv', 'copy the file to...'], ['rates_$(date +%F).csv', 'a name built on the fly: $(date +%F) is replaced by today\'s date before cp runs']), check: async c => c.file(`${D}/rates_${await today(c)}.csv`) !== null && /^ls/.test(c.cmd) },
      { do: '<b>Exercise.</b> Put the US dollar rate (USD) in a variable called <b>usd</b> and print <i>1 USD = … PLN</i>.', check: async c => c.var('usd') === (await c.run(`grep USD ${R} | cut -d, -f2`)).trim() && c.out.includes(c.var('usd')) },
      { do: 'Every command reports success or failure. Search for something that is not there: <code>grep XYZ rates.csv</code>', check: is(/^grep XYZ/) },
      { do: '<code>echo $?</code> prints the exit status of the last command: 0 means success, anything else means failure.', why: why(['$?', 'a special variable: the exit status of the previous command'], ['0', 'success'], ['1', 'for grep: nothing found'], 'Scripts and <code>if</code> use this number to decide what to do next.'), check: c => c.cmd === 'echo $?' && c.out.trim() === '1' },
    ],
  },
  {
    id: 'script', title: '2.2 Your first script',
    intro: 'A script is a text file with commands that run one after another. Write it once, run it whenever you need it. The first line <code>#!/bin/bash</code> says which program runs the file; lines starting with <code>#</code> are comments for humans.',
    steps: [
      { do: 'A folder for scripts: <code>mkdir ~/course/scripts</code>, then <code>cd ~/course/scripts</code>', check: c => c.cwd === S },
      { do: 'Open a new file: <code>nano report.sh</code>, paste this in (click the box to copy), then <b>Ctrl+X</b>, <b>Y</b>, <b>Enter</b>:' + pre`
#!/bin/bash
# Short report about today's exchange rates
cd ~/course/data
echo "Currencies: $(wc -l < rates.csv)"
echo "Euro:"
grep EUR rates.csv
echo "Three most expensive:"
sort -t, -k2 -nr rates.csv | head -3`, check: c => n(c.file(S + '/report.sh')) >= 3 },
      { do: 'Run it: <code>bash report.sh</code>', check: c => /^(bash|sh) report\.sh/.test(c.cmd) && c.out.includes('EUR') },
      { do: 'Now try running it directly: <code>./report.sh</code>. Permission denied?', check: is(/^\.\/report\.sh$/) },
      { do: 'Look at the permissions: <code>ls -l report.sh</code>. <b>r</b> = read, <b>w</b> = write, <b>x</b> = execute. There is no x.', check: is(/^ls -l/) },
      { do: 'Make it executable: <code>chmod +x report.sh</code>, then <code>ls -l report.sh</code> again.', why: why(['chmod', 'change mode: change permissions'], ['+x', 'add execute permission'], ['report.sh', 'the file'], 'In <code>-rwxr-xr-x</code> the three groups are: you, your group, everyone else.'), check: c => c.isExec(S + '/report.sh') && /^ls -l/.test(c.cmd) },
      { do: 'Now it works: <code>./report.sh</code>', check: c => c.cmd === './report.sh' && c.out.includes('EUR') },
      { do: 'Without <code>./</code> it does not: <code>report.sh</code>. Bash only looks for commands in a few system folders; <code>./</code> means "the file right here".', check: is(/^report\.sh$/) },
      { do: 'The script did <code>cd ~/course/data</code>. Where are you? <code>pwd</code>. A script runs in its own copy of the shell, so its cd does not move you.', check: c => c.cmd === 'pwd' && c.cwd === S },
      { do: 'Script output can be redirected like any command: <code>./report.sh > ~/course/results/report.txt</code>', check: c => (c.file('~/course/results/report.txt') || '').includes('EUR') },
      { do: '<b>Exercise.</b> Write <b>kronas.sh</b> that prints how many currencies are kronas (<i>korona</i>) and then lists them. Make it executable and run it.', hint: 'grep -c, then grep; do not forget chmod +x', check: c => c.isExec(S + '/kronas.sh') && /kronas\.sh/.test(c.cmd) && c.out.includes('korona') },
    ],
  },
  {
    id: 'loops', title: '2.3 Loops',
    intro: 'A <b>for</b> loop repeats commands for each item in a list: <code>for x in a b c; do ...; done</code>. You can also type a loop over several lines: after <code>do</code> press Enter and bash shows <code>&gt;</code> until you type <code>done</code>.',
    steps: [
      { do: '<code>cd ~/course/data</code>, then your first loop:<br><code>for code in USD EUR GBP; do echo "Currency: $code"; done</code>', check: c => c.out === 'Currency: USD\nCurrency: EUR\nCurrency: GBP\n' },
      { do: 'Do something useful in the loop: <code>for code in USD EUR GBP; do grep "^$code," rates.csv; done</code>', check: async c => /^for /.test(c.cmd) && c.out === await c.run(`for x in USD EUR GBP; do grep "^$x," ${R}; done`) },
      { do: 'The list can come from a command: <code>for code in $(cut -d, -f1 rates.csv | head -5); do echo "Code: $code"; done</code>', why: why(['for code in ...', 'repeat for every word in the list, putting it in $code'], ['$(cut -d, -f1 rates.csv | head -5)', 'the list: the first 5 currency codes'], ['do ...; done', 'the commands to repeat']), check: c => n(c.out) === 5 && c.out.startsWith('Code: ') },
      { do: 'Or from files: <code>for f in *.csv; do echo "$f has $(wc -l < $f) lines"; done</code>', why: why(['*.csv', 'every file in this folder ending in .csv'], ['$f', 'the current file name'], ['$(wc -l < $f)', 'its line count']), check: c => n(c.out) >= 1 && c.out.includes(' has ') },
      { do: '<b>Exercise.</b> With one loop, save the rows of USD, EUR and CHF into separate files <b>USD.csv</b>, <b>EUR.csv</b>, <b>CHF.csv</b> in the data folder.', hint: 'grep "^$code," rates.csv > $code.csv inside the loop', check: c => ['USD', 'EUR', 'CHF'].every(x => (c.file(`${D}/${x}.csv`) || '').startsWith(x + ',')) },
    ],
  },
  {
    id: 'if', title: '2.4 Decisions: if',
    intro: '<code>[ ... ]</code> is a test: it succeeds (status 0) or fails. <code>if</code> runs commands only when a test succeeds. <b>The spaces inside [ ] are required</b>: <code>[ -f file ]</code>, not <code>[-f file]</code>.',
    steps: [
      { do: 'In the data folder: <code>[ -f rates.csv ] && echo "file exists"</code>. <code>-f</code> asks "is there such a file?", and <code>&&</code> runs the next command only on success.', why: why(['[ -f rates.csv ]', 'test: is rates.csv an existing file?'], ['&&', 'and then: run the next command only if the test succeeded'], ['echo "file exists"', 'runs only on success'], 'Try it with a wrong name: nothing is printed.'), check: c => c.out === 'file exists\n' },
      { do: 'With if and else: <code>if [ -f rates.csv ]; then echo "found"; else echo "missing"; fi</code>', check: c => /^if /.test(c.cmd) && c.out === 'found\n' },
      { do: 'Press <b>↑</b> and change rates.csv to <b>nothere.csv</b>.', check: c => /^if /.test(c.cmd) && c.out === 'missing\n' },
      { do: 'Compare numbers: <code>rows=$(wc -l < rates.csv)</code>, then <code>if [ $rows -gt 30 ]; then echo "big table"; fi</code>. (<code>-gt</code> = greater than. It works only on whole numbers, not on rates like 4.36.)', why: why(['$rows', 'the number stored earlier'], ['-gt', 'greater than. Also: -lt less, -eq equal, -ge, -le'], ['then ...; fi', 'what to run if the test succeeds; fi closes the if']), check: c => /-gt/.test(c.cmd) && c.out === 'big table\n' },
      { do: 'Put it all together: a script that downloads today\'s rates into a dated file. Create <b>get_rates.sh</b> in ~/course/scripts, make it executable and run it.' + pre`
#!/bin/bash
# Downloads today's NBP rates into ~/course/data/rates_YYYY-MM-DD.csv
out=$HOME/course/data/rates_$(date +%F).csv
curl -s "https://api.nbp.pl/api/exchangerates/tables/a/?format=json" | jq -r '.[0].rates[] | "\(.code),\(.mid),\(.currency)"' > "$out"
if [ -s "$out" ]; then
  echo "Saved $(wc -l < "$out") rates to $out"
else
  echo "Download failed"
  exit 1
fi` + '<code>-s</code> means "exists and is not empty". Run this every day and you collect a history of rates.', check: async c => /get_rates\.sh/.test(c.cmd) && /^Saved \d+ rates/.test(c.out) && n(c.file(`${D}/rates_${await today(c)}.csv`)) > 10 },
    ],
  },
  {
    id: 'hw2', title: '2.H Homework 2 (practice run)',
    intro: 'Practise here, then do it for real in Cloud Shell and send a screenshot of <code>ls -l ~/course/homework2</code> and of <code>cat ~/course/homework2/all.txt</code>.',
    steps: [
      { do: 'Create the folder <b>~/course/homework2</b> and go into it.', check: c => c.cwd === '~/course/homework2' },
      { do: 'Write an executable script <b>summary.sh</b> that, with one for loop over the words <i>dolar</i>, <i>korona</i> and <i>frank</i>, prints for each word: how many currencies match it, then the matching rows sorted from the cheapest. If ~/course/data/rates.csv does not exist, it prints an error and exits with status 1.', hint: 'if [ ! -f ... ] at the top, then for w in dolar korona frank; do ... done', check: c => c.isExec('~/course/homework2/summary.sh') },
      { do: 'Run <code>./summary.sh</code>', check: async c => { if (!/summary\.sh$/.test(c.cmd)) return false; const codes = (await c.run(`grep -e dolar -e korona -e frank ${R} | cut -d, -f1`)).split('\n').filter(Boolean); return codes.every(x => c.out.includes(x)) && c.out.includes((await c.run(`grep -c korona ${R}`)).trim()); } },
      { do: 'Save its output to <b>all.txt</b>: <code>./summary.sh > all.txt</code>', check: c => ['USD', 'CZK', 'CHF'].every(x => (c.file('~/course/homework2/all.txt') || '').includes(x)) },
      { do: 'Run <code>ls -l ~/course/homework2</code>', check: c => /^ls -l/.test(c.cmd) && c.out.includes('all.txt') && c.out.includes('rwx') },
    ],
  },
  {
    id: 'args', title: '2.B Bonus: script arguments',
    intro: '<b>Optional, for the curious.</b> Words you type after a script name are its <b>arguments</b>. Inside the script, <code>$1</code> is the first, <code>$2</code> the second, <code>$#</code> how many there are. One script, many questions.',
    steps: [
      { do: 'Go to the scripts folder: <code>cd ~/course/scripts</code>, then create <b>rate.sh</b> there (<code>nano rate.sh</code>):' + pre`
#!/bin/bash
# Usage: ./rate.sh CODE    e.g. ./rate.sh USD
grep "$1" ~/course/data/rates.csv`, check: c => (c.file(S + '/rate.sh') || '').includes('$1') },
      { do: 'Make it executable: <code>chmod +x rate.sh</code>', check: c => c.isExec(S + '/rate.sh') },
      { do: 'Ask about the dollar: <code>./rate.sh USD</code>', check: c => c.cmd === './rate.sh USD' && /^USD,/.test(c.out) },
      { do: 'Same script, different questions: <code>./rate.sh CHF</code>, then <code>./rate.sh korona</code>', check: c => c.cmd === './rate.sh korona' && n(c.out) > 1 },
      { do: 'What if you forget the argument? <code>./rate.sh</code>. <code>$1</code> is empty, and grep with an empty pattern matches every line. We fix that at the end of this lesson.', check: c => c.cmd === './rate.sh' && n(c.out) > 10 },
      { do: 'Make the output friendlier. Open <code>nano rate.sh</code> and replace everything with:' + pre`
#!/bin/bash
# Usage: ./rate.sh CODE    e.g. ./rate.sh USD
rate=$(grep "^$1," ~/course/data/rates.csv | cut -d, -f2)
echo "1 $1 = $rate PLN"` + 'then run <code>./rate.sh EUR</code>. (<code>^</code> means "at the start of the line", so EUR cannot match in the middle of a name.)', why: why(['$1', 'the first argument, e.g. EUR'], ['"^$1,"', 'the pattern becomes <code>^EUR,</code>: EUR at the very start of the line, followed by a comma'], ['| cut -d, -f2', 'keep only the rate'], ['rate=$( ... )', 'store it']), check: c => /^1 [A-Z]{3} = [\d.]+ PLN$/.test(c.out.trim()) },
      { do: '<b>Exercise.</b> Write <b>top.sh</b> that prints the N most expensive currencies, where N is the first argument. Run <code>./top.sh 5</code>.', hint: 'sort -t, -k2 -nr ... | head -n "$1"', check: async c => { const m = c.cmd.match(/top\.sh (\d+)$/); return !!m && +m[1] > 0 && c.out === await c.run(`sort -t, -k2 -nr ${R} | head -${m[1]}`); } },
      { do: 'Now in a script. In ~/course/scripts create <b>rates_for.sh</b> and make it executable. <code>"$@"</code> means "all the arguments".' + pre`
#!/bin/bash
# Usage: ./rates_for.sh CODE...    e.g. ./rates_for.sh USD EUR GBP
for code in "$@"; do
  rate=$(grep "^$code," ~/course/data/rates.csv | cut -d, -f2)
  echo "$code: $rate"
done`, check: c => c.isExec(S + '/rates_for.sh') },
      { do: 'Run it with as many codes as you like: <code>./rates_for.sh USD EUR GBP CHF</code>', check: c => { const m = c.cmd.match(/rates_for\.sh((?: \S+)+)$/); return !!m && n(c.out) === m[1].trim().split(' ').length && c.out.split('\n').filter(Boolean).every(l => /^\S+: [\d.]+$/.test(l)); } },
      { do: 'Protect rate.sh from a missing argument. In ~/course/scripts, <code>nano rate.sh</code>:' + pre`
#!/bin/bash
# Usage: ./rate.sh CODE    e.g. ./rate.sh USD
if [ -z "$1" ]; then
  echo "Usage: ./rate.sh CODE    (e.g. ./rate.sh USD)"
  exit 1
fi
rate=$(grep "^$1," ~/course/data/rates.csv | cut -d, -f2)
echo "1 $1 = $rate PLN"` + '<code>-z</code> means "is empty", <code>exit 1</code> stops the script with an error. Then run <code>./rate.sh</code> with no argument.', check: c => c.cmd === './rate.sh' && /usage/i.test(c.out) },
      { do: 'Check the exit status: <code>echo $?</code>', check: c => c.cmd === 'echo $?' && c.out.trim() === '1' },
      { do: '<b>Exercise.</b> <code>./rate.sh XYZ</code> prints <i>1 XYZ =  PLN</i>. Change rate.sh so it prints <i>Unknown currency: XYZ</i> instead, and try it.', hint: 'after rate=..., add if [ -z "$rate" ]; then ... exit 1; fi', check: async c => { const m = c.cmd.match(/^\.\/rate\.sh (\S+)$/); return !!m && (await c.run(`grep -c "^${m[1]}," ${R}`)).trim() === '0' && /unknown/i.test(c.out) && c.out.includes(m[1]); } },
    ],
  },
);

// ---------- Class 3: APIs ----------
const A = '~/course/api', NBP = 'https://api.nbp.pl/api/exchangerates/rates/a', WL = 'https://wolnelektury.pl/api';
const json = s => { try { return JSON.parse(s); } catch { return null; } };
const rows = s => (s ?? '').split('\n').filter(Boolean);

LESSONS.push(
  {
    id: 'api-nbp', title: '3.1 APIs: asking a server for data',
    intro: 'An <b>API</b> is a web address that answers programs, not people: instead of a page you get data. You ask a different question by changing the address. The answer usually comes as <b>JSON</b>: <code>{ }</code> is an object with <i>"name": value</i> pairs, <code>[ ]</code> is a list. <b>jq</b> picks things out of JSON.',
    steps: [
      { do: 'A folder for today: <code>mkdir -p ~/course/api</code>, then <code>cd ~/course/api</code>', why: why(['mkdir -p ~/course/api', 'create the folder; -p: no error if it already exists'], ['cd ~/course/api', 'go into it']), check: c => c.cwd === A },
      { do: `Ask the National Bank for today's dollar rate:<br><code>curl -s "${NBP}/usd/?format=json"</code><br>Correct, but hard to read.`, why: why(['https://api.nbp.pl/api', 'the server and the door for programs'], ['/exchangerates/rates/a', 'the question: exchange rates, table A (the average rates)'], ['/usd', 'which currency. Change it and you get another one'], ['?format=json', 'please answer in JSON'], 'The NBP documents all its addresses at api.nbp.pl.'), check: c => /^curl /.test(c.cmd) && c.out.includes('"code":"USD"') },
      { do: `Same answer, readable: press <b>↑</b> and add <code>| jq '.'</code> at the end.`, why: why(['|', 'pass the answer to the next command'], ['jq', 'a program for reading JSON: you give it a <i>filter</i>, a small description of which part you want'], ["'.'", 'the filter. <code>.</code> means "everything", shown with indents and one value per line'], 'Filters go in single quotes so bash leaves their special characters alone. <code>jq --help</code> lists the filters the simulator knows.'), check: c => c.out.includes('"code": "USD"') },
      { do: `Ask for the last 10 days and save the answer, so you do not have to ask the server again:<br><code>curl -s "${NBP}/usd/last/10/?format=json" > usd.json</code>`, why: why(['/last/10', 'the last 10 published rates (NBP publishes on working days only)'], ['> usd.json', 'save the answer to a file'], 'Servers do not like being asked the same thing a thousand times. Download once, then explore the file.'), check: c => json(c.file(A + '/usd.json'))?.rates?.length === 10 },
      { do: 'What is inside? <code>jq keys usd.json</code> lists the names in the top object.', why: why(['keys', 'list the names of the fields'], ['usd.json', 'jq can read a file instead of a pipe']), check: c => /^jq '?keys'? usd\.json$/.test(c.cmd) && c.out.includes('"rates"') },
      { do: `One field: <code>jq '.currency' usd.json</code> gives it in quotes, as JSON. Add <code>-r</code> (raw) to get plain text: <code>jq -r '.currency' usd.json</code>`, why: why(['jq', 'the JSON tool'], ["'.currency'", 'the filter: the dot is the whole answer, .currency the field called currency inside it'], ['usd.json', 'the file to read'], ['-r', 'raw: print text as it is, without the JSON quotes. Use it whenever the result goes into a file, a variable or another command']), check: c => c.out === 'dolar amerykański\n' },
      { do: `<i>rates</i> is a list. Its first element: <code>jq '.rates[0]' usd.json</code>. Counting starts at 0.`, why: why(['.rates', 'the field rates: a list of days'], ['[0]', 'element number 0 of that list, i.e. the first one. [1] is the second'], 'The result is an object again, so you can go deeper: <code>.rates[0].mid</code>.'), check: c => /\.rates\[0\]/.test(c.cmd) && c.out.includes('"effectiveDate"') },
      { do: `<code>[]</code> with no number means "every element": <code>jq '.rates[].mid' usd.json</code>`, why: why(['.rates', 'go into the field rates'], ['[]', 'every element of the list, one after another'], ['.mid', 'from each one take mid, the average rate']), check: c => c.cmd.includes('.rates[].mid') && n(c.out) === 10 },
      { do: String.raw`Turn JSON into the CSV you know from class 1:<br><code>jq -r '.rates[] | "\(.effectiveDate),\(.mid)"' usd.json > usd.csv</code><br>then <code>cat usd.csv</code>`, why: why(['.rates[]', 'every day in the list'], ['|', 'inside jq too: pass each day on'], ['"\\(.effectiveDate),\\(.mid)"', 'build a line of text; <code>\\( )</code> puts a field in place'], ['-r', 'plain text, no quotes'], ['> usd.csv', 'save it']), check: async c => !!c.file(A + '/usd.csv') && c.file(A + '/usd.csv') === await c.run(String.raw`jq -r '.rates[] | "\(.effectiveDate),\(.mid)"' ${A}/usd.json`) && /^cat/.test(c.cmd) },
      { do: 'Now the old tools work again. The day the dollar was most expensive: <code>sort -t, -k2 -nr usd.csv | head -1</code>', why: why(['sort -t, -k2 -nr usd.csv', 'sort the days by column 2 (the rate), as numbers, largest first'], ['| head -1', 'keep only the first line']), check: async c => c.out === await c.run(`sort -t, -k2 -nr ${A}/usd.csv | head -1`) },
      { do: `The address is just text, so a variable can go into it: <code>code=eur</code>, then<br><code>curl -s "${NBP}/$code/last/10/?format=json" > $code.json</code>`, why: why(['code=eur', 'store the currency in a variable'], ['"…/$code/last/10/…"', 'double quotes: $code is replaced by eur before curl runs'], ['> $code.json', 'the file name too: eur.json']), check: c => json(c.file(A + '/eur.json'))?.code === 'EUR' },
      { do: `And where there is a variable, there can be a loop. Four currencies, four files, one line:<br><code>for code in usd eur gbp chf; do curl -s "${NBP}/$code/last/10/?format=json" > $code.json; done</code><br>then <code>ls</code>`, why: why(['for code in usd eur gbp chf', 'repeat for each currency, putting it in $code'], ['do curl … > $code.json', 'download that currency and save it as usd.json, eur.json, …'], ['; done', 'end of the loop'], 'One line, four questions to the server.'), check: c => ['usd', 'eur', 'gbp', 'chf'].every(x => json(c.file(`${A}/${x}.json`))?.rates?.length === 10) && /^ls/.test(c.cmd) },
      { do: `Loop over the files: the latest rate in each.<br><code>for f in *.json; do echo "$f $(jq -r '.rates[].mid' $f | tail -1)"; done</code>`, why: why(['for f in *.json', 'every JSON file here'], ["jq -r '.rates[].mid' $f", 'all 10 rates from that file'], ['| tail -1', 'the last one is the newest'], ['"$f $( … )"', 'print the file name and the result side by side']), check: c => /^for /.test(c.cmd) && n(c.out) >= 4 && rows(c.out).every(l => /^\S+\.json [\d.]+$/.test(l)) },
      { do: `What if you ask a wrong question? <code>curl -s "${NBP}/xyz/?format=json"</code>. There is no currency XYZ, and the answer is not JSON at all. Always look at what came back before you trust it.`, why: why(['/xyz/', 'a currency that does not exist'], ['404', 'the web code for "not found"'], ['Brak danych', 'Polish for "no data"'], "Pipe this into jq and it fails: it is not JSON. A script that does not check what came back saves rubbish."), check: c => c.out.includes('404') },
      { do: '<b>Exercise.</b> Save the last 30 rates of the Japanese yen (<b>jpy</b>) to <b>jpy.csv</b> as <i>date,rate</i> lines.', hint: 'curl … | jq -r … > jpy.csv (one pipeline, or curl to jpy.json first)', check: c => n(c.file(A + '/jpy.csv')) === 30 && rows(c.file(A + '/jpy.csv')).every(l => /^\d{4}-\d\d-\d\d,[\d.]+$/.test(l)) },
      { do: '<b>Exercise.</b> With one loop and no files, print today\'s rate of <b>nok</b>, <b>sek</b> and <b>dkk</b>, one currency per line.', hint: String.raw`for c in nok sek dkk; do echo "$c $(curl -s "…/$c/?format=json" | jq '.rates[0].mid')"; done`, check: c => /^for /.test(c.cmd) && ['nok', 'sek', 'dkk'].every(x => c.cmd.toLowerCase().includes(x)) && n(c.out) === 3 && rows(c.out).every(l => /\d\.\d+/.test(l)) },
      { do: `<b>Bonus.</b> Instead of <i>last/10</i> you can give dates: <code>…/usd/2026-01-01/2026-03-31/?format=json</code>. On how many days did the NBP publish rates in the first quarter of 2026?`, hint: `jq '.rates | length'`, why: why(['/usd/2026-01-01/2026-03-31/', 'from date / to date, written YYYY-MM-DD'], ["jq '.rates | length'", 'go into rates, then count its elements']), check: async c => c.out.trim() !== '' && c.out.trim() === (await c.run(`curl -s "${NBP}/usd/2026-01-01/2026-03-31/?format=json" | jq '.rates | length'`)).trim() },
    ],
  },
  {
    id: 'api-wl', title: '3.2 APIs: a library of Polish literature',
    intro: '<b>Wolne Lektury</b> is a free online library of Polish literature. Its API at <code>wolnelektury.pl/api/</code> answers with lists of authors, books and epochs. Most answers are a list of objects: <code>[{…}, {…}]</code>. Polish words you will see: <i>epoka</i> = epoch, <i>Liryka</i> = poetry, <i>Epika</i> = narrative, <i>Dramat</i> = drama. Some answers are huge (all 7000 books, every book of an epoch); we stick to small questions.',
    steps: [
      { do: 'Go to the api folder: <code>mkdir -p ~/course/api</code>, then <code>cd ~/course/api</code>', why: why(['mkdir -p ~/course/api', 'create the folder; -p: no error if it already exists'], ['cd ~/course/api', 'go into it']), check: c => c.cwd === A },
      { do: `The literary epochs: <code>curl -s "${WL}/epochs/" | jq '.'</code>`, why: why(['curl -s "…/epochs/"', 'ask the library API for the list of epochs'], ['| jq', 'pass the JSON to jq, the tool that reads JSON'], ["'.'", 'the filter: . means the whole thing, shown nicely'], 'The answer starts with <code>[</code>: a list. Each element is an object <code>{…}</code> with the fields name, slug, url, href.'), check: c => c.cmd.includes('/epochs') && c.out.includes('Romantyzm') },
      { do: `Names only. Press <b>↑</b> and change the filter: <code>curl -s "${WL}/epochs/" | jq -r '.[].name'</code>`, why: why(['.[]', 'every element of the top list'], ['.name', 'from each one its name']), check: c => c.out.includes('Romantyzm\n') && !c.out.includes('{') },
      { do: `How many are there? <code>curl -s "${WL}/epochs/" | jq length</code>`, why: why(['length', 'how many elements a list has']), check: c => c.cmd.includes('/epochs') && /^\d+\n$/.test(c.out) },
      { do: `All books by one author, saved to a file:<br><code>curl -s "${WL}/authors/adam-mickiewicz/books/" > mickiewicz.json</code>`, why: why(['/authors/', 'the authors part of the API'], ['adam-mickiewicz', 'the <i>slug</i>: a name written for addresses, lowercase, no Polish letters, dashes instead of spaces'], ['/books/', 'his books']), check: c => json(c.file(A + '/mickiewicz.json'))?.length > 50 },
      { do: 'How many books? <code>jq length mickiewicz.json</code>', why: why(['jq', 'the JSON tool'], ['length', 'the filter: how many elements in the list. No quotes needed, it has no special characters'], ['mickiewicz.json', 'the file to read']), check: c => c.out.trim() === String(json(c.file(A + '/mickiewicz.json'))?.length) },
      { do: `What does one book look like? <code>jq '.[0]' mickiewicz.json</code>`, why: why(["'.[0]'", 'the first element of the top list: one book'], 'Look at the field names: title, kind, epoch, genre, has_audio, slug… You will use them in the next steps.'), check: c => c.cmd.includes('.[0]') && c.out.includes('"title"') },
      { do: `The first ten titles: <code>jq -r '.[].title' mickiewicz.json | head</code>`, why: why(["'.[].title'", 'from every book ([]) take the title'], ['-r', 'plain text without quotes'], ['| head', 'only the first 10 lines']), check: async c => c.out === await c.run(`jq -r '.[].title' ${A}/mickiewicz.json | head`) },
      { do: `A class 1 pipeline on API data. How many poems, dramas, narratives?<br><code>jq -r '.[].kind' mickiewicz.json | sort | uniq -c</code>`, why: why(["jq -r '.[].kind'", 'the kind of every book, one per line'], ['| sort', 'put equal kinds next to each other'], ['| uniq -c', 'squash repeats and count them']), check: async c => c.out === await c.run(`jq -r '.[].kind' ${A}/mickiewicz.json | sort | uniq -c`) },
      { do: String.raw`<i>has_audio</i> is <i>true</i> or <i>false</i>. How many of his books have an audiobook?<br><code>jq -r '.[] | "\(.has_audio) \(.title)"' mickiewicz.json | grep -c ^true</code>`, why: why(['"\\(.has_audio) \\(.title)"', 'one line per book: <i>true Pan Tadeusz</i>'], ['grep -c ^true', 'count the lines that start (^) with true']), check: async c => c.out === await c.run(String.raw`jq -r '.[] | "\(.has_audio) \(.title)"' ${A}/mickiewicz.json | grep -c ^true`) },
      { do: `One book in detail: <code>curl -s "${WL}/books/pan-tadeusz/" > pan-tadeusz.json</code>, then <code>jq keys pan-tadeusz.json</code>`, why: why(['/books/pan-tadeusz/', 'one book, by its slug'], ['> pan-tadeusz.json', 'save it'], ['jq keys', 'list the field names of the object'], 'One book has many more fields than in the list: links to the text, the epub, audio…'), check: c => (json(c.file(A + '/pan-tadeusz.json'))?.title || '').startsWith('Pan Tadeusz') && c.out.includes('"epochs"') },
      { do: `Lists inside objects: <code>jq -r '.authors[0].name' pan-tadeusz.json</code>`, why: why(['.authors', 'the field authors, a list (a book can have several)'], ['[0]', 'its first element'], ['.name', 'that author\'s name']), check: c => c.out === 'Adam Mickiewicz\n' },
      { do: `Where is the full text? <code>jq -r '.txt' pan-tadeusz.json</code>. In Cloud Shell you can download it with curl and grep the whole poem; the simulator cannot, because the library does not let browser pages download its book files.`, why: why(["'.txt'", 'the field txt: the address of the plain-text version'], ['-r', 'without quotes, so you could pass it straight to curl']), check: c => /^https:\S+\.txt\n$/.test(c.out) },
      { do: `A loop over authors: how many books each?<br><code>for a in adam-mickiewicz juliusz-slowacki boleslaw-prus; do echo "$a: $(curl -s "${WL}/authors/$a/books/" | jq length)"; done</code>`, why: why(['for a in adam-mickiewicz …', 'repeat for each author slug, putting it in $a'], ['"$a: $( … )"', 'print the slug and the result of the command inside'], ['curl -s "…/authors/$a/books/"', 'that author\'s books'], ['| jq length', 'count them']), check: c => /^for /.test(c.cmd) && n(c.out) === 3 && rows(c.out).every(l => /^\S+: \d+$/.test(l)) },
      { do: '<b>Exercise.</b> Find the slug of Henryk Sienkiewicz in the list of all authors, then count his books.', hint: `curl -s "${WL}/authors/" | jq -r '.[].slug' | grep sienkiewicz`, check: c => /sienkiewicz/.test(c.cmd) && /^\d+$/.test(c.out.trim()) && +c.out.trim() > 20 },
      { do: '<b>Exercise.</b> With one loop, print the epoch of each of these books: <b>lalka</b>, <b>przedwiosnie</b>, <b>kordian</b>, <b>treny</b> (these are book slugs), one per line.', hint: `one book: curl -s "${WL}/books/SLUG/" | jq -r '.epochs[0].name'`, check: c => /^for /.test(c.cmd) && ['lalka', 'przedwiosnie', 'kordian', 'treny'].every(x => c.cmd.includes(x)) && n(c.out) === 4 && c.out.includes('Pozytywizm') && c.out.includes('Renesans') },
      { do: String.raw`<b>Bonus.</b> Press <b>↑</b> and change the loop to print the author and the full title of each book, e.g. <i>Bolesław Prus: Lalka</i>.`, hint: String.raw`jq -r '"\(.authors[0].name): \(.title)"'`, check: c => /^for /.test(c.cmd) && n(c.out) === 4 && c.out.includes('Bolesław Prus: ') && c.out.includes('Jan Kochanowski: ') },
    ],
  },
  {
    id: 'hw3', title: '3.H Homework 3 (practice run)',
    intro: `Practise here, then do it for real in Cloud Shell and send a screenshot of <code>ls -l ~/course/homework3</code> and of <code>cat ~/course/homework3/max.txt</code>. <b>Extra, Cloud Shell only:</b> download the full text of Pan Tadeusz (the <i>.txt</i> link from lesson 3.2) and count how many lines mention <i>Zosia</i>.`,
    steps: [
      { do: 'Create the folder <b>~/course/homework3</b> and go into it.', check: c => c.cwd === '~/course/homework3' },
      { do: 'Write an executable script <b>get.sh</b> that, with one for loop over <i>usd</i>, <i>eur</i> and <i>chf</i>, downloads the last 5 NBP rates of each currency and saves them as <b>usd.csv</b>, <b>eur.csv</b>, <b>chf.csv</b> in ~/course/homework3, one <i>date,rate</i> line per day.', hint: String.raw`cd ~/course/homework3 at the top; inside the loop: curl -s "…/$code/last/5/?format=json" | jq -r '.rates[] | "\(.effectiveDate),\(.mid)"' > $code.csv`, check: c => c.isExec('~/course/homework3/get.sh') },
      { do: 'Run <code>./get.sh</code>, then <code>ls</code>', check: c => /^ls/.test(c.cmd) && ['usd', 'eur', 'chf'].every(x => { const f = c.file(`~/course/homework3/${x}.csv`); return n(f) === 5 && rows(f).every(l => /^\d{4}-\d\d-\d\d,[\d.]+$/.test(l)); }) },
      { do: 'With one loop over the CSV files, save to <b>max.txt</b> one line per file: the file name and its highest rate, e.g. <i>usd.csv 3.92</i>.', hint: 'for f in *.csv; do echo "$f $(sort … | head -1 | cut …)"; done > max.txt', check: async c => { const f = c.file('~/course/homework3/max.txt'); if (n(f) !== 3) return false; for (const x of ['usd', 'eur', 'chf']) { const top = (await c.run(`sort -t, -k2 -nr ~/course/homework3/${x}.csv | head -1 | cut -d, -f2`)).trim(); if (!rows(f).some(l => l.includes(x) && l.includes(top))) return false; } return true; } },
      { do: 'Save the titles of all books by Stefan Żeromski (slug <b>stefan-zeromski</b>), sorted alphabetically, to <b>zeromski.txt</b>.', check: async c => { const f = c.file('~/course/homework3/zeromski.txt'); return n(f) > 10 && f === await c.run(`curl -s "${WL}/authors/stefan-zeromski/books/" | jq -r '.[].title' | sort`); } },
      { do: 'Run <code>ls -l ~/course/homework3</code>', check: c => /^ls -l/.test(c.cmd) && c.out.includes('max.txt') && c.out.includes('zeromski.txt') && c.out.includes('rwx') },
    ],
  },
);

if (typeof module !== 'undefined') module.exports = { LESSONS };

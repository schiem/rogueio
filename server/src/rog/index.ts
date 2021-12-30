import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'process';
import { Rog } from './Rog';

const rl = readline.createInterface({ input, output });
const rog = new Rog();
rl.on('line', (line) => {
    rog.run(line);
});
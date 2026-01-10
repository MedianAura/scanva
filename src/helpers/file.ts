import { createReadStream, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';

export function readHeadOfFile(filePath: string, lines: number = 10): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!existsSync(filePath)) {
      reject(new Error(`File does not exist: ${filePath}`));
      return;
    }

    const stream = createReadStream(filePath, 'utf8');
    const rl = createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    const headLines: string[] = [];
    let lineCount = 0;

    rl.on('line', (line) => {
      if (lineCount < lines) {
        headLines.push(line);
        lineCount++;
      } else {
        rl.close();
        stream.destroy();
      }
    });

    rl.on('close', () => {
      resolve(headLines.join('\n'));
    });

    rl.on('error', reject);
    stream.on('error', reject);
  });
}

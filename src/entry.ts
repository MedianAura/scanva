export async function run(): Promise<number> {
  const program = await import('./main.js');
  return program.run();
}

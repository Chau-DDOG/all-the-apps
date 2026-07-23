import { spawnSync } from 'node:child_process';

const readArgument = (name) => {
  const exactIndex = process.argv.indexOf(name);
  if (exactIndex >= 0) {
    return process.argv[exactIndex + 1];
  }
  const prefix = name + '=';
  return process.argv
    .find((argument) => argument.startsWith(prefix))
    ?.slice(prefix.length);
};

const appId = readArgument('--app-id');
if (
  appId &&
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    appId,
  )
) {
  console.error('--app-id must be an existing App Builder definition UUID.');
  process.exit(1);
}

const expectedCommit = readArgument('--expected-commit');
if (expectedCommit) {
  if (!/^[0-9a-f]{40}$/i.test(expectedCommit)) {
    console.error('--expected-commit must be a full 40-character Git commit SHA.');
    process.exit(1);
  }
  const head = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
  if (head.status !== 0) {
    console.error(head.stderr || 'Could not determine the current Git commit.');
    process.exit(head.status || 1);
  }
  if (head.stdout.trim() !== expectedCommit) {
    console.error(
      `Refusing to preview commit ${head.stdout.trim()}; expected PR head ${expectedCommit}.`,
    );
    process.exit(1);
  }
}

const vite = process.platform === 'win32' ? 'vite.cmd' : 'vite';
const result = spawnSync(vite, ['build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DD_APPS_PREVIEW: '1',
    ...(appId ? { DD_APPS_PREVIEW_APP_ID: appId } : {}),
    DD_APPS_PUBLISH: '0',
    DD_APPS_UPLOAD_ASSETS: '1',
  },
});

if (result.error) {
  console.error(result.error.message);
}
process.exit(result.status ?? 1);

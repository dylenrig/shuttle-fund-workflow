import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const workflow = JSON.parse(readFileSync(new URL('./shuttle-fund.n8n.json', import.meta.url)));
const [trigger, fixture, reconcile] = workflow.nodes;
assert.equal(trigger.type, 'n8n-nodes-base.manualTrigger');
for (const [from, to] of [[trigger, fixture], [fixture, reconcile]]) {
  assert.equal(workflow.connections[from.name].main[0][0].node, to.name);
}
const source = runInNewContext('(function(){' + fixture.parameters.jsCode + '})()')[0].json;
function run(input) {
  return runInNewContext('(function(){' + reconcile.parameters.jsCode + '})()', {
    $input: {first: () => ({json: input})}
  }, {timeout: 1000})[0].json;
}
function checkStandard(actual) {
  assert.equal(actual.receivedCents, 420000);
  assert.equal(actual.pledgedCents, 180000);
  assert.equal(actual.claimedExcessCents, 180000);
  assert.equal(actual.percentReceived, 70);
  assert.equal(actual.trace.map(r => r.id).join(','), 'D-101,D-102,P-201');
}
checkStandard(run(source));
const r = source.records;
const duplicate = run({...source, records:[...r,r[0]]});
checkStandard(duplicate);
assert.equal(duplicate.duplicates[0], 'D-101');
for (const records of [[], [...r,{...r[0],cents:1000}], [{...r[0],cents:20.25}], [{...r[0],status:'unconfirmed'}]]) {
  const out = run({...source,records});
  assert.equal(out.status, 'REVIEW');
  assert.equal(out.draft, null);
}
if (process.argv[2]) {
  const contents = readFileSync(process.argv[2], 'utf8');
  const start = contents.indexOf('{');
  assert.ok(start >= 0, 'Expected JSON from n8n');
  const output = JSON.parse(contents.slice(start));
  const data = (output.data?.resultData ?? output.resultData)?.runData;
  checkStandard(data[reconcile.name][0].data.main[0][0].json);
  console.log('Verified receipt against the final node output of an n8n execution.');
}
console.log('Standard receipt, duplicate receipt, conflicting records, empty input, invalid amount and unconfirmed status passed.');

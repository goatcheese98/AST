import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import DirectusService, { CmsError, parseRecipe, recipePath } from '../src/services/directus.ts';
const fixture = JSON.parse(readFileSync(new URL('./fixtures/recipes.json', import.meta.url), 'utf8'));
const response = (body: unknown, status = 200) => async () => new Response(JSON.stringify(body), { status });
test('validates real field shapes, quantities, relations, IDs and optional image without inventing defaults', async () => {
  const client = new DirectusService('https://cms.invalid/', response(fixture));
  const [recipe, missing] = await client.getRecipes();
  assert.equal(recipe.title, fixture.data[0].title);
  assert.deepEqual(recipe.ingredients, ['Fixture bread', '2 slices fixture tomato']);
  assert.deepEqual(recipe.instructions, ['Fixture: toast the bread.', 'Fixture: layer the ingredients.', 'Fixture: close and serve.']);
  assert.deepEqual(recipe.categories, ['Sandwiches']);
  assert.equal(recipe.imageUrl, null);
  assert.equal(missing.imageUrl, 'https://cms.invalid/assets/missing-fixture-image');
  assert.deepEqual(missing.instructions, []);
  assert.equal(recipePath({ id: 'a/b ?' }), '/recipes/a%2Fb%20%3F/');
});
test('only anonymous GET, no credentials, no redirects; encodes query and asset paths', async () => {
  let called = false;
  const transport: typeof fetch = async (url, init) => {
    called = true;
    assert.equal(new URL(String(url)).searchParams.get('fields'), '*,main_image.id,categories.categories_id.name');
    assert.equal(init?.headers, undefined);
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    return new Response('{"data":[]}');
  };
  const client = new DirectusService('https://cms.invalid/prefix/', transport);
  assert.deepEqual(await client.getRecipes(), []);
  assert.ok(called);
  assert.equal(client.getAssetUrl('a/b'), 'https://cms.invalid/prefix/assets/a%2Fb');
  assert.equal(client.getAssetUrl('..'), null);
  await assert.rejects(client.getRecipes(JSON.parse('{"access_token":"not-a-credential"}')), { code:'configuration' });
});
test('malformed data fails explicitly rather than becoming an empty collection', async () => {
  for (const data of [{}, { data: null }, { data: [null] }, { data: [{id:1,title:'',tags:[]}] },
    { data: [{id:1,title:'Title',tags:{}}] }, { data: [{id:1,title:'Title',instructions:[{}]}] }]) {
    await assert.rejects(new DirectusService('https://cms.invalid', response(data)).getRecipes(), { code:'malformed' });
  }
  assert.throws(() => parseRecipe({ id:1,title:'Title',main_image:{} }, () => null), CmsError);
  assert.throws(() => parseRecipe({ id:'..',title:'Title' }, () => null), CmsError);
  assert.throws(() => parseRecipe({ id:1,title:'Title',main_image:'..' }, () => null), CmsError);
});
test('missing configuration never calls network; credential URLs rejected', async () => {
  await assert.rejects(new DirectusService('', () => { throw Error('must not fetch'); }).getRecipes(), { code:'configuration' });
  for (const url of ['https://user:password@cms.invalid', 'file:///tmp/x', 'https://cms.invalid?access_token=no']) {
    assert.throws(() => new DirectusService(url), { code:'configuration' });
  }
});
test('HTTP and network errors expose no upstream body or URL', async () => {
  for (const fetcher of [response({errors:['private upstream detail']},403), async () => { throw Error('private upstream detail'); }]) {
    await assert.rejects(new DirectusService('https://cms.invalid',fetcher).getRecipes(), { message:'CMS unavailable' });
  }
});
test('timeout aborts slow transport and bounds body consumption', async () => {
  const stalled: typeof fetch = async (_url, options) => new Promise((_resolve, reject) => {
    options?.signal?.addEventListener('abort', () => reject(new Error('aborted')), {once:true});
  });
  await assert.rejects(new DirectusService('https://cms.invalid',stalled,20).getRecipes(), { code:'unavailable' });
});
test('aborts a real loopback response stalled during JSON body reading', async () => {
  const { createServer } = await import('node:http');
  const server = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type':'application/json' });
    res.write('{"data":['); // Intentionally never complete the response body.
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address === 'object');
    await assert.rejects(new DirectusService(`http://127.0.0.1:${address.port}`, fetch, 100).getRecipes(), { code:'unavailable' });
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
test('preserves SDK-style field/sort arrays and JSON filters at the REST boundary', async () => {
  const transport: typeof fetch = async url => {
    const params = new URL(String(url)).searchParams;
    assert.equal(params.get('fields'), 'id,title');
    assert.equal(params.get('sort'), '-date_published');
    assert.equal(params.get('filter'), '{"status":{"_eq":"published"}}');
    assert.equal(params.get('limit'), '1');
    return new Response('{"data":[]}');
  };
  await new DirectusService('https://cms.invalid', transport).getRecipes({
    fields: ['id','title'], sort: ['-date_published'], filter: { status: { _eq:'published' } }, limit:1,
  });
});

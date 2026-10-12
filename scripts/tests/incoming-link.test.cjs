const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/incomingLink.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:m.exports,module:m,URL});
const normalize=m.exports.normalizeIncomingLink;
for(const base of ['https://ziona.app','https://api.ziona.app','https://staging.ziona.app','https://api.staging.ziona.app','ziona:/','zionastaging:/']) {
 test(base+' post and profile links',()=>{
  assert.equal(normalize(base+'/post/abc-123?share=1#section'),'/viewer/abc-123');
  assert.equal(normalize(base+'/profile/user-123'),'/guest?userId=user-123');
  assert.equal(normalize(base+'/viewer/abc-123'),'/viewer/abc-123');
 });
}
test('unrelated routes and malformed IDs are preserved',()=>{
 for(const input of ['/guest?userId=123','exp+ziona://expo-development-client/?url=x','https://example.com/post/id','/post/a%2Fb','/post/%ZZ']) assert.equal(normalize(input),input);
});
test('both variants separate verified HTTPS filters from custom schemes',()=>{
 for(const variant of ['staging','production']) {
  process.env.APP_VARIANT=variant; delete require.cache[require.resolve('../../app.config.js')];
  const config=require('../../app.config.js').expo;
  const verified=config.android.intentFilters.filter(x=>x.autoVerify);
  assert.equal(verified.length,2);
  for(const filter of verified){assert.ok(filter.data.every(x=>x.scheme==='https'));assert.ok(filter.data.some(x=>x.pathPrefix==='/profile/'));}
  assert.ok(config.android.intentFilters.some(x=>!x.autoVerify&&x.data.some(d=>d.scheme===config.scheme)));
 }
});

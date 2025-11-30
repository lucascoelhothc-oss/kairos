const fs = require('fs'); const base = process.env.BASE_URL || 'http://localhost:10000'; 
(async () => { 
  const out = []; const now = new Date().toISOString(); out.push(`SMOKE TEST RUN: ${now}\n`); 
  const check = async (name, fn) => { 
      try { 
          const r = await fn(); 
          out.push(`${name}: ${JSON.stringify(r)}\n`); 
      } catch (e) { 
          out.push(`${name} ERROR: ${e && e.message ? e.message : e}\n`); 
          if (e && e.stack) out.push(`${e.stack}\n`);
          if (e && e.code) out.push(`CODE: ${e.code}\n`);
      } 
  };
  await check('/ready', async()=>(await fetch(`${base}/ready`)).json());
  await check('/status', async()=>(await fetch(`${base}/status`)).json());
  await check('/landing', async()=>(await fetch(`${base}/landing`)).text().then(t=>({length:t.length})));
  await check('/landing/subscribe', async()=>(await fetch(`${base}/landing/subscribe`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'test@example.com'})})).json());
  await check('/chat', async()=>(await fetch(`${base}/chat`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:'oi'})})).json());
  await check('/chat/history', async()=>(await fetch(`${base}/chat/history`)).json());
  try {
    fs.writeFileSync('../validation.log', out.join('\n'), 'utf8'); 
    console.log('SMOKE TESTS COMPLETED, validation.log written.'); 
  } catch(e) {
    try { fs.writeFileSync('./validation.log', out.join('\n'), 'utf8'); console.log('SMOKE TESTS COMPLETED, local validation.log written.'); }
    catch (err) { console.error('Failed to write validation logs:', err); }
  }
  process.exit(0); 
})();
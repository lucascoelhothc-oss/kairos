const { createClient } = require('@supabase/supabase-js'); const logger = require('../lib/logger'); require('dotenv').config(); 
const url = process.env.SUPABASE_URL; 
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; 
let client;
if (!url || !key || url.includes("your-project")) { 
    logger.warn("[SUPABASE] Mock mode active."); 
    client = { 
        auth: { getUser: async()=>({data:{user:{id:'mock'}}}) }, 
        from: ()=>({ select: ()=>({ eq: ()=>({ single: async()=>({data:null}), limit: async()=>({data:[]}) }) }), insert: ()=>({ select: ()=>({ single: async()=>({data:{id:1}}) }) }) }) 
    }; 
} else { 
    client = createClient(url, key); 
} 
module.exports = client;
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const FAST2SMS_KEY = process.env.FAST2SMS_KEY;

function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

app.post('/send-otp', async (req, res) => {
    const { phone, count } = req.body;
    const numTimes = Math.min(count, 20);
    let sent = 0;

    try {
        for(let i=0;i<numTimes;i++){
            const otp = Math.floor(100000 + Math.random() * 900000);
            await fetch('https://www.fast2sms.com/dev/bulkV2', {
                method:'POST',
                headers:{ 'authorization': FAST2SMS_KEY, 'Content-Type':'application/json' },
                body: JSON.stringify({
                    route:"v3",
                    message:`Your OTP is ${otp}`,
                    language:"english",
                    flash:0,
                    numbers:phone
                })
            });
            sent++;
            await sleep(Math.floor(Math.random()*2000)+1000);
        }
        res.json({ success:true, message:`${sent} OTP sent to ${phone}` });
    } catch(err){
        res.json({ success:false, message:"SMS failed", error:err.toString() });
    }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
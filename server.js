// Team ALPHA - Microgreens Project
// Little Angels School, Visakhapatnam
// Kaushal Bodh Initiative
// ULTIMATE EDITION with all features!

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));

// ============ TEST ROUTE ============
app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'OK', 
        groqKey: process.env.GROQ_API_KEY ? 'Groq key loaded ✅' : 'Groq key MISSING ❌',
        perenualKey: process.env.PERENUAL_API_KEY ? 'Perenual key loaded ✅' : 'Perenual key MISSING ❌'
    });
});

// ============ PLANTS API ROUTES ============
app.get('/api/plant/search', async (req, res) => {
    const plantName = req.query.q || 'basil';
    console.log('🔍 Plant search for:', plantName);
    
    try {
        const url = `https://perenual.com/api/species-list?key=${process.env.PERENUAL_API_KEY}&q=${plantName}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            return res.status(400).json({ error: data.error });
        }
        
        if (data.data && data.data.length > 0) {
            const cleanData = data.data.map(plant => ({
                id: plant.id,
                common_name: plant.common_name || 'Unknown Plant',
                scientific_name: plant.scientific_name || [],
                watering: plant.watering && !plant.watering.includes('Upgrade') ? plant.watering : 'Water regularly',
                sunlight: plant.sunlight && !plant.sunlight.includes('Upgrade') ? plant.sunlight : ['Full sun'],
                cycle: plant.cycle && !plant.cycle.includes('Upgrade') ? plant.cycle : 'Annual',
                default_image: plant.default_image && !plant.default_image.thumbnail.includes('upgrade') ? plant.default_image : null
            }));
            
            res.json({ data: cleanData, total: cleanData.length });
        } else {
            res.json({ data: [], total: 0, message: 'No plants found' });
        }
        
    } catch (error) {
        console.error('❌ Plant API error:', error.message);
        res.status(500).json({ error: 'Plant API failed: ' + error.message });
    }
});

// ============ WEATHER API (Visakhapatnam) ============
app.get('/api/weather', async (req, res) => {
    try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=17.6868&longitude=83.2185&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia/Kolkata';
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('❌ Weather error:', error.message);
        res.status(500).json({ error: 'Weather failed' });
    }
});

// ============ GROQ AI CHATBOT (PLANTO) ============
app.post('/api/planto', async (req, res) => {
    const userMessage = req.body.message;
    console.log('🔍 Planto received:', userMessage);
    
    const systemPrompt = `You are Planto, a friendly and knowledgeable plant expert assistant created by Team ALPHA (Class 8A, Little Angels School, Visakhapatnam) for their Kaushal Bodh hydroponics project. 
    
    Your personality:
    - You're enthusiastic, encouraging, and genuinely excited about plants
    - You give DETAILED, thorough answers (not just one-liners)
    - You explain concepts clearly so a Class 8 student can understand
    - You share interesting facts and tips
    - You love talking about hydroponics and microgreens
    - You're proud of Team ALPHA's project
    - You use emojis occasionally 🌱
    - You ask follow-up questions to keep the conversation going
    
    Current context: Team ALPHA is growing microgreens using hydroponics. They started Monday and today is Friday. They have 9 members (Roll No 1-9).
    
    When answering:
    - Give detailed explanations (100-200 words)
    - Include practical tips
    - Share fun facts
    - End with a question to engage the user
    - Be conversational and friendly`;

    try {
        console.log('📡 Sending to Groq...');
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.9,
                max_tokens: 500
            })
        });
        
        console.log('📥 Status:', response.status);
        
        const data = await response.json();
        
        if (data.error) {
            console.error('❌ Groq error:', JSON.stringify(data.error));
            return res.status(500).json({ error: data.error.message || 'Groq API error' });
        }
        
        if (!data.choices || !data.choices[0]) {
            console.error('❌ No choices in response');
            return res.status(500).json({ error: 'No response from Groq' });
        }
        
        console.log('✅ Success!');
        res.json({ reply: data.choices[0].message.content });
        
    } catch (error) {
        console.error('❌ Exception:', error.message);
        res.status(500).json({ error: error.message || 'Planto failed' });
    }
});
// ============ PLANT DISEASE DETECTOR (SIMPLE) ============
app.post('/api/detect-disease', async (req, res) => {
    const imageBase64 = req.body.image;
    console.log('🔬 Disease detection requested');
    
    if (!imageBase64) {
        return res.status(400).json({ error: 'No image provided' });
    }
    
    try {
        console.log('📡 Sending image to Groq Vision...');
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'qwen/qwen3.6-27b',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Analyze this plant image. At the very END of your response, write EXACTLY one of these two words: HEALTHY or DISEASED'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: imageBase64
                                }
                            }
                        ]
                    }
                ],
                temperature: 0.3,
                max_tokens: 800
            })
        });
        
        console.log('📥 Status:', response.status);
        
        const data = await response.json();
        
        if (data.error) {
            console.error('❌ Groq vision error:', data.error);
            return res.status(500).json({ error: data.error.message || 'Vision API failed' });
        }
        
        const fullAnalysis = data.choices[0].message.content;
        console.log('📦 Full analysis received!');
        
        // Check the LAST word of the analysis
        const lastWord = fullAnalysis.trim().split(/\s+/).pop().toUpperCase();
        console.log('📋 Last word:', lastWord);
        
        const isHealthy = lastWord === 'HEALTHY';
        
        const result = {
            isHealthy: isHealthy,
            diagnosis: fullAnalysis,
            treatment: isHealthy 
                ? 'Plant is healthy. Maintain regular care.'
                : 'Plant is diseased. Isolate and treat immediately.'
        };
        
        console.log('✅ Diagnosis complete! Verdict:', isHealthy ? 'HEALTHY ✅' : 'DISEASED ⚠️');
        res.json(result);
        
    } catch (error) {
        console.error('❌ Disease detection error:', error.message);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

// ============ VIEW COUNTER ============
let viewCount = 0;

app.get('/api/count', (req, res) => {
    viewCount++;
    res.json({ count: viewCount });
});

app.listen(PORT, () => {
    console.log('🌱 Team ALPHA ULTIMATE server running on http://localhost:' + PORT);
    console.log('🔑 Groq API:', process.env.GROQ_API_KEY ? 'Connected ✅' : 'Missing ❌');
    console.log('🔑 Perenual API:', process.env.PERENUAL_API_KEY ? 'Connected ✅' : 'Missing ❌');
    console.log('🌤️ Weather API: Free (Open-Meteo) ✅');
});
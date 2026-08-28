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
app.use(express.json());
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
        // Using Open-Meteo free API (no key needed!)
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
    
    const systemPrompt = `You are Planto, a friendly plant expert assistant created by Team ALPHA (Class 8A, Little Angels School, Visakhapatnam) for their Kaushal Bodh hydroponics project. 
    
    Your personality:
    - You're enthusiastic and encouraging
    - You use simple language a Class 8 student would understand
    - You love talking about hydroponics and microgreens
    - You give practical, actionable advice
    - You're proud of Team ALPHA's project
    - You use emojis occasionally 🌱
    
    Current context: Team ALPHA is growing microgreens using hydroponics. They started Monday and today is Friday. They have 9 members (Roll No 1-9).
    
    Keep responses under 150 words unless specifically asked for more detail.`;

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'qwen/qwen-3.8-27b',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            return res.status(500).json({ error: data.error.message || 'Groq API error' });
        }
        
        res.json({ reply: data.choices[0].message.content });
        
    } catch (error) {
        console.error('❌ Full error:', error);
        res.status(500).json({ error: error.message || 'Planto failed' });
    }
});

app.listen(PORT, () => {
    console.log('🌱 Team ALPHA ULTIMATE server running on http://localhost:' + PORT);
    console.log('🔑 Groq API:', process.env.GROQ_API_KEY ? 'Connected ✅' : 'Missing ❌');
    console.log('🔑 Perenual API:', process.env.PERENUAL_API_KEY ? 'Connected ✅' : 'Missing ❌');
    console.log('🌤️ Weather API: Free (Open-Meteo) ✅');
});
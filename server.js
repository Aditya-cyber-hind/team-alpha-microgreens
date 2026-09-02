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

// ============ PLANT DISEASE DETECTOR (TWO-STEP WITH DETAILED OUTPUT) ============
app.post('/api/detect-disease', async (req, res) => {
    const imageBase64 = req.body.image;
    console.log('🔬 Disease detection requested');
    
    if (!imageBase64) {
        return res.status(400).json({ error: 'No image provided' });
    }
    
    try {
        console.log('📡 Step 1: Analyzing image with Vision AI...');
        
        // Step 1: Use vision model to analyze the image
        const visionResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                                text: 'Describe this plant image in detail. Include: appearance, color, texture, any spots/mold/discoloration/wilting/pests, overall health assessment. Answer in 3-4 detailed sentences. Do NOT show thinking.'
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
                max_tokens: 300
            })
        });
        
        const visionData = await visionResponse.json();
        
        if (visionData.error) {
            console.error('❌ Vision error:', visionData.error);
            return res.status(500).json({ error: visionData.error.message || 'Vision API failed' });
        }
        
        let analysis = visionData.choices[0].message.content;
        console.log('📝 Raw vision analysis:', analysis.substring(0, 200));
        
        // CLEAN THE ANALYSIS - Remove thinking blocks and markdown
        analysis = analysis
            .replace(/<think>[\s\S]*?<\/think>/g, '')
            .replace(/\*\*/g, '')
            .replace(/-\s*\*.*?\*/g, '')
            .replace(/\d+\.\s*\*.*?\*/g, '')
            .replace(/The user wants.*?\./g, '')
            .replace(/Drafting the response:[\s\S]*$/g, '')
            .replace(/Based on.*?\./g, '')
            .replace(/Let me.*?\./g, '')
            .replace(/I (see|observe|notice).*?\./g, '')
            .trim();
        
        // If analysis is empty after cleaning, use fallback
        if (analysis.length < 20) {
            analysis = 'The plant appears to be sprouts or microgreens with green leaves and white stems. No obvious signs of disease visible.';
        }
        
        console.log('📝 Cleaned analysis:', analysis.substring(0, 200));
        
        // Step 2: Use text model for DETAILED, DYNAMIC JSON output
        console.log('📡 Step 2: Generating detailed response...');
        
        const textResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b',
                messages: [
                    {
                        role: 'system',
                        content: `You are a plant disease expert AI. Based on the plant analysis provided, create a DETAILED diagnosis.
                        
                        Output ONLY valid JSON in this format:
                        {
                            "isHealthy": true/false,
                            "diagnosis": "Detailed 30-50 word diagnosis explaining what you see and why",
                            "treatment": "Detailed 30-50 word treatment plan with specific care instructions",
                            "funFact": "An interesting fact about this type of plant",
                            "confidence": "High/Medium/Low confidence in this diagnosis"
                        }
                        
                        Rules:
                        - Make diagnosis DETAILED and specific
                        - Make treatment PRACTICAL and actionable
                        - Include a fun fact about the plant type
                        - Be conversational but professional
                        - Output ONLY the JSON, no markdown, no code blocks`
                    },
                    {
                        role: 'user',
                        content: `Plant analysis: "${analysis}"
                        
                        Create a detailed JSON diagnosis.`
                    }
                ],
                temperature: 0.8,
                max_tokens: 400
            })
        });
        
        const textData = await textResponse.json();
        
        if (textData.error) {
            console.error('❌ Text model error:', textData.error);
            return res.status(500).json({ error: textData.error.message || 'Text API failed' });
        }
        
        let content = textData.choices[0].message.content;
        console.log('📦 Raw text response:', content);
        
        // Clean the text response
        content = content
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        
        // Parse the JSON
        let result;
        try {
            result = JSON.parse(content);
        } catch (directParseError) {
            try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    result = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found');
                }
            } catch (extractError) {
                console.error('❌ Parse failed, using fallback');
                const looksHealthy = !/disease|mold|rot|spots|wilting|yellowing|pest|fungus|brown|black/i.test(analysis);
                result = {
                    isHealthy: looksHealthy,
                    diagnosis: looksHealthy 
                        ? 'The plant appears healthy with vibrant green leaves and strong stems. No signs of disease, mold, or pest damage visible.' 
                        : 'The plant shows potential signs of stress. Further inspection recommended for spots, discoloration, or unusual growth patterns.',
                    treatment: looksHealthy 
                        ? 'Maintain current care routine. Ensure proper light, water regularly, and monitor for any changes over the next few days.' 
                        : 'Isolate from other plants. Remove affected areas if possible and apply appropriate organic treatment.',
                    funFact: 'Microgreens can contain up to 40x more nutrients than mature plants!',
                    confidence: 'Medium'
                };
            }
        }
        
        console.log('✅ Diagnosis complete!');
        res.json(result);
        
    } catch (error) {
        console.error('❌ Disease detection error:', error.message);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

app.listen(PORT, () => {
    console.log('🌱 Team ALPHA ULTIMATE server running on http://localhost:' + PORT);
    console.log('🔑 Groq API:', process.env.GROQ_API_KEY ? 'Connected ✅' : 'Missing ❌');
    console.log('🔑 Perenual API:', process.env.PERENUAL_API_KEY ? 'Connected ✅' : 'Missing ❌');
    console.log('🌤️ Weather API: Free (Open-Meteo) ✅');
});
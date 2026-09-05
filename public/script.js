// Team ALPHA - Microgreens Project
// ULTIMATE JavaScript with all features!

// ============ DARK MODE ============
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const darkModeBtn = document.querySelector('.dark-mode-toggle');
    if (document.body.classList.contains('dark-mode')) {
        darkModeBtn.textContent = '☀️';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        darkModeBtn.textContent = '🌙';
        localStorage.setItem('darkMode', 'disabled');
    }
}

if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.querySelector('.dark-mode-toggle').textContent = '☀️';
}

// ============ MOBILE MENU ============
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// ============ TIMELINE DATA ============
const timelineData = {
    1: {
        day: "Day 1 - Monday",
        image: "/images/day3.jpeg",
        caption: "We started our microgreens journey! Soaked the seeds overnight to wake them up."
    },
    2: {
        day: "Day 2 - Tuesday",
        image: "/images/day5.jpeg",
        caption: "The seeds are starting to swell! We set up our hydroponic tray with the growing medium."
    },
    3: {
        day: "Day 3 - Wednesday",
        image: "/images/day1.jpeg",
        caption: "Tiny white roots are appearing! The seeds are sprouting - this is so exciting!"
    },
    4: {
        day: "Day 4 - Thursday",
        image: "/images/day4.jpeg",
        caption: "Small green leaves (cotyledons) are visible! The microgreens are reaching for the light."
    },
    5: {
        day: "Day 5 - Friday",
        image: "/images/day2.jpeg",
        caption: "Look at them grow! Beautiful green microgreens ready to harvest soon. Team ALPHA success!"
    }
};

// ============ TIMELINE FUNCTIONALITY ============
const dayButtons = document.querySelectorAll('.day-btn');
const timelineImg = document.getElementById('timelineImg');
const timelineCaption = document.getElementById('timelineCaption');

dayButtons.forEach(button => {
    button.addEventListener('click', function() {
        dayButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        const day = this.dataset.day;
        const data = timelineData[day];
        
        timelineImg.src = data.image;
        timelineImg.alt = data.day;
        timelineCaption.innerHTML = `<h3>${data.day}</h3><p>${data.caption}</p>`;
    });
});

// ============ ANIMATED COUNTERS ============
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        let current = 0;
        const increment = target / 50;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            observer.unobserve(entry.target);
        }
    });
});

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    observer.observe(statsSection);
}

// ============ TEAM DATA ============
const teamMembers = [
    { roll: 1, name: "Aditya Choudhary" },
    { roll: 2, name: "Atmik Biswas" },
    { roll: 3, name: "G. Bokam" },
    { roll: 4, name: "Hari Vignesh" },
    { roll: 5, name: "P. Havish" },
    { roll: 6, name: "Hritvik Bisoyi" },
    { roll: 7, name: "G.J. Aashish" },
    { roll: 8, name: "G. John Stephen" },
    { roll: 9, name: "Kunal Sekhani" }
];

const teamGrid = document.getElementById('teamGrid');

teamMembers.forEach(member => {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.innerHTML = `
        <div class="team-avatar">${member.roll}</div>
        <h4>${member.name}</h4>
        <p>Roll No. ${member.roll}</p>
    `;
    teamGrid.appendChild(card);
});

// ============ WEATHER API ============
async function loadWeather() {
    try {
        const response = await fetch('/api/weather');
        const data = await response.json();
        
        const weatherCard = document.getElementById('weatherCard');
        const temp = data.current.temperature_2m;
        const humidity = data.current.relative_humidity_2m;
        const weatherCode = data.current.weather_code;
        
        let weatherEmoji = '🌤️';
        if (weatherCode <= 3) weatherEmoji = '☀️';
        else if (weatherCode <= 48) weatherEmoji = '🌫️';
        else if (weatherCode <= 67) weatherEmoji = '🌧️';
        else if (weatherCode <= 77) weatherEmoji = '❄️';
        else weatherEmoji = '⛈️';
        
        weatherCard.innerHTML = `
            <div class="weather-icon">${weatherEmoji}</div>
            <div class="weather-temp">${temp}°C</div>
            <div class="weather-info">
                <p>Humidity: ${humidity}%</p>
                <p>📍 Visakhapatnam, India</p>
            </div>
        `;
    } catch (error) {
        document.getElementById('weatherCard').innerHTML = '<p>Weather data unavailable</p>';
    }
}

loadWeather();

// ============ PLANTS API FUNCTIONALITY ============
async function searchPlants() {
    const searchTerm = document.getElementById('plantSearch').value;
    const resultsDiv = document.getElementById('plantResults');
    
    if (!searchTerm) {
        alert('Please enter a plant name!');
        return;
    }
    
    resultsDiv.innerHTML = '<p>Searching for plants... 🌱</p>';
    
    try {
        const response = await fetch(`/api/plant/search?q=${searchTerm}`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            resultsDiv.innerHTML = '';
            data.data.forEach(plant => {
                const card = document.createElement('div');
                card.className = 'plant-card';
                
                let plantInfo = `
                    <h4>${plant.common_name || 'Unknown Plant'}</h4>
                    <p><strong>Scientific Name:</strong> <em>${plant.scientific_name?.[0] || 'N/A'}</em></p>
                `;
                
                if (plant.watering) {
                    plantInfo += `<p><strong>Watering:</strong> ${plant.watering}</p>`;
                }
                
                if (plant.sunlight) {
                    plantInfo += `<p><strong>Sunlight:</strong> ${Array.isArray(plant.sunlight) ? plant.sunlight.join(', ') : plant.sunlight}</p>`;
                }
                
                if (plant.cycle) {
                    plantInfo += `<p><strong>Life Cycle:</strong> ${plant.cycle}</p>`;
                }
                
                card.innerHTML = plantInfo;
                resultsDiv.appendChild(card);
            });
        } else {
            resultsDiv.innerHTML = '<p>No plants found. Try another search! 🌿</p>';
        }
    } catch (error) {
        resultsDiv.innerHTML = '<p>Error loading plants. Please try again.</p>';
    }
}

// ============ RANDOM PLANT FACTS ============
const plantFacts = [
    "Microgreens can contain up to 40 times more nutrients than their mature counterparts!",
    "Hydroponic plants grow 30-50% faster than soil-grown plants.",
    "NASA uses hydroponics to grow food in space!",
    "The first hydroponic systems were used in the Hanging Gardens of Babylon.",
    "Hydroponics uses 90% less water than traditional farming.",
    "Some microgreens are ready to harvest in just 7 days!",
    "Plants grown hydroponically don't need pesticides because there's no soil-borne diseases.",
    "The word 'hydroponics' comes from Greek: 'hydro' (water) and 'ponos' (labor).",
    "You can grow microgreens all year round with hydroponics!",
    "Basil microgreens are packed with vitamins A, C, and K!"
];

function getRandomFact() {
    const factElement = document.getElementById('randomFact');
    const randomIndex = Math.floor(Math.random() * plantFacts.length);
    factElement.textContent = plantFacts[randomIndex];
}

getRandomFact();

// ============ QUIZ SYSTEM ============
const quizQuestions = [
    {
        question: "What is hydroponics?",
        options: ["Growing plants in soil", "Growing plants in water with nutrients", "Growing plants in sand", "Growing plants in air"],
        correct: 1
    },
    {
        question: "How much more nutrients do microgreens have compared to mature plants?",
        options: ["Same amount", "2x more", "Up to 40x more", "10x more"],
        correct: 2
    },
    {
        question: "How much water does hydroponics save compared to traditional farming?",
        options: ["10%", "25%", "50%", "90%"],
        correct: 3
    },
    {
        question: "Which organization uses hydroponics in space?",
        options: ["ISRO", "NASA", "ESA", "All of the above"],
        correct: 3
    }
];

let currentQuestion = 0;
let score = 0;

function startQuiz() {
    currentQuestion = 0;
    score = 0;
    document.getElementById('quizBtn').style.display = 'none';
    document.getElementById('quizResult').textContent = '';
    showQuestion();
}

function showQuestion() {
    const question = quizQuestions[currentQuestion];
    const questionElement = document.getElementById('quizQuestion');
    const optionsElement = document.getElementById('quizOptions');
    
    questionElement.textContent = `Question ${currentQuestion + 1}: ${question.question}`;
    optionsElement.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'quiz-option';
        optionDiv.textContent = option;
        optionDiv.addEventListener('click', () => selectAnswer(index));
        optionsElement.appendChild(optionDiv);
    });
}

function selectAnswer(index) {
    if (index === quizQuestions[currentQuestion].correct) {
        score++;
    }
    
    currentQuestion++;
    
    if (currentQuestion < quizQuestions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    const questionElement = document.getElementById('quizQuestion');
    const optionsElement = document.getElementById('quizOptions');
    const resultElement = document.getElementById('quizResult');
    const quizBtn = document.getElementById('quizBtn');
    
    questionElement.textContent = 'Quiz Complete! 🎉';
    optionsElement.innerHTML = '';
    resultElement.textContent = `You scored ${score} out of ${quizQuestions.length}!`;
    
    if (score === quizQuestions.length) {
        resultElement.textContent += ' 🏆 Perfect Score!';
    } else if (score >= quizQuestions.length / 2) {
        resultElement.textContent += ' 🌱 Good job!';
    } else {
        resultElement.textContent += ' 📚 Keep learning!';
    }
    
    quizBtn.textContent = 'Restart Quiz';
    quizBtn.style.display = 'block';
}

// ============ LIGHTBOX ============
function openLightbox(element) {
    const img = element.querySelector('img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    lightboxImg.src = img.src;
    lightbox.classList.add('active');
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});

// ============ CHATBOT (PLANTO) ============
function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.toggle('active');
}

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    const chatMessages = document.getElementById('chatMessages');
    
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'message user-message';
    userMessageDiv.textContent = message;
    chatMessages.appendChild(userMessageDiv);
    
    userInput.value = '';
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.textContent = 'Planto is thinking... 🤔';
    chatMessages.appendChild(typingDiv);
    
    try {
        const response = await fetch('/api/planto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        
        chatMessages.removeChild(typingDiv);
        
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'message bot-message';
        botMessageDiv.textContent = data.reply;
        chatMessages.appendChild(botMessageDiv);
        
        // Speak Planto's reply (with auto language detection)
        speakText(data.reply);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        chatMessages.removeChild(typingDiv);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message bot-message';
        errorDiv.textContent = 'Sorry, I had a brain freeze! Try again. 🌱';
        chatMessages.appendChild(errorDiv);
    }
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// ============ VOICE-CONTROLLED PLANTO ============
let isListening = false;
let recognition = null;

function startVoiceInput() {
    const voiceBtn = document.getElementById('voiceBtn');
    const userInput = document.getElementById('userInput');
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice input not supported in this browser. Please use Chrome!');
        return;
    }
    
    if (isListening) {
        recognition.stop();
        isListening = false;
        voiceBtn.classList.remove('listening');
        voiceBtn.textContent = '🎤';
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = function() {
        isListening = true;
        voiceBtn.classList.add('listening');
        voiceBtn.textContent = '🔴';
        userInput.placeholder = 'Listening... Speak now!';
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        userInput.placeholder = 'Ask me anything about plants...';
        sendMessage();
    };
    
    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        isListening = false;
        voiceBtn.classList.remove('listening');
        voiceBtn.textContent = '🎤';
        userInput.placeholder = 'Ask me anything about plants...';
    };
    
    recognition.onend = function() {
        isListening = false;
        voiceBtn.classList.remove('listening');
        voiceBtn.textContent = '🎤';
        userInput.placeholder = 'Ask me anything about plants...';
    };
    
    recognition.start();
}

// ============ TEXT-TO-SPEECH (50+ LANGUAGES AUTO-DETECTION) ============
function detectLanguage(text) {
    const languagePatterns = [
        // Indian Languages (30)
        { lang: 'hi-IN', name: 'Hindi', pattern: /[\u0900-\u097F]/ },
        { lang: 'bn-IN', name: 'Bengali', pattern: /[\u0980-\u09FF]/ },
        { lang: 'te-IN', name: 'Telugu', pattern: /[\u0C00-\u0C7F]/ },
        { lang: 'ta-IN', name: 'Tamil', pattern: /[\u0B80-\u0BFF]/ },
        { lang: 'gu-IN', name: 'Gujarati', pattern: /[\u0A80-\u0AFF]/ },
        { lang: 'kn-IN', name: 'Kannada', pattern: /[\u0C80-\u0CFF]/ },
        { lang: 'ml-IN', name: 'Malayalam', pattern: /[\u0D00-\u0D7F]/ },
        { lang: 'pa-IN', name: 'Punjabi', pattern: /[\u0A00-\u0A7F]/ },
        { lang: 'or-IN', name: 'Odia', pattern: /[\u0B00-\u0B7F]/ },
        { lang: 'ur-IN', name: 'Urdu', pattern: /[\u0600-\u06FF]/ },
        { lang: 'ne-IN', name: 'Nepali', pattern: /[\u0900-\u097F]/ },
        { lang: 'si-IN', name: 'Sinhala', pattern: /[\u0D80-\u0DFF]/ },
        { lang: 'my-IN', name: 'Burmese', pattern: /[\u1000-\u109F]/ },
        { lang: 'bo-IN', name: 'Tibetan', pattern: /[\u0F00-\u0FFF]/ },
        { lang: 'sat-IN', name: 'Santali', pattern: /[\u1C50-\u1C7F]/ },
        { lang: 'mni-IN', name: 'Manipuri', pattern: /[\uABC0-\uABFF]/ },
        { lang: 'sa-IN', name: 'Sanskrit', pattern: /[\u0900-\u097F]/ },
        { lang: 'kok-IN', name: 'Konkani', pattern: /[\u0900-\u097F]/ },
        { lang: 'mai-IN', name: 'Maithili', pattern: /[\u0900-\u097F]/ },
        { lang: 'doi-IN', name: 'Dogri', pattern: /[\u0900-\u097F]/ },
        { lang: 'brx-IN', name: 'Bodo', pattern: /[\u0900-\u097F]/ },
        { lang: 'bho-IN', name: 'Bhojpuri', pattern: /[\u0900-\u097F]/ },
        { lang: 'mag-IN', name: 'Magahi', pattern: /[\u0900-\u097F]/ },
        { lang: 'raj-IN', name: 'Rajasthani', pattern: /[\u0900-\u097F]/ },
        { lang: 'ks-IN', name: 'Kashmiri', pattern: /[\u0600-\u06FF]/ },
        { lang: 'sd-IN', name: 'Sindhi', pattern: /[\u0600-\u06FF]/ },
        { lang: 'dz-IN', name: 'Dzongkha', pattern: /[\u0F00-\u0FFF]/ },
        { lang: 'bpy-IN', name: 'Bishnupriya', pattern: /[\u0980-\u09FF]/ },
        { lang: 'as-IN', name: 'Assamese', pattern: /[\u0980-\u09FF]/ },
        { lang: 'mr-IN', name: 'Marathi', pattern: /[\u0900-\u097F]/ },
        
        // International Languages (20+)
        { lang: 'en-US', name: 'English', pattern: /[a-zA-Z]/ },
        { lang: 'es-ES', name: 'Spanish', pattern: /[áéíóúñ¿¡]/i },
        { lang: 'fr-FR', name: 'French', pattern: /[àâçéèêëîïôùûüœæ]/i },
        { lang: 'de-DE', name: 'German', pattern: /[äöüß]/i },
        { lang: 'zh-CN', name: 'Chinese', pattern: /[\u4E00-\u9FFF]/ },
        { lang: 'ja-JP', name: 'Japanese', pattern: /[\u3040-\u30FF]/ },
        { lang: 'ko-KR', name: 'Korean', pattern: /[\uAC00-\uD7AF]/ },
        { lang: 'ar-SA', name: 'Arabic', pattern: /[\u0600-\u06FF]/ },
        { lang: 'ru-RU', name: 'Russian', pattern: /[\u0400-\u04FF]/ },
        { lang: 'pt-BR', name: 'Portuguese', pattern: /[ãõáéíóúâêô]/i },
        { lang: 'it-IT', name: 'Italian', pattern: /[àèéìíîòóùú]/i },
        { lang: 'nl-NL', name: 'Dutch', pattern: /[éëïóöü]/i },
        { lang: 'pl-PL', name: 'Polish', pattern: /[ąćęłńóśźż]/i },
        { lang: 'tr-TR', name: 'Turkish', pattern: /[çğıöşü]/i },
        { lang: 'vi-VN', name: 'Vietnamese', pattern: /[ăâđêôơư]/i },
        { lang: 'th-TH', name: 'Thai', pattern: /[\u0E00-\u0E7F]/ },
        { lang: 'he-IL', name: 'Hebrew', pattern: /[\u0590-\u05FF]/ },
        { lang: 'el-GR', name: 'Greek', pattern: /[\u0370-\u03FF]/ },
        { lang: 'id-ID', name: 'Indonesian', pattern: /[a-zA-Z]/ },
        { lang: 'ms-MY', name: 'Malay', pattern: /[a-zA-Z]/ },
        { lang: 'fil-PH', name: 'Filipino', pattern: /[a-zA-Z]/ }
    ];
    
    // Check for non-English scripts first (more specific)
    for (const lang of languagePatterns) {
        if (lang.pattern.test(text)) {
            return { code: lang.lang, name: lang.name };
        }
    }
    
    // Default to English
    return { code: 'en-US', name: 'English' };
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Auto-detect language
        const detected = detectLanguage(text);
        utterance.lang = detected.code;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        console.log('🗣️ Speaking in:', detected.name, '(', detected.code, ')');
        
        // Get available voices and find matching language
        const voices = window.speechSynthesis.getVoices();
        
        if (voices.length > 0) {
            const matchingVoice = voices.find(voice => 
                voice.lang.startsWith(detected.code.split('-')[0])
            );
            
            if (matchingVoice) {
                utterance.voice = matchingVoice;
            } else {
                const fallbackVoice = voices.find(voice => 
                    voice.lang.includes(detected.code.split('-')[0])
                );
                if (fallbackVoice) utterance.voice = fallbackVoice;
            }
        }
        
        window.speechSynthesis.speak(utterance);
    }
}

// ============ PLANT DISEASE DETECTOR ============
let uploadedImageBase64 = '';

function previewImage(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const maxWidth = 800;
            const maxHeight = 800;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = height * (maxWidth / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = width * (maxHeight / height);
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            uploadedImageBase64 = canvas.toDataURL('image/jpeg', 0.7);
            
            const preview = document.getElementById('imagePreview');
            preview.src = uploadedImageBase64;
            preview.style.display = 'block';
            
            document.querySelector('.upload-placeholder').style.display = 'none';
            document.getElementById('detectBtn').style.display = 'block';
            document.getElementById('diagnosisResult').style.display = 'none';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

async function detectDisease() {
    const resultDiv = document.getElementById('diagnosisResult');
    const detectBtn = document.getElementById('detectBtn');
    
    if (!uploadedImageBase64) {
        alert('Please upload an image first!');
        return;
    }
    
    detectBtn.textContent = '🔬 Analyzing...';
    detectBtn.disabled = true;
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<p>🤖 AI is analyzing your plant...</p>';
    
    try {
        const response = await fetch('/api/detect-disease', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: uploadedImageBase64 })
        });
        
        const data = await response.json();
        
        if (data.error) {
            resultDiv.innerHTML = `<p style="color:red;">❌ ${data.error}</p>`;
            return;
        }
        
        resultDiv.innerHTML = `
            <h3>🔬 Dr. Planto's Detailed Report</h3>
            <p class="${data.isHealthy ? 'healthy' : 'diseased'}">
                ${data.isHealthy ? '✅ Plant looks healthy!' : '⚠️ Plant may have issues!'}
            </p>
            ${data.plantType ? `<h4>🌿 Plant Type:</h4><p>${data.plantType}</p>` : ''}
            ${data.growthStage ? `<h4>📈 Growth Stage:</h4><p>${data.growthStage}</p>` : ''}
            <h4>📋 Detailed Diagnosis:</h4>
            <p>${data.diagnosis || 'Analysis complete.'}</p>
            <h4>💊 Treatment Plan:</h4>
            <p>${data.treatment || 'Continue regular care.'}</p>
            ${data.funFact ? `<h4>💡 Scientific Fun Fact:</h4><p>${data.funFact}</p>` : ''}
            ${data.confidence ? `<h4>📊 Confidence Level:</h4><p>${data.confidence}</p>` : ''}
        `;
        
    } catch (error) {
        resultDiv.innerHTML = '<p style="color:red;">❌ Error analyzing plant. Please try again.</p>';
    } finally {
        detectBtn.textContent = '🔍 Analyze Plant';
        detectBtn.disabled = false;
    }
}

// ============ RATING SYSTEM ============
function rateProject(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.textContent = '⭐';
            star.classList.add('active');
        } else {
            star.textContent = '☆';
            star.classList.remove('active');
        }
    });
    
    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    ratings.push(rating);
    localStorage.setItem('ratings', JSON.stringify(ratings));
    
    const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    document.getElementById('ratingMessage').textContent = `You rated ${rating} star${rating > 1 ? 's' : ''}!`;
    document.getElementById('averageRating').textContent = `Average: ${avg.toFixed(1)} ⭐ (${ratings.length} ratings)`;
}

function loadRatings() {
    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    if (ratings.length > 0) {
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        document.getElementById('averageRating').textContent = `Average: ${avg.toFixed(1)} ⭐ (${ratings.length} ratings)`;
    }
}

loadRatings();

// ============ SOUND EFFECTS ============
function playSound(type) {
    const audio = new Audio();
    if (type === 'click') {
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
    } else if (type === 'hover') {
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
    }
    audio.volume = 0.3;
    audio.play().catch(() => {});
}

document.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON' || e.target.classList.contains('star') || e.target.classList.contains('gallery-item')) {
        playSound('click');
    }
});

// ============ GROWTH CALCULATOR ============
function calculateHarvest() {
    const plantType = document.getElementById('plantType').value;
    const startDate = document.getElementById('startDate').value;
    
    if (!startDate) {
        alert('Please select a start date!');
        return;
    }
    
    const growthDays = {
        radish: 6,
        broccoli: 8,
        sunflower: 12,
        pea: 12,
        basil: 17
    };
    
    const days = growthDays[plantType];
    const start = new Date(startDate);
    const harvest = new Date(start);
    harvest.setDate(harvest.getDate() + days);
    
    const today = new Date();
    const daysLeft = Math.ceil((harvest - today) / (1000 * 60 * 60 * 24));
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    document.getElementById('harvestDate').textContent = harvest.toLocaleDateString('en-US', options);
    document.getElementById('daysRemaining').textContent = daysLeft > 0 ? `${daysLeft} days remaining! 🌱` : 'Ready to harvest! 🎉';
    document.getElementById('harvestResult').style.display = 'block';
    
    playSound('click');
}

// ============ QR CODE GENERATOR ============
function generateQRCode() {
    const url = window.location.href;
    const qrContainer = document.getElementById('qrCode');
    
    qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}" alt="QR Code">`;
    document.getElementById('qrLink').textContent = url;
}

generateQRCode();

// ============ COMMENT SYSTEM ============
function addComment() {
    const name = document.getElementById('commentName').value.trim();
    const text = document.getElementById('commentText').value.trim();
    
    if (!name || !text) {
        alert('Please enter your name and comment!');
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    comments.push({
        name: name,
        text: text,
        date: new Date().toLocaleString()
    });
    localStorage.setItem('comments', JSON.stringify(comments));
    
    document.getElementById('commentName').value = '';
    document.getElementById('commentText').value = '';
    
    displayComments();
    playSound('click');
}

function displayComments() {
    const commentsList = document.getElementById('commentsList');
    
    // Check if element exists first
    if (!commentsList) {
        console.log('Comments section not found - skipping');
        return;
    }
    
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    
    if (comments.length === 0) {
        commentsList.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
        return;
    }
    
    commentsList.innerHTML = '';
    comments.forEach(comment => {
        const card = document.createElement('div');
        card.className = 'comment-card';
        card.innerHTML = `
            <h4>${comment.name}</h4>
            <p>${comment.text}</p>
            <span>${comment.date}</span>
        `;
        commentsList.appendChild(card);
    });
}

// Only call if element exists
if (document.getElementById('commentsList')) {
    displayComments();
}
// ============ SPLASH SCREEN ============
window.addEventListener('load', function() {
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
        // Remove splash screen after animation
        setTimeout(() => {
            splashScreen.style.display = 'none';
        }, 3000); // 3 seconds total
    }
});
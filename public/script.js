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

// Check for saved dark mode preference
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
        const increment = target / 50; // Animate over 50 steps
        
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

// Trigger counter animation when stats section is visible
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

// Close lightbox with Escape key
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
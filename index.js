const OpenAI = require("openai");
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const token = process.env.TELEGRAM_API_KEY;

// Set up the OpenAI API
const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
      api_key: openaiApiKey,
    });

// Create a new bot instance
const bot = new TelegramBot(token, { polling: true });

// Handle incoming messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text.toLowerCase();


var Sentiment = require('sentiment');
var sentiment = new Sentiment();

// Function to perform sentiment analysis and evaluate emotions
function analyzeEmotion(text) {
  const result = sentiment.analyze(text);

  // Map sentiment score to emotion
  if (result.score > 0) {
    return "Emotion: Happiness, Sentiment: Positive, Score"+result.score;
  } else if (result.score < 0) {
    return "Sadness, Sentiment: Positive, Score"+result.score;
  } else {
    // Neutral sentiment, check for additional details
    if (result.tokens.includes("hate")) {
      return "Disgust";
    } else if (result.tokens.includes("stupid")) {
      return "Anger";
    } else {
      return "Neutral";
    }
  }
}

// Example usage
const text1 = messageText;




console.log("Emotion for text1:", analyzeEmotion(text1)); // Output: Happiness

  


  try {
    const completion = await openai.chat.completions.create({
    messages: [{"role": "system", "content": messageText}],
    model: "gpt-3.5-turbo",
  });
    console.log(completion);
    console.log(completion.choices[0]);
        console.log(completion.choices[0].message.content);




  if (messageText.includes('cryptocurrency') || messageText.includes('crypto')) {
    // Send market trend and risk appetite to Telegram
    bot.sendMessage(chatId, `Market Trend: ${marketTrend}\nRisk Appetite: ${riskAppetite}`);
  }

  if (messageText.includes('article') || messageText.includes('subject')) {
    // Send articles from Google News to Telegram
       googleNews.search(messageText).then((articles) => {
      const numArticlesToSend = Math.min(10, articles.length);
      const articleTitles = articles.slice(0, numArticlesToSend).map((article) => article.title);
      bot.sendMessage(chatId, `Articles from Google News:\n${articleTitles.join('\n')}`);
  });
  };



    bot.sendMessage(chatId, completion.choices[0].message.content+"Emotion for text1:"+ analyzeEmotion(text1));
    console.log(completion.choices[0].text);
  } catch (error) {
    console.error('Error:', error.message);
  }
});

const GoogleNewsRSS = require('google-news-rss');
const { namedNode, literal, graph, Namespace } = require('rdflib');
const fs = require('fs');

// Set up the Google News RSS client
const googleNews = new GoogleNewsRSS();

// Create an RDF graph
const rdfGraph = graph();

// Define namespaces for the ontology
const newsNS = Namespace('http://example.com/news#');
const rdfNS = Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const rdfsNS = Namespace('http://www.w3.org/2000/01/rdf-schema#');
const owlNS = Namespace('http://www.w3.org/2002/07/owl#');

// Create named nodes for properties
const description = newsNS('description');
const pubDate = newsNS('pubDate');
const title = newsNS('title');
const type = newsNS('type');
const articleType = newsNS('Article');
const newsClass = newsNS('News');
const owlClass = owlNS('Class');
const owlOntology = owlNS('Ontology');

// Function to fetch and store news articles in an ontology
async function fetchAndStoreNews() {
  try {
    // Fetch news articles from Google News
    const articles = await googleNews.search('technology news');

    // Iterate over the articles and store them as RDF triples
    articles.forEach((article, index) => {
      const { title: articleTitle, pubDate: articlePubDate, description: articleDescription } = article;

      // Create named nodes for the article and its properties
      const articleNode = newsNS(`article${index + 1}`);
      const titleLiteral = literal(articleTitle);
      const pubDateLiteral = literal(articlePubDate);
      const descriptionLiteral = literal(articleDescription);

      // Add triples to the graph
      rdfGraph.add(articleNode, description, descriptionLiteral);
      rdfGraph.add(articleNode, pubDate, pubDateLiteral);
      rdfGraph.add(articleNode, title, titleLiteral);
      rdfGraph.add(articleNode, type, articleType);
      rdfGraph.add(articleNode, rdfNS('type'), articleType);
    });

    // Create ontology class and subclass declarations
    rdfGraph.add(articleType, rdfNS('type'), owlClass);
    rdfGraph.add(newsClass, rdfNS('type'), owlClass);
    rdfGraph.add(articleType, rdfsNS('subClassOf'), newsClass);

    // Add ontology metadata
    rdfGraph.add(owlOntology, rdfNS('type'), owlClass);
    rdfGraph.add(owlOntology, rdfsNS('label'), literal('News Ontology'));

    // Serialize the RDF graph to Turtle format
    const ontologyData = rdfGraph.toNT();

    // Save the ontology to a file
    fs.writeFileSync('news.owl', ontologyData, 'utf8');
    console.log('Ontology saved to news.owl');

    // Get the current state from the articles
    const currentState = getCurrentStateFromArticles(articles);
    console.log('Current State:', currentState);

    // Perform buy/sell decision based on the market trend, risk appetite, and current state
    performBuySellDecision(marketTrend, riskAppetite, currentState);

  } catch (error) {
    console.error('Error fetching news articles:', error);
  }
}

// Function to get the current state from the news articles
function getCurrentStateFromArticles(articles) {
  let positiveCount = 0;
  let negativeCount = 0;

  // Analyze each article and count positive and negative mentions
  articles.forEach((article) => {
    const { description } = article;

    // Perform simple sentiment analysis based on keywords
    if (description.includes('positive')) {
      positiveCount++;
    }
    if (description.includes('negative')) {
      negativeCount++;
    }
  });

  // Determine the current state based on the counts
  if (positiveCount > negativeCount) {
    return 'positive';
  } else if (negativeCount > positiveCount) {
    return 'negative';
  } else {
    return 'neutral';
  }
}

// Function to perform buy/sell decision based on market trend, risk appetite, and current state
function performBuySellDecision(marketTrend, riskAppetite, currentState) {
  // Add your buy/sell logic here based on marketTrend, riskAppetite, and currentState
  // This is just a placeholder implementation
  if (marketTrend === 'upward' && riskAppetite === 'high' && currentState === 'positive') {
    console.log('Buy');
  } else {
    console.log('Sell');
  }
}

// Set market trend and risk appetite variables
const marketTrend = 'upward';
const riskAppetite = 'high';

// Call the function to fetch and store news articles
fetchAndStoreNews();


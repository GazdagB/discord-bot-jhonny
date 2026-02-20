import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import { EmbedBuilder } from 'discord.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const fetchNews = async () => {
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        category: 'technology',
        language: 'en',
        pageSize: 10,
        apiKey: process.env.NEWS_API_KEY
      }
    });
    return response.data.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

const generateDailyNews = async (articles) => {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        { 
          role: 'user', 
          content: `Te egy tech hír bot vagy egy magyar Discord közösség számára, ahol programozók vannak.

Itt van ${articles.length} tech hír:
${JSON.stringify(articles, null, 2)}

FELADATOD:
1. Válaszd ki a TOP 4 legérdekesebb hírt programozóknak/fejlesztőknek
2. Fordítsd le őket magyarul

FONTOS: Válaszolj CSAK valid JSON formátumban, így:

[
  {
    "title": "Rövid, figyelemfelkeltő magyar cím (max 256 karakter)",
    "content": "Részletes fordítás magyarul - 3-4 bekezdés, engaging stílusban. (max 4000 karakter)",
    "url": "eredeti url",
    "imageUrl": "urlToImage mező értéke (ha van, ha nincs akkor null)"
  },
  {
    "title": "Rövid magyar cím",
    "content": "2-3 mondatos rövid összefoglaló magyarul (max 1024 karakter)",
    "url": "eredeti url",
    "imageUrl": "urlToImage mező értéke (ha van, ha nincs akkor null)"
  },
  {
    "title": "Rövid magyar cím",
    "content": "2-3 mondatos rövid összefoglaló magyarul (max 1024 karakter)",
    "url": "eredeti url",
    "imageUrl": "urlToImage mező értéke (ha van, ha nincs akkor null)"
  },
  {
    "title": "Rövid magyar cím",
    "content": "2-3 mondatos rövid összefoglaló magyarul (max 1024 karakter)",
    "url": "eredeti url",
    "imageUrl": "urlToImage mező értéke (ha van, ha nincs akkor null)"
  }
]

Az első elem a LEGÉRDEKESEBB programozóknak, ez kap részletes fordítást.
A többi 3 rövid összefoglalót kap.
Használj barátságos, casual magyar nyelvezetet!` 
        }
      ],
    });

    // Parse JSON response
    let jsonText = response.content[0].text.trim();
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error generating news:', error);
    return null;
  }
};

export async function getDailyTechNews() {
  console.log('📰 Fetching daily tech news...');
  
  const articles = await fetchNews();
  
  if (articles.length === 0) {
    console.log('❌ No articles found');
    return null;
  }
  
  console.log(`✅ Found ${articles.length} articles`);
  console.log('🤖 Generating Hungarian digest...');
  
  const newsArticles = await generateDailyNews(articles);
  
  if (newsArticles && newsArticles.length === 4) {
    console.log('✅ Generated 4 articles successfully');
    return newsArticles;
  }
  
  return null;
}

export async function postDailyNews(client) {
  console.log('📰 Running daily news task...');

  const channel = client.channels.cache.get(process.env.NEWS_CHANNEL_ID);

  if (!channel) {
    console.error('❌ News channel not found!');
    return;
  }

  try {
    const articles = await getDailyTechNews();

    if (articles && articles.length === 4) {
      await channel.send('**Jóóóóóreggelt Srácok!** ☀️\n\nMai 4 TOP hír amit neked programozóként tudnod kell:');

      const colors = ['#FF4500', '#0099FF', '#0099FF', '#0099FF'];
      const icons  = ['🔥', '💡', '⚡', '🚀'];
      const footer = ['Kiemelt hír', null, null, null];

      for (let i = 0; i < 4; i++) {
        const embed = new EmbedBuilder()
          .setColor(colors[i])
          .setTitle(`${icons[i]} ${articles[i].title}`)
          .setURL(articles[i].url)
          .setDescription(articles[i].content)
          .setTimestamp();

        if (footer[i]) embed.setFooter({ text: footer[i] });
        if (articles[i].imageUrl) embed.setImage(articles[i].imageUrl);

        await channel.send({ embeds: [embed] });
      }

      await channel.send('**Jó kódolást!** 💻');
      console.log('✅ Daily news posted successfully!');
    } else {
      console.error('❌ Failed to generate news articles');
    }
  } catch (error) {
    console.error('❌ Error posting daily news:', error);
  }
}
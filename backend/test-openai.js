require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testOpenAI() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI expert in the Enneagram system. Provide a brief response about Type 1."
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    console.log('OpenAI Connection Test:');
    console.log('Response:', completion.choices[0].message.content);
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing OpenAI connection:');
    console.error(error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testOpenAI();

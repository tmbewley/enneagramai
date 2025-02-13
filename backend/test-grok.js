require('dotenv').config();
const axios = require('axios');

async function testGrok() {
  try {
    const response = await axios.post(process.env.XAI_API_URL, {
      model: "grok-2-latest",
      messages: [
        {
          role: "system",
          content: "You are an AI expert in the Enneagram system. Provide a brief response about Type 1."
        },
        {
          role: "user",
          content: "Tell me about Type 1 in the Enneagram system."
        }
      ],
      stream: false,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('xAI Grok Connection Test:');
    console.log('Response:', response.data.choices[0].message.content);
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing xAI Grok connection:');
    console.error(error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testGrok();

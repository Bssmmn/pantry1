import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { image } = req.body;
    const apiKey = process.env.ROBOFLOW_API_KEY;

    try {
      const response = await axios.post(
        'https://detect.roboflow.com/pantry-scdeu/1',
        { image },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.error) {
        console.error('Error from Roboflow API:', response.data.error);
        res.status(500).json({ error: response.data.error });
      } else {
        const description = response.data.predictions[0]?.class || 'unknown';
        res.status(200).json({ description });
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      res.status(500).json({ error: 'Error analyzing image' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

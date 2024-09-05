import axios from 'axios';

const PROHIBITED_WORDS = ['badword1', 'badword2']; // Add more words as needed

export async function isContentSafe(content: string): Promise<boolean> {
    for (const word of PROHIBITED_WORDS) {
        if (content.toLowerCase().includes(word)) {
            return false;
        }
    }

    const response = await axios.post('https://api.example.com/moderate', { content });
    return response.data.isSafe;
}
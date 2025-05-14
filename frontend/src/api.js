const API_URL = 'http://localhost:3000/api';

export async function getCategories() {
    const res = await fetch(`${API_URL}/categories`);
    return res.json();
}

export async function getWords(category) {
    const res = await fetch(`${API_URL}/words/${category}`);
    return res.json();
}

export async function evaluateSentence(data) {
    const res = await fetch(`${API_URL}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function saveResult(data) {
    const res = await fetch(`${API_URL}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return res.json();
}

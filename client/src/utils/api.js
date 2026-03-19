const BASE = '/api';

export async function getModels() {
  const r = await fetch(`${BASE}/models`);
  return r.json();
}

export async function getConversations() {
  const r = await fetch(`${BASE}/conversations`);
  return r.json();
}

export async function createConversation(model) {
  const r = await fetch(`${BASE}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model }),
  });
  return r.json();
}

export async function getConversation(id) {
  const r = await fetch(`${BASE}/conversations/${id}`);
  return r.json();
}

export async function deleteConversation(id) {
  await fetch(`${BASE}/conversations/${id}`, { method: 'DELETE' });
}

export async function updateConversation(id, data) {
  const r = await fetch(`${BASE}/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return r.json();
}

export async function clearMessages(id) {
  const r = await fetch(`${BASE}/conversations/${id}/messages`, { method: 'DELETE' });
  return r.json();
}

// Returns a raw fetch Response for SSE streaming
export function sendMessage(conversationId, content, model) {
  return fetch(`${BASE}/conversations/${conversationId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, model }),
  });
}

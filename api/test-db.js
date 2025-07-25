import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  try {
    // 'test-key' 라는 이름으로 'Hello KV!' 값을 저장합니다.
    await kv.set('test-key', 'Hello from Vercel KV!');

    // 'test-key' 값을 다시 읽어옵니다.
    const value = await kv.get('test-key');

    // 성공 메시지와 함께 읽어온 값을 반환합니다.
    response.status(200).json({ success: true, value: value });
  } catch (error) {
    response.status(500).json({ success: false, error: error.message });
  }
}

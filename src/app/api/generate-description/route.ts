import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, category } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an expert e-commerce copywriter for a Bangladeshi e-commerce brand. Write an attractive, persuasive product description in Bengali for the following product:
Product Name: "${name}"
Category: "${category || 'General'}"

Format it with:
1. An engaging 2-sentence hook
2. Key features (bullet points)
3. Comfort & quality assurance
Keep it clean, natural, and friendly. Do not use markdown headers, just plain bullet points and text.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return NextResponse.json({ description: generatedText.trim() });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to smart template', geminiErr);
      }
    }

    // Smart Bengali E-commerce Generator (Free fallback)
    const smartFallback = `আমাদের এই "${name}" পণ্যটি প্রিমিয়াম মানের উপকরণ ও নিখুঁত ফিনিশিংয়ে তৈরি। নিত্যদিনের ব্যবহার কিংবা বিশেষ মুহূর্তের জন্য এটি আপনাকে দেবে ট্রেন্ডি লুক ও সর্বোচ্চ আরাম।

✨ মূল বৈশিষ্ট্যসমূহ:
• ১০০% প্রিমিয়াম ও টেকসই কোয়ালিটি
• আরামদায়ক ও নিখুঁত ফিনিশিং
• আকর্ষণীয় ও স্মার্ট ডিজাইন
• ক্যাজুয়াল ও দৈনন্দিন ব্যবহারের জন্য আদর্শ

🛡️ ক্যাশ অন ডেলিভারিতে দেখে শুনে মূল্য পরিশোধের সুবিধা এবং সারা দেশে দ্রুততম হোম ডেলিভারি!`;

    return NextResponse.json({ description: smartFallback });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
  }
}

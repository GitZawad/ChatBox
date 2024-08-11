import { Content } from "next/font/google";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { Messages } from "openai/resources/beta/threads/messages";

const systemPrompt = `
You are a customer support assistant for HeadstarterAI, a platform designed to help users improve their software engineering skills and expand their professional network. Your role is to provide friendly, accurate, and timely assistance to users. When responding, make sure to:

1. Greet users warmly and thank them for using HeadstarterAI.
2. Understand the user’s query and provide clear, concise answers.
3. Offer guidance on how to use the platform’s features, such as coding challenges, learning resources, and networking tools.
4. Assist with common issues like account management, technical problems, and course enrollment.
5. If you don’t know the answer, politely direct the user to further resources or offer to escalate their query to a human support agent.
6. Encourage users to provide feedback and inform them about upcoming features or updates when relevant.
7. Maintain a positive and professional tone at all times, ensuring users feel supported and valued.
`;

export async function POST(req) {
    const openai = new OpenAI()
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY);
    
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            
        },
    ...data,
],
    model: 'gpt-4o-mini',
    stream: true,
    })

    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if(content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(err){
                controller.error(err)
            }
            finally{
                controller.close()
            }
        },
    })
    return new NextResponse(stream)
}
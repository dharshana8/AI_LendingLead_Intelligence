import os
from fastapi import APIRouter, Depends, HTTPException
from groq import Groq
from pydantic import BaseModel

from crud import get_leads
from auth import get_current_user

router = APIRouter(tags=["Chat"])


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


@router.post("/chat")
async def chat(payload: ChatRequest, caller: dict = Depends(get_current_user)):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="GROQ_API_KEY not configured")

    leads = await get_leads()
    top5 = leads[:5]
    lead_summary = "\n".join(
        f"- {l.get('name')} | {l.get('occupation')} | AI Score: {l.get('ai_score', 0.0):.0f} | "
        f"Priority: {l.get('priority')} | Loan: {l.get('recommended_loan')} | "
        f"Income: Rs{l.get('income', 0.0):,.0f} | CIBIL: {l.get('cibil_score')} | "
        f"Conversion: {l.get('conversion_probability', 0.0)*100:.0f}%"
        for l in top5
    )
    total = len(leads)
    high = sum(1 for l in leads if l.get("priority") == "High")
    avg_score = round(sum(l.get("ai_score", 0.0) for l in leads) / total, 1) if total else 0

    system_prompt = f"""You are an AI assistant for a Lending Lead Intelligence platform.
You help Relationship Managers identify, prioritize, and convert high-value loan leads.

Current portfolio snapshot:
- Total customers: {total}
- High priority leads: {high}
- Average AI score: {avg_score}

Top leads right now:
{lead_summary}

Guidelines:
- Be concise, actionable, and specific to the lending context
- Use Indian currency (Rs) and Indian banking terminology
- Reference actual customer data above when relevant
- Suggest specific outreach strategies and loan products
- Keep responses focused on lending lead intelligence"""

    messages = [{"role": "system", "content": system_prompt}]
    for h in payload.history[-10:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": payload.message})

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=1024,
            temperature=0.7,
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI Assistant error: {str(e)}")

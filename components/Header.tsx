import React, { useState, useEffect } from 'react';
import { getGreeting } from '../utils/timeUtils';
import { GoogleGenAI } from "@google/genai";

const FALLBACK_QUOTES = [
  "打工人的命也是命",
  "下班不积极，思想有问题",
  "除了工资，一切皆虚妄",
  "每天叫醒我的是穷",
  "摸鱼是为了更好地工作",
  "距离退休还有...很久",
  "快乐助手 (伪)",
  "为了五斗米折腰",
  "公司是我家 (才怪)",
  "老板的饼，我不吃",
  "只要我够废，没人能用我",
  "带薪发呆中...",
  "演戏给老板看",
  "我想回家",
  "禁止内卷，从我做起"
];

export const Header: React.FC = () => {
  const [title, setTitle] = useState("快乐助手");

  useEffect(() => {
    // 1. Set a random fallback first
    const randomFallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    setTitle(randomFallback);

    const fetchQuote = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: '请给我一句非常简短的（12个字以内）、幽默、犀利、毒鸡汤风格的“打工人”语录用来问候还在上班的打工人。只要一句话，不要带引号，不要解释，不要标点符号。',
        });
        const text = response.text?.trim();
        if (text) setTitle(text);
      } catch (error) {
        console.error("Failed to fetch quote, using fallback.");
      }
    };

    fetchQuote();
  }, []);

  return (
    <header className="px-4 md:px-0 pb-6 md:pb-8 pt-12 md:pt-0">
      <p className="text-xs font-bold uppercase tracking-wider mb-2 text-[var(--primary)] transition-colors duration-300">{getGreeting()}</p>
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
        {title}
      </h1>
    </header>
  );
};
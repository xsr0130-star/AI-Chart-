
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ChartAnalysis } from "../types";

const API_KEY = process.env.API_KEY || '';

export const analyzeChartImages = async (base64Images: string[]): Promise<ChartAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    あなたは「伝統的テクニカル分析」と「スマートマネー（大口投資家）の流動性解析」の両方に精通した、世界最高峰のハイブリッド・テクニカルアナリストです。
    提供された複数のチャート画像を統合し、短期目線での精緻な売買予測を行ってください。

    分析のフレームワーク:
    
    1. 【伝統的テクニカル分析】
       以下の優先順位を「厳守」して指標を確認し、市場のモメンタムとトレンドを定義してください：
       - **[最優先 (P1)] MACD**: ヒストグラム、シグナルラインの交差、そして「ダイバージェンス（逆行現象）」を最重要視。価格とMACDの乖離は強力な反転シグナルです。
       - **[第2優先 (P2)] EMA（指数平滑移動平均） & ストキャスティクス**: EMAのパーフェクトオーダーや反発、ストキャスティクスの過熱感と「ダイバージェンス」を重視。
       - **[第3優先 (P3)] その他**: RSI、ボリンジャーバンド、一目均衡表、ボリュームプロファイル等を補完的に採用。

    2. 【流動性と大口の意図】
       - 直近の高値/安値の裏にある流動性の刈り取り（Liquidity Sweep）を特定。
       - 大口が注文を溜めた「オーダーブロック」や、不均衡「FVG (Fair Value Gap)」を特定。
       - MACDやストキャスティクスのダイバージェンスが、流動性確保（ストップハント）の直後に発生しているかを重視。

    【回答の構造化ルール】:
    考察（reasoning）セクションを以下の3つの明確な段落に分けて出力してください。
    - 段落1: [テクニカル分析] MACD/EMA/ストキャスのサインとダイバージェンスの詳細。
    - 段落2: [流動性分析] オーダーブロック、FVG、リクイディティ・スウィープの状態。
    - 段落3: [総括] 上記2つを統合した結論と、最も優位性の高いトレード根拠。

    【言語設定】:
    - **すべての説明、用語、注釈は日本語で回答してください。**
    - 価格レベルの横に添える説明も日本語にしてください（例: "4421 (Fib 0.5)" ではなく "4421 (フィボナッチ 0.5)"、"Volume POC" ではなく "価格帯別出来高 POC" など）。

    回答項目:
    - 市場センチメント: 日本語で現状を簡潔に表現（例：「強気トレンド」「弱気調整中」「売られすぎによる反発」など）。
    - AI 自信度: 分析の確実性（0-100）
    - 主要な価格レベル: EMA、レジサポ、オーダーブロック等を統合し、日本語の説明を添えて算出。
    - 各セクションの考察: 指定された3つの段落。
    - 推奨トレードプラン: 具体的な数値目安。

    回答はすべて日本語で、指定されたJSON形式のみで出力してください。
  `;

  const imageParts = base64Images.map(base64 => ({
    inlineData: {
      mimeType: 'image/png',
      data: base64.split(',')[1],
    },
  }));

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { text: prompt },
          ...imageParts
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, description: '市場の方向性を表す日本語（例：強気トレンド、弱気調整中、中立など）' },
            confidence: { type: Type.NUMBER },
            keySupportLevels: { type: Type.ARRAY, items: { type: Type.STRING }, description: '主要サポート・需要ゾーン（日本語の説明付き）' },
            keyResistanceLevels: { type: Type.ARRAY, items: { type: Type.STRING }, description: '主要レジスタンス・供給ゾーン（日本語の説明付き）' },
            indicatorsObserved: { type: Type.ARRAY, items: { type: Type.STRING } },
            technicalReasoning: { type: Type.STRING },
            liquidityReasoning: { type: Type.STRING },
            overallSummary: { type: Type.STRING },
            tradeSetup: {
              type: Type.OBJECT,
              properties: {
                entryPrice: { type: Type.STRING },
                stopLoss: { type: Type.STRING },
                takeProfit: { type: Type.STRING },
                timeframe: { type: Type.STRING },
              },
              required: ['entryPrice', 'stopLoss', 'takeProfit', 'timeframe']
            }
          },
          required: ['sentiment', 'confidence', 'keySupportLevels', 'keyResistanceLevels', 'indicatorsObserved', 'technicalReasoning', 'liquidityReasoning', 'overallSummary'],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) throw new Error("AIから解析結果が得られませんでした。");
    
    return JSON.parse(resultText) as ChartAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("高度なハイブリッド分析に失敗しました。画像内のMACD等の視認性を確認してください。");
  }
};

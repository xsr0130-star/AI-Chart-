
import React from 'react';
import { ChartAnalysis } from '../types';

interface Props {
  analysis: ChartAnalysis;
}

const AnalysisResult: React.FC<Props> = ({ analysis }) => {
  const getSentimentColor = (sentiment: string) => {
    const s = sentiment.toLowerCase();
    if (s.includes('強気') || s.includes('上昇') || s.includes('反発')) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (s.includes('弱気') || s.includes('下落') || s.includes('調整')) return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  };

  const generateReportText = () => {
    const tradeSetup = analysis.tradeSetup 
      ? `【推奨トレードプラン】
・エントリー目安: ${analysis.tradeSetup.entryPrice}
・利確目安 (TP): ${analysis.tradeSetup.takeProfit}
・損切り目安 (SL): ${analysis.tradeSetup.stopLoss}
・推奨保持期間: ${analysis.tradeSetup.timeframe}`
      : '明確なエントリーシグナルなし';

    return `■ TradeSense AI ハイブリッド分析レポート
━━━━━━━━━━━━━━━━━━━━━━
【分析日時】 ${analysis.analyzedAt || '不明'}

【市場センチメント】 ${analysis.sentiment} (自信度: ${analysis.confidence}%)

【主要なレジサポ / 需給ゾーン】
・上値抵抗 (供給): ${analysis.keyResistanceLevels.join(', ')}
・下値支持 (需要): ${analysis.keySupportLevels.join(', ')}

【確認された重要サイン】
${analysis.indicatorsObserved.join(', ')}

【1. テクニカル分析 (MACD/EMA/Stoch)】
${analysis.technicalReasoning}

【2. 流動性分析 (SMC/OrderBlock)】
${analysis.liquidityReasoning}

【3. 統合的な総括】
${analysis.overallSummary}

${tradeSetup}

━━━━━━━━━━━━━━━━━━━━━━
※免責事項: 投資は自己責任で行ってください。`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateReportText());
      alert('詳細レポートをクリップボードにコピーしました');
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const downloadReport = () => {
    const element = document.createElement("a");
    const file = new Blob([generateReportText()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Analysis_${analysis.analyzedAt?.replace(/[:/ ]/g, '_') || 'report'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
      {/* アクションバー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 text-slate-500 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] font-medium tracking-wider uppercase">分析日時: {analysis.analyzedAt}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-700 shadow-lg">
            分析をコピー
          </button>
          <button onClick={downloadReport} className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-sm font-medium rounded-lg transition-colors border border-emerald-500/20 shadow-lg">
            保存
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* センチメント */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-bl-full pointer-events-none" />
          <h3 className="text-slate-400 text-[10px] font-bold mb-4 uppercase tracking-[0.2em]">市場センチメント</h3>
          <div className="flex items-center justify-between">
            <span className={`px-4 py-1.5 rounded-full border text-sm font-bold ${getSentimentColor(analysis.sentiment)}`}>
              {analysis.sentiment}
            </span>
            <div className="text-right">
              <div className="text-2xl font-bold text-white tracking-tighter">{analysis.confidence}%</div>
              <div className="text-[10px] text-slate-500 uppercase font-medium">AI 自信度</div>
            </div>
          </div>
        </div>

        {/* ゾーン */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:col-span-2 shadow-xl">
          <h3 className="text-slate-400 text-[10px] font-bold mb-4 uppercase tracking-[0.2em]">レジサポ & 需給ゾーン</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-rose-400 text-[10px] font-bold mb-2 uppercase tracking-tight">レジスタンス / 供給</p>
              <div className="flex flex-wrap gap-2">
                {analysis.keyResistanceLevels.map((lvl, i) => <span key={i} className="bg-rose-400/5 text-rose-300 border border-rose-400/10 px-2 py-0.5 rounded text-[11px] font-mono">{lvl}</span>)}
              </div>
            </div>
            <div>
              <p className="text-emerald-400 text-[10px] font-bold mb-2 uppercase tracking-tight">サポート / 需要</p>
              <div className="flex flex-wrap gap-2">
                {analysis.keySupportLevels.map((lvl, i) => <span key={i} className="bg-emerald-400/5 text-emerald-300 border border-emerald-400/10 px-2 py-0.5 rounded text-[11px] font-mono">{lvl}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 考察セクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-slate-400 text-[10px] font-bold mb-4 uppercase tracking-[0.2em] border-b border-slate-800 pb-2">1. テクニカル分析 (MACD/ストキャス/EMA)</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {analysis.indicatorsObserved.map((ind, i) => (
                <span key={i} className={`px-2 py-0.5 rounded text-[10px] border ${ind.includes('ダイバージェンス') || ind.includes('MACD') ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                  {ind}
                </span>
              ))}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{analysis.technicalReasoning}</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-slate-400 text-[10px] font-bold mb-4 uppercase tracking-[0.2em] border-b border-slate-800 pb-2">2. 流動性分析 (SMC/オーダーブロック)</h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{analysis.liquidityReasoning}</p>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 shadow-xl border-l-4 border-l-emerald-500">
            <h3 className="text-emerald-400 text-[10px] font-bold mb-4 uppercase tracking-[0.2em]">3. ハイブリッド総括</h3>
            <p className="text-slate-200 text-sm leading-relaxed font-medium">{analysis.overallSummary}</p>
          </div>
        </div>

        {analysis.tradeSetup && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 shadow-xl relative flex flex-col justify-center">
            <h3 className="text-emerald-400 text-[10px] font-bold mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              スマート・トレード戦略
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest">エントリー目標</div>
                <div className="text-lg font-bold text-white font-mono">{analysis.tradeSetup.entryPrice}</div>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest">保持期間の目安</div>
                <div className="text-lg font-bold text-white">{analysis.tradeSetup.timeframe}</div>
              </div>
              <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                <div className="text-[10px] text-rose-400/60 mb-1 uppercase tracking-widest">損切り目安 (SL)</div>
                <div className="text-lg font-bold text-rose-400 font-mono">{analysis.tradeSetup.stopLoss}</div>
              </div>
              <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                <div className="text-[10px] text-emerald-400/60 mb-1 uppercase tracking-widest">利確目標 (TP)</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">{analysis.tradeSetup.takeProfit}</div>
              </div>
            </div>
            <p className="mt-6 text-[10px] text-slate-500 italic leading-tight">
              ※免責事項: 高度なマルチタイムフレーム解析結果ですが、最終判断は必ずご自身で行ってください。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResult;

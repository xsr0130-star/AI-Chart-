
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import AnalysisResult from './components/AnalysisResult';
import { analyzeChartImages } from './services/geminiService';
import { AnalysisState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    error: null,
    previewUrls: [],
  });
  
  const [base64Images, setBase64Images] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      setState(prev => ({ ...prev, error: '有効な画像ファイルを選択してください。' }));
      return;
    }

    const newPreviewUrls = validFiles.map(f => URL.createObjectURL(f));
    setState(prev => ({ 
      ...prev, 
      previewUrls: [...prev.previewUrls, ...newPreviewUrls],
      error: null,
      result: null 
    }));

    const readAsBase64 = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    };

    const newBase64s = await Promise.all(validFiles.map(readAsBase64));
    setBase64Images(prev => [...prev, ...newBase64s]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFiles(event.target.files);
    }
  };

  const handlePaste = (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) processFiles(files);
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const runAnalysis = async () => {
    if (base64Images.length === 0) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await analyzeChartImages(base64Images);
      const now = new Date();
      const analyzedAt = now.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        result: { ...result, analyzedAt } 
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message }));
    }
  };

  const removeImage = (index: number) => {
    setState(prev => ({
      ...prev,
      previewUrls: prev.previewUrls.filter((_, i) => i !== index),
      result: null
    }));
    setBase64Images(prev => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    setState({
      isLoading: false,
      result: null,
      error: null,
      previewUrls: [],
    });
    setBase64Images([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-emerald-500/30">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* 未アップロード時の表示 */}
          {state.previewUrls.length === 0 && (
            <div className="text-center space-y-6 py-12">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                ハイブリッド <br />
                <span className="text-emerald-500">AI チャート分析</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                MACD/EMA/Stochasticsと大口流動性を統合。<br/>
                精緻なマルチタイムフレーム分析を実行します。
              </p>
              
              <div className="pt-8 flex flex-col items-center gap-4">
                <button
                  onClick={triggerUpload}
                  className="group relative inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:scale-105"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  画像を選択 (複数可)
                </button>
                <p className="text-slate-500 text-sm">またはスクリーンショットを Ctrl+V で貼り付け</p>
              </div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />

          {/* 解析ワークスペース */}
          {state.previewUrls.length > 0 && (
            <div className="space-y-8 pb-20">
              <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-4">
                  <button onClick={reset} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    すべてクリア
                  </button>
                  <button onClick={triggerUpload} className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    画像を追加
                  </button>
                </div>

                <button
                  onClick={runAnalysis}
                  disabled={state.isLoading}
                  className={`px-6 py-2 rounded-full font-bold transition-all ${state.isLoading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105'}`}
                >
                  {state.isLoading ? '分析中...' : '統合分析を開始'}
                </button>
              </div>

              {/* 画像グリッド */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-lg">
                    <img src={url} alt={`Chart ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 to-transparent p-2">
                      <span className="text-[10px] text-slate-300 font-medium px-2 py-0.5 bg-slate-900/50 rounded-full border border-slate-700">
                        {idx === 0 ? '上位足目安' : `チャート ${idx + 1}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 解析中ローディング */}
              {state.isLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-lg">ハイブリッド分析を実行中</p>
                    <p className="text-slate-500 text-sm">MACD/Stochダイバージェンスと流動性を照合しています...</p>
                  </div>
                </div>
              )}

              {/* エラー表示 */}
              {state.error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {state.error}
                </div>
              )}

              {/* 分析結果 */}
              {state.result && <AnalysisResult analysis={state.result} />}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-xs uppercase tracking-widest font-semibold">Hybrid Technical Analysis Hub</p>
        </div>
      </footer>
    </div>
  );
};

export default App;

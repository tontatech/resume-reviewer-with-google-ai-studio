import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  FileText, 
  Briefcase, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import type { ResumeReview, ReviewCategory } from "./types";

const PROGRESS_STAGES = [
  "Parsing objective",
  "Analysing job descriptions",
  "Creating a personalised review"
];

function CategoryCard({ category, id }: { category: ReviewCategory; id: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-orange-100 rounded-xl overflow-hidden bg-white shadow-sm mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 flex items-center justify-between hover:bg-orange-50 transition-colors"
        id={`category-btn-${id}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${category.score >= 80 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
            {category.score >= 80 ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 capitalize">{id.replace(/([A-Z])/g, ' $1').trim()}</h3>
            <p className="text-sm text-slate-500">Score: {category.score}%</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-orange-50 bg-orange-50/30"
          >
            <div className="p-4 space-y-4">
              {category.suggestions.map((suggestion, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                  <div className="text-sm font-medium text-slate-400 mb-1">Original Sentence:</div>
                  <div className="text-slate-600 italic mb-3">"{suggestion.sentence}"</div>
                  <div className="text-sm font-medium text-orange-600 mb-1">XYZ Suggestion:</div>
                  <div className="text-slate-800 bg-orange-50 p-2 rounded border border-orange-100">
                    {suggestion.improvement}
                  </div>
                </div>
              ))}
              {category.suggestions.length === 0 && (
                <p className="text-slate-500 text-center py-2 italic text-sm">No specific changes recommended for this section.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [progressIndex, setProgressIndex] = useState(-1);
  const [review, setReview] = useState<ResumeReview | null>(null);
  const [error, setError] = useState("");

  const handleAnalyse = async () => {
    if (!resumeText || !jobDescription) {
      setError("Please provide both your resume text and the job description.");
      return;
    }

    setError("");
    setIsAnalysing(true);
    setReview(null);
    setProgressIndex(0);
  };

  useEffect(() => {
    let interval: any;
    if (isAnalysing && progressIndex >= 0 && progressIndex < PROGRESS_STAGES.length) {
      interval = setInterval(() => {
        setProgressIndex(prev => prev + 1);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAnalysing, progressIndex]);

  useEffect(() => {
    if (isAnalysing && progressIndex === 0) {
      const fetchData = async () => {
        try {
          const response = await fetch("/api/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resumeText, jobDescription }),
          });
          const data = await response.json();
          if (data.error) throw new Error(data.error);
          
          // Ensure min display time for messages
          const startTime = Date.now();
          const minTime = PROGRESS_STAGES.length * 2000;
          
          setReview(data);
          
          // Only stop analysing once messages are done
          const checkProgress = setInterval(() => {
            if (Date.now() - startTime > minTime) {
              setIsAnalysing(false);
              setProgressIndex(-1);
              clearInterval(checkProgress);
            }
          }, 100);

        } catch (err: any) {
          setError(err.message || "An unexpected error occurred.");
          setIsAnalysing(false);
          setProgressIndex(-1);
        }
      };
      fetchData();
    }
  }, [isAnalysing]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900">
      <header className="bg-white border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-orange-600">
            <Sparkles className="w-6 h-6 fill-current" />
            <h1 className="text-xl font-bold tracking-tight">Resume Reviewer</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            Optimise Your Resume for Success
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Get actionable feedback based on the <span className="font-semibold text-orange-600">XYZ formula</span> and align your career story with your dream job description.
          </p>
        </div>

        {!review && !isAnalysing && (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                <FileText size={18} className="text-orange-500" />
                Resume Text
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here..."
                className="w-full h-80 p-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 bg-white shadow-sm transition-all resize-none outline-none text-slate-700"
                id="resume-input"
              />
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 ml-1">
                <Briefcase size={18} className="text-orange-500" />
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                className="w-full h-80 p-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 bg-white shadow-sm transition-all resize-none outline-none text-slate-700"
                id="jd-input"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!review && !isAnalysing && (
          <div className="flex justify-center">
            <button
              onClick={handleAnalyse}
              className="group relative px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold shadow-xl shadow-orange-600/20 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              id="analyse-btn"
            >
              Analyse Resume
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {isAnalysing && (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-orange-100 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-white p-6 rounded-full shadow-xl">
                <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Reviewing your brilliance...</h3>
              <div className="text-orange-600 font-medium tracking-wide h-6">
                <AnimatePresence mode="wait">
                  {progressIndex >= 0 && progressIndex < PROGRESS_STAGES.length && (
                    <motion.span
                      key={progressIndex}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className="block"
                    >
                      {PROGRESS_STAGES[progressIndex]}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {review && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="bg-white p-8 rounded-3xl border border-orange-100 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
              <div className="relative flex flex-col md:flex-row items-center gap-8">
                <div className="relative flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      className="text-orange-100"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray={440}
                      initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset: 440 - (440 * review.overallScore) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="text-orange-600"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-slate-800">{review.overallScore}%</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Score</span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Overall Analysis</h3>
                  <p className="text-slate-600 leading-relaxed italic">"{review.summary}"</p>
                  <button 
                    onClick={() => setReview(null)}
                    className="mt-6 text-sm font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 mx-auto md:mx-0"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Start New Review
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-1 gap-4">
              <h4 className="text-xl font-bold text-slate-800 mb-2 px-2">Detailed Feedback</h4>
              {(Object.keys(review.categories) as Array<keyof typeof review.categories>).map((key) => (
                <CategoryCard key={String(key)} id={String(key)} category={review.categories[key]} />
              ))}
            </div>
          </motion.div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-slate-200 mt-12 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Resume Reviewer. Helping you stand out using the XYZ formula.</p>
        <p className="mt-1">Built with Australian English standards.</p>
      </footer>
    </div>
  );
}

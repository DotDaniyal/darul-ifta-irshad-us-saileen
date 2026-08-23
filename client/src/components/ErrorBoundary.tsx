import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const urdu = typeof document !== "undefined" && document.documentElement.lang === "ur";
      return (
        <main className="platform-error-screen" lang={urdu ? "ur" : "en"} dir={urdu ? "rtl" : "ltr"}>
          <div className="platform-error-card" role="alert">
            <span className="platform-error-seal">۞</span>
            <AlertTriangle size={30} className="text-[#B88A43]" aria-hidden="true" />
            <p className="platform-error-kicker">{urdu ? "عارضی مسئلہ" : "Temporary interruption"}</p>
            <h1 className={urdu ? "font-urdu" : "font-display"}>{urdu ? "یہ صفحہ فی الحال دستیاب نہیں ہے" : "This page is temporarily unavailable"}</h1>
            <p>{urdu ? "براہِ کرم صفحہ دوبارہ کھولیں۔ اگر مسئلہ برقرار رہے تو کچھ دیر بعد کوشش کریں۔" : "Please reload the page. If the issue continues, try again in a moment."}</p>
            <button onClick={() => window.location.reload()} className="platform-error-action">
              <RotateCcw size={16} />
              {urdu ? "صفحہ دوبارہ کھولیں" : "Reload page"}
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

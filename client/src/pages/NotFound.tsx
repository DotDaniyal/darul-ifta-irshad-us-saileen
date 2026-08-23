import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SiteShell, { useLanguage } from "@/components/SiteShell";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const urdu = language === "ur";

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <SiteShell>
      <main
        className="grid min-h-[55vh] w-full place-items-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12"
        lang={language}
        dir={urdu ? "rtl" : "ltr"}
      >
        <Card className="w-full max-w-lg mx-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />
                <AlertCircle className="relative h-16 w-16 text-red-500" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>

            <h2 className="text-xl font-semibold text-slate-700 mb-4">
              {urdu ? "صفحہ موجود نہیں" : "Page Not Found"}
            </h2>

            <p className="text-slate-600 mb-8 leading-relaxed">
              {urdu
                ? "آپ جس صفحے کو تلاش کر رہے ہیں وہ موجود نہیں ہے۔"
                : "Sorry, the page you are looking for doesn't exist."}
              <br />
              {urdu
                ? "ممکن ہے اسے منتقل یا حذف کر دیا گیا ہو۔"
                : "It may have been moved or deleted."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleGoHome}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Home className="w-4 h-4" />
                {urdu ? "سرورق پر جائیں" : "Go Home"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </SiteShell>
  );
}

import { useEffect } from "react";

export default function FeedbackRedirect() {
  useEffect(() => {
    // Redirecionar para a página HTML estática
    window.location.href = "/feedback.html";
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando para o sistema de feedback...</p>
      </div>
    </div>
  );
}

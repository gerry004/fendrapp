"use client"

export default function Home() {
  const handleFacebookLogin = async () => {
    const res = await fetch('/api/connect_facebook');
    if (res.ok) {
      const data = await res.json();
      if (data.oauthUrl) {
        window.location.href = data.oauthUrl;
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button
        onClick={handleFacebookLogin}
        className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
      >
        Connect with Facebook
      </button>
    </div>
  );
}

// https://www.instagram.com/oauth/authorize?client_id=704153072007594&redirect_uri=http://localhost:3000/api/instagram/callback/&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish
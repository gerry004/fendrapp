"use client"

// You can store this in an environment variable
const REDIRECT_URI = 'https://fendrapp.vercel.app/api/instagram/callback/';

export default function Home() {
  const handleInstagramLogin = () => {
    // Log the full URL for debugging
    const instagramAuthUrl = `https://www.instagram.com/oauth/authorize?client_id=704153072007594&redirect_uri=${REDIRECT_URI}&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish`;
    console.log('Redirecting to:', instagramAuthUrl); // Add this for debugging
    window.location.href = instagramAuthUrl;
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button
        onClick={handleInstagramLogin}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
      >
        Connect with Instagram
      </button>
    </div>
  );
}


// https://www.instagram.com/oauth/authorize?client_id=704153072007594&redirect_uri=http://localhost:3000/api/instagram/callback/&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish
import withPWA from 'next-pwa';

const nextConfig = {
  /* config options here */
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  ...nextConfig,
});

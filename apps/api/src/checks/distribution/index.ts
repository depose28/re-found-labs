// Re-export utilities used by new check files (productFeed.ts, commerceApi.ts, paymentMethods.ts)
export { detectPlatform, type PlatformDetection } from './platform';
export { discoverFeeds, type FeedInfo } from './feeds';
export {
  calculateProtocolReadiness,
  detectCheckoutInfrastructure,
  detectAPIPatterns,
  type ProtocolReadiness,
  type ProtocolStatus,
} from './protocols';

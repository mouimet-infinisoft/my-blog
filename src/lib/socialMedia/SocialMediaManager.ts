import { Container } from '@brainstack/inject';
import { Article, SocialMediaProvider, SocialMediaConfig } from './types';
import { DevToProvider } from './providers/DevToProvider';
import { LinkedInProvider } from './providers/LinkedInProvider';

export class SocialMediaManager {
  private container: Container;
  private providers: SocialMediaProvider[] = [];

  constructor(config: SocialMediaConfig) {
    this.container = new Container();
    this.initializeProviders(config);
  }

  private initializeProviders(config: SocialMediaConfig) {
    if (config.devTo?.apiKey) {
      this.container.register(
        'DevToProvider',
        new DevToProvider(config.devTo.apiKey)
      );
    }

    if (config.linkedin?.accessToken && config.linkedin?.userId) {
      this.container.register(
        'LinkedInProvider',
        new LinkedInProvider(config.linkedin.accessToken, config.linkedin.userId)
      );
    }

    // Get all registered providers
    const providerIds = ['DevToProvider', 'LinkedInProvider'];
    this.providers = providerIds
      .map(id => this.container.get<SocialMediaProvider>(id))
      .filter((provider): provider is SocialMediaProvider => !!provider);
  }

  async crossPost(article: Article) {
    const results = await Promise.all(
      this.providers.map(async provider => {
        const result = await provider.post(article);
        return {
          provider: provider.name,
          ...result,
        };
      })
    );

    return {
      success: results.every(r => r.success),
      results,
    };
  }
}
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Find the rules for CSS modules
    const rules = config.module.rules
      .find((rule: any) => typeof rule.oneOf === 'object')
      ?.oneOf.filter((rule: any) => Array.isArray(rule.use));

    if (rules) {
      rules.forEach((rule: any) => {
        rule.use.forEach((moduleLoader: any) => {
          if (
            moduleLoader.loader?.includes('css-loader') &&
            !moduleLoader.loader?.includes('postcss-loader') &&
            moduleLoader.options?.modules?.getLocalIdent
          ) {
            const defaultGetLocalIdent = moduleLoader.options.modules.getLocalIdent;
            moduleLoader.options.modules.getLocalIdent = (
              context: any,
              localIdentName: any,
              localName: any,
              options: any
            ) => {
              const resourcePath: string = context?.resourcePath ?? '';
              const isOurModule = resourcePath.endsWith('.module.scss') || resourcePath.endsWith('.module.css');

              try {
                const defaultName = defaultGetLocalIdent(context, localIdentName, localName, options);
                if (isOurModule && typeof defaultName === 'string') {
                  // Strip out the redundant "-module-scss-module" / "-module-scss" suffix
                  return defaultName
                    .replace(/[-_]module[-_]scss[-_]module/gi, '')
                    .replace(/[-_]module[-_]scss/gi, '');
                }
                return defaultName;
              } catch {
                // next/font and other special loaders — just return localName as-is
                return localName;
              }
            };
          }
        });
      });
    }

    return config;
  },
};

export default nextConfig;

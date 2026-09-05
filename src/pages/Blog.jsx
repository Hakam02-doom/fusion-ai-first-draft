import {
  Navigation,
  BillingProvider,
  Reveal,
} from '../components/Interactions.jsx';
import { Footer, CallToAction } from '../components/SiteChrome.jsx';

import { TextReveal } from '../components/EntranceMotion.jsx';

export default function Blog() {
  return (
    <BillingProvider>
      <>
        <div
          id={'main'}
          data-framer-ssr-released-at={'2026-06-24T12:37:21.819Z'}
          data-framer-page-optimized-at={'2026-06-24T13:04:01.014Z'}
          data-framer-generated-page={''}
        >
          <div
            className={
              'framer-n5UzQ framer-myrI0 framer-KYDPx framer-KBkxR framer-1hmmxt8'
            }
            data-layout-template={'true'}
            style={{ minHeight: '100vh', width: 'auto' }}
          >
            <div className={'ssr-variant'}>
              <div
                className={'framer-fqbro6'}
                data-framer-name={'Background Gradient'}
              >
                <div
                  style={{
                    position: 'absolute',
                    borderRadius: 'inherit',
                    cornerShape: 'inherit',
                    top: '0',
                    right: '0',
                    bottom: '0',
                    left: '0',
                  }}
                  data-framer-background-image-wrapper={'true'}
                >
                  <img
                    data-gradient-surface={true}
                    decoding={'async'}
                    width={'1440'}
                    height={'848'}
                    sizes={
                      '(min-width: 1200px) 100vw, (max-width: 809.98px) 100vw, (min-width: 810px) and (max-width: 1199.98px) 100vw'
                    }
                    src={
                      '/vendor/framer/gradients/Be2eOLzV4xVwCVXDiJq8fLpcY3c.avif'
                    }
                    alt={'bacground gradient shape'}
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      borderRadius: 'inherit',
                      cornerShape: 'inherit',
                      objectPosition: 'center',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              </div>
            </div>
            <Navigation />
            <div
              data-framer-root={''}
              className={
                'framer-pVViE framer-Wp4zw framer-myrI0 framer-16tlgjf'
              }
              style={{ minHeight: '100vh', width: 'auto', display: 'contents' }}
            >
              <BlogFeaturedBlog />
              <BlogBlogs />
            </div>
            <div className={'framer-1hhvw1u'}></div>
            <CallToAction />
            <Footer />
          </div>
        </div>
        <div
          id={'svg-templates'}
          style={{
            position: 'absolute',
            overflow: 'hidden',
            bottom: '0',
            left: '0',
            width: '0',
            height: '0',
            zIndex: '0',
            contain: 'strict',
          }}
          aria-hidden={'true'}
        >
          <svg
            width={'16'}
            height={'16'}
            viewBox={'0 0 16 16'}
            fill={'none'}
            id={'svg-1859665208_389'}
          >
            <rect width={'16'} height={'16'} rx={'8'} fill={'black'}></rect>
            <path
              d={
                'M7.99655 7.05767L11.2964 3.75781L12.2392 4.70062L8.93935 8.00047L12.2392 11.3003L11.2964 12.2431L7.99655 8.94327L4.69672 12.2431L3.75391 11.3003L7.05375 8.00047L3.75391 4.70062L4.69672 3.75781L7.99655 7.05767Z'
              }
              fill={'white'}
            ></path>
          </svg>
          <svg
            width={'11'}
            height={'10'}
            viewBox={'-1 -1 11 10'}
            fill={'none'}
            id={'svg-1160060004_483'}
          >
            <path
              d={'M0 0C7.5 0 9 1.5 9 7.99997'}
              stroke={'url(#svg-1160060004_483_paint0_linear_4667_10125)'}
              strokeWidth={'2'}
              strokeLinecap={'round'}
            ></path>
            <defs>
              <linearGradient
                id={'svg-1160060004_483_paint0_linear_4667_10125'}
                x1={'-1'}
                y1={'-0.5'}
                x2={'9'}
                y2={'9'}
                gradientUnits={'userSpaceOnUse'}
              >
                <stop stopColor={'#ADFF30'}></stop>
                <stop offset={'0.519231'} stopColor={'#00D5FF'}></stop>
                <stop offset={'1'} stopColor={'#D469FF'}></stop>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </>
    </BillingProvider>
  );
}

function BlogFeaturedBlog() {
  return (
    <section className={'framer-1ntwwqu'} data-framer-name={'Featured Blog'}>
      <div className={'framer-3ximo8'} data-framer-name={'Bg'}>
        <div
          style={{
            position: 'absolute',
            borderRadius: 'inherit',
            cornerShape: 'inherit',
            top: '0',
            right: '0',
            bottom: '0',
            left: '0',
          }}
          data-framer-background-image-wrapper={'true'}
        >
          <img
            data-gradient-surface={true}
            decoding={'async'}
            width={'1440'}
            height={'1083'}
            sizes={
              '(min-width: 1200px) calc(100vw - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(100vw - 40px), (max-width: 809.98px) calc(100vw - 40px)'
            }
            src={'/vendor/framer/gradients/UIpX3PUgTgkNx4Bx5MgOQSfAI.avif'}
            alt={'background gradient'}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              borderRadius: 'inherit',
              cornerShape: 'inherit',
              objectPosition: 'center',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>
      <div className={'framer-c6f2l1'} data-framer-name={'Container'}>
        <div className={'framer-1t7gmma'} data-framer-name={'Title Block'}>
          <div className={'ssr-variant'}>
            <div className={'framer-18rradd-container'}>
              <div
                className={
                  'framer-28RHx framer-yrDLW framer-1w7qnhj framer-v-1w7qnhj'
                }
                data-framer-name={'Primary'}
                style={{
                  background:
                    'linear-gradient(90deg, rgb(105, 51, 0) 0%, rgb(128, 30, 0) 32.88288288288289%, var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0)) 54.054054054054056%, rgb(0, 105, 166) 100%)',
                  borderBottomLeftRadius: '99px',
                  borderBottomRightRadius: '99px',
                  borderTopLeftRadius: '99px',
                  borderTopRightRadius: '99px',
                }}
              >
                <div
                  className={'framer-1c7kxik'}
                  data-framer-name={'Text Wrapper'}
                  style={{
                    backgroundColor:
                      'var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0))',
                    borderBottomLeftRadius: '14px',
                    borderBottomRightRadius: '14px',
                    borderTopLeftRadius: '14px',
                    borderTopRightRadius: '14px',
                  }}
                >
                  <div
                    className={'framer-1ogoaej'}
                    data-framer-name={'Text'}
                    data-framer-component-type={'RichTextContainer'}
                    style={{
                      '--framer-paragraph-spacing': '0px',
                      transform: 'none',
                    }}
                  >
                    <p
                      className={'framer-text framer-styles-preset-1u1yh6c'}
                      data-styles-preset={'qkxgfTMWc'}
                    >
                      {'Blog'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <TextReveal
            className={'framer-rnfgyg'}
            data-framer-name={'Title Text'}
            data-framer-component-type={'RichTextContainer'}
            style={{ transform: 'none' }}
          >
            <h1
              className={'framer-text framer-styles-preset-13d02to'}
              data-styles-preset={'wJZnWFInK'}
              style={{ '--framer-text-alignment': 'center' }}
            >
              <span style={{ display: 'inline-block' }}>{'Stay'}</span>{' '}
              <span style={{ display: 'inline-block' }}>{'on'}</span>{' '}
              <span style={{ display: 'inline-block' }}>{'the'}</span>{' '}
              <span style={{ display: 'inline-block' }}>{'top'}</span>{' '}
              <span style={{ display: 'inline-block' }}>{'of'}</span>{' '}
              <span style={{ display: 'inline-block' }}>{'  Industry'}</span>{' '}
              <span style={{ display: 'inline-block' }}>{'News'}</span>
            </h1>
          </TextReveal>
        </div>
        <Reveal as={'div'} className={'framer-1u6aix2'} style={{}}>
          <div className={'framer-1w52w3m'}>
            <div className={'ssr-variant hidden-1cnef43 hidden-d7fev5'}>
              <div className={'framer-10cg4pu-container'}>
                <div
                  className={
                    'framer-VvuIM framer-FrlQ0 framer-KYDPx framer-159pz2f framer-v-159pz2f'
                  }
                  data-framer-name={'Desktop'}
                  style={{
                    '--border-bottom-width': '0px',
                    '--border-color': 'rgba(0, 0, 0, 0)',
                    '--border-left-width': '0px',
                    '--border-right-width': '0px',
                    '--border-style': 'solid',
                    '--border-top-width': '0px',
                    backgroundColor:
                      'var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0))',
                    width: '100%',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                  }}
                >
                  <div className={'framer-15ht5t0'} data-framer-name={'Col'}>
                    <div
                      className={'framer-1mtsili'}
                      data-framer-name={'Text Wrapper'}
                    >
                      <div
                        className={'framer-4uatu9'}
                        data-framer-name={'Text'}
                      >
                        <div
                          className={'framer-1qesn8m'}
                          data-framer-name={'featured'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-paragraph-spacing': '0px',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={'framer-text'}
                            style={{
                              '--framer-font-size': '14px',
                              '--framer-line-height': '1.57em',
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                              '--framer-text-transform': 'uppercase',
                            }}
                          >
                            {'featured'}
                          </p>
                        </div>
                        <div
                          className={'framer-1a9vqw9'}
                          data-framer-name={'Header Text'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-paragraph-spacing': '0px',
                            transform: 'none',
                          }}
                        >
                          <h2
                            className={
                              'framer-text framer-styles-preset-1j87fkn'
                            }
                            data-styles-preset={'chv2YGyi7'}
                          >
                            {'Building Long-Lasting Customer in SaaS'}
                          </h2>
                        </div>
                      </div>
                      <div
                        className={'framer-17ikdf0'}
                        data-framer-name={'Subheader Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <p
                          className={'framer-text framer-styles-preset-1e7rr0f'}
                          data-styles-preset={'MigD80yic'}
                        >
                          {
                            'Tailor your site’s design to meet your financial targets. Easily adjust layouts, colors, and fonts to match your brand without extra cost.'
                          }
                        </p>
                      </div>
                    </div>
                    <div className={'framer-jcj913-container'}>
                      <a
                        aria-label={'Read More'}
                        className={
                          'framer-HQetX framer-6O6de framer-1jf35qu framer-v-1jf35qu framer-1pv4xz5'
                        }
                        data-framer-name={'Primary'}
                        data-highlight={'true'}
                        href={'/blog/building-long-lasting-customer-in-saas'}
                        tabIndex={'0'}
                        style={{
                          borderBottomLeftRadius: '12px',
                          borderBottomRightRadius: '12px',
                          borderTopLeftRadius: '12px',
                          borderTopRightRadius: '12px',
                        }}
                      >
                        <div
                          className={'framer-wn16j9'}
                          data-framer-name={'Blob'}
                          style={{
                            background:
                              'radial-gradient(50% 50% at 50% 50%, rgb(255, 255, 255) 52.88461446762085%, rgb(140, 54, 2) 100%)',
                            filter: 'blur(3px)',
                            WebkitFilter: 'blur(3px)',
                            borderBottomLeftRadius: '100%',
                            borderBottomRightRadius: '100%',
                            borderTopLeftRadius: '100%',
                            borderTopRightRadius: '100%',
                          }}
                        ></div>
                        <div
                          className={'framer-1cqnp6c'}
                          data-framer-name={'Blur'}
                          style={{
                            backgroundColor:
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            filter: 'blur(10px)',
                            WebkitFilter: 'blur(10px)',
                            borderBottomLeftRadius: '100%',
                            borderBottomRightRadius: '100%',
                            borderTopLeftRadius: '100%',
                            borderTopRightRadius: '100%',
                            opacity: '0.6',
                          }}
                        ></div>
                        <div
                          className={'framer-vc05ce'}
                          data-framer-name={'Gradient'}
                          style={{
                            background:
                              'linear-gradient(163deg, rgb(255, 137, 24) 28.000000000000004%, var(--token-9ac59eff-1022-40a8-ae94-1c27de6ff71e, rgb(162, 41, 4)) 54%, var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0)) 68%, var(--token-75161833-e0e8-4cc7-a671-fa8c224dd0e8, rgb(0, 152, 243)) 100%)',
                            borderBottomLeftRadius: '12px',
                            borderBottomRightRadius: '12px',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                          }}
                        ></div>
                        <div
                          className={'framer-yghdzi'}
                          data-framer-name={'Fill'}
                          style={{
                            backgroundColor:
                              'var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0))',
                            borderBottomLeftRadius: '12px',
                            borderBottomRightRadius: '12px',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                          }}
                        ></div>
                        <div
                          className={'framer-j6xjan'}
                          data-framer-name={'Text'}
                        >
                          <div
                            className={'framer-1k2zu1p'}
                            data-framer-name={'Text 1'}
                            data-framer-component-type={'RichTextContainer'}
                            style={{
                              '--framer-paragraph-spacing': '0px',
                              transform: 'none',
                            }}
                          >
                            <p
                              className={
                                'framer-text framer-styles-preset-amoww1'
                              }
                              data-styles-preset={'RzAhCiscr'}
                            >
                              {'Read More'}
                            </p>
                          </div>
                          <div
                            className={'framer-119r11v'}
                            data-framer-name={'Text 2'}
                            data-framer-component-type={'RichTextContainer'}
                            style={{ '--framer-paragraph-spacing': '0px' }}
                          >
                            <p
                              className={
                                'framer-text framer-styles-preset-amoww1'
                              }
                              data-styles-preset={'RzAhCiscr'}
                            >
                              {'Read More'}
                            </p>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className={'framer-ch5z87'} data-framer-name={'Col'}>
                    <div
                      className={'framer-1qg7uad'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-1gco4xt'}
                        data-framer-name={'Gradiant Background'}
                        style={{ transform: 'none' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) 1006px, (max-width: 809.98px) 1006px, (min-width: 810px) and (max-width: 1199.98px) 1006px'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-1adn9qo'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) max(min(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 120px) / 2, 1px), 518px), 1px), (max-width: 809.98px) max(max(min(max(100vw - 72px, 1px), 500px), 1px) - 48px, 1px), (min-width: 810px) and (max-width: 1199.98px) max(min(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 80px) / 2, 1px), 518px), 1px)'
                            }
                            srcSet={
                              '/vendor/framer/images/YtaRTIWBHwKVRRvRltM3z8uCvRo.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/YtaRTIWBHwKVRRvRltM3z8uCvRo.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/YtaRTIWBHwKVRRvRltM3z8uCvRo.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/YtaRTIWBHwKVRRvRltM3z8uCvRo.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={'ssr-variant hidden-16tlgjf hidden-d7fev5'}>
              <div className={'framer-10cg4pu-container'}>
                <div
                  className={
                    'framer-VvuIM framer-FrlQ0 framer-KYDPx framer-159pz2f framer-v-1pk80nn'
                  }
                  data-framer-name={'Phone'}
                  data-border={'true'}
                  style={{
                    '--border-bottom-width': '1px',
                    '--border-color':
                      'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                    '--border-left-width': '1px',
                    '--border-right-width': '1px',
                    '--border-style': 'solid',
                    '--border-top-width': '1px',
                    backgroundColor:
                      'var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0))',
                    width: '100%',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                  }}
                >
                  <div className={'framer-15ht5t0'} data-framer-name={'Col'}>
                    <div
                      className={'framer-1mtsili'}
                      data-framer-name={'Text Wrapper'}
                    >
                      <div
                        className={'framer-4uatu9'}
                        data-framer-name={'Text'}
                      >
                        <div
                          className={'framer-1qesn8m'}
                          data-framer-name={'featured'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-paragraph-spacing': '0px',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={'framer-text'}
                            style={{
                              '--framer-font-size': '14px',
                              '--framer-line-height': '1.57em',
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                              '--framer-text-transform': 'uppercase',
                            }}
                          >
                            {'featured'}
                          </p>
                        </div>
                        <div
                          className={'framer-1a9vqw9'}
                          data-framer-name={'Header Text'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-paragraph-spacing': '0px',
                            transform: 'none',
                          }}
                        >
                          <h2
                            className={
                              'framer-text framer-styles-preset-1j87fkn'
                            }
                            data-styles-preset={'chv2YGyi7'}
                          >
                            {'Building Long-Lasting Customer in SaaS'}
                          </h2>
                        </div>
                      </div>
                      <div
                        className={'framer-17ikdf0'}
                        data-framer-name={'Subheader Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <p
                          className={'framer-text framer-styles-preset-1e7rr0f'}
                          data-styles-preset={'MigD80yic'}
                        >
                          {
                            'Tailor your site’s design to meet your financial targets. Easily adjust layouts, colors, and fonts to match your brand without extra cost.'
                          }
                        </p>
                      </div>
                    </div>
                    <div className={'framer-jcj913-container'}>
                      <a
                        aria-label={'Read More'}
                        className={
                          'framer-HQetX framer-6O6de framer-1jf35qu framer-v-1jf35qu framer-1pv4xz5'
                        }
                        data-framer-name={'Primary'}
                        data-highlight={'true'}
                        href={'/blog/building-long-lasting-customer-in-saas'}
                        tabIndex={'0'}
                        style={{
                          borderBottomLeftRadius: '12px',
                          borderBottomRightRadius: '12px',
                          borderTopLeftRadius: '12px',
                          borderTopRightRadius: '12px',
                        }}
                      >
                        <div
                          className={'framer-wn16j9'}
                          data-framer-name={'Blob'}
                          style={{
                            background:
                              'radial-gradient(50% 50% at 50% 50%, rgb(255, 255, 255) 52.88461446762085%, rgb(140, 54, 2) 100%)',
                            filter: 'blur(3px)',
                            WebkitFilter: 'blur(3px)',
                            borderBottomLeftRadius: '100%',
                            borderBottomRightRadius: '100%',
                            borderTopLeftRadius: '100%',
                            borderTopRightRadius: '100%',
                          }}
                        ></div>
                        <div
                          className={'framer-1cqnp6c'}
                          data-framer-name={'Blur'}
                          style={{
                            backgroundColor:
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            filter: 'blur(10px)',
                            WebkitFilter: 'blur(10px)',
                            borderBottomLeftRadius: '100%',
                            borderBottomRightRadius: '100%',
                            borderTopLeftRadius: '100%',
                            borderTopRightRadius: '100%',
                            opacity: '0.6',
                          }}
                        ></div>
                        <div
                          className={'framer-vc05ce'}
                          data-framer-name={'Gradient'}
                          style={{
                            background:
                              'linear-gradient(163deg, rgb(255, 137, 24) 28.000000000000004%, var(--token-9ac59eff-1022-40a8-ae94-1c27de6ff71e, rgb(162, 41, 4)) 54%, var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0)) 68%, var(--token-75161833-e0e8-4cc7-a671-fa8c224dd0e8, rgb(0, 152, 243)) 100%)',
                            borderBottomLeftRadius: '12px',
                            borderBottomRightRadius: '12px',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                          }}
                        ></div>
                        <div
                          className={'framer-yghdzi'}
                          data-framer-name={'Fill'}
                          style={{
                            backgroundColor:
                              'var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0))',
                            borderBottomLeftRadius: '12px',
                            borderBottomRightRadius: '12px',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                          }}
                        ></div>
                        <div
                          className={'framer-j6xjan'}
                          data-framer-name={'Text'}
                        >
                          <div
                            className={'framer-1k2zu1p'}
                            data-framer-name={'Text 1'}
                            data-framer-component-type={'RichTextContainer'}
                            style={{
                              '--framer-paragraph-spacing': '0px',
                              transform: 'none',
                            }}
                          >
                            <p
                              className={
                                'framer-text framer-styles-preset-amoww1'
                              }
                              data-styles-preset={'RzAhCiscr'}
                            >
                              {'Read More'}
                            </p>
                          </div>
                          <div
                            className={'framer-119r11v'}
                            data-framer-name={'Text 2'}
                            data-framer-component-type={'RichTextContainer'}
                            style={{ '--framer-paragraph-spacing': '0px' }}
                          >
                            <p
                              className={
                                'framer-text framer-styles-preset-amoww1'
                              }
                              data-styles-preset={'RzAhCiscr'}
                            >
                              {'Read More'}
                            </p>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className={'framer-ch5z87'} data-framer-name={'Col'}>
                    <div
                      className={'framer-1qg7uad'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-1gco4xt'}
                        data-framer-name={'Gradiant Background'}
                        style={{ transform: 'none' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) 1006px, (max-width: 809.98px) 1006px, (min-width: 810px) and (max-width: 1199.98px) 1006px'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-1adn9qo'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) max(min(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 120px) / 2, 1px), 518px), 1px), (max-width: 809.98px) max(max(min(max(100vw - 72px, 1px), 500px), 1px) - 48px, 1px), (min-width: 810px) and (max-width: 1199.98px) max(min(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 80px) / 2, 1px), 518px), 1px)'
                            }
                            srcSet={
                              '/vendor/framer/images/YtaRTIWBHwKVRRvRltM3z8uCvRo.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/YtaRTIWBHwKVRRvRltM3z8uCvRo.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/YtaRTIWBHwKVRRvRltM3z8uCvRo.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/YtaRTIWBHwKVRRvRltM3z8uCvRo.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={'ssr-variant hidden-1cnef43 hidden-16tlgjf'}>
              <div className={'framer-10cg4pu-container'}>
                <div
                  className={
                    'framer-VvuIM framer-FrlQ0 framer-KYDPx framer-159pz2f framer-v-mfg9hq'
                  }
                  data-framer-name={'Tablet'}
                  data-border={'true'}
                  style={{
                    '--border-bottom-width': '1px',
                    '--border-color':
                      'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                    '--border-left-width': '1px',
                    '--border-right-width': '1px',
                    '--border-style': 'solid',
                    '--border-top-width': '1px',
                    backgroundColor:
                      'var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0))',
                    width: '100%',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                  }}
                >
                  <div className={'framer-15ht5t0'} data-framer-name={'Col'}>
                    <div
                      className={'framer-1mtsili'}
                      data-framer-name={'Text Wrapper'}
                    >
                      <div
                        className={'framer-4uatu9'}
                        data-framer-name={'Text'}
                      >
                        <div
                          className={'framer-1qesn8m'}
                          data-framer-name={'featured'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-paragraph-spacing': '0px',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={'framer-text'}
                            style={{
                              '--framer-font-size': '14px',
                              '--framer-line-height': '1.57em',
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                              '--framer-text-transform': 'uppercase',
                            }}
                          >
                            {'featured'}
                          </p>
                        </div>
                        <div
                          className={'framer-1a9vqw9'}
                          data-framer-name={'Header Text'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-paragraph-spacing': '0px',
                            transform: 'none',
                          }}
                        >
                          <h2
                            className={
                              'framer-text framer-styles-preset-1j87fkn'
                            }
                            data-styles-preset={'chv2YGyi7'}
                          >
                            {'Building Long-Lasting Customer in SaaS'}
                          </h2>
                        </div>
                      </div>
                      <div
                        className={'framer-17ikdf0'}
                        data-framer-name={'Subheader Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <p
                          className={'framer-text framer-styles-preset-1e7rr0f'}
                          data-styles-preset={'MigD80yic'}
                        >
                          {
                            'Tailor your site’s design to meet your financial targets. Easily adjust layouts, colors, and fonts to match your brand without extra cost.'
                          }
                        </p>
                      </div>
                    </div>
                    <div className={'framer-jcj913-container'}>
                      <a
                        aria-label={'Read More'}
                        className={
                          'framer-HQetX framer-6O6de framer-1jf35qu framer-v-1jf35qu framer-1pv4xz5'
                        }
                        data-framer-name={'Primary'}
                        data-highlight={'true'}
                        href={'/blog/building-long-lasting-customer-in-saas'}
                        tabIndex={'0'}
                        style={{
                          borderBottomLeftRadius: '12px',
                          borderBottomRightRadius: '12px',
                          borderTopLeftRadius: '12px',
                          borderTopRightRadius: '12px',
                        }}
                      >
                        <div
                          className={'framer-wn16j9'}
                          data-framer-name={'Blob'}
                          style={{
                            background:
                              'radial-gradient(50% 50% at 50% 50%, rgb(255, 255, 255) 52.88461446762085%, rgb(140, 54, 2) 100%)',
                            filter: 'blur(3px)',
                            WebkitFilter: 'blur(3px)',
                            borderBottomLeftRadius: '100%',
                            borderBottomRightRadius: '100%',
                            borderTopLeftRadius: '100%',
                            borderTopRightRadius: '100%',
                          }}
                        ></div>
                        <div
                          className={'framer-1cqnp6c'}
                          data-framer-name={'Blur'}
                          style={{
                            backgroundColor:
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            filter: 'blur(10px)',
                            WebkitFilter: 'blur(10px)',
                            borderBottomLeftRadius: '100%',
                            borderBottomRightRadius: '100%',
                            borderTopLeftRadius: '100%',
                            borderTopRightRadius: '100%',
                            opacity: '0.6',
                          }}
                        ></div>
                        <div
                          className={'framer-vc05ce'}
                          data-framer-name={'Gradient'}
                          style={{
                            background:
                              'linear-gradient(163deg, rgb(255, 137, 24) 28.000000000000004%, var(--token-9ac59eff-1022-40a8-ae94-1c27de6ff71e, rgb(162, 41, 4)) 54%, var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0)) 68%, var(--token-75161833-e0e8-4cc7-a671-fa8c224dd0e8, rgb(0, 152, 243)) 100%)',
                            borderBottomLeftRadius: '12px',
                            borderBottomRightRadius: '12px',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                          }}
                        ></div>
                        <div
                          className={'framer-yghdzi'}
                          data-framer-name={'Fill'}
                          style={{
                            backgroundColor:
                              'var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0))',
                            borderBottomLeftRadius: '12px',
                            borderBottomRightRadius: '12px',
                            borderTopLeftRadius: '12px',
                            borderTopRightRadius: '12px',
                          }}
                        ></div>
                        <div
                          className={'framer-j6xjan'}
                          data-framer-name={'Text'}
                        >
                          <div
                            className={'framer-1k2zu1p'}
                            data-framer-name={'Text 1'}
                            data-framer-component-type={'RichTextContainer'}
                            style={{
                              '--framer-paragraph-spacing': '0px',
                              transform: 'none',
                            }}
                          >
                            <p
                              className={
                                'framer-text framer-styles-preset-amoww1'
                              }
                              data-styles-preset={'RzAhCiscr'}
                            >
                              {'Read More'}
                            </p>
                          </div>
                          <div
                            className={'framer-119r11v'}
                            data-framer-name={'Text 2'}
                            data-framer-component-type={'RichTextContainer'}
                            style={{ '--framer-paragraph-spacing': '0px' }}
                          >
                            <p
                              className={
                                'framer-text framer-styles-preset-amoww1'
                              }
                              data-styles-preset={'RzAhCiscr'}
                            >
                              {'Read More'}
                            </p>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div className={'framer-ch5z87'} data-framer-name={'Col'}>
                    <div
                      className={'framer-1qg7uad'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-1gco4xt'}
                        data-framer-name={'Gradiant Background'}
                        style={{ transform: 'rotate(-20deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) 1006px, (max-width: 809.98px) 1006px, (min-width: 810px) and (max-width: 1199.98px) 1006px'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-1adn9qo'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) max(min(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 120px) / 2, 1px), 518px), 1px), (max-width: 809.98px) max(max(min(max(100vw - 72px, 1px), 500px), 1px) - 48px, 1px), (min-width: 810px) and (max-width: 1199.98px) max(min(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 80px) / 2, 1px), 518px), 1px)'
                            }
                            srcSet={
                              '/vendor/framer/images/YtaRTIWBHwKVRRvRltM3z8uCvRo.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/YtaRTIWBHwKVRRvRltM3z8uCvRo.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/YtaRTIWBHwKVRRvRltM3z8uCvRo.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/YtaRTIWBHwKVRRvRltM3z8uCvRo.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BlogBlogs() {
  return (
    <section className={'framer-1up0lvg'} data-framer-name={'Blogs'}>
      <div className={'framer-ep93rr'} data-framer-name={'Container'}>
        <div
          className={'framer-1ufr1kc'}
          data-framer-name={'Title Text'}
          data-framer-component-type={'RichTextContainer'}
          style={{ transform: 'none' }}
        >
          <h2
            className={'framer-text framer-styles-preset-1cqcawc'}
            data-styles-preset={'L_WLniPme'}
            style={{ '--framer-text-alignment': 'left' }}
          >
            {'All blogs'}
          </h2>
        </div>
        <div className={'framer-dle3zk'} data-framer-name={'Container'}>
          <div className={'framer-10colkk'} id={'nav-trigger'}>
            <div className={'framer-1vosqm4'}>
              <div className={'ssr-variant hidden-1cnef43 hidden-d7fev5'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'SaaSMar 13, 2025Maximizing Your ROI with Effective SaaS Solutions'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-1hjbpeh framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Desktop'}
                    href={
                      '/blog/maximizing-your-roi-with-effective-saas-solutions'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '16px',
                      borderBottomRightRadius: '16px',
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/AXGl21RdTEG4fwdLHoUkXazbNgw.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/AXGl21RdTEG4fwdLHoUkXazbNgw.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/AXGl21RdTEG4fwdLHoUkXazbNgw.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/AXGl21RdTEG4fwdLHoUkXazbNgw.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'SaaS'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Mar 13, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi':
                            'var(--token-2ff9a6d4-dab7-4ef6-b4fa-9e88617ec594, rgb(255, 255, 255))',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, var(--token-2ff9a6d4-dab7-4ef6-b4fa-9e88617ec594, rgb(255, 255, 255)))',
                          }}
                        >
                          {'Maximizing Your ROI with Effective SaaS Solutions'}
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className={'ssr-variant hidden-16tlgjf hidden-d7fev5'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'SaaSMar 13, 2025Maximizing Your ROI with Effective SaaS Solutions'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-19cubgf framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Phone'}
                    href={
                      '/blog/maximizing-your-roi-with-effective-saas-solutions'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '8px',
                      borderBottomRightRadius: '8px',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/AXGl21RdTEG4fwdLHoUkXazbNgw.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/AXGl21RdTEG4fwdLHoUkXazbNgw.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/AXGl21RdTEG4fwdLHoUkXazbNgw.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/AXGl21RdTEG4fwdLHoUkXazbNgw.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'SaaS'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Mar 13, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi': 'rgb(255, 255, 255)',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, rgb(255, 255, 255))',
                          }}
                        >
                          {'Maximizing Your ROI with Effective SaaS Solutions'}
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className={'ssr-variant hidden-1cnef43 hidden-16tlgjf'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'SaaSMar 13, 2025Maximizing Your ROI with Effective SaaS Solutions'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-1hc04hk framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Tablet'}
                    href={
                      '/blog/maximizing-your-roi-with-effective-saas-solutions'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '12px',
                      borderBottomRightRadius: '12px',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/AXGl21RdTEG4fwdLHoUkXazbNgw.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/AXGl21RdTEG4fwdLHoUkXazbNgw.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/AXGl21RdTEG4fwdLHoUkXazbNgw.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/AXGl21RdTEG4fwdLHoUkXazbNgw.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'SaaS'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Mar 13, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi': 'rgb(255, 255, 255)',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, rgb(255, 255, 255))',
                          }}
                        >
                          {'Maximizing Your ROI with Effective SaaS Solutions'}
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div className={'framer-1vosqm4'}>
              <div className={'ssr-variant hidden-1cnef43 hidden-d7fev5'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'FinanceFeb 16, 2025Essential Financial Metrics for Sustainable SaaS Success'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-1hjbpeh framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Desktop'}
                    href={
                      '/blog/essential-financial-metrics-for-sustainable-saas-success'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '16px',
                      borderBottomRightRadius: '16px',
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1502'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/w30PRJHAzUUUyagAgLvoqk1ok8.png?scale-down-to=512&width=1502&height=846 512w,/vendor/framer/images/w30PRJHAzUUUyagAgLvoqk1ok8.png?scale-down-to=1024&width=1502&height=846 1024w,/vendor/framer/images/w30PRJHAzUUUyagAgLvoqk1ok8.png?width=1502&height=846 1502w'
                            }
                            src={
                              '/vendor/framer/images/w30PRJHAzUUUyagAgLvoqk1ok8.png?width=1502&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'Finance'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi':
                            'var(--token-2ff9a6d4-dab7-4ef6-b4fa-9e88617ec594, rgb(255, 255, 255))',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, var(--token-2ff9a6d4-dab7-4ef6-b4fa-9e88617ec594, rgb(255, 255, 255)))',
                          }}
                        >
                          {
                            'Essential Financial Metrics for Sustainable SaaS Success'
                          }
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className={'ssr-variant hidden-16tlgjf hidden-d7fev5'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'FinanceFeb 16, 2025Essential Financial Metrics for Sustainable SaaS Success'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-19cubgf framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Phone'}
                    href={
                      '/blog/essential-financial-metrics-for-sustainable-saas-success'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '8px',
                      borderBottomRightRadius: '8px',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1502'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/w30PRJHAzUUUyagAgLvoqk1ok8.png?scale-down-to=512&width=1502&height=846 512w,/vendor/framer/images/w30PRJHAzUUUyagAgLvoqk1ok8.png?scale-down-to=1024&width=1502&height=846 1024w,/vendor/framer/images/w30PRJHAzUUUyagAgLvoqk1ok8.png?width=1502&height=846 1502w'
                            }
                            src={
                              '/vendor/framer/images/w30PRJHAzUUUyagAgLvoqk1ok8.png?width=1502&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'Finance'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi': 'rgb(255, 255, 255)',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, rgb(255, 255, 255))',
                          }}
                        >
                          {
                            'Essential Financial Metrics for Sustainable SaaS Success'
                          }
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className={'ssr-variant hidden-1cnef43 hidden-16tlgjf'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'FinanceFeb 16, 2025Essential Financial Metrics for Sustainable SaaS Success'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-1hc04hk framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Tablet'}
                    href={
                      '/blog/essential-financial-metrics-for-sustainable-saas-success'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '12px',
                      borderBottomRightRadius: '12px',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1502'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/w30PRJHAzUUUyagAgLvoqk1ok8.png?scale-down-to=512&width=1502&height=846 512w,/vendor/framer/images/w30PRJHAzUUUyagAgLvoqk1ok8.png?scale-down-to=1024&width=1502&height=846 1024w,/vendor/framer/images/w30PRJHAzUUUyagAgLvoqk1ok8.png?width=1502&height=846 1502w'
                            }
                            src={
                              '/vendor/framer/images/w30PRJHAzUUUyagAgLvoqk1ok8.png?width=1502&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'Finance'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi': 'rgb(255, 255, 255)',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, rgb(255, 255, 255))',
                          }}
                        >
                          {
                            'Essential Financial Metrics for Sustainable SaaS Success'
                          }
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div className={'framer-1vosqm4'}>
              <div className={'ssr-variant hidden-1cnef43 hidden-d7fev5'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'AIFeb 16, 2025Integrating Payment Gateways for Seamless Transactions'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-1hjbpeh framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Desktop'}
                    href={
                      '/blog/integrating-payment-gateways-for-seamless-transactions'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '16px',
                      borderBottomRightRadius: '16px',
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/tmq5wh891SjVWu2KSdBgSq16bXU.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/tmq5wh891SjVWu2KSdBgSq16bXU.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/tmq5wh891SjVWu2KSdBgSq16bXU.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/tmq5wh891SjVWu2KSdBgSq16bXU.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'AI'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi':
                            'var(--token-2ff9a6d4-dab7-4ef6-b4fa-9e88617ec594, rgb(255, 255, 255))',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, var(--token-2ff9a6d4-dab7-4ef6-b4fa-9e88617ec594, rgb(255, 255, 255)))',
                          }}
                        >
                          {
                            'Integrating Payment Gateways for Seamless Transactions'
                          }
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className={'ssr-variant hidden-16tlgjf hidden-d7fev5'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'AIFeb 16, 2025Integrating Payment Gateways for Seamless Transactions'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-19cubgf framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Phone'}
                    href={
                      '/blog/integrating-payment-gateways-for-seamless-transactions'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '8px',
                      borderBottomRightRadius: '8px',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/tmq5wh891SjVWu2KSdBgSq16bXU.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/tmq5wh891SjVWu2KSdBgSq16bXU.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/tmq5wh891SjVWu2KSdBgSq16bXU.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/tmq5wh891SjVWu2KSdBgSq16bXU.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'AI'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi': 'rgb(255, 255, 255)',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, rgb(255, 255, 255))',
                          }}
                        >
                          {
                            'Integrating Payment Gateways for Seamless Transactions'
                          }
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className={'ssr-variant hidden-1cnef43 hidden-16tlgjf'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'AIFeb 16, 2025Integrating Payment Gateways for Seamless Transactions'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-1hc04hk framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Tablet'}
                    href={
                      '/blog/integrating-payment-gateways-for-seamless-transactions'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '12px',
                      borderBottomRightRadius: '12px',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/tmq5wh891SjVWu2KSdBgSq16bXU.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/tmq5wh891SjVWu2KSdBgSq16bXU.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/tmq5wh891SjVWu2KSdBgSq16bXU.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/tmq5wh891SjVWu2KSdBgSq16bXU.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'AI'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi': 'rgb(255, 255, 255)',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, rgb(255, 255, 255))',
                          }}
                        >
                          {
                            'Integrating Payment Gateways for Seamless Transactions'
                          }
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div className={'framer-1vosqm4'}>
              <div className={'ssr-variant hidden-1cnef43 hidden-d7fev5'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'SaaSFeb 16, 2025Why Data Security is Vital for Every SaaS Platform'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-1hjbpeh framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Desktop'}
                    href={
                      '/blog/why-data-security-is-vital-for-every-saas-platform'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '16px',
                      borderBottomRightRadius: '16px',
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1502'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/Ldk98dSMJtEwsDSUI1r98VpAT4I.png?scale-down-to=512&width=1502&height=846 512w,/vendor/framer/images/Ldk98dSMJtEwsDSUI1r98VpAT4I.png?scale-down-to=1024&width=1502&height=846 1024w,/vendor/framer/images/Ldk98dSMJtEwsDSUI1r98VpAT4I.png?width=1502&height=846 1502w'
                            }
                            src={
                              '/vendor/framer/images/Ldk98dSMJtEwsDSUI1r98VpAT4I.png?width=1502&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'SaaS'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi':
                            'var(--token-2ff9a6d4-dab7-4ef6-b4fa-9e88617ec594, rgb(255, 255, 255))',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, var(--token-2ff9a6d4-dab7-4ef6-b4fa-9e88617ec594, rgb(255, 255, 255)))',
                          }}
                        >
                          {'Why Data Security is Vital for Every SaaS Platform'}
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className={'ssr-variant hidden-16tlgjf hidden-d7fev5'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'SaaSFeb 16, 2025Why Data Security is Vital for Every SaaS Platform'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-19cubgf framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Phone'}
                    href={
                      '/blog/why-data-security-is-vital-for-every-saas-platform'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '8px',
                      borderBottomRightRadius: '8px',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1502'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/Ldk98dSMJtEwsDSUI1r98VpAT4I.png?scale-down-to=512&width=1502&height=846 512w,/vendor/framer/images/Ldk98dSMJtEwsDSUI1r98VpAT4I.png?scale-down-to=1024&width=1502&height=846 1024w,/vendor/framer/images/Ldk98dSMJtEwsDSUI1r98VpAT4I.png?width=1502&height=846 1502w'
                            }
                            src={
                              '/vendor/framer/images/Ldk98dSMJtEwsDSUI1r98VpAT4I.png?width=1502&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'SaaS'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi': 'rgb(255, 255, 255)',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, rgb(255, 255, 255))',
                          }}
                        >
                          {'Why Data Security is Vital for Every SaaS Platform'}
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className={'ssr-variant hidden-1cnef43 hidden-16tlgjf'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'SaaSFeb 16, 2025Why Data Security is Vital for Every SaaS Platform'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-1hc04hk framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Tablet'}
                    href={
                      '/blog/why-data-security-is-vital-for-every-saas-platform'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '12px',
                      borderBottomRightRadius: '12px',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1502'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/Ldk98dSMJtEwsDSUI1r98VpAT4I.png?scale-down-to=512&width=1502&height=846 512w,/vendor/framer/images/Ldk98dSMJtEwsDSUI1r98VpAT4I.png?scale-down-to=1024&width=1502&height=846 1024w,/vendor/framer/images/Ldk98dSMJtEwsDSUI1r98VpAT4I.png?width=1502&height=846 1502w'
                            }
                            src={
                              '/vendor/framer/images/Ldk98dSMJtEwsDSUI1r98VpAT4I.png?width=1502&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'SaaS'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi': 'rgb(255, 255, 255)',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, rgb(255, 255, 255))',
                          }}
                        >
                          {'Why Data Security is Vital for Every SaaS Platform'}
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div className={'framer-1vosqm4'}>
              <div className={'ssr-variant hidden-1cnef43 hidden-d7fev5'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'StartupFeb 16, 2025Site Optimization Techniques to Boost Conversions'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-1hjbpeh framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Desktop'}
                    href={
                      '/blog/site-optimization-techniques-to-boost-conversions'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '16px',
                      borderBottomRightRadius: '16px',
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/6DM069MH6JAo4vNaeiIA39GOHA.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/6DM069MH6JAo4vNaeiIA39GOHA.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/6DM069MH6JAo4vNaeiIA39GOHA.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/6DM069MH6JAo4vNaeiIA39GOHA.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'Startup'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi':
                            'var(--token-2ff9a6d4-dab7-4ef6-b4fa-9e88617ec594, rgb(255, 255, 255))',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, var(--token-2ff9a6d4-dab7-4ef6-b4fa-9e88617ec594, rgb(255, 255, 255)))',
                          }}
                        >
                          {'Site Optimization Techniques to Boost Conversions'}
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className={'ssr-variant hidden-16tlgjf hidden-d7fev5'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'StartupFeb 16, 2025Site Optimization Techniques to Boost Conversions'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-19cubgf framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Phone'}
                    href={
                      '/blog/site-optimization-techniques-to-boost-conversions'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '8px',
                      borderBottomRightRadius: '8px',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/6DM069MH6JAo4vNaeiIA39GOHA.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/6DM069MH6JAo4vNaeiIA39GOHA.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/6DM069MH6JAo4vNaeiIA39GOHA.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/6DM069MH6JAo4vNaeiIA39GOHA.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'Startup'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi': 'rgb(255, 255, 255)',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, rgb(255, 255, 255))',
                          }}
                        >
                          {'Site Optimization Techniques to Boost Conversions'}
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className={'ssr-variant hidden-1cnef43 hidden-16tlgjf'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'StartupFeb 16, 2025Site Optimization Techniques to Boost Conversions'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-1hc04hk framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Tablet'}
                    href={
                      '/blog/site-optimization-techniques-to-boost-conversions'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '12px',
                      borderBottomRightRadius: '12px',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/6DM069MH6JAo4vNaeiIA39GOHA.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/6DM069MH6JAo4vNaeiIA39GOHA.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/6DM069MH6JAo4vNaeiIA39GOHA.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/6DM069MH6JAo4vNaeiIA39GOHA.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'Startup'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi': 'rgb(255, 255, 255)',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, rgb(255, 255, 255))',
                          }}
                        >
                          {'Site Optimization Techniques to Boost Conversions'}
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <div className={'framer-1vosqm4'}>
              <div className={'ssr-variant hidden-1cnef43 hidden-d7fev5'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'AIFeb 16, 2025Efficient Strategies for Scaling Your SaaS Business'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-1hjbpeh framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Desktop'}
                    href={
                      '/blog/efficient-strategies-for-scaling-your-saas-business'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '16px',
                      borderBottomRightRadius: '16px',
                      borderTopLeftRadius: '16px',
                      borderTopRightRadius: '16px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/EC8BRXqnxQT8QfRwtidOozt7cs.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/EC8BRXqnxQT8QfRwtidOozt7cs.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/EC8BRXqnxQT8QfRwtidOozt7cs.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/EC8BRXqnxQT8QfRwtidOozt7cs.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'AI'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi':
                            'var(--token-2ff9a6d4-dab7-4ef6-b4fa-9e88617ec594, rgb(255, 255, 255))',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, var(--token-2ff9a6d4-dab7-4ef6-b4fa-9e88617ec594, rgb(255, 255, 255)))',
                          }}
                        >
                          {
                            'Efficient Strategies for Scaling Your SaaS Business'
                          }
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className={'ssr-variant hidden-16tlgjf hidden-d7fev5'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'AIFeb 16, 2025Efficient Strategies for Scaling Your SaaS Business'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-19cubgf framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Phone'}
                    href={
                      '/blog/efficient-strategies-for-scaling-your-saas-business'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '8px',
                      borderBottomRightRadius: '8px',
                      borderTopLeftRadius: '8px',
                      borderTopRightRadius: '8px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/EC8BRXqnxQT8QfRwtidOozt7cs.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/EC8BRXqnxQT8QfRwtidOozt7cs.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/EC8BRXqnxQT8QfRwtidOozt7cs.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/EC8BRXqnxQT8QfRwtidOozt7cs.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'AI'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi': 'rgb(255, 255, 255)',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, rgb(255, 255, 255))',
                          }}
                        >
                          {
                            'Efficient Strategies for Scaling Your SaaS Business'
                          }
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className={'ssr-variant hidden-1cnef43 hidden-16tlgjf'}>
                <div className={'framer-1gttkmp-container'}>
                  <a
                    aria-label={
                      'AIFeb 16, 2025Efficient Strategies for Scaling Your SaaS Business'
                    }
                    className={
                      'framer-ssTad framer-yrDLW framer-1hjbpeh framer-v-1hc04hk framer-19mitep'
                    }
                    data-border={'true'}
                    data-framer-name={'Tablet'}
                    href={
                      '/blog/efficient-strategies-for-scaling-your-saas-business'
                    }
                    style={{
                      '--border-bottom-width': '1px',
                      '--border-color':
                        'var(--token-9f31eb8f-2d57-4065-8237-4066f919a350, rgb(25, 25, 25))',
                      '--border-left-width': '1px',
                      '--border-right-width': '1px',
                      '--border-style': 'solid',
                      '--border-top-width': '1px',
                      backgroundColor:
                        'var(--token-97c47d8c-52b8-46e3-8ddb-ef0f78ad9d88, rgb(6, 6, 6))',
                      width: '100%',
                      borderBottomLeftRadius: '12px',
                      borderBottomRightRadius: '12px',
                      borderTopLeftRadius: '12px',
                      borderTopRightRadius: '12px',
                    }}
                  >
                    <div
                      className={'framer-1jvypr8'}
                      data-framer-name={'Image Wrapper'}
                      style={{
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                      }}
                    >
                      <div
                        className={'framer-h9n16o'}
                        data-framer-name={'Gradiant Background'}
                        style={{ opacity: '0.7', transform: 'rotate(10deg)' }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            data-gradient-surface={true}
                            decoding={'async'}
                            loading={'lazy'}
                            width={'994'}
                            height={'702'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) + 274px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) + 282px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) + 282px)'
                            }
                            src={
                              '/vendor/framer/gradients/gUrIjZ2n8b2RrowJ0g1CbV3gUM.avif'
                            }
                            alt={'Gradiant Background'}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                      <div className={'framer-jdnhu1'}>
                        <div
                          style={{
                            position: 'absolute',
                            borderRadius: 'inherit',
                            cornerShape: 'inherit',
                            top: '0',
                            right: '0',
                            bottom: '0',
                            left: '0',
                          }}
                          data-framer-background-image-wrapper={'true'}
                        >
                          <img
                            decoding={'async'}
                            loading={'lazy'}
                            width={'1504'}
                            height={'846'}
                            sizes={
                              '(min-width: 1200px) calc(max((max(min(max(100vw - 120px, 1px), 1240px), 1px) - 48px) / 3, 50px) - 48px), (max-width: 809.98px) calc(max(min(max(100vw - 72px, 1px), 500px), 50px) - 40px), (min-width: 810px) and (max-width: 1199.98px) calc(max((max(min(max(100vw - 100px, 1px), 810px), 1px) - 24px) / 2, 50px) - 40px)'
                            }
                            srcSet={
                              '/vendor/framer/images/EC8BRXqnxQT8QfRwtidOozt7cs.png?scale-down-to=512&width=1504&height=846 512w,/vendor/framer/images/EC8BRXqnxQT8QfRwtidOozt7cs.png?scale-down-to=1024&width=1504&height=846 1024w,/vendor/framer/images/EC8BRXqnxQT8QfRwtidOozt7cs.png?width=1504&height=846 1504w'
                            }
                            src={
                              '/vendor/framer/images/EC8BRXqnxQT8QfRwtidOozt7cs.png?width=1504&height=846'
                            }
                            alt={''}
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '100%',
                              borderRadius: 'inherit',
                              cornerShape: 'inherit',
                              objectPosition: 'center',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className={'framer-oz0chm'}
                      data-framer-name={'Content Wrapper'}
                    >
                      <div
                        className={'framer-u9wnt8'}
                        data-framer-name={'Meta Wrapper'}
                      >
                        <div
                          className={'framer-alwwp7'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--extracted-r6o4lv':
                              'var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))',
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                            style={{
                              '--framer-text-color':
                                'var(--extracted-r6o4lv, var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36)))',
                            }}
                          >
                            {'AI'}
                          </p>
                        </div>
                        <div
                          className={'framer-11oemfx'}
                          data-framer-component-type={'RichTextContainer'}
                          style={{
                            '--framer-link-text-color': 'rgb(0, 153, 255)',
                            '--framer-link-text-decoration': 'underline',
                            opacity: '0.8',
                            transform: 'none',
                          }}
                        >
                          <p
                            className={
                              'framer-text framer-styles-preset-1u1yh6c'
                            }
                            data-styles-preset={'qkxgfTMWc'}
                          >
                            {'Feb 16, 2025'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={'framer-b24rdj'}
                        data-framer-name={'Title Text'}
                        data-framer-component-type={'RichTextContainer'}
                        style={{
                          '--extracted-a0htzi': 'rgb(255, 255, 255)',
                          '--framer-paragraph-spacing': '0px',
                          opacity: '0.8',
                          transform: 'none',
                        }}
                      >
                        <h3
                          className={'framer-text'}
                          style={{
                            '--font-selector':
                              'RlM7R2VuZXJhbCBTYW5zLW1lZGl1bQ==',
                            '--framer-font-family':
                              '"General Sans", "General Sans Placeholder", sans-serif',
                            '--framer-font-size': '20px',
                            '--framer-font-weight': '500',
                            '--framer-line-height': '1.5em',
                            '--framer-text-color':
                              'var(--extracted-a0htzi, rgb(255, 255, 255))',
                          }}
                        >
                          {
                            'Efficient Strategies for Scaling Your SaaS Business'
                          }
                        </h3>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

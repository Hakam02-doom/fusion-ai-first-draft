import { ShaderCanvas } from './ReferenceMotion.jsx';
export default function PromptShell({
  value,
  onChange,
  placeholder,
  onSend,
  ...props
}) {
  if (props.className.includes('framer-v-2yzi0f'))
    return (
      <div {...props}>
        <div className={'framer-2c8pm2-container'}>
          <div
            data-framer-component-type={'Shader'}
            style={{
              display: 'block',
              flex: '0 0 auto',
              width: '100%',
              height: '100%',
              borderRadius: 'inherit',
              cornerShape: 'inherit',
              overflowX: 'hidden',
              overflowY: 'hidden',
              transform: 'none',
            }}
          >
            <ShaderCanvas
              preset={'framer-2c8pm2-container'}
              style={{ display: 'block', width: '100%', height: '100%' }}
            />
          </div>
        </div>
        <div
          className={'framer-y94pu8'}
          data-framer-name={' Input Inner'}
          style={{
            backgroundColor:
              'var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0))',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <div className={'framer-16o33b1'} data-framer-name={'Top Area'}>
            <div
              className={'framer-ql1a56'}
              data-framer-name={'Button Wrapper'}
            >
              <div
                className={'framer-3ku544'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(2px)',
                  WebkitBackdropFilter: 'blur(2px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  data-framer-component-type={'SVG'}
                  className={'framer-1yz9u9b'}
                  aria-hidden={'true'}
                  style={{
                    imageRendering: 'pixelated',
                    flexShrink: '0',
                    fill: 'rgba(0,0,0,1)',
                    color: 'rgba(0,0,0,1)',
                    opacity: '0.5',
                  }}
                >
                  <div
                    className={'svgContainer'}
                    style={{
                      width: '100%',
                      height: '100%',
                      aspectRatio: 'inherit',
                    }}
                  >
                    <svg
                      style={{ width: '100%', height: '100%' }}
                      viewBox={'0 0 21 21'}
                    >
                      <use href={'#svg1548446190_7225'}></use>
                    </svg>
                  </div>
                </div>
                <div
                  className={'framer-5rvfvv'}
                  data-framer-name={'GPT 4.5'}
                  data-framer-component-type={'RichTextContainer'}
                  style={{
                    justifyContent: 'center',
                    '--framer-paragraph-spacing': '0px',
                    transform: 'none',
                  }}
                >
                  <p
                    className={'framer-text framer-styles-preset-1kk3io7'}
                    data-styles-preset={'GMSbta4Nb'}
                    dir={'auto'}
                  >
                    {'GPT 5.5'}
                  </p>
                </div>
                <div
                  data-framer-component-type={'SVG'}
                  className={'framer-91rn5z'}
                  aria-hidden={'true'}
                  style={{
                    imageRendering: 'pixelated',
                    flexShrink: '0',
                    fill: 'rgba(0,0,0,1)',
                    color: 'rgba(0,0,0,1)',
                  }}
                >
                  <div
                    className={'svgContainer'}
                    style={{
                      width: '100%',
                      height: '100%',
                      aspectRatio: 'inherit',
                    }}
                  >
                    <svg
                      style={{ width: '100%', height: '100%' }}
                      viewBox={'0 0 18 17'}
                    >
                      <use href={'#svg-1864421204_990'}></use>
                    </svg>
                  </div>
                </div>
              </div>
              <div
                className={'framer-85of6n'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  data-framer-component-type={'SVG'}
                  data-framer-name={'Globe'}
                  className={'framer-5zpyph'}
                  aria-hidden={'true'}
                  style={{
                    imageRendering: 'pixelated',
                    flexShrink: '0',
                    fill: 'rgba(0,0,0,1)',
                    color: 'rgba(0,0,0,1)',
                    opacity: '0.5',
                  }}
                >
                  <div
                    className={'svgContainer'}
                    style={{
                      width: '100%',
                      height: '100%',
                      aspectRatio: 'inherit',
                    }}
                  >
                    <svg
                      style={{ width: '100%', height: '100%' }}
                      viewBox={'0 0 21 21'}
                    >
                      <use href={'#svg-1975030956_2025'}></use>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={'framer-vqyd67-container'}>
            <input
              className="reference-prompt-input"
              aria-label="AI prompt demo"
              value={value}
              onChange={onChange}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onSend();
              }}
            />
            {!value && (
              <span className="reference-prompt-typewriter" aria-hidden="true">
                {placeholder}
                <span className="reference-prompt-cursor">|</span>
              </span>
            )}
          </div>
          <div
            className={'framer-d50miu'}
            data-framer-name={'Bottom Area'}
            style={{
              borderBottomLeftRadius: '8.14px',
              borderBottomRightRadius: '8.14px',
              borderTopLeftRadius: '8.14px',
              borderTopRightRadius: '8.14px',
            }}
          >
            <div className={'framer-3izdap'} data-framer-name={'Tag Wrapper'}>
              <div
                className={'framer-iox8qf'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  className={'framer-z0yjt8'}
                  data-framer-name={'Chat'}
                  data-framer-component-type={'RichTextContainer'}
                  style={{
                    justifyContent: 'center',
                    '--framer-paragraph-spacing': '0px',
                    transform: 'none',
                  }}
                >
                  <p
                    className={'framer-text framer-styles-preset-1kk3io7'}
                    data-styles-preset={'GMSbta4Nb'}
                    dir={'auto'}
                  >
                    {'Chat'}
                  </p>
                </div>
              </div>
              <div
                className={'framer-1pl3gn4'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  className={'framer-a7ug6h'}
                  data-framer-name={'Image Generator'}
                  data-framer-component-type={'RichTextContainer'}
                  style={{
                    justifyContent: 'center',
                    '--framer-paragraph-spacing': '0px',
                    transform: 'none',
                  }}
                >
                  <p
                    className={'framer-text framer-styles-preset-1kk3io7'}
                    data-styles-preset={'GMSbta4Nb'}
                    dir={'auto'}
                  >
                    {'Launch Workflow'}
                  </p>
                </div>
              </div>
              <div
                className={'framer-mr09r8'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  className={'framer-1kbag88'}
                  data-framer-name={'Video Generator'}
                  data-framer-component-type={'RichTextContainer'}
                  style={{
                    justifyContent: 'center',
                    '--framer-paragraph-spacing': '0px',
                    transform: 'none',
                  }}
                >
                  <p
                    className={'framer-text framer-styles-preset-1kk3io7'}
                    data-styles-preset={'GMSbta4Nb'}
                    dir={'auto'}
                  >
                    {'Data Analysis'}
                  </p>
                </div>
              </div>
            </div>
            <div className={'framer-17p8yrq-container'}>
              <button
                aria-label={'Send'}
                className={
                  'framer-G3leq framer-JY1O8 framer-v3o6w3 framer-v-v3o6w3'
                }
                data-framer-name={'Variant 1'}
                data-highlight={'true'}
                data-reset={'button'}
                tabIndex={'0'}
                style={{
                  '--border-bottom-width': '0px',
                  '--border-color': 'rgba(0, 0, 0, 0)',
                  '--border-left-width': '0px',
                  '--border-right-width': '0px',
                  '--border-style': 'solid',
                  '--border-top-width': '0px',
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
                type="button"
                onClick={onSend}
              >
                <div
                  className={'framer-6cncpd'}
                  data-framer-name={'Gradient'}
                  style={{
                    background:
                      'linear-gradient(163deg, rgb(255, 137, 24) 28.000000000000004%, var(--token-9ac59eff-1022-40a8-ae94-1c27de6ff71e, rgb(162, 41, 4)) 54%, var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0)) 68%, var(--token-75161833-e0e8-4cc7-a671-fa8c224dd0e8, rgb(0, 152, 243)) 100%)',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  }}
                ></div>
                <div
                  className={'framer-yl9vg5'}
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
                  className={'framer-ifyzez'}
                  data-framer-name={'Fill'}
                  style={{
                    backgroundColor:
                      'var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0))',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  }}
                ></div>
                <div
                  className={'framer-1p2nhy6'}
                  data-framer-name={'Button Inner'}
                >
                  <div className={'framer-3ty08b'} data-framer-name={'Icon'}>
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
                        width={'1024'}
                        height={'1024'}
                        sizes={
                          '(min-width: 1200px) 24px, (max-width: 809.98px) 24px, (min-width: 810px) and (max-width: 1199.98px) 24px'
                        }
                        srcSet={
                          '/vendor/framer/images/sVkwweGRCRcQUW2eM3O9WXUNw4w.png?scale-down-to=512&width=1024&height=1024 512w,/vendor/framer/images/sVkwweGRCRcQUW2eM3O9WXUNw4w.png?width=1024&height=1024 1024w'
                        }
                        src={
                          '/vendor/framer/images/sVkwweGRCRcQUW2eM3O9WXUNw4w.png?width=1024&height=1024'
                        }
                        alt={'feature card icon'}
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
                  <div
                    className={'framer-1candkg'}
                    data-framer-name={'Send'}
                    data-framer-component-type={'RichTextContainer'}
                    style={{
                      justifyContent: 'center',
                      '--framer-paragraph-spacing': '0px',
                      transform: 'none',
                    }}
                  >
                    <p
                      className={'framer-text framer-styles-preset-1kk3io7'}
                      data-styles-preset={'GMSbta4Nb'}
                    >
                      {'Send'}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  if (props.className.includes('framer-v-103sw8a'))
    return (
      <div {...props}>
        <div className={'framer-2c8pm2-container'}>
          <div
            data-framer-component-type={'Shader'}
            style={{
              display: 'block',
              flex: '0 0 auto',
              width: '100%',
              height: '100%',
              borderRadius: 'inherit',
              cornerShape: 'inherit',
              overflowX: 'hidden',
              overflowY: 'hidden',
              transform: 'none',
            }}
          >
            <ShaderCanvas
              preset={'framer-2c8pm2-container'}
              style={{ display: 'block', width: '100%', height: '100%' }}
            />
          </div>
        </div>
        <div
          className={'framer-y94pu8'}
          data-framer-name={' Input Inner'}
          style={{
            backgroundColor:
              'var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0))',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <div className={'framer-16o33b1'} data-framer-name={'Top Area'}>
            <div
              className={'framer-ql1a56'}
              data-framer-name={'Button Wrapper'}
            >
              <div
                className={'framer-3ku544'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(2px)',
                  WebkitBackdropFilter: 'blur(2px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  data-framer-component-type={'SVG'}
                  className={'framer-1yz9u9b'}
                  aria-hidden={'true'}
                  style={{
                    imageRendering: 'pixelated',
                    flexShrink: '0',
                    fill: 'rgba(0,0,0,1)',
                    color: 'rgba(0,0,0,1)',
                    opacity: '0.5',
                  }}
                >
                  <div
                    className={'svgContainer'}
                    style={{
                      width: '100%',
                      height: '100%',
                      aspectRatio: 'inherit',
                    }}
                  >
                    <svg
                      style={{ width: '100%', height: '100%' }}
                      viewBox={'0 0 21 21'}
                    >
                      <use href={'#svg1548446190_7225'}></use>
                    </svg>
                  </div>
                </div>
                <div
                  className={'framer-5rvfvv'}
                  data-framer-name={'GPT 4.5'}
                  data-framer-component-type={'RichTextContainer'}
                  style={{
                    justifyContent: 'center',
                    '--framer-paragraph-spacing': '0px',
                    transform: 'none',
                  }}
                >
                  <p
                    className={'framer-text framer-styles-preset-1kk3io7'}
                    data-styles-preset={'GMSbta4Nb'}
                    dir={'auto'}
                  >
                    {'GPT 5.5'}
                  </p>
                </div>
                <div
                  data-framer-component-type={'SVG'}
                  className={'framer-91rn5z'}
                  aria-hidden={'true'}
                  style={{
                    imageRendering: 'pixelated',
                    flexShrink: '0',
                    fill: 'rgba(0,0,0,1)',
                    color: 'rgba(0,0,0,1)',
                  }}
                >
                  <div
                    className={'svgContainer'}
                    style={{
                      width: '100%',
                      height: '100%',
                      aspectRatio: 'inherit',
                    }}
                  >
                    <svg
                      style={{ width: '100%', height: '100%' }}
                      viewBox={'0 0 18 17'}
                    >
                      <use href={'#svg-1864421204_990'}></use>
                    </svg>
                  </div>
                </div>
              </div>
              <div
                className={'framer-85of6n'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  data-framer-component-type={'SVG'}
                  data-framer-name={'Globe'}
                  className={'framer-5zpyph'}
                  aria-hidden={'true'}
                  style={{
                    imageRendering: 'pixelated',
                    flexShrink: '0',
                    fill: 'rgba(0,0,0,1)',
                    color: 'rgba(0,0,0,1)',
                    opacity: '0.5',
                  }}
                >
                  <div
                    className={'svgContainer'}
                    style={{
                      width: '100%',
                      height: '100%',
                      aspectRatio: 'inherit',
                    }}
                  >
                    <svg
                      style={{ width: '100%', height: '100%' }}
                      viewBox={'0 0 21 21'}
                    >
                      <use href={'#svg-1975030956_2025'}></use>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={'framer-vqyd67-container'}>
            <input
              className="reference-prompt-input"
              aria-label="AI prompt demo"
              value={value}
              onChange={onChange}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onSend();
              }}
            />
            {!value && (
              <span className="reference-prompt-typewriter" aria-hidden="true">
                {placeholder}
                <span className="reference-prompt-cursor">|</span>
              </span>
            )}
          </div>
          <div
            className={'framer-d50miu'}
            data-framer-name={'Bottom Area'}
            style={{
              borderBottomLeftRadius: '8.14px',
              borderBottomRightRadius: '8.14px',
              borderTopLeftRadius: '8.14px',
              borderTopRightRadius: '8.14px',
            }}
          >
            <div className={'framer-3izdap'} data-framer-name={'Tag Wrapper'}>
              <div
                className={'framer-iox8qf'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  className={'framer-z0yjt8'}
                  data-framer-name={'Chat'}
                  data-framer-component-type={'RichTextContainer'}
                  style={{
                    justifyContent: 'center',
                    '--framer-paragraph-spacing': '0px',
                    transform: 'none',
                  }}
                >
                  <p
                    className={'framer-text framer-styles-preset-1kk3io7'}
                    data-styles-preset={'GMSbta4Nb'}
                    dir={'auto'}
                  >
                    {'Chat'}
                  </p>
                </div>
              </div>
              <div
                className={'framer-1pl3gn4'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  className={'framer-a7ug6h'}
                  data-framer-name={'Image Generator'}
                  data-framer-component-type={'RichTextContainer'}
                  style={{
                    justifyContent: 'center',
                    '--framer-paragraph-spacing': '0px',
                    transform: 'none',
                  }}
                >
                  <p
                    className={'framer-text framer-styles-preset-1kk3io7'}
                    data-styles-preset={'GMSbta4Nb'}
                    dir={'auto'}
                  >
                    {'Launch Workflow'}
                  </p>
                </div>
              </div>
              <div
                className={'framer-mr09r8'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  className={'framer-1kbag88'}
                  data-framer-name={'Video Generator'}
                  data-framer-component-type={'RichTextContainer'}
                  style={{
                    justifyContent: 'center',
                    '--framer-paragraph-spacing': '0px',
                    transform: 'none',
                  }}
                >
                  <p
                    className={'framer-text framer-styles-preset-1kk3io7'}
                    data-styles-preset={'GMSbta4Nb'}
                    dir={'auto'}
                  >
                    {'Data Analysis'}
                  </p>
                </div>
              </div>
            </div>
            <div className={'framer-17p8yrq-container'}>
              <button
                aria-label={'Send'}
                className={
                  'framer-G3leq framer-JY1O8 framer-v3o6w3 framer-v-v3o6w3'
                }
                data-framer-name={'Variant 1'}
                data-highlight={'true'}
                data-reset={'button'}
                tabIndex={'0'}
                style={{
                  '--border-bottom-width': '0px',
                  '--border-color': 'rgba(0, 0, 0, 0)',
                  '--border-left-width': '0px',
                  '--border-right-width': '0px',
                  '--border-style': 'solid',
                  '--border-top-width': '0px',
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
                type="button"
                onClick={onSend}
              >
                <div
                  className={'framer-6cncpd'}
                  data-framer-name={'Gradient'}
                  style={{
                    background:
                      'linear-gradient(163deg, rgb(255, 137, 24) 28.000000000000004%, var(--token-9ac59eff-1022-40a8-ae94-1c27de6ff71e, rgb(162, 41, 4)) 54%, var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0)) 68%, var(--token-75161833-e0e8-4cc7-a671-fa8c224dd0e8, rgb(0, 152, 243)) 100%)',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  }}
                ></div>
                <div
                  className={'framer-yl9vg5'}
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
                  className={'framer-ifyzez'}
                  data-framer-name={'Fill'}
                  style={{
                    backgroundColor:
                      'var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0))',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  }}
                ></div>
                <div
                  className={'framer-1p2nhy6'}
                  data-framer-name={'Button Inner'}
                >
                  <div className={'framer-3ty08b'} data-framer-name={'Icon'}>
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
                        width={'1024'}
                        height={'1024'}
                        sizes={
                          '(min-width: 1200px) 24px, (max-width: 809.98px) 24px, (min-width: 810px) and (max-width: 1199.98px) 24px'
                        }
                        srcSet={
                          '/vendor/framer/images/sVkwweGRCRcQUW2eM3O9WXUNw4w.png?scale-down-to=512&width=1024&height=1024 512w,/vendor/framer/images/sVkwweGRCRcQUW2eM3O9WXUNw4w.png?width=1024&height=1024 1024w'
                        }
                        src={
                          '/vendor/framer/images/sVkwweGRCRcQUW2eM3O9WXUNw4w.png?width=1024&height=1024'
                        }
                        alt={'feature card icon'}
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
                  <div
                    className={'framer-1candkg'}
                    data-framer-name={'Send'}
                    data-framer-component-type={'RichTextContainer'}
                    style={{
                      justifyContent: 'center',
                      '--framer-paragraph-spacing': '0px',
                      transform: 'none',
                    }}
                  >
                    <p
                      className={'framer-text framer-styles-preset-1kk3io7'}
                      data-styles-preset={'GMSbta4Nb'}
                    >
                      {'Send'}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  if (props.className.includes('framer-v-djey10'))
    return (
      <div {...props}>
        <div
          className={'framer-y94pu8'}
          data-framer-name={' Input Inner'}
          style={{
            backgroundColor:
              'var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0))',
            borderBottomLeftRadius: '16px',
            borderBottomRightRadius: '16px',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
          }}
        >
          <div className={'framer-16o33b1'} data-framer-name={'Top Area'}>
            <div
              className={'framer-ql1a56'}
              data-framer-name={'Button Wrapper'}
            >
              <div
                className={'framer-3ku544'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(2px)',
                  WebkitBackdropFilter: 'blur(2px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  data-framer-component-type={'SVG'}
                  className={'framer-1yz9u9b'}
                  aria-hidden={'true'}
                  style={{
                    imageRendering: 'pixelated',
                    flexShrink: '0',
                    fill: 'rgba(0,0,0,1)',
                    color: 'rgba(0,0,0,1)',
                    opacity: '0.5',
                  }}
                >
                  <div
                    className={'svgContainer'}
                    style={{
                      width: '100%',
                      height: '100%',
                      aspectRatio: 'inherit',
                    }}
                  >
                    <svg
                      style={{ width: '100%', height: '100%' }}
                      viewBox={'0 0 21 21'}
                    >
                      <use href={'#svg1548446190_7225'}></use>
                    </svg>
                  </div>
                </div>
                <div
                  className={'framer-5rvfvv'}
                  data-framer-name={'GPT 4.5'}
                  data-framer-component-type={'RichTextContainer'}
                  style={{
                    justifyContent: 'center',
                    '--framer-paragraph-spacing': '0px',
                    transform: 'none',
                  }}
                >
                  <p
                    className={'framer-text framer-styles-preset-1kk3io7'}
                    data-styles-preset={'GMSbta4Nb'}
                    dir={'auto'}
                  >
                    {'GPT 5.5'}
                  </p>
                </div>
                <div
                  data-framer-component-type={'SVG'}
                  className={'framer-91rn5z'}
                  aria-hidden={'true'}
                  style={{
                    imageRendering: 'pixelated',
                    flexShrink: '0',
                    fill: 'rgba(0,0,0,1)',
                    color: 'rgba(0,0,0,1)',
                  }}
                >
                  <div
                    className={'svgContainer'}
                    style={{
                      width: '100%',
                      height: '100%',
                      aspectRatio: 'inherit',
                    }}
                  >
                    <svg
                      style={{ width: '100%', height: '100%' }}
                      viewBox={'0 0 18 17'}
                    >
                      <use href={'#svg-1864421204_990'}></use>
                    </svg>
                  </div>
                </div>
              </div>
              <div
                className={'framer-85of6n'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  data-framer-component-type={'SVG'}
                  data-framer-name={'Globe'}
                  className={'framer-5zpyph'}
                  aria-hidden={'true'}
                  style={{
                    imageRendering: 'pixelated',
                    flexShrink: '0',
                    fill: 'rgba(0,0,0,1)',
                    color: 'rgba(0,0,0,1)',
                    opacity: '0.5',
                  }}
                >
                  <div
                    className={'svgContainer'}
                    style={{
                      width: '100%',
                      height: '100%',
                      aspectRatio: 'inherit',
                    }}
                  >
                    <svg
                      style={{ width: '100%', height: '100%' }}
                      viewBox={'0 0 21 21'}
                    >
                      <use href={'#svg-1975030956_2025'}></use>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className={'framer-ur4cdg'}
            data-framer-name={'GPT 4.5'}
            data-framer-component-type={'RichTextContainer'}
            style={{
              justifyContent: 'center',
              '--framer-paragraph-spacing': '0px',
              opacity: '0.7',
              transform: 'none',
            }}
          >
            <p
              className={'framer-text framer-styles-preset-1kk3io7'}
              data-styles-preset={'GMSbta4Nb'}
              dir={'auto'}
            >
              {'Hey, can you generate a customer follow-up list'}
            </p>
          </div>
          <div
            className={'framer-d50miu'}
            data-framer-name={'Bottom Area'}
            style={{
              borderBottomLeftRadius: '8.14px',
              borderBottomRightRadius: '8.14px',
              borderTopLeftRadius: '8.14px',
              borderTopRightRadius: '8.14px',
            }}
          >
            <div className={'framer-3izdap'} data-framer-name={'Tag Wrapper'}>
              <div
                className={'framer-iox8qf'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  className={'framer-z0yjt8'}
                  data-framer-name={'Chat'}
                  data-framer-component-type={'RichTextContainer'}
                  style={{
                    justifyContent: 'center',
                    '--framer-paragraph-spacing': '0px',
                    transform: 'none',
                  }}
                >
                  <p
                    className={'framer-text framer-styles-preset-1kk3io7'}
                    data-styles-preset={'GMSbta4Nb'}
                    dir={'auto'}
                  >
                    {'Chat'}
                  </p>
                </div>
              </div>
              <div
                className={'framer-1pl3gn4'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  className={'framer-a7ug6h'}
                  data-framer-name={'Image Generator'}
                  data-framer-component-type={'RichTextContainer'}
                  style={{
                    justifyContent: 'center',
                    '--framer-paragraph-spacing': '0px',
                    transform: 'none',
                  }}
                >
                  <p
                    className={'framer-text framer-styles-preset-1kk3io7'}
                    data-styles-preset={'GMSbta4Nb'}
                    dir={'auto'}
                  >
                    {'Launch Workflow'}
                  </p>
                </div>
              </div>
              <div
                className={'framer-mr09r8'}
                data-border={'true'}
                data-framer-name={'Button'}
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'rgba(255, 255, 255, 0.08)',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backdropFilter: 'blur(6px)',
                  WebkitBackdropFilter: 'blur(6px)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
              >
                <div
                  className={'framer-1kbag88'}
                  data-framer-name={'Video Generator'}
                  data-framer-component-type={'RichTextContainer'}
                  style={{
                    justifyContent: 'center',
                    '--framer-paragraph-spacing': '0px',
                    transform: 'none',
                  }}
                >
                  <p
                    className={'framer-text framer-styles-preset-1kk3io7'}
                    data-styles-preset={'GMSbta4Nb'}
                    dir={'auto'}
                  >
                    {'Data Analysis'}
                  </p>
                </div>
              </div>
            </div>
            <div className={'framer-17p8yrq-container'}>
              <button
                aria-label={'Send'}
                className={
                  'framer-G3leq framer-JY1O8 framer-v3o6w3 framer-v-v3o6w3'
                }
                data-framer-name={'Variant 1'}
                data-highlight={'true'}
                data-reset={'button'}
                tabIndex={'0'}
                style={{
                  '--border-bottom-width': '0px',
                  '--border-color': 'rgba(0, 0, 0, 0)',
                  '--border-left-width': '0px',
                  '--border-right-width': '0px',
                  '--border-style': 'solid',
                  '--border-top-width': '0px',
                  backgroundColor: 'rgba(0, 0, 0, 0)',
                  borderBottomLeftRadius: '8px',
                  borderBottomRightRadius: '8px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                }}
                type="button"
                onClick={onSend}
              >
                <div
                  className={'framer-6cncpd'}
                  data-framer-name={'Gradient'}
                  style={{
                    background:
                      'linear-gradient(163deg, rgb(255, 137, 24) 28.000000000000004%, var(--token-9ac59eff-1022-40a8-ae94-1c27de6ff71e, rgb(162, 41, 4)) 54%, var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0)) 68%, var(--token-75161833-e0e8-4cc7-a671-fa8c224dd0e8, rgb(0, 152, 243)) 100%)',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  }}
                ></div>
                <div
                  className={'framer-yl9vg5'}
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
                  className={'framer-ifyzez'}
                  data-framer-name={'Fill'}
                  style={{
                    backgroundColor:
                      'var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0))',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  }}
                ></div>
                <div
                  className={'framer-1p2nhy6'}
                  data-framer-name={'Button Inner'}
                >
                  <div className={'framer-3ty08b'} data-framer-name={'Icon'}>
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
                        width={'1024'}
                        height={'1024'}
                        sizes={
                          '(min-width: 1200px) 24px, (max-width: 809.98px) 24px, (min-width: 810px) and (max-width: 1199.98px) 24px'
                        }
                        srcSet={
                          '/vendor/framer/images/sVkwweGRCRcQUW2eM3O9WXUNw4w.png?scale-down-to=512&width=1024&height=1024 512w,/vendor/framer/images/sVkwweGRCRcQUW2eM3O9WXUNw4w.png?width=1024&height=1024 1024w'
                        }
                        src={
                          '/vendor/framer/images/sVkwweGRCRcQUW2eM3O9WXUNw4w.png?width=1024&height=1024'
                        }
                        alt={'feature card icon'}
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
                  <div
                    className={'framer-1candkg'}
                    data-framer-name={'Send'}
                    data-framer-component-type={'RichTextContainer'}
                    style={{
                      justifyContent: 'center',
                      '--framer-paragraph-spacing': '0px',
                      transform: 'none',
                    }}
                  >
                    <p
                      className={'framer-text framer-styles-preset-1kk3io7'}
                      data-styles-preset={'GMSbta4Nb'}
                    >
                      {'Send'}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  return null;
}

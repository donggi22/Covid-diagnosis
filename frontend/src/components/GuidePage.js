import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './GuidePage.css';

const GuidePage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const sectionsRef = useRef([]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      sectionsRef.current.forEach((section, index) => {
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;

        if (isVisible) {
          section.classList.add('visible');
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            setActiveSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const TypingText = ({ text, speed = 50 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (currentIndex >= text.length) return undefined;
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }, [currentIndex, text, speed]);

    return <span>{displayedText}</span>;
  };

  const CountUp = ({ target, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting || count >= target) return;
          const increment = target / (duration / 16);
          const timer = setInterval(() => {
            setCount((prev) => {
              const next = prev + increment;
              if (next >= target) {
                clearInterval(timer);
                return target;
              }
              return next;
            });
          }, 16);
        },
        { threshold: 0.5 }
      );

      if (countRef.current) observer.observe(countRef.current);
      return () => observer.disconnect();
    }, [target, duration, count]);

    return <span ref={countRef}>{Math.floor(count)}</span>;
  };

  const featureList = [
    {
      title: 'AI 이미지 분석',
      description:
        '의료 영상을 업로드하면 AI가 자동으로 분석하여 이상 소견을 찾아냅니다. 정상/경계/이상으로 분류하고 이상 부위를 하이라이트합니다.',
      bullets: [
        '✅ 다중 파일 업로드 지원',
        '✅ 드래그 앤 드롭 인터페이스',
        '✅ 실시간 분석 결과 표시',
        '✅ 이상 부위 하이라이트'
      ],
      demo: (
        <div className="image-upload-demo">
          <div className="upload-area-demo">
            <div className="upload-icon-demo">📁</div>
            <p>이미지 업로드</p>
          </div>
          <div className="analysis-progress">
            <div
              className="progress-bar-demo"
              style={{ width: `${Math.min(100, (scrollY - 800) / 10)}%` }}
            />
          </div>
          <div className="analysis-result-demo">
            <div className="result-badge normal">정상</div>
            <div className="result-badge abnormal">이상</div>
          </div>
        </div>
      )
    },
    {
      title: '판독문 자동 생성',
      description:
        'AI 분석 결과를 바탕으로 판독문 초안을 자동으로 생성해 의사가 빠르게 검토하고 수정할 수 있도록 돕습니다.',
      bullets: [
        '✅ AI 기반 초안 자동 생성',
        '✅ 증상, 권장 조치 자동 채움',
        '✅ 커스터마이징 가능한 템플릿',
        '✅ 판독 이력과 자동 연동'
      ],
      demo: (
        <div className="report-editor-demo">
          <div className="editor-header-demo">
            <h3>판독문 자동 생성</h3>
          </div>
          <div className="editor-content-demo">
            {activeSection >= 1 && (
              <TypingText
                text={`환자: 김OO (45세, 남성)

검진일: 2024-11-05

소견:
우하엽에 음영 증가 소견이 관찰됩니다.

권장사항:
1. 항생제 치료 고려
2. 추후 재촬영 권장`}
                speed={30}
              />
            )}
          </div>
        </div>
      )
    },
    {
      title: '배치 판독 시스템',
      description:
        '여러 의료 영상을 한 번에 업로드하여 순차적으로 판독할 수 있는 배치 판독 모드로 업무 효율을 극대화합니다.',
      bullets: [
        '✅ 케이스별 자동 큐잉',
        '✅ 키보드 단축키 지원',
        '✅ AI 추천 우선순위 제공',
        '✅ 판독 완료 후 자동 레포트 생성'
      ],
      demo: (
        <div className="batch-mode-demo">
          <div className="batch-queue">
            {['Case #101', 'Case #102', 'Case #103'].map((item, idx) => (
              <div key={item} className={`batch-item ${idx === activeSection - 1 ? 'active' : ''}`}>
                {item}
              </div>
            ))}
          </div>
          <div className="batch-preview">🩻</div>
        </div>
      )
    },
    {
      title: '3D 의료 영상 뷰어',
      description:
        'VTK.js 기반의 3D 볼륨 렌더링과 STL 모델을 지원하여 정밀한 의료 영상 확인이 가능합니다.',
      bullets: [
        '✅ 3D 볼륨 렌더링',
        '✅ ROI 하이라이트',
        '✅ 회전/확대/단면 보기',
        '✅ 폐 모델 등 STL 지원'
      ],
      demo: (
        <div className="viewer-demo">
          <div className="viewer-canvas">🧠</div>
          <div className="viewer-controls">
            <button>Rotate</button>
            <button>Slice</button>
            <button>Measure</button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="guide-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="fade-in">검진 보조 AI 기능 가이드</span>
          </h1>
          <p className="hero-subtitle fade-in-delay">
            반복 작업을 줄이고 환자 케어에 집중할 수 있도록 설계된 기능을 살펴보세요.
          </p>
          <div className="hero-stats fade-in-delay-2">
            <div className="stat-item">
              <div className="stat-number">
                <CountUp target={60} />%
              </div>
              <div className="stat-label">업무 시간 절감</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <CountUp target={95} />%
              </div>
              <div className="stat-label">AI 판독 정확도</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                <CountUp target={500} />+
              </div>
              <div className="stat-label">일일 처리 환자 수</div>
            </div>
          </div>
          <button
            className="btn btn-primary btn-large hero-cta fade-in-delay-3"
            onClick={() => navigate('/diagnosis')}
          >
            AI 진단 시작하기
          </button>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">🔬</div>
            <div className="card-text">AI 분석</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">📝</div>
            <div className="card-text">자동 생성</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">⚡</div>
            <div className="card-text">빠른 처리</div>
          </div>
        </div>
      </section>

      {featureList.map((feature, index) => (
        <section
          key={feature.title}
          ref={(el) => {
            sectionsRef.current[index] = el;
          }}
          className={`feature-section section-${index + 1} ${
            index % 2 === 1 ? 'reverse' : ''
          }`}
        >
          <div className="feature-content">
            {index % 2 === 1 && <div className="feature-visual">{feature.demo}</div>}
            <div className="feature-text">
              <h2 className="feature-title">{feature.title}</h2>
              <p className="feature-description">{feature.description}</p>
              <ul className="feature-list">
                {feature.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            {index % 2 === 0 && <div className="feature-visual">{feature.demo}</div>}
          </div>
        </section>
      ))}

      <section className="cta-section">
        <div className="cta-card">
          <h2>검진 보조 AI가 준비되어 있습니다</h2>
          <p>
            지금 바로 AI 진단을 시작해 보세요. 업무 효율을 높이고 더욱 정확한 진단을 경험할
            수 있습니다.
          </p>
          <div className="cta-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/diagnosis')}>
              AI 진단 바로가기
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/mypage')}>
              마이페이지로 이동
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuidePage;










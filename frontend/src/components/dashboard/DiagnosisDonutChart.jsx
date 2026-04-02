import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { diagnosisAPI } from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * 진단 분류 분포 도넛 차트 컴포넌트
 */
const DiagnosisDonutChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [diagnosisData, setDiagnosisData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  // 진단 이력 데이터 가져오기
  useEffect(() => {
    const fetchDiagnosisData = async () => {
      try {
        setLoading(true);
        const diagnoses = await diagnosisAPI.getDiagnoses();
        setDiagnosisData(diagnoses || []);
      } catch (error) {
        console.error('진단 데이터 로드 실패:', error);
        setDiagnosisData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiagnosisData();
  }, []);

  useEffect(() => {
    if (!chartRef.current || loading) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    // 진단 결과별 카운트
    const conditionCount = {};
    diagnosisData.forEach((diagnosis) => {
      const condition = diagnosis.aiAnalysis?.findings?.[0]?.condition;
      if (condition) {
        // 영어 값을 한국어로 매핑
        const conditionMap = {
          'Normal': '정상',
          'Normal Range': '정상',  // Normal Range를 정상으로 통합
          'Pneumonia': '폐렴',
          'Lung Opacity': '폐 불투명화',
          'COVID-19': '코로나19',
          '정상': '정상',
          '정상 범위': '정상',  // 정상 범위도 정상으로 통합
          '폐렴': '폐렴',
          '폐 불투명화': '폐 불투명화',
          '코로나19': '코로나19',
          '코로나': '코로나19',
          // 기타 값도 그대로 사용
        };
        const koreanCondition = conditionMap[condition] || condition;
        conditionCount[koreanCondition] = (conditionCount[koreanCondition] || 0) + 1;
      }
    });

    // 차트 데이터 생성 - 병명별 색상 매핑
    const colorMap = {
      // 정상 관련
      '정상': '#22c55e',           // 초록색
      'Normal': '#22c55e',
      '정상 범위': '#10b981',       // 진한 초록색
      'Normal Range': '#10b981',
      
      // 폐렴 관련
      '폐렴': '#f97316',            // 주황색
      'Pneumonia': '#f97316',
      'Viral Pneumonia': '#fb923c', // 밝은 주황색
      
      // COVID-19 관련
      '코로나19': '#ef4444',        // 빨간색
      '코로나': '#ef4444',
      'COVID-19': '#ef4444',
      'COVID': '#dc2626',           // 진한 빨간색
      
      // 폐 불투명화 관련
      '폐 불투명화': '#6366f1',      // 보라색
      'Lung Opacity': '#6366f1',
      'Lung_Opacity': '#6366f1',
      '폐기종': '#8b5cf6',          // 진한 보라색
      
      // 기타 질환
      'Cardiomegaly': '#ec4899',    // 분홍색
      '심장비대': '#ec4899',
      
      // 알 수 없는 질환은 청록색 계열
      '예상 질환 A': '#06b6d4',      // 청록색
      '기타': '#64748b',             // 회색
    };
    
    // 색상 순환을 위한 색상 팔레트 (매핑되지 않은 항목용)
    const defaultColors = [
      '#3b82f6', // 파란색
      '#8b5cf6', // 보라색
      '#ec4899', // 분홍색
      '#f59e0b', // 황금색
      '#10b981', // 초록색
      '#06b6d4', // 청록색
      '#6366f1', // 인디고
      '#f97316', // 주황색
      '#ef4444', // 빨간색
      '#14b8a6', // 틸색
    ];
    
    let colorIndex = 0;

    const data = Object.keys(conditionCount).map((condition) => {
      // 색상 찾기: 정확한 매칭 먼저 시도
      let color = colorMap[condition];
      
      // 대소문자 무시하고 찾기
      if (!color) {
        const lowerCondition = condition.toLowerCase();
        for (const [key, value] of Object.entries(colorMap)) {
          if (key.toLowerCase() === lowerCondition) {
            color = value;
            break;
          }
        }
      }
      
      // 부분 매칭 시도 (예: "Normal Range"가 "normal"을 포함하는 경우)
      if (!color) {
        const lowerCondition = condition.toLowerCase();
        for (const [key, value] of Object.entries(colorMap)) {
          if (key.toLowerCase().includes(lowerCondition) || lowerCondition.includes(key.toLowerCase())) {
            color = value;
            break;
          }
        }
      }
      
      // 매핑되지 않은 경우 기본 색상 팔레트에서 선택
      if (!color) {
        color = defaultColors[colorIndex % defaultColors.length];
        colorIndex++;
      }
      
      return {
        value: conditionCount[condition],
        name: condition,
        itemStyle: { color: color },
      };
    });

    // 데이터가 없으면 빈 차트 표시
    if (data.length === 0) {
      data.push({
        value: 1,
        name: '데이터 없음',
        itemStyle: { color: '#e2e8f0' },
      });
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          if (params.name === '데이터 없음') {
            return '진단 데이터가 없습니다.';
          }
          const percentage = ((params.value / total) * 100).toFixed(1);
          return `${params.name}: ${params.value}건 (${percentage}%)`;
        },
      },
      legend: {
        orient: 'horizontal',
        bottom: 5,
        left: 'center',
        itemGap: 10,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          fontSize: 11,
          color: darkMode ? '#e5e7eb' : '#333',
          fontWeight: '500'
        },
        formatter: (name) => {
          if (name === '데이터 없음') return name;
          const item = data.find(d => d.name === name);
          if (!item) return name;
          const percentage = ((item.value / total) * 100).toFixed(1);
          return `${name} ${percentage}%`;
        }
      },
      series: [
        {
          name: '진단 분류',
          type: 'pie',
          radius: ['45%', '72%'],
          center: ['50%', '40%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false
          },
          labelLine: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data: data
        }
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: '38%',
          style: {
            text: `총 ${total}건`,
            fontSize: 16,
            fontWeight: 'bold',
            fill: darkMode ? '#e5e7eb' : '#333',
            textAlign: 'center',
            textVerticalAlign: 'middle'
          },
          z: 100
        }
      ]
    };

    chart.setOption(option);

    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, [diagnosisData, loading, darkMode]);

  if (loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: '180px',
          padding: '6px 10px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: '#666', fontSize: '14px' }}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '320px', padding: '10px 10px 20px 10px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <div ref={chartRef} style={{ width: '100%', height: '100%', flex: 1, minHeight: '280px' }} />
    </div>
  );
};

export default DiagnosisDonutChart;

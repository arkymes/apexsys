
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { PillarStats } from '../types.ts';
import { PILLAR_LABELS } from '../constants.tsx';

interface PillarChartProps {
  stats: PillarStats;
}

const PillarChart: React.FC<PillarChartProps> = ({ stats }) => {
  const data = Object.keys(stats).map((key) => ({
    subject: PILLAR_LABELS[key as keyof PillarStats],
    A: stats[key as keyof PillarStats],
    fullMark: 100,
  }));

  return (
    <div className="w-full h-full min-h-[250px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'JetBrains Mono', fontWeight: 'bold' }} 
          />
          <Radar
            name="Stats"
            dataKey="A"
            stroke="#38bdf8"
            strokeWidth={2}
            fill="#38bdf8"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PillarChart;

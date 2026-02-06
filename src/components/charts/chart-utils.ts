import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler, Plugin } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const CHART_COLORS = {
  amberGold: '#F59E0B',
};

export const CHART_COLORS_DARK = {
  amberGold: '#FBBF24',
};

export const LOCATION_COLORS = [
  '#1E293B', // Slate 800
  '#F59E0B', // Amber 500
  '#0284C7', // Sky 600
  '#059669', // Emerald 600
  '#DC2626', // Red 600
  '#7C3AED', // Violet 600
  '#0D9488', // Teal 600
];

export const LOCATION_COLORS_DARK = [
  '#94A3B8', // Slate 400
  '#FCD34D', // Amber 300
  '#38BDF8', // Sky 400
  '#34D399', // Emerald 400
  '#F87171', // Red 400
  '#A78BFA', // Violet 400
  '#2DD4BF', // Teal 400
];

export const createOutsideLabelsPlugin = (isDark: boolean) => {
  return {
    id: 'outsideLabels',
    afterDraw: (chart: any) => {
      const { ctx, width, height } = chart;
      const { datasets } = chart.data;
      
      ctx.save();
      ctx.font = `bold 11px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const meta = chart.getDatasetMeta(0);
      
      meta.data.forEach((element: any, index: number) => {
        if (element.hidden) return;

        const { x, y } = element.tooltipPosition();
        const value = datasets[0].data[index] as number;
        
        const centerX = width / 2;
        const centerY = height / 2;
        
        const angle = Math.atan2(y - centerY, x - centerX);
        
        const offset = 25; 
        
        const tx = x + Math.cos(angle) * offset;
        const ty = y + Math.sin(angle) * offset;

        const textWidth = ctx.measureText(String(value)).width + 8;
        ctx.fillStyle = isDark ? '#1E293B' : '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 4;
        
        ctx.beginPath();
        ctx.roundRect(tx - textWidth/2, ty - 10, textWidth, 20, 10);
        ctx.fill();
        
        ctx.shadowColor = 'transparent';
        
        ctx.fillStyle = isDark ? '#F1F5F9' : '#1E293B';
        ctx.fillText(String(value), tx, ty);
      });
      
      ctx.restore();
    }
  };
};
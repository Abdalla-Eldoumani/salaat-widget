import type { WidgetLayout, WidgetViewProps } from '../../types';
import Bar from './Bar';
import Compact from './Compact';
import Sidebar from './Sidebar';

export default function Widget({ layout, ...view }: WidgetViewProps & { layout: WidgetLayout }) {
  if (layout === 'horizontal') return <Bar {...view} />;
  if (layout === 'vertical') return <Sidebar {...view} />;
  return <Compact {...view} />;
}

import HistoryControl from '@/components/whiteboard/controls/HistoryControl';
import OverlayControl from '@/components/whiteboard/controls/OverlayControl';
import ZoomControls from '@/components/whiteboard/controls/ZoomControl';

import SidebarContainer from '@/components/whiteboard/sidebar/SidebarContainer';
import ToolbarContainer from '@/components/whiteboard/toolbar/ToolbarContainer';

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <ToolbarContainer />
      <SidebarContainer />
      <HistoryControl />
      <ZoomControls />
      <OverlayControl />
    </div>
  );
}

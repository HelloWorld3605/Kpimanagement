import React from 'react';
import { ArrowUpIcon, ChevronRightIcon, MaximizeIcon, MinusIcon, PlusIcon } from 'lucide-react';
import { OrgChartNode } from './OrgChartNode';
import { useCanvasView } from '../../hooks/useCanvasView';
import { useFillHeight } from '../../hooks/useFillHeight';
import { findUnit, rootUnit, unitPath } from '../../utils/org';

type OrgChartProps = {
  rootId: string;
  onRoot: (id: string) => void;
  onViewMembers: (id: string) => void;
};

const ctrlBtn =
'flex h-8 w-8 items-center justify-center rounded text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-40';

export function OrgChart({ rootId, onRoot, onViewMembers }: OrgChartProps) {
  const root = findUnit(rootId) ?? rootUnit;
  const path = unitPath(root.id);
  const canvas = useCanvasView(root.id);
  const { x, y, scale } = canvas.view;
  const fill = useFillHeight<HTMLDivElement>(768, -22);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-4">
        <nav aria-label="Phạm vi sơ đồ" className="flex flex-wrap items-center gap-1 text-[14px]">
          {path.map((u, i) => {
            const last = i === path.length - 1;
            return (
              <React.Fragment key={u.id}>
                {last ?
                <span className="font-semibold text-gray-900">{u.name}</span> :

                <button
                  type="button"
                  onClick={() => onRoot(u.id)}
                  className="rounded text-gray-500 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  style={{ transition: 'color 120ms ease-out' }}>
                  
                    {u.shortName ?? u.name}
                  </button>
                }
                {!last && <ChevronRightIcon className="h-4 w-4 text-gray-300" aria-hidden />}
              </React.Fragment>);

          })}
        </nav>
        {root.parentId &&
        <button
          type="button"
          onClick={() => onRoot(root.parentId as string)}
          className="flex h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-[14px] font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          style={{ transition: 'background-color 150ms ease-out' }}>
          
            <ArrowUpIcon className="h-4 w-4" aria-hidden />
            Lên cấp trên
          </button>
        }
      </div>

      {/* Khung sơ đồ cao đúng phần còn lại của màn hình → trang không cuộn */}
      <div ref={fill.ref} className="relative" style={{ height: fill.height }}>
        <div
          ref={canvas.viewportRef}
          {...canvas.handlers}
          tabIndex={0}
          role="region"
          aria-label="Sơ đồ tổ chức. Dùng phím cộng, trừ để thu phóng, phím 0 để vừa màn hình, mũi tên để di chuyển."
          className={`relative h-[calc(100vh-11.5rem)] min-h-[460px] md:h-full md:min-h-0 touch-none select-none overflow-hidden bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 ${
          canvas.dragging ? 'cursor-grabbing' : 'cursor-grab'}`
          }
          style={{
            backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${x}px ${y}px`
          }}>
          
          <div
            ref={canvas.contentRef}
            className="org-chart absolute left-0 top-0 w-max p-2"
            style={{
              // Không dùng translate3d / will-change cố định: trình duyệt sẽ chụp lớp ở tỉ lệ cũ rồi phóng ảnh → chữ bị mờ.
              // Chỉ bật will-change khi đang kéo; khi dừng, nội dung được vẽ lại sắc nét ở tỉ lệ mới.
              transform: `translate(${Math.round(x)}px, ${Math.round(y)}px) scale(${scale})`,
              transformOrigin: '0 0',
              transition: canvas.animated ? 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)' : 'none',
              willChange: canvas.dragging ? 'transform' : 'auto'
            }}>
            
            <ul>
              <OrgChartNode unit={root} depth={0} maxDepth={2} onRoot={onRoot} onViewMembers={onViewMembers} />
            </ul>
          </div>
        </div>

        <p className="pointer-events-none absolute bottom-4 left-4 hidden rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[12px] text-gray-500 shadow-sm md:block">
          Cuộn chuột để thu phóng · Kéo nền để di chuyển · Bấm đơn vị để đi sâu
        </p>

        <div
          role="toolbar"
          aria-label="Điều khiển sơ đồ"
          className="absolute bottom-4 right-4 flex items-center gap-0.5 rounded-md border border-gray-200 bg-white p-1 shadow-sm">
          
          <button type="button" onClick={canvas.zoomOut} disabled={!canvas.canZoomOut} aria-label="Thu nhỏ" title="Thu nhỏ (−)" className={ctrlBtn}>
            <MinusIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={canvas.resetZoom}
            title="Về 100%"
            aria-label={`Mức thu phóng ${Math.round(scale * 100)}%, bấm để về 100%`}
            className="h-8 w-14 rounded text-[13px] font-medium tabular-nums text-gray-700 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            
            {Math.round(scale * 100)}%
          </button>
          <button type="button" onClick={canvas.zoomIn} disabled={!canvas.canZoomIn} aria-label="Phóng to" title="Phóng to (+)" className={ctrlBtn}>
            <PlusIcon className="h-4 w-4" />
          </button>
          <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden />
          <button type="button" onClick={canvas.fit} aria-label="Vừa màn hình" title="Vừa màn hình (0)" className={ctrlBtn}>
            <MaximizeIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>);

}
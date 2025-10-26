import React from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BaseCard from './BaseCard';
import type { ProfileConfig, Service } from '../../index';

const DragHandleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path d="M7 5a1 1 0 110-2 1 1 0 010 2zm6-2a1 1 0 100 2 1 1 0 000-2zM7 11a1 1 0 110-2 1 1 0 010 2zm6-2a1 1 0 100 2 1 1 0 000-2zM7 17a1 1 0 110-2 1 1 0 010 2zm6-2a1 1 0 100 2 1 1 0 000-2z" />
  </svg>
);

const RemoveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-2.28-9.78a.75.75 0 011.06 0L10 9.44l1.22-1.22a.75.75 0 111.06 1.06L11.06 10.5l1.22 1.22a.75.75 0 11-1.06 1.06L10 11.56l-1.22 1.22a.75.75 0 11-1.06-1.06L8.94 10.5 7.72 9.28a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

const AddIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
  </svg>
);

const createServiceId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

type SortableInstance = ReturnType<typeof useSortable>;

interface SortableRenderProps {
  attributes: SortableInstance['attributes'];
  listeners: SortableInstance['listeners'];
  setActivatorNodeRef: SortableInstance['setActivatorNodeRef'];
  isDragging: boolean;
}

interface SortableServiceItemProps {
  id: string;
  disabled?: boolean;
  children: (props: SortableRenderProps) => React.ReactNode;
}

const SortableServiceItem: React.FC<SortableServiceItemProps> = ({ id, disabled, children }) => {
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {children({ attributes, listeners, setActivatorNodeRef, isDragging })}
      {isDragging && (
        <div className="absolute inset-0 rounded-2xl border-2 border-blue-400/70 border-dashed pointer-events-none" />
      )}
    </div>
  );
};

interface ServicesCardProps {
  config: ProfileConfig;
  services: Service[];
  onServiceChange: (services: Service[]) => void;
  isRtl: boolean;
  t: (key: string) => string;
  mode?: 'edit' | 'view';
}

const ServicesCard: React.FC<ServicesCardProps> = ({
  config,
  services,
  onServiceChange,
  isRtl,
  t,
  mode = 'edit',
}) => {
  const isView = mode === 'view';
  const dirAttr = isRtl ? 'rtl' : 'ltr';

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 6 },
  }));

  const ensureStringId = (service: Service, fallback: number) => {
    if (service?.id) {
      return String(service.id);
    }
    return `svc-${fallback}`;
  };

  const serviceIds = services.map((service, index) => ensureStringId(service, index));

  const updateService = (index: number, field: keyof Service, value: string) => {
    if (isView) return;
    const updated = services.map((service, idx) => (idx === index ? { ...service, [field]: value } : service));
    onServiceChange(updated);
  };

  const addService = () => {
    if (isView) return;
    const newService: Service = {
      id: createServiceId(),
      title: 'New Service',
      description: 'Describe your service here...',
    };
    onServiceChange([...services, newService]);
  };

  const removeService = (index: number) => {
    if (isView) return;
    onServiceChange(services.filter((_, idx) => idx !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (isView) {
      return;
    }

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = serviceIds.indexOf(String(active.id));
    const newIndex = serviceIds.indexOf(String(over.id));

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = arrayMove(services, oldIndex, newIndex);
    onServiceChange(reordered);
  };

  const inputBase = 'bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded-md px-2 py-1 w-full';
  const readOnlyExtras = 'pointer-events-none focus:ring-0 focus:outline-none hover:bg-transparent';
  const inputClass = `${inputBase}${isView ? ` ${readOnlyExtras}` : ''}`;

  return (
    <BaseCard variant="default" className="overflow-hidden">
      <div className="space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 rounded-full ${config.styles.colorPrimary} flex items-center justify-center shadow-lg`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h2 className={`text-3xl font-bold mb-2 ${config.styles.fontHeading} ${config.styles.colorSecondary} relative`}>
            {t('myServices')}
            <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 ${config.styles.colorPrimary} rounded-full`} />
          </h2>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={serviceIds} strategy={verticalListSortingStrategy}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => {
                const sortableId = serviceIds[index];
                return (
                  <SortableServiceItem key={sortableId} id={sortableId} disabled={isView}>
                    {({ attributes, listeners, setActivatorNodeRef, isDragging }) => {
                      const activatorProps = attributes as React.ButtonHTMLAttributes<HTMLButtonElement>;
                      const listenerProps = (listeners ?? {}) as React.DOMAttributes<HTMLButtonElement>;

                      return (
                      <BaseCard
                        variant="glass"
                        padding="md"
                        className={`relative group transition-shadow duration-200 ${
                          isDragging ? 'shadow-2xl ring-2 ring-blue-500/40' : ''
                        }`}
                        hoverable={!isView}
                      >
                        {!isView && (
                          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              ref={setActivatorNodeRef}
                              {...activatorProps}
                              {...listenerProps}
                              className="p-2 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 shadow-sm transition-colors"
                              title="Drag to reorder"
                            >
                              <DragHandleIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeService(index)}
                              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-sm transition-colors"
                              title="Remove service"
                            >
                              <RemoveIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <div className="space-y-4">
                          {isView ? (
                            <h3 className={`${config.styles.fontHeading} text-xl font-semibold text-center text-slate-800 dark:text-slate-200`}>
                              {service.title}
                            </h3>
                          ) : (
                            <input
                              type="text"
                              value={service.title}
                              onChange={(event) => updateService(index, 'title', event.target.value)}
                              className={`${inputClass} ${config.styles.fontHeading} text-xl font-semibold text-center text-slate-800 dark:text-slate-200`}
                              placeholder="Service Title"
                              dir={dirAttr}
                            />
                          )}

                          {isView ? (
                            <p className={`${config.styles.fontBody} text-slate-600 dark:text-slate-400 text-center whitespace-pre-line`}>
                              {service.description}
                            </p>
                          ) : (
                            <textarea
                              value={service.description}
                              onChange={(event) => updateService(index, 'description', event.target.value)}
                              className={`${inputClass} ${config.styles.fontBody} text-slate-600 dark:text-slate-400 text-center min-h-[100px] resize-none`}
                              placeholder="Describe this service..."
                              dir={dirAttr}
                            />
                          )}
                        </div>
                      </BaseCard>
                      );
                    }}
                  </SortableServiceItem>
                );
              })}

              {!isView && (
                <BaseCard
                  variant="minimal"
                  padding="md"
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer"
                  onClick={addService}
                >
                  <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors">
                    <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center mb-3">
                      <AddIcon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">Add Service</span>
                  </div>
                </BaseCard>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </BaseCard>
  );
};

export default ServicesCard;


import React from 'react';
import { Plus } from 'lucide-react';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAction = ({ label, description, onClick }: { 
  label: string; 
  description?: string; 
  onClick: () => void; 
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-full rounded-xl border border-gray-200 p-3 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-colors"
    aria-label={`Create ${label}`}
  >
    <div className="text-sm font-medium text-primary">
      {label}
    </div>
    {description && (
      <div className="text-xs mt-0.5 text-gray-600">
        {description}
      </div>
    )}
    <div className="mt-2 h-6 w-6 rounded-md grid place-items-center group-hover:opacity-90 bg-tertiary" aria-hidden>
      <Plus className="size-4 text-primary" />
    </div>
  </button>
);

const CreateModal: React.FC<CreateModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleAction = (action: string) => {
    alert(`${action} flow`);
    onClose();
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label="Create"
      className="fixed inset-0 z-50 animate-fade-in"
    >
      <button
        type="button"
        aria-label="Close create menu"
        className="absolute inset-0 w-full h-full backdrop-blur-xl bg-black/30"
        onClick={onClose}
      />
      
      <div className="absolute bottom-0 inset-x-0 mx-auto max-w-[480px] rounded-t-2xl bg-white shadow-2xl border border-gray-200 animate-slide-up">
        <div className="px-5 pt-4 pb-2">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200 mb-3" aria-hidden />
          <h3 className="text-base font-semibold text-primary">
            Create
          </h3>
          <p className="text-sm text-gray-600">
            Post an update, start a circle, or explore the shop.
          </p>
        </div>
        
        <div className="px-3 pb-5 grid grid-cols-3 gap-3">
          <CreateAction 
            label="Post" 
            description="Text, photo, or short video" 
            onClick={() => handleAction("Post")} 
          />
          <CreateAction 
            label="Circle" 
            description="Start a private group" 
            onClick={() => handleAction("Circle")} 
          />
          <CreateAction 
            label="Shop" 
            description="List or find items" 
            onClick={() => handleAction("Shop")} 
          />
        </div>
        
        <div className="px-3 pb-4">
          <button
            type="button"
            className="w-full rounded-xl border border-gray-200 py-2 text-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateModal;
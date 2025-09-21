import React from 'react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface ShopCategoriesProps {
  selected: string;
  onSelect: (category: string) => void;
}

const categories = [
  { id: 'all', label: 'All', icon: '🛍️' },
  { id: 'electronics', label: 'Electronics', icon: '📱' },
  { id: 'fashion', label: 'Fashion', icon: '👗' },
  { id: 'home', label: 'Home & Garden', icon: '🏠' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'beauty', label: 'Beauty', icon: '💄' },
  { id: 'books', label: 'Books', icon: '📚' },
  { id: 'art', label: 'Art & Crafts', icon: '🎨' },
  { id: 'food', label: 'Food & Drinks', icon: '🍕' },
];

export const ShopCategories: React.FC<ShopCategoriesProps> = ({ selected, onSelect }) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={selected === category.id ? "default" : "secondary"}
            className="cursor-pointer hover:bg-primary/90 transition-colors shrink-0 px-3 py-1.5"
            onClick={() => onSelect(category.id)}
          >
            <span className="mr-1">{category.icon}</span>
            {category.label}
          </Badge>
        ))}
      </div>
    </ScrollArea>
  );
};
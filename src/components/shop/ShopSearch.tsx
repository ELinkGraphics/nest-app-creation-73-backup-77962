import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface ShopSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const ShopSearch: React.FC<ShopSearchProps> = ({ value, onChange }) => {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search products, sellers, or categories..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>
      <Button variant="outline" size="icon">
        <Filter className="h-4 w-4" />
      </Button>
    </div>
  );
};
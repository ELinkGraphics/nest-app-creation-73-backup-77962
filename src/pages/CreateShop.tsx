import React, { useState } from 'react';
import { ArrowLeft, Camera, DollarSign, Package, MapPin, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const CreateShop: React.FC = () => {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState<'new' | 'used' | 'refurbished'>('new');

  const handleCreate = () => {
    // Handle shop item creation logic here
    console.log('Creating shop item:', { name: productName, description, price, category, condition });
    navigate('/');
  };

  const categories = [
    'Electronics',
    'Clothing & Fashion',
    'Home & Garden',
    'Sports & Outdoors',
    'Books & Media',
    'Toys & Games',
    'Health & Beauty',
    'Automotive',
    'Art & Crafts',
    'Food & Beverages',
    'Services',
    'Other'
  ];

  const conditions = [
    { value: 'new', label: 'New', description: 'Brand new, never used' },
    { value: 'used', label: 'Used', description: 'Previously owned, good condition' },
    { value: 'refurbished', label: 'Refurbished', description: 'Restored to working condition' }
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-lg font-semibold">List Item</h1>
          <Button 
            onClick={handleCreate}
            disabled={!productName.trim() || !description.trim() || !price.trim()}
            className="px-6"
          >
            List
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Product Images */}
        <div>
          <Label>Photos</Label>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="aspect-square rounded-lg bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group">
              <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="aspect-square rounded-lg bg-muted/50 border border-dashed border-border/50 flex items-center justify-center">
              <Camera className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <div className="aspect-square rounded-lg bg-muted/50 border border-dashed border-border/50 flex items-center justify-center">
              <Camera className="w-6 h-6 text-muted-foreground/50" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Add up to 5 photos</p>
        </div>

        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="product-name">Product Name</Label>
          <Input
            id="product-name"
            placeholder="What are you selling?"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="price"
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Condition */}
        <div className="space-y-2">
          <Label>Condition</Label>
          <div className="space-y-2">
            {conditions.map((cond) => (
              <button
                key={cond.value}
                onClick={() => setCondition(cond.value as 'new' | 'used' | 'refurbished')}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  condition === cond.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-left">
                  <p className="font-medium">{cond.label}</p>
                  <p className="text-xs text-muted-foreground">{cond.description}</p>
                </div>
                <Package className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your item..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <button className="w-full flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <MapPin className="w-5 h-5 text-muted-foreground mr-3" />
            <span className="text-muted-foreground">Add pickup location</span>
          </button>
          
          <button className="w-full flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Tag className="w-5 h-5 text-muted-foreground mr-3" />
            <span className="text-muted-foreground">Add tags</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateShop;
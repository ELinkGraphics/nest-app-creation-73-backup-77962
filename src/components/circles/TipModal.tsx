import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, DollarSign, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTip: (amount: number) => void;
  authorName: string;
  postId: string;
}

const PRESET_AMOUNTS = [1, 3, 5, 10];

export const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  onClose,
  onTip,
  authorName,
  postId
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const finalAmount = selectedAmount || parseFloat(customAmount) || 0;
  const isValidAmount = finalAmount > 0 && finalAmount <= 1000;

  const handleTip = async () => {
    if (!isValidAmount) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsProcessing(false);
    setShowSuccess(true);
    
    // Show success state briefly, then complete
    setTimeout(() => {
      onTip(finalAmount);
      setShowSuccess(false);
      setSelectedAmount(null);
      setCustomAmount('');
    }, 2000);
  };

  const reset = () => {
    setSelectedAmount(null);
    setCustomAmount('');
    setIsProcessing(false);
    setShowSuccess(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-green-600 dark:text-green-400 fill-current" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-yellow-900" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Tip Sent! 🎉
              </h3>
              <p className="text-sm text-muted-foreground">
                Your ${finalAmount} tip has been sent to {authorName}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Tip {authorName}
          </DialogTitle>
          <DialogDescription>
            Show your appreciation for this valuable content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Preset amounts */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Quick amounts</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                  className="flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  {amount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Custom amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="pl-10"
                min="0.01"
                max="1000"
                step="0.01"
              />
            </div>
            {customAmount && parseFloat(customAmount) > 1000 && (
              <p className="text-xs text-destructive">
                Maximum tip amount is $1,000
              </p>
            )}
          </div>

          {/* Summary */}
          {isValidAmount && (
            <div className="bg-accent/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Tip amount:</span>
                <span className="font-semibold">${finalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Processing fee:</span>
                <span>Free (Demo)</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleTip}
              disabled={!isValidAmount || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                `Tip $${finalAmount.toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
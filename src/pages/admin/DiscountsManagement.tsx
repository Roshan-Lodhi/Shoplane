import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DiscountCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  valid_from: string;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number;
  min_purchase_amount: number;
  active: boolean;
}

const DiscountsManagement = () => {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchDiscounts = async () => {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load discount codes');
      return;
    }

    setDiscounts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const discountData = {
      code: (formData.get('code') as string).toUpperCase(),
      discount_type: formData.get('discount_type') as string,
      discount_value: parseFloat(formData.get('discount_value') as string),
      valid_from: formData.get('valid_from') as string,
      valid_until: formData.get('valid_until') as string || null,
      max_uses: formData.get('max_uses') ? parseInt(formData.get('max_uses') as string) : null,
      min_purchase_amount: parseFloat(formData.get('min_purchase_amount') as string) || 0,
      active: formData.get('active') === 'on',
    };

    if (editingDiscount) {
      const { error } = await supabase
        .from('discount_codes')
        .update(discountData)
        .eq('id', editingDiscount.id);

      if (error) {
        toast.error('Failed to update discount code');
        return;
      }
      toast.success('Discount code updated successfully');
    } else {
      const { error } = await supabase
        .from('discount_codes')
        .insert(discountData);

      if (error) {
        toast.error('Failed to create discount code');
        return;
      }
      toast.success('Discount code created successfully');
    }

    setIsDialogOpen(false);
    setEditingDiscount(null);
    fetchDiscounts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;

    const { error } = await supabase
      .from('discount_codes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete discount code');
      return;
    }

    toast.success('Discount code deleted successfully');
    fetchDiscounts();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Discount Codes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDiscount(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Discount Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingDiscount ? 'Edit Discount Code' : 'Create Discount Code'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Discount Code</Label>
                <Input 
                  id="code" 
                  name="code" 
                  defaultValue={editingDiscount?.code}
                  placeholder="SUMMER2024"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <Select name="discount_type" defaultValue={editingDiscount?.discount_type || 'percentage'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_value">Discount Value</Label>
                  <Input 
                    id="discount_value" 
                    name="discount_value" 
                    type="number" 
                    step="0.01"
                    defaultValue={editingDiscount?.discount_value}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Valid From</Label>
                  <Input 
                    id="valid_from" 
                    name="valid_from" 
                    type="datetime-local"
                    defaultValue={editingDiscount?.valid_from.slice(0, 16)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Valid Until (Optional)</Label>
                  <Input 
                    id="valid_until" 
                    name="valid_until" 
                    type="datetime-local"
                    defaultValue={editingDiscount?.valid_until?.slice(0, 16)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_uses">Max Uses (Optional)</Label>
                  <Input 
                    id="max_uses" 
                    name="max_uses" 
                    type="number"
                    defaultValue={editingDiscount?.max_uses || ''}
                    placeholder="Unlimited"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_purchase_amount">Min Purchase (₹)</Label>
                  <Input 
                    id="min_purchase_amount" 
                    name="min_purchase_amount" 
                    type="number"
                    step="0.01"
                    defaultValue={editingDiscount?.min_purchase_amount || 0}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="active" name="active" defaultChecked={editingDiscount?.active ?? true} />
                <Label htmlFor="active">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDiscount ? 'Update' : 'Create'} Discount
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {discounts.map((discount) => (
          <Card key={discount.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg font-mono">{discount.code}</CardTitle>
                  <Badge variant={discount.active ? 'default' : 'secondary'}>
                    {discount.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingDiscount(discount);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(discount.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Discount:</span>{' '}
                  {discount.discount_type === 'percentage' 
                    ? `${discount.discount_value}%` 
                    : `₹${discount.discount_value}`}
                </div>
                <div>
                  <span className="text-muted-foreground">Used:</span>{' '}
                  {discount.current_uses}/{discount.max_uses || '∞'}
                </div>
                <div>
                  <span className="text-muted-foreground">Min Purchase:</span> ₹{discount.min_purchase_amount}
                </div>
                <div>
                  <span className="text-muted-foreground">Valid Until:</span>{' '}
                  {discount.valid_until ? new Date(discount.valid_until).toLocaleDateString() : 'No expiry'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DiscountsManagement;

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Package, ShoppingCart, Pencil, Trash2, AlertTriangle, Search
} from "lucide-react";
import ProductForm from "@/components/shop/ProductForm";
import OrderList from "@/components/shop/OrderList";
import NewOrderForm from "@/components/shop/NewOrderForm";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const categoryLabels = {
  dental_care: "Kujdes Dental", oral_hygiene: "Higjenë Orale", whitening: "Zbardhim",
  accessories: "Aksesorë", kids: "Fëmijë", professional: "Profesional", other: "Tjetër",
};

export default function ShopManager() {
  const queryClient = useQueryClient();
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderDetail, setOrderDetail] = useState(null);
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.list("-created_date", 100),
  });
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: () => base44.entities.Order.list("-created_date", 100),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const deleteProduct = async (id) => {
    await base44.entities.Product.delete(id);
    refresh();
    toast.success("Produkti u fshi!");
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.stock_quantity <= (p.min_stock_alert || 10));
  const totalRevenue = orders.filter(o => o.payment_status === "paid").reduce((s, o) => s + (o.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-500 text-xs">Produkte</p>
          <p className="text-white text-2xl font-bold mt-1">{products.length}</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-500 text-xs">Porosi</p>
          <p className="text-white text-2xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-500 text-xs">Të ardhura</p>
          <p className="text-emerald-400 text-2xl font-bold mt-1">{totalRevenue.toLocaleString()} <span className="text-sm font-normal">ALL</span></p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-500 text-xs flex items-center gap-1">
            {lowStockProducts.length > 0 && <AlertTriangle className="w-3 h-3 text-amber-400" />} Stok i Ulët
          </p>
          <p className={cn("text-2xl font-bold mt-1", lowStockProducts.length > 0 ? "text-amber-400" : "text-white")}>{lowStockProducts.length}</p>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="products" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            <Package className="w-4 h-4 mr-2" /> Produkte ({products.length})
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400">
            <ShoppingCart className="w-4 h-4 mr-2" /> Porosi ({orders.length})
          </TabsTrigger>

        </TabsList>

        <TabsContent value="products" className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Kërko produkte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white pl-10"
              />
            </div>
            <Button onClick={() => { setEditingProduct(null); setProductDialogOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Shto Produkt
            </Button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">Nuk ka produkte</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium text-sm">{product.name}</h4>
                      <p className="text-slate-500 text-xs">{product.sku || "—"} • {product.brand || "—"}</p>
                    </div>
                    <Badge className="bg-slate-700/50 text-slate-300 text-xs">{categoryLabels[product.category]}</Badge>
                  </div>
                  <div className="flex items-end justify-between mt-3">
                    <div>
                      <p className="text-emerald-400 font-bold">{product.price?.toLocaleString()} ALL</p>
                      <p className={cn(
                        "text-xs mt-0.5",
                        product.stock_quantity <= (product.min_stock_alert || 10) ? "text-amber-400" : "text-slate-500"
                      )}>
                        Stok: {product.stock_quantity || 0}
                        {product.stock_quantity <= (product.min_stock_alert || 10) && " ⚠️"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-white" onClick={() => { setEditingProduct(product); setProductDialogOpen(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-red-400" onClick={() => deleteProduct(product.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setNewOrderOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" /> Porosi e Re
            </Button>
          </div>
          <OrderList orders={orders} onRefresh={refresh} onViewOrder={setOrderDetail} />
        </TabsContent>
      </Tabs>

      {/* Product Form Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-white">{editingProduct ? "Përditëso Produktin" : "Produkt i Ri"}</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSave={() => { setProductDialogOpen(false); refresh(); }}
            onCancel={() => setProductDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* New Order Dialog */}
      <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Porosi e Re</DialogTitle>
          </DialogHeader>
          <NewOrderForm
            products={products}
            onSave={() => { setNewOrderOpen(false); refresh(); }}
            onCancel={() => setNewOrderOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={!!orderDetail} onOpenChange={() => setOrderDetail(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
          {orderDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">Porosi #{orderDetail.order_number || orderDetail.id?.slice(0, 8)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-slate-500 text-xs">Klient</p><p className="text-white">{orderDetail.customer_name}</p></div>
                  <div><p className="text-slate-500 text-xs">Telefon</p><p className="text-white">{orderDetail.customer_phone || "—"}</p></div>
                  <div><p className="text-slate-500 text-xs">Email</p><p className="text-white">{orderDetail.customer_email || "—"}</p></div>
                  <div><p className="text-slate-500 text-xs">Qytet</p><p className="text-white">{orderDetail.city || "—"}</p></div>
                </div>
                <div><p className="text-slate-500 text-xs mb-1">Adresa</p><p className="text-slate-300 text-sm">{orderDetail.shipping_address || "—"}</p></div>
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-slate-400 text-xs font-medium mb-2">Artikuj</p>
                  {orderDetail.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1.5 border-b border-slate-800">
                      <span className="text-slate-300">{item.product_name} × {item.quantity}</span>
                      <span className="text-white">{item.total?.toLocaleString()} ALL</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm pt-3 font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-emerald-400">{orderDetail.total_amount?.toLocaleString()} ALL</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState, useEffect, ChangeEvent } from 'react';
import { ShoppingCart, Menu as MenuIcon, X, Plus, Minus, Trash2, Clock, MapPin, Phone, ChevronRight, LayoutDashboard, Utensils, History, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import { cn, Product, Order, OrderItem } from './types';

// --- Utils ---

const DELIVERY_FEE = 4.0;

function validarNumeroTelefone(numero: string) {
  const numeros = numero.replace(/\D/g, '');
  if (numeros.length !== 10 && numeros.length !== 11) return false;
  const ddd = numeros.substring(0, 2);
  const numeroPrincipal = numeros.substring(2);
  const dddsValidos = ['11','12','13','14','15','16','17','18','19','21','22','24','27','28','31','32','33','34','35','37','38','41','42','43','44','45','46','47','48','49','51','53','54','55','61','62','63','64','65','66','67','68','69','71','73','74','75','77','79','81','82','83','84','85','86','87','88','89','91','92','93','94','95','96','97','98','99'];
  if (!dddsValidos.includes(ddd)) return false;
  if (numeros.length === 11 && numeroPrincipal[0] !== '9') return false;
  if (numeros.length === 10 && numeroPrincipal.length !== 8) return false;
  return true;
}

function formatarNumeroTelefone(numero: string) {
  const numeros = numero.replace(/\D/g, '');
  if (numeros.length === 11) {
    return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7)}`;
  } else if (numeros.length === 10) {
    return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
  } else {
    return numero;
  }
}

// --- Components ---

const Header = ({ cartCount, onOpenCart, onOpenAdmin }: { cartCount: number, onOpenCart: () => void, onOpenAdmin: () => void }) => (
  <header className="sticky top-0 z-50 w-full glass px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="bg-brand-red p-1.5 md:p-2 rounded-lg">
        <Utensils className="text-white w-5 h-5 md:w-6 h-6" />
      </div>
      <h1 className="text-lg md:text-xl font-black tracking-tighter text-brand-black">CHALÉ<span className="text-brand-red">DUDI</span></h1>
    </div>
    
    <div className="flex items-center gap-2 md:gap-4">
      <button onClick={onOpenAdmin} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
        <LayoutDashboard className="w-5 h-5 md:w-6 h-6" />
      </button>
      <button onClick={onOpenCart} className="relative p-2 bg-brand-black text-white rounded-full hover:scale-105 transition-transform">
        <ShoppingCart className="w-5 h-5 md:w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
            {cartCount}
          </span>
        )}
      </button>
    </div>
  </header>
);

const MobileCartBar = ({ items, onOpen }: { items: OrderItem[], onOpen: () => void }) => {
  if (items.length === 0) return null;
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-6 left-4 right-4 z-[55] md:hidden"
    >
      <button 
        onClick={onOpen}
        className="w-full bg-brand-red text-white p-4 rounded-2xl shadow-2xl shadow-red-500/40 flex items-center justify-between font-black"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 px-2 py-1 rounded-lg text-xs">
            {count} {count === 1 ? 'item' : 'itens'}
          </div>
          <span>VER CARRINHO</span>
        </div>
        <span>R$ {(total + DELIVERY_FEE).toFixed(2)}</span>
      </button>
    </motion.div>
  );
};

const Hero = ({ onOrderNow }: { onOrderNow: () => void }) => (
  <section className="relative min-h-[400px] md:h-[500px] w-full overflow-hidden bg-brand-black flex items-center px-6 md:px-20 py-12 md:py-0">
    <div className="absolute inset-0 opacity-40">
      <img 
        src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&q=80" 
        alt="Burger Background" 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
    <div className="relative z-10 max-w-2xl">
      <motion.span 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-block bg-brand-yellow text-brand-black px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4"
      >
        O melhor lanche de Carmo do Rio Claro
      </motion.span>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-7xl font-black text-white leading-tight mb-6"
      >
        Sabor e Tradição em <br /> <span className="text-brand-red">Cada Mordida.</span>
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-slate-300 text-base md:text-lg mb-8 max-w-md"
      >
        Ingredientes frescos, carne selecionada e aquele molho especial que você só encontra aqui. Peça agora e receba em minutos!
      </motion.p>
      <motion.button 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={onOrderNow}
        className="btn-secondary flex items-center gap-2 group w-full md:w-auto justify-center"
      >
        FAZER PEDIDO AGORA
        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </div>
  </section>
);

const CategoryFilter = ({ categories, active, onChange }: { categories: string[], active: string, onChange: (c: string) => void }) => (
  <div className="flex gap-3 overflow-x-auto py-6 no-scrollbar px-4">
    {categories.map(cat => (
      <button
        key={cat}
        onClick={() => onChange(cat)}
        className={cn(
          "px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all",
          active === cat 
            ? "bg-brand-red text-white shadow-lg shadow-red-500/30" 
            : "bg-white text-slate-600 hover:bg-slate-100"
        )}
      >
        {cat}
      </button>
    ))}
  </div>
);

const ProductCard = ({ product, onAdd }: { product: Product, onAdd: (p: Product) => void, key?: any }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-row md:flex-col h-32 md:h-auto"
  >
    <div className="w-32 md:w-full h-full md:h-48 overflow-hidden relative shrink-0">
      <img 
        src={product.image} 
        alt={product.name} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur px-2 py-0.5 md:px-3 md:py-1 rounded-full font-black text-brand-red shadow-sm text-xs md:text-base">
        R$ {product.price.toFixed(2)}
      </div>
    </div>
    <div className="p-3 md:p-5 flex flex-col justify-between flex-1">
      <div>
        <h3 className="font-bold text-sm md:text-lg mb-0.5 md:mb-1 text-brand-black line-clamp-1">{product.name}</h3>
        <p className="text-slate-500 text-[10px] md:text-sm mb-2 md:mb-4 line-clamp-2">{product.description}</p>
      </div>
      <button 
        onClick={() => onAdd(product)}
        className="w-full bg-slate-100 hover:bg-brand-red hover:text-white text-brand-black font-bold py-2 md:py-3 rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm"
      >
        <Plus className="w-3 h-3 md:w-5 h-5" />
        ADICIONAR
      </button>
    </div>
  </motion.div>
);

const CartDrawer = ({ isOpen, onClose, items, onUpdateQty, onRemove, onCheckout }: { 
  isOpen: boolean, 
  onClose: () => void, 
  items: OrderItem[],
  onUpdateQty: (id: number, delta: number) => void,
  onRemove: (id: number) => void,
  onCheckout: () => void
}) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b bg-white flex items-center justify-between">
              <h2 className="text-2xl font-black text-brand-black">Meu Carrinho</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                  <ShoppingCart className="w-16 h-16 opacity-20" />
                  <p className="font-medium">Seu carrinho está vazio</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-brand-black">{item.name}</h4>
                      <p className="text-brand-red font-bold">R$ {(item.price * item.quantity).toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button 
                          onClick={() => onUpdateQty(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg hover:bg-slate-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQty(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg hover:bg-slate-200"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 bg-white border-t space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Subtotal</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Taxa de Entrega</span>
                    <span>R$ {DELIVERY_FEE.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-black pt-2 border-t">
                    <span>Total</span>
                    <span className="text-brand-red">R$ {(total + DELIVERY_FEE).toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={onCheckout}
                  className="w-full btn-primary py-4 text-lg"
                >
                  FINALIZAR PEDIDO
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const AdminPanel = ({ isOpen, onClose, orders, onUpdateStatus }: { 
  isOpen: boolean, 
  onClose: () => void, 
  orders: Order[],
  onUpdateStatus: (id: number, status: string) => void
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-brand-black/95 z-[100] overflow-y-auto p-6"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-black text-white">Painel de Pedidos</h2>
              <p className="text-slate-400">Gerencie os pedidos em tempo real</p>
            </div>
            <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              <X className="w-8 h-8" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pedido #{order.id}</span>
                    <h3 className="text-xl font-bold text-brand-black">{order.customer_name}</h3>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                    order.status === 'pending' && "bg-amber-100 text-amber-600",
                    order.status === 'preparing' && "bg-blue-100 text-blue-600",
                    order.status === 'delivering' && "bg-purple-100 text-purple-600",
                    order.status === 'completed' && "bg-emerald-100 text-emerald-600",
                  )}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2 mb-6 border-y py-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.quantity}x {item.name}</span>
                      <span className="font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 font-black text-brand-red">
                    <span>Total</span>
                    <span>R$ {order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.notes && (
                    <p className="text-xs bg-brand-yellow/20 p-2 rounded-lg text-brand-black font-medium">
                      <span className="font-bold">Obs:</span> {order.notes}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> {order.address}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Phone className="w-3 h-3" /> {order.customer_phone}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-6">
                  <button 
                    onClick={() => onUpdateStatus(order.id, 'preparing')}
                    className="bg-blue-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-600"
                  >
                    PREPARAR
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(order.id, 'delivering')}
                    className="bg-purple-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-purple-600"
                  >
                    ENTREGAR
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(order.id, 'completed')}
                    className="bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 col-span-2"
                  >
                    CONCLUIR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const CheckoutModal = ({ isOpen, onClose, onConfirm, successUrl }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: (data: any) => void,
  successUrl: string | null
}) => {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', notes: '' });
  const [isPhoneValid, setIsPhoneValid] = useState(true);

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const formatted = formatarNumeroTelefone(val);
    setFormData({ ...formData, phone: formatted });
    
    const digits = val.replace(/\D/g, '');
    if (digits.length >= 10) {
      setIsPhoneValid(validarNumeroTelefone(digits));
    } else {
      setIsPhoneValid(true);
    }
  };

  const canConfirm = formData.name && formData.phone && formData.address && validarNumeroTelefone(formData.phone);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {successUrl ? (
              <div className="text-center space-y-6 py-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-10 h-10 rotate-45" /> {/* Using Plus as a checkmark alternative or just a success icon */}
                </div>
                <h2 className="text-3xl font-black text-brand-black">Pedido Recebido!</h2>
                <p className="text-slate-500">Seu pedido foi registrado em nosso sistema. Agora, clique no botão abaixo para nos enviar os detalhes pelo WhatsApp e confirmar sua entrega.</p>
                <a 
                  href={successUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <Phone className="w-6 h-6" />
                  ENVIAR NO WHATSAPP
                </a>
                <button 
                  onClick={onClose}
                  className="text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors"
                >
                  FECHAR JANELA
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-black text-brand-black mb-6">Finalizar Pedido</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-brand-red outline-none"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">WhatsApp</label>
                    <input 
                      type="tel" 
                      className={cn(
                        "w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 outline-none transition-all",
                        !isPhoneValid ? "ring-2 ring-red-500" : "focus:ring-brand-red"
                      )}
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                    />
                    {!isPhoneValid && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wider">Número de telefone inválido</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Endereço de Entrega</label>
                    <textarea 
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-brand-red outline-none h-20 resize-none"
                      placeholder="Rua, número, bairro..."
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Observações (Opcional)</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-brand-red outline-none"
                      placeholder="Ex: Sem cebola, extra queijo..."
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                  <button 
                    onClick={() => onConfirm(formData)}
                    disabled={!canConfirm}
                    className="w-full btn-primary py-4 mt-4 disabled:opacity-50"
                  >
                    CONFIRMAR PEDIDO
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- Main App ---

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    fetch('/api/products').then(res => res.json()).then(setProducts);
    fetch('/api/orders').then(res => res.json()).then(setOrders);

    newSocket.on('new_order', (order: Order) => {
      setOrders(prev => [order, ...prev]);
    });

    newSocket.on('order_updated', ({ id, status }) => {
      setOrders(prev => prev.map(o => o.id === Number(id) ? { ...o, status } : o));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const categories: string[] = ['Todos', ...Array.from(new Set<string>(products.map(p => p.category as string)))];
  const filteredProducts = activeCategory === 'Todos' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = async (formData: any) => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + DELIVERY_FEE;
    const orderData = {
      customer_name: formData.name,
      customer_phone: formData.phone,
      address: formData.address,
      notes: formData.notes,
      total,
      items: cart
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (res.ok) {
      const order = await res.json();
      
      // Construct WhatsApp Message
      const storePhone = '5535999673500'; // Número da loja (Dudi)
      const itemsList = cart.map(item => `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`).join('\n');
      
      const message = encodeURIComponent(
        `*🍔 NOVO PEDIDO - CHALÉ DUDI (#${order.id})*\n\n` +
        `*Cliente:* ${formData.name}\n` +
        `*Telefone:* ${formData.phone}\n` +
        `*Endereço:* ${formData.address}\n` +
        (formData.notes ? `*Obs:* ${formData.notes}\n` : '') +
        `\n*ITENS:*\n${itemsList}\n` +
        `\n*Subtotal:* R$ ${subtotal.toFixed(2)}` +
        `\n*Taxa de Entrega:* R$ ${DELIVERY_FEE.toFixed(2)}` +
        `\n*TOTAL: R$ ${total.toFixed(2)}*\n\n` +
        `_Pedido realizado via Cardápio Digital_`
      );

      setCart([]);
      setWhatsappUrl(`https://api.whatsapp.com/send?phone=${storePhone}&text=${message}`);
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <Header 
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />
      
      <main>
        <Hero onOrderNow={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })} />
        
        <div id="menu" className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8 gap-2 md:gap-4">
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-brand-black">Nosso Cardápio</h2>
              <p className="text-slate-500 text-sm md:text-base">Escolha sua delícia favorita</p>
            </div>
            <CategoryFilter 
              categories={categories} 
              active={activeCategory} 
              onChange={setActiveCategory} 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {filteredProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </div>

        {/* Features / About Section */}
        <section className="bg-white py-12 md:py-20 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center space-y-2 md:space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-yellow/20 text-brand-yellow rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold">Entrega Rápida</h3>
              <p className="text-slate-500 text-sm md:text-base">Seu pedido chega quentinho em até 30 minutos na sua porta.</p>
            </div>
            <div className="text-center space-y-2 md:space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-red/20 text-brand-red rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold">Qualidade Premium</h3>
              <p className="text-slate-500 text-sm md:text-base">Usamos apenas carnes selecionadas e ingredientes frescos todos os dias.</p>
            </div>
            <div className="text-center space-y-2 md:space-y-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-100 text-emerald-600 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold">Suporte 24/7</h3>
              <p className="text-slate-500 text-sm md:text-base">Dúvidas? Nosso time está pronto para te atender via WhatsApp.</p>
            </div>
          </div>
        </section>
      </main>

      <MobileCartBar items={cart} onOpen={() => setIsCartOpen(true)} />

      {/* Footer */}
      <footer className="bg-brand-black text-white py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-black tracking-tighter mb-4">CHALÉ<span className="text-brand-red">DUDI</span></h2>
            <p className="text-slate-400 max-w-sm">
              O melhor lanche de Carmo do Rio Claro. Qualidade, sabor e tradição na Praça Dona Maria Goulart.
            </p>
            <div className="mt-6">
              <a 
                href="https://www.instagram.com/chale_lanches_da_dudi_?igsh=Z25nMHk1bHFodmNu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition-transform"
              >
                <History className="w-5 h-5" />
                Siga no Instagram
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-slate-500">Links Úteis</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-brand-red transition-colors">Início</a></li>
              <li><a href="#menu" className="hover:text-brand-red transition-colors">Cardápio</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Contato</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-slate-500">Contato</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-1 shrink-0" /> Praça Dona Maria Goulart, 100 - Centro, Carmo do Rio Claro - MG</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> (35) 99999-9999</li>
              <li className="flex items-center gap-2"><Clock className="w-4 h-4" /> Fechado · Abre às 19:00</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-8 text-center text-slate-500 text-sm">
          © 2024 Chalé lanches da Dudi. Todos os direitos reservados.
        </div>
      </footer>

      {/* Overlays */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart}
        onUpdateQty={updateCartQty}
        onRemove={removeFromCart}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        orders={orders}
        onUpdateStatus={updateOrderStatus}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => {
          setIsCheckoutOpen(false);
          setWhatsappUrl(null);
        }} 
        onConfirm={handleCheckout}
        successUrl={whatsappUrl}
      />
    </div>
  );
}

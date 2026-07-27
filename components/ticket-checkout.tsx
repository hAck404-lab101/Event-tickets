"use client";

import { useMemo, useState, useEffect } from "react";
import { LoaderCircle, Minus, Plus, Coins, CheckCircle2 } from "lucide-react";
import type { Event } from "@/lib/events";
import { formatGhs } from "@/lib/events";
import { toast } from "sonner";

type Props = { event: Event };

interface WalletProfile {
  id: string;
  asset: string;
  network: string;
  address: string;
  label: string;
  isDefault: boolean;
}

export default function TicketCheckout({ event }: Props) {
  const [ticketId, setTicketId] = useState(event.ticketTypes[0].id);
  const [quantity, setQuantity] = useState(1);

  // Dynamic DoronX Wallets
  const [wallets, setWallets] = useState<WalletProfile[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);

  const [cryptoAsset, setCryptoAsset] = useState<string>("USDT");
  const [cryptoNetwork, setCryptoNetwork] = useState<string>("TRC20");
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ticket = event.ticketTypes.find((item) => item.id === ticketId) ?? event.ticketTypes[0];
  const subtotal = ticket.price * quantity;
  const serviceFee = useMemo(() => Math.round(subtotal * 0.03 * 100) / 100, [subtotal]);
  const total = subtotal + serviceFee;

  // Fetch active merchant wallets from DoronX dashboard
  useEffect(() => {
    let isMounted = true;
    async function fetchWallets() {
      try {
        const res = await fetch("/api/doronx/wallets");
        const data = await res.json();
        if (isMounted && res.ok && data.wallets && data.wallets.length > 0) {
          setWallets(data.wallets);
          // Set initial asset/network to first active default wallet
          const defaultWallet = data.wallets.find((w: WalletProfile) => w.isDefault) || data.wallets[0];
          if (defaultWallet) {
            setCryptoAsset(defaultWallet.asset);
            setCryptoNetwork(defaultWallet.network);
          }
        }
      } catch (e) {
        console.warn("Could not load dynamic DoronX wallets:", e);
      } finally {
        if (isMounted) setLoadingWallets(false);
      }
    }
    fetchWallets();
    return () => { isMounted = false; };
  }, []);

  // Filter unique assets from active wallets (e.g. USDT, BTC)
  const availableAssets = useMemo(() => {
    if (wallets.length === 0) return ["USDT", "BTC"];
    const unique = Array.from(new Set(wallets.map((w) => w.asset)));
    return unique;
  }, [wallets]);

  // Filter available networks for currently selected asset
  const availableNetworksForAsset = useMemo(() => {
    if (wallets.length === 0) {
      return cryptoAsset === "USDT" ? ["TRC20", "ERC20", "BEP20", "SOLANA", "POLYGON"] : ["BTC"];
    }
    const matching = wallets.filter((w) => w.asset === cryptoAsset).map((w) => w.network);
    return matching.length > 0 ? Array.from(new Set(matching)) : [cryptoAsset === "USDT" ? "TRC20" : "BTC"];
  }, [wallets, cryptoAsset]);

  // Handle Asset Switch
  const handleSelectAsset = (asset: string) => {
    setCryptoAsset(asset);
    const matchingWallets = wallets.filter((w) => w.asset === asset);
    if (matchingWallets.length > 0) {
      setCryptoNetwork(matchingWallets[0].network);
    } else {
      setCryptoNetwork(asset === "USDT" ? "TRC20" : "BTC");
    }
  };

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let networkToSend = cryptoNetwork;
      if (networkToSend === "SOLANA") networkToSend = "SOLANA";

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          ticketTypeId: ticket.id,
          ticketName: ticket.name,
          quantity,
          unitPrice: ticket.price,
          paymentMethod: "crypto",
          cryptoAsset: cryptoAsset,
          cryptoNetwork: networkToSend,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          customerName: customer.name
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to start checkout");

      if (result.directCheckoutUrl) {
        toast.success("Opening DoronX invoice payment page...");
        window.open(result.directCheckoutUrl, "_blank");
        window.location.href = result.pendingUrl;
      } else {
        if (result.doronxError) {
          console.warn("DoronX API Notice:", result.doronxError);
        }
        window.location.href = result.paymentUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout");
      setLoading(false);
    }
  }

  return (
    <form className="bg-surface p-6 sm:p-8 rounded-[2rem] border border-border shadow-2xl" onSubmit={handleCheckout}>
      <div className="mb-8">
        <p className="text-accent text-sm font-bold uppercase tracking-wider mb-2">Choose your ticket</p>
        <h2 className="text-3xl font-serif font-bold text-primary">Reserve your spot</h2>
      </div>

      <div className="space-y-3 mb-8">
        {event.ticketTypes.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex justify-between items-center ${
              ticketId === item.id 
                ? "border-primary bg-primary/5 ring-1 ring-primary" 
                : "border-border bg-background hover:border-primary/40"
            }`}
            onClick={() => { setTicketId(item.id); setQuantity(1); }}
          >
            <div>
              <strong className="block text-primary font-bold mb-1">{item.name}</strong>
              <small className="block text-muted">{item.description}</small>
            </div>
            <strong className="text-lg text-primary">{formatGhs(item.price)}</strong>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between py-5 border-y border-border mb-8">
        <div>
          <strong className="block text-primary">Quantity</strong>
          <small className="text-muted text-sm">Maximum 10 tickets</small>
        </div>
        <div className="flex items-center gap-4 bg-background border border-border rounded-xl p-1">
          <button 
            type="button" 
            aria-label="Reduce quantity" 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-primary hover:bg-surface disabled:opacity-50"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
          >
            <Minus size={18} />
          </button>
          <strong className="text-lg w-4 text-center text-primary">{quantity}</strong>
          <button 
            type="button" 
            aria-label="Increase quantity" 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-primary hover:bg-surface disabled:opacity-50"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            disabled={quantity >= 10}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Crypto Asset Selection - Dynamic from DoronX Dashboard */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-primary">Select Crypto Payment Asset</label>
          {loadingWallets ? (
            <span className="text-xs text-muted flex items-center gap-1">
              <LoaderCircle size={12} className="animate-spin text-primary" /> Syncing DoronX wallets...
            </span>
          ) : (
            <span className="text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 size={12} /> {wallets.length} DoronX Wallets Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {availableAssets.map((asset) => {
            const isSelected = cryptoAsset === asset;
            const isUsdt = asset === "USDT";
            return (
              <button
                type="button"
                key={asset}
                onClick={() => handleSelectAsset(asset)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-1 ring-primary text-primary"
                    : "border-border bg-background text-muted hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Coins size={22} className={isUsdt ? "text-accent" : "text-yellow-500"} />
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    isSelected ? "bg-primary/20 text-primary" : "bg-surface text-muted"
                  }`}>
                    {isSelected ? cryptoNetwork : asset}
                  </span>
                </div>
                <div>
                  <strong className="block text-sm text-primary font-bold">
                    {isUsdt ? "USDT (Tether)" : `${asset} (${asset === "BTC" ? "Bitcoin" : asset})`}
                  </strong>
                  <span className="text-xs text-muted">
                    {isUsdt ? "Stablecoin" : "Crypto Asset"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic USDT Network Type Selector */}
        {cryptoAsset === "USDT" && availableNetworksForAsset.length > 0 && (
          <div className="bg-background border border-border rounded-2xl p-4 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <Coins size={14} className="text-accent" />
              <span>Select Active USDT Network</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {availableNetworksForAsset.map((net) => {
                const isNetSelected = cryptoNetwork === net;
                return (
                  <button
                    type="button"
                    key={net}
                    onClick={() => setCryptoNetwork(net)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      isNetSelected
                        ? "border-primary bg-primary text-white shadow-md"
                        : "border-border bg-surface text-muted hover:border-primary/50 hover:text-primary"
                    }`}
                  >
                    {net}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-bold text-primary mb-2">Full name</label>
          <input 
            required 
            value={customer.name} 
            onChange={(e) => setCustomer({ ...customer, name: e.target.value })} 
            placeholder="Ama Mensah" 
            className="w-full bg-background border border-border rounded-xl p-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-primary placeholder:text-muted/60"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-primary mb-2">Email</label>
          <input 
            required 
            type="email" 
            value={customer.email} 
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })} 
            placeholder="ama@example.com" 
            className="w-full bg-background border border-border rounded-xl p-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-primary placeholder:text-muted/60"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-primary mb-2">Phone number</label>
          <input 
            required 
            value={customer.phone} 
            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} 
            placeholder="+233 24 000 0000" 
            className="w-full bg-background border border-border rounded-xl p-3.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-primary placeholder:text-muted/60"
          />
        </div>
      </div>

      <div className="border-t border-border pt-6 space-y-3 mb-8">
        <p className="flex justify-between text-muted font-medium">
          <span>Tickets</span>
          <strong className="text-primary">{formatGhs(subtotal)}</strong>
        </p>
        <p className="flex justify-between text-muted font-medium pb-4 border-b border-border">
          <span>Service fee</span>
          <strong className="text-primary">{formatGhs(serviceFee)}</strong>
        </p>
        <p className="flex justify-between items-center pt-2">
          <span className="text-primary font-bold">Total</span>
          <strong className="text-2xl font-serif text-primary">{formatGhs(total)}</strong>
        </p>
      </div>

      {error && <p className="bg-error-bg text-error p-4 rounded-xl text-sm font-medium mb-6" role="alert">{error}</p>}
      
      <button 
        className="w-full bg-primary text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed" 
        disabled={loading}
      >
        {loading ? (
          <><LoaderCircle className="animate-spin" size={20} /> Generating DoronX Invoice...</>
        ) : (
          `Pay ${formatGhs(total)} via ${cryptoAsset} (${cryptoNetwork})`
        )}
      </button>
      <p className="text-center text-muted text-xs font-medium mt-4">
        You will be redirected to the live DoronX Invoice link ({cryptoAsset} {cryptoNetwork}).
      </p>
    </form>
  );
}

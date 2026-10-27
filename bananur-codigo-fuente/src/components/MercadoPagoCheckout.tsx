import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { MP_TEST_CARDS, processMercadoPagoPayment, MercadoPagoPaymentResult, getMercadoPagoConfig } from '../services/mercadopago';

interface MercadoPagoCheckoutProps {
  amount: number;
  items: { id: string; title: string; quantity: number; unit_price: number }[];
  payer: { email: string; name: string; rut?: string };
  onSuccess: (result: MercadoPagoPaymentResult) => void;
  onCancel: () => void;
  onShowToast?: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function MercadoPagoCheckout({
  amount,
  items,
  payer,
  onSuccess,
  onCancel,
  onShowToast
}: MercadoPagoCheckoutProps) {
  const config = getMercadoPagoConfig();
  const [paymentType, setPaymentType] = useState<'card' | 'account_money' | 'webpay'>('card');
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(payer.name || '');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);
  const [cardIssuer, setCardIssuer] = useState<'visa' | 'mastercard' | 'amex' | 'generic'>('generic');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTestCards, setShowTestCards] = useState(false);

  // Auto-detect card brand and format number
  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    let formatted = '';
    for (let i = 0; i < raw.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += raw[i];
    }
    setCardNumber(formatted);

    if (raw.startsWith('4')) setCardIssuer('visa');
    else if (raw.startsWith('5')) setCardIssuer('mastercard');
    else if (raw.startsWith('3')) setCardIssuer('amex');
    else setCardIssuer('generic');

    if (errorMessage) setErrorMessage('');
  };

  const handleExpChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setCardExp(raw.slice(0, 2) + '/' + raw.slice(2));
    } else {
      setCardExp(raw);
    }
  };

  const applyTestCard = (card: typeof MP_TEST_CARDS[0]) => {
    setCardNumber(card.number);
    setCardHolder(card.holder);
    setCardExp(card.exp);
    setCardCvv(card.cvv);
    if (card.issuer === 'Visa') setCardIssuer('visa');
    else if (card.issuer === 'Mastercard') setCardIssuer('mastercard');
    else setCardIssuer('generic');
    setShowTestCards(false);
    if (onShowToast) {
      onShowToast('Tarjeta de Prueba Aplicada', `Se cargó la tarjeta de prueba de Mercado Pago: ${card.name}`, 'info');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (paymentType === 'card') {
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 15) {
        setErrorMessage('El número de tarjeta debe tener al menos 15 o 16 dígitos.');
        return;
      }
      if (!cardHolder.trim()) {
        setErrorMessage('Ingresa el nombre del titular tal como figura en el plástico.');
        return;
      }
      if (cardExp.length < 5) {
        setErrorMessage('Ingresa una fecha de expiración válida (MM/AA).');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMessage('Ingresa el código de seguridad (CVV de 3 o 4 dígitos).');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const result = await processMercadoPagoPayment({
        amount,
        items,
        payer,
        cardNumber,
        cardHolder,
        cardExp,
        cardCvv,
        installments,
        paymentMethodType: paymentType
      });

      setIsProcessing(false);

      if (result.success) {
        onSuccess(result);
      } else {
        setErrorMessage('Mercado Pago: La transacción fue rechazada (fondos insuficientes o tarjeta declinada por la entidad emisora). Intenta con otra tarjeta.');
        if (onShowToast) {
          onShowToast('Pago Rechazado por Mercado Pago', 'La entidad bancaria no autorizó el cobro. Puedes probar con otra tarjeta.', 'error');
        }
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage('Hubo un error de conexión con los servidores de Mercado Pago. Revisa tu conexión.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl border border-bananur-sand shadow-2xl max-w-xl w-full overflow-hidden my-8 animate-scale-up">
        
        {/* Mercado Pago Header Banner */}
        <div className="bg-[#009ee3] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white text-[#009ee3] font-black font-sans text-xs px-2.5 py-1 rounded-lg tracking-wider shadow-xs flex items-center gap-1.5">
              <span>mercado</span>
              <span className="font-extrabold text-blue-600">pago</span>
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-100 font-bold block">
                Pasarela Oficial de Cobro
              </span>
              <h3 className="font-bold text-sm text-white leading-tight">
                {config.isSandbox ? 'Mercado Pago Sandbox (Chile)' : 'Checkout Mercado Pago'}
              </h3>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] text-blue-100 font-mono block">Monto a Pagar</span>
            <span className="text-lg font-mono font-black text-white">
              ${amount.toLocaleString('es-CL')} CLP
            </span>
          </div>
        </div>

        {/* Security bar */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-2 flex items-center justify-between text-[11px] text-blue-900 font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#009ee3]" />
            <span>Transacción segura y encriptada por Mercado Pago</span>
          </div>
          <span className="font-mono text-[10px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
            {config.isSandbox ? 'SANDBOX ACTIVO' : 'PRODUCCIÓN'}
          </span>
        </div>

        {/* Payment Methods Tabs */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light">
              Elige cómo deseas pagar con Mercado Pago:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType('card')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  paymentType === 'card'
                    ? 'border-[#009ee3] bg-blue-50/50 shadow-xs ring-1 ring-[#009ee3]'
                    : 'border-bananur-sand/80 hover:bg-bananur-cream/30'
                }`}
              >
                <CreditCard className={`w-5 h-5 mb-2 ${paymentType === 'card' ? 'text-[#009ee3]' : 'text-bananur-clay-light'}`} />
                <div>
                  <span className="font-bold text-xs block text-bananur-clay">Tarjetas</span>
                  <span className="text-[10px] text-bananur-clay-light">Crédito o Débito</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('account_money')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  paymentType === 'account_money'
                    ? 'border-[#009ee3] bg-blue-50/50 shadow-xs ring-1 ring-[#009ee3]'
                    : 'border-bananur-sand/80 hover:bg-bananur-cream/30'
                }`}
              >
                <Wallet className={`w-5 h-5 mb-2 ${paymentType === 'account_money' ? 'text-[#009ee3]' : 'text-bananur-clay-light'}`} />
                <div>
                  <span className="font-bold text-xs block text-bananur-clay">Mercado Pago</span>
                  <span className="text-[10px] text-bananur-clay-light">Saldo en cuenta</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType('webpay')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  paymentType === 'webpay'
                    ? 'border-[#009ee3] bg-blue-50/50 shadow-xs ring-1 ring-[#009ee3]'
                    : 'border-bananur-sand/80 hover:bg-bananur-cream/30'
                }`}
              >
                <div className="w-5 h-5 mb-2 font-black text-xs text-[#009ee3] flex items-center justify-center bg-blue-100 rounded">
                  W
                </div>
                <div>
                  <span className="font-bold text-xs block text-bananur-clay">Webpay Plus</span>
                  <span className="text-[10px] text-bananur-clay-light">Vía Mercado Pago</span>
                </div>
              </button>
            </div>
          </div>

          {/* Test Cards helper button if sandbox */}
          {config.isSandbox && (
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <span className="text-base">🧪</span>
                  <span>Modo Sandbox de Pruebas</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTestCards(!showTestCards)}
                  className="text-[11px] font-mono font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  {showTestCards ? 'Ocultar Tarjetas' : 'Ver Tarjetas de Prueba (1-Clic)'}
                </button>
              </div>

              {showTestCards && (
                <div className="space-y-1.5 pt-2 border-t border-amber-200/60 animate-fade-in">
                  <p className="text-[10px] text-amber-800">Selecciona una tarjeta oficial de prueba para auto-completar los datos al instante:</p>
                  <div className="space-y-1">
                    {MP_TEST_CARDS.map((tc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyTestCard(tc)}
                        className="w-full text-left p-2 rounded-xl bg-white border border-amber-200 hover:border-[#009ee3] text-xs font-mono flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-bananur-clay block text-[11px]">{tc.name}</span>
                          <span className="text-[10px] text-[#524742]/70">{tc.number} • Exp: {tc.exp} • CVV: {tc.cvv}</span>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          Usar esta
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error display */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Error al procesar el pago</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. Card Form */}
            {paymentType === 'card' && (
              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light">
                      Número de Tarjeta
                    </label>
                    <div className="flex items-center gap-1">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        cardIssuer === 'visa' ? 'bg-blue-600 text-white' :
                        cardIssuer === 'mastercard' ? 'bg-red-600 text-white' :
                        cardIssuer === 'amex' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {cardIssuer === 'generic' ? 'Tarjeta' : cardIssuer.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      className="w-full p-3 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs font-mono tracking-wider focus:outline-none focus:border-[#009ee3] focus:ring-1 focus:ring-[#009ee3]"
                    />
                    <Lock className="w-4 h-4 text-bananur-clay-light absolute right-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light mb-1">
                    Titular de la Tarjeta
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Constanza Silva"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="w-full p-3 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs uppercase focus:outline-none focus:border-[#009ee3] focus:ring-1 focus:ring-[#009ee3]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light mb-1">
                      Expiración (MM/AA)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      value={cardExp}
                      onChange={(e) => handleExpChange(e.target.value)}
                      className="w-full p-3 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs font-mono focus:outline-none focus:border-[#009ee3] focus:ring-1 focus:ring-[#009ee3]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light mb-1">
                      Código de Seguridad (CVV)
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="123"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full p-3 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs font-mono tracking-widest focus:outline-none focus:border-[#009ee3] focus:ring-1 focus:ring-[#009ee3]"
                    />
                  </div>
                </div>

                {/* Installments selector */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase text-bananur-clay-light mb-1">
                    Cuotas de Pago
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full p-3 bg-[#FAF8F5] border border-bananur-sand rounded-xl text-xs font-mono cursor-pointer focus:outline-none focus:border-[#009ee3]"
                  >
                    <option value={1}>1 cuota de ${amount.toLocaleString('es-CL')} (Sin interés)</option>
                    <option value={3}>3 cuotas de ${Math.round(amount / 3).toLocaleString('es-CL')} (Sin interés)</option>
                    <option value={6}>6 cuotas de ${Math.round(amount / 6).toLocaleString('es-CL')} (Sin interés)</option>
                    <option value={12}>12 cuotas de ${Math.round(amount / 12).toLocaleString('es-CL')}</option>
                  </select>
                </div>
              </div>
            )}

            {/* 2. Account Money */}
            {paymentType === 'account_money' && (
              <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#009ee3] text-white flex items-center justify-center font-bold text-lg">
                    MP
                  </div>
                  <div>
                    <span className="font-bold text-bananur-clay text-xs block">Cuenta Mercado Pago de {payer.name}</span>
                    <span className="text-[11px] font-mono text-blue-700">Saldo disponible verificado: $150.000 CLP</span>
                  </div>
                </div>
                <p className="text-xs text-bananur-clay-light leading-relaxed">
                  El monto de <strong>${amount.toLocaleString('es-CL')} CLP</strong> se debitará de forma instantánea de tu saldo de cuenta en Mercado Pago sin necesidad de ingresar tarjetas.
                </p>
              </div>
            )}

            {/* 3. Webpay via Mercado Pago */}
            {paymentType === 'webpay' && (
              <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Redcompra y Débito Bancario a través de Mercado Pago</span>
                </div>
                <p className="text-xs text-bananur-clay-light leading-relaxed">
                  Serás procesado por la pasarela segura de Mercado Pago Chile conectada con los principales bancos nacionales (Banco de Chile, Santander, BCI, BancoEstado, Scotiabank, Itaú).
                </p>
              </div>
            )}

            {/* Total recap & confirm button */}
            <div className="pt-2 border-t border-bananur-sand/60 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-bananur-clay-light">Comprador registrado:</span>
                <span className="font-semibold text-bananur-clay">{payer.email}</span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isProcessing}
                  className="px-5 py-3 rounded-xl border border-bananur-sand text-xs font-bold text-bananur-clay-light hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-[#009ee3] hover:bg-blue-600 text-white py-3.5 px-6 rounded-xl text-xs font-bold font-mono transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Procesando con Mercado Pago...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Pagar ${amount.toLocaleString('es-CL')} CLP</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}

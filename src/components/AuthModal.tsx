import React, { useState } from 'react';
import { X, User, Store, LogIn, UserPlus, Building2 } from 'lucide-react';
import { User as UserType, UserRole, ProviderType } from '../types';

type AuthMode = 'login' | 'register-client' | 'register-provider';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Motivo de abrir (ex.: finalizar compra) */
  reason?: string;
  users: UserType[];
  onLogin: (user: UserType) => void;
  onRegisterClient: (data: { name: string; phone: string }) => UserType;
  onRegisterProvider: (data: {
    name: string;
    phone: string;
    businessName: string;
    type: ProviderType;
    address: string;
  }) => UserType;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  reason,
  users,
  onLogin,
  onRegisterClient,
  onRegisterProvider,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState<string | null>(null);

  // Login
  const [loginName, setLoginName] = useState('');

  // Cadastro cliente
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Cadastro prestador
  const [provName, setProvName] = useState('');
  const [provPhone, setProvPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [provType, setProvType] = useState<ProviderType>('establishment');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const resetErrors = () => setError(null);

  const handleLogin = () => {
    resetErrors();
    const name = loginName.trim();
    if (!name) {
      setError('Digite o nome do usuário.');
      return;
    }
    const found = users.find((u) => u.name.toLowerCase() === name.toLowerCase());
    if (!found) {
      setError('Usuário não encontrado. Use um dos exemplos ou faça um novo cadastro.');
      return;
    }
    onLogin(found);
    onClose();
  };

  const handleRegisterClient = () => {
    resetErrors();
    if (!clientName.trim()) {
      setError('Informe seu nome.');
      return;
    }
    if (users.some((u) => u.name.toLowerCase() === clientName.trim().toLowerCase())) {
      setError('Já existe um usuário com esse nome.');
      return;
    }
    onRegisterClient({ name: clientName.trim(), phone: clientPhone.trim() });
    onClose();
  };

  const handleRegisterProvider = () => {
    resetErrors();
    if (!provName.trim() || !businessName.trim()) {
      setError('Informe seu nome e o nome do negócio.');
      return;
    }
    if (users.some((u) => u.name.toLowerCase() === provName.trim().toLowerCase())) {
      setError('Já existe um usuário com esse nome.');
      return;
    }
    onRegisterProvider({
      name: provName.trim(),
      phone: provPhone.trim(),
      businessName: businessName.trim(),
      type: provType,
      address: address.trim() || 'Endereço a definir',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="font-extrabold text-lg text-white">
              {mode === 'login' && 'Entrar na conta'}
              {mode === 'register-client' && 'Criar conta de cliente'}
              {mode === 'register-provider' && 'Cadastrar prestador'}
            </h2>
            {reason && (
              <p className="text-xs text-amber-300/90 mt-0.5">{reason}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* LOGIN */}
          {mode === 'login' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  Nome do usuário
                </label>
                <input
                  type="text"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Ex: Sérgio Filho"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>

              <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold"
              >
                <LogIn className="w-4 h-4" />
                Entrar
              </button>

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Exemplos: <strong className="text-zinc-300">Sérgio Filho</strong> (cliente),{' '}
                <strong className="text-zinc-300">EcoWash</strong> (loja),{' '}
                <strong className="text-zinc-300">Carlos Autônomo</strong> (autônomo).
              </p>

              <div className="pt-2 border-t border-zinc-800 space-y-2">
                <button
                  onClick={() => { resetErrors(); setMode('register-client'); }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Criar conta de cliente
                </button>
                <button
                  onClick={() => { resetErrors(); setMode('register-provider'); }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold"
                >
                  <Store className="w-3.5 h-3.5" />
                  Cadastrar como prestador / loja
                </button>
              </div>
            </>
          )}

          {/* CADASTRO CLIENTE */}
          {mode === 'register-client' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nome</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Telefone</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(21) 99999-0000"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={handleRegisterClient}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold"
              >
                <User className="w-4 h-4" />
                Criar conta e entrar
              </button>
              <button
                onClick={() => { resetErrors(); setMode('login'); }}
                className="w-full text-center text-xs text-zinc-400 hover:text-white"
              >
                Já tenho conta — Entrar
              </button>
            </>
          )}

          {/* CADASTRO PRESTADOR */}
          {mode === 'register-provider' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Seu nome</label>
                <input
                  type="text"
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
                  placeholder="Nome do responsável"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Telefone</label>
                <input
                  type="text"
                  value={provPhone}
                  onChange={(e) => setProvPhone(e.target.value)}
                  placeholder="(21) 99999-0000"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Nome do negócio</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ex: Lava-Jato Brilho Total"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Tipo</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProvType('establishment')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      provType === 'establishment'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Loja / Lava-jato
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvType('autonomous')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      provType === 'autonomous'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Autônomo
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Endereço / área de atendimento</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, bairro ou raio de atendimento"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                onClick={handleRegisterProvider}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold"
              >
                <Store className="w-4 h-4" />
                Cadastrar e entrar no painel
              </button>
              <button
                onClick={() => { resetErrors(); setMode('login'); }}
                className="w-full text-center text-xs text-zinc-400 hover:text-white"
              >
                Já tenho conta — Entrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

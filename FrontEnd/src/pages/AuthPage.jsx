import { useState } from 'react';
import { IntegrationNotice } from '../components/IntegrationNotice';

export function AuthPage({ mode = 'login' }) {
  const register = mode === 'cadastro';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailInvalid = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordInvalid = password.length > 0 && password.length < 8;

  return <main className="grid min-h-screen place-items-center bg-page p-4 dark:bg-slate-950 dark:text-white">
    <section className="card w-full max-w-md">
      <a href="#/painel" className="text-xl font-extrabold">time<span className="text-brand">track</span></a>
      <h1 className="mt-8 text-2xl font-extrabold">{register ? 'Criar conta' : 'Entrar no Dashboard'}</h1>
      <div className="mt-5 grid gap-4">
        <label className="text-sm font-semibold">E-mail<input className="form-field mt-1" type="email" autoComplete="email" value={email} aria-invalid={emailInvalid} aria-describedby={emailInvalid ? 'auth-email-error' : undefined} onChange={event => setEmail(event.target.value)} /></label>
        {emailInvalid && <p id="auth-email-error" role="alert" className="text-sm text-red-700">Informe um e-mail válido.</p>}
        <label className="text-sm font-semibold">Senha<input className="form-field mt-1" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength="8" value={password} aria-invalid={passwordInvalid} aria-describedby={passwordInvalid ? 'auth-password-error password-help' : 'password-help'} onChange={event => setPassword(event.target.value)} /></label>
        <p id="password-help" className="text-xs muted">Use pelo menos 8 caracteres.</p>
        {passwordInvalid && <p id="auth-password-error" role="alert" className="text-sm text-red-700">A senha deve ter pelo menos 8 caracteres.</p>}
        <button className="primary-button" disabled>{register ? 'Criar conta' : 'Entrar'}</button>
      </div>
      <div className="mt-5"><IntegrationNotice title="Autenticação indisponível">Cadastro e login precisam de endpoints, sessão e autorização no backend. Credenciais preenchidas nesta tela não são enviadas nem armazenadas.</IntegrationNotice></div>
      <p className="mt-5 text-center text-sm muted"><a className="font-bold text-brand" href={register ? '#/login' : '#/cadastro'}>{register ? 'Já tenho conta' : 'Criar conta'}</a></p>
    </section>
  </main>;
}

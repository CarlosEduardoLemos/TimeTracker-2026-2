import { useRef, useState } from 'react';
import { useManagerSession } from '../../../shared/auth/ManagerSession';

function messageForAuthError(error, register) {
  if (error?.type === 'session-storage') {
    return 'Este navegador não permite armazenar a sessão necessária. Ative o armazenamento de sessão e tente novamente.';
  }
  if (error?.status === 401) return 'E-mail ou senha inválidos.';
  if (error?.status === 409) return 'Já existe uma conta cadastrada com este e-mail.';
  if (error?.status === 422) {
    return register
      ? 'Confira o e-mail e a senha. A senha deve ter pelo menos 8 caracteres e até 72 bytes.'
      : 'Confira o formato do e-mail e da senha.';
  }
  if (error?.type === 'network' || error?.type === 'timeout') {
    return 'Não foi possível conectar à API. Verifique a conexão e tente novamente.';
  }
  return register ? 'Não foi possível criar a conta.' : 'Não foi possível entrar.';
}

function validateForm(email, password, register) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Informe um endereço de e-mail válido.';
  }
  if (!password) return 'Informe a senha.';
  if (register && Array.from(password).length < 8) {
    return 'A senha precisa ter pelo menos 8 caracteres.';
  }
  if (register && new TextEncoder().encode(password).byteLength > 72) {
    return 'A senha deve ter no máximo 72 bytes em UTF-8.';
  }
  return null;
}

export function AuthPage({ mode = 'login' }) {
  const registerMode = mode === 'cadastro';
  const { login, register } = useManagerSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [created, setCreated] = useState(false);
  const submittingRef = useRef(false);

  async function submit(event) {
    event.preventDefault();
    if (submittingRef.current) return;

    const validation = validateForm(email, password, registerMode);
    setValidationError(validation);
    setError(null);
    if (validation) return;

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const credentials = { email: email.trim(), password };
      if (registerMode) {
        await register(credentials);
        setPassword('');
        setCreated(true);
      } else {
        await login(credentials);
        setPassword('');
        window.location.hash = '#/painel';
      }
    } catch (cause) {
      setError(messageForAuthError(cause, registerMode));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section className="card w-full max-w-lg p-6 sm:p-8" aria-labelledby="auth-title">
      <a href="#/login" className="text-xl font-extrabold" aria-label="TimeTrack, ir para entrar">
        time<span className="text-brand">track</span>
      </a>
      <p className="mt-8 text-xs font-bold uppercase tracking-wide text-brand">Acesso do gestor</p>
      <h1 id="auth-title" className="mt-2 text-2xl font-extrabold">
        {registerMode ? 'Criar conta' : 'Entrar no Dashboard'}
      </h1>

      {created ? (
        <div className="mt-5" aria-live="polite">
          <p role="status" className="text-sm leading-6">
            Conta criada. O cadastro não inicia uma sessão automaticamente; entre com suas
            credenciais para continuar.
          </p>
          <a className="primary-button mt-5 inline-block" href="#/login">
            Ir para entrar
          </a>
        </div>
      ) : (
        <form className="mt-5 space-y-4" onSubmit={submit} noValidate>
          <div>
            <label htmlFor="manager-email" className="block text-sm font-semibold">
              E-mail
            </label>
            <input
              id="manager-email"
              name="email"
              className="form-field mt-1"
              type="email"
              autoComplete="username"
              inputMode="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setValidationError(null);
              }}
              aria-invalid={validationError?.includes('e-mail') ? 'true' : undefined}
              aria-describedby={validationError?.includes('e-mail') ? 'auth-error' : undefined}
            />
          </div>
          <div>
            <label htmlFor="manager-password" className="block text-sm font-semibold">
              Senha
            </label>
            <input
              id="manager-password"
              name="password"
              className="form-field mt-1"
              type="password"
              autoComplete={registerMode ? 'new-password' : 'current-password'}
              required
              minLength={registerMode ? 8 : undefined}
              maxLength={registerMode ? 72 : 256}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setValidationError(null);
              }}
              aria-invalid={validationError?.includes('senha') ? 'true' : undefined}
              aria-describedby={
                validationError?.includes('senha')
                  ? 'auth-password-help auth-error'
                  : 'auth-password-help'
              }
            />
            <p id="auth-password-help" className="mt-1 text-xs muted">
              {registerMode
                ? 'Use pelo menos 8 caracteres; o limite do servidor é 72 bytes em UTF-8.'
                : 'A senha é enviada diretamente à API de autenticação.'}
            </p>
          </div>
          {validationError && (
            <p id="auth-error" role="alert" className="text-sm text-red-700 dark:text-red-300">
              {validationError}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          )}
          <button type="submit" className="primary-button w-full" disabled={submitting}>
            {submitting ? 'Enviando…' : registerMode ? 'Criar conta' : 'Entrar'}
          </button>
          <p className="text-center text-sm muted">
            {registerMode ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
            <a
              className="font-semibold text-brand underline"
              href={registerMode ? '#/login' : '#/cadastro'}
            >
              {registerMode ? 'Entrar' : 'Criar conta'}
            </a>
          </p>
        </form>
      )}
    </section>
  );
}

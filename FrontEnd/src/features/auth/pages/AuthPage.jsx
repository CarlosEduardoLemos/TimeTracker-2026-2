import { IntegrationNotice } from '../../../shared/components/IntegrationNotice';

export function AuthPage({ mode = 'login' }) {
  const register = mode === 'cadastro';
  return (
    <section className="card w-full max-w-lg p-6 sm:p-8" aria-labelledby="auth-title">
      <a
        href="#/painel"
        className="text-xl font-extrabold"
        aria-label="TimeTrack, ir para o painel"
      >
        time<span className="text-brand">track</span>
      </a>
      <p className="mt-8 text-xs font-bold uppercase tracking-wide text-brand">
        Acesso em preparação
      </p>
      <h1 id="auth-title" className="mt-2 text-2xl font-extrabold">
        {register ? 'Criar conta' : 'Entrar no Dashboard'}
      </h1>
      <div className="mt-5">
        <IntegrationNotice title="Sessão do gestor não integrada">
          O backend oferece cadastro, login JWT e identificação do gestor, mas esta interface ainda
          não integra uma sessão autenticada. O acesso permanece aberto no MVP.
        </IntegrationNotice>
      </div>
      <a className="secondary-button mt-5 inline-block" href="#/painel">
        Ir para o painel
      </a>
    </section>
  );
}

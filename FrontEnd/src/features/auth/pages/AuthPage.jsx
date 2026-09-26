import { IntegrationNotice } from '../../../shared/components/IntegrationNotice';

export function AuthPage({ mode = 'login' }) {
  const register = mode === 'cadastro';
  return (
    <main className="grid min-h-screen place-items-center bg-page p-4 dark:bg-slate-950 dark:text-white">
      <section className="card w-full max-w-md">
        <a href="#/painel" className="text-xl font-extrabold">
          time<span className="text-brand">track</span>
        </a>
        <h1 className="mt-8 text-2xl font-extrabold">
          {register ? 'Criar conta' : 'Entrar no Dashboard'}
        </h1>
        <div className="mt-5">
          <IntegrationNotice title="Autenticação indisponível">
            Cadastro e login dependem de endpoints, sessão e autorização no backend. Ainda não é
            possível criar conta nem entrar por esta interface.
          </IntegrationNotice>
        </div>
        <a className="mt-5 inline-block text-sm font-semibold text-brand underline" href="#/painel">
          Ir para o painel
        </a>
      </section>
    </main>
  );
}

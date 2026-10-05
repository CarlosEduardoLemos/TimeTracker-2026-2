import { PageHeader } from '../../../shared/components/PageHeader';
import { IntegrationNotice } from '../../../shared/components/IntegrationNotice';

export function TasksPage() {
  return (
    <>
      <PageHeader title="Tasks" description="Criação e edição de tasks do gestor." />
      <IntegrationNotice>
        O backend ainda não oferece consulta ou persistência de tasks, associação de colaboradores
        nem aplicações do escopo. Esta página será habilitada quando esses contratos existirem. A
        criação persistida pelo Dashboard, quando disponível, não inicia nem controla o
        monitoramento pelo Agent.
      </IntegrationNotice>
      <section className="card mt-5 max-w-3xl text-center" aria-labelledby="tasks-empty-title">
        <div
          aria-hidden="true"
          className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-3xl text-brand dark:bg-indigo-950"
        >
          ☷
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-brand">
          Aguardando integração
        </p>
        <h2 id="tasks-empty-title" className="mt-2 text-xl font-bold">
          Organização de tasks da equipe
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 muted">
          Quando a API oferecer suporte, esta área reunirá as tasks definidas pelo gestor e a
          associação de colaboradores e aplicações ao escopo de cada uma.
        </p>
      </section>
    </>
  );
}

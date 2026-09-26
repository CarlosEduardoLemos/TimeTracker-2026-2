import { PageHeader } from '../components/PageHeader';
import { IntegrationNotice } from '../components/IntegrationNotice';

export function TasksPage() {
  return (
    <>
      <PageHeader title="Tasks" description="Criação e edição de tasks do gestor." />
      <IntegrationNotice>
        O backend ainda não oferece consulta ou persistência de tasks, associação de colaboradores
        nem aplicações do escopo. Esta página será habilitada quando esses contratos existirem.
      </IntegrationNotice>
    </>
  );
}

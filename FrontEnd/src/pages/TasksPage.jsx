import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { IntegrationNotice } from '../components/IntegrationNotice';

export function TasksPage() {
  const [description, setDescription] = useState('');
  const [applications, setApplications] = useState('');
  const invalid = description.length > 0 && description.trim().length < 3;
  return <>
    <PageHeader title="Tasks" description="Preparação da task pelo gestor." />
    <IntegrationNotice>O backend ainda não oferece CRUD de tasks, associação de colaboradores nem escopo de aplicações. O formulário pode ser preenchido localmente, mas os dados não são salvos.</IntegrationNotice>
    <section className="card mt-5 max-w-2xl"><h2 className="font-bold">Dados da task</h2><div className="mt-4 grid gap-4"><label className="text-sm font-semibold">Descrição<input className="form-field mt-2" value={description} onChange={event => setDescription(event.target.value)} aria-invalid={invalid} aria-describedby={invalid ? 'task-error' : undefined} /></label>{invalid && <p id="task-error" className="text-sm text-red-700">Informe pelo menos 3 caracteres.</p>}<label className="text-sm font-semibold">Aplicações ou serviços do escopo<textarea className="form-field mt-2" rows="4" value={applications} onChange={event => setApplications(event.target.value)} placeholder="Uma aplicação por linha" /></label><p className="text-sm muted">A seleção de colaboradores associados estará disponível quando a API fornecer a equipe do gestor.</p></div><div className="mt-5 flex flex-wrap gap-2"><button className="primary-button" disabled>Salvar task</button><button className="secondary-button" onClick={() => { setDescription(''); setApplications(''); }}>Limpar formulário</button></div></section>
  </>;
}
